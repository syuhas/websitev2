import json
import logging
import os
import time
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

ssm = boto3.client("ssm")
ec2 = boto3.client("ec2")


def _to_bool(value):
    return str(value).strip().lower() in {"1", "true", "yes", "y", "on"}


def _to_int(value, default=None):
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return default


def _resolve_instance_id(event):
    explicit_instance_id = (
        (event or {}).get("instance_id")
        or os.environ.get("EC2_INSTANCE_ID")
    )
    if explicit_instance_id:
        return explicit_instance_id

    name = (
        (event or {}).get("instance_name")
        or os.environ.get("EC2_INSTANCE_NAME")
        or os.environ.get("DOMAIN_NAME", "digitalsteve.net")
    )
    reservations = ec2.describe_instances(
        Filters=[
            {"Name": "tag:Name", "Values": [name]},
            {"Name": "instance-state-name", "Values": ["running", "pending", "stopped"]},
        ]
    ).get("Reservations", [])
    instances = [ins for res in reservations for ins in res.get("Instances", [])]
    if not instances:
        raise RuntimeError(
            f"No EC2 instance found for Name tag '{name}'. "
            "Set EC2_INSTANCE_ID or pass instance_id in the event."
        )

    running = [ins for ins in instances if ins.get("State", {}).get("Name") == "running"]
    selected = running[0] if running else instances[0]
    return selected["InstanceId"]


def _build_remote_script(cert_name, max_cert_age_days):
    return f"""#!/bin/bash
set -u

cert_name="{cert_name}"
max_cert_age_days="{max_cert_age_days}"

to_bool() {{
  local v="${{1:-}}"
  case "${{v,,}}" in
    1|true|yes|y|on) echo "true" ;;
    *) echo "false" ;;
  esac
}}

emit() {{
  local k="$1"
  shift
  echo "${{k}}=$*"
}}

certbot_installed=false
if command -v certbot >/dev/null 2>&1; then
  certbot_installed=true
fi

route53_plugin_installed=false
if [ "$certbot_installed" = "true" ]; then
  if certbot plugins 2>/dev/null | grep -Eiq 'dns-route53|route53'; then
    route53_plugin_installed=true
  elif python3 -m pip show certbot-dns-route53 >/dev/null 2>&1; then
    route53_plugin_installed=true
  elif rpm -qa 2>/dev/null | grep -Eiq 'certbot-dns-route53|python3-certbot-dns-route53'; then
    route53_plugin_installed=true
  elif dpkg -l 2>/dev/null | grep -Eiq 'certbot-dns-route53|python3-certbot-dns-route53'; then
    route53_plugin_installed=true
  fi
fi

certbot_out="$(sudo certbot certificates --cert-name "$cert_name" 2>/dev/null || true)"
has_cert=false
domains_line=""
valid_days=""
expiry_line=""
if echo "$certbot_out" | grep -Fq "Certificate Name: $cert_name"; then
  has_cert=true
  domains_line="$(echo "$certbot_out" | sed -n 's/^ *Domains: *//p' | head -n1)"
  expiry_line="$(echo "$certbot_out" | sed -n 's/^ *Expiry Date: *//p' | head -n1)"
  valid_days="$(echo "$expiry_line" | sed -n 's/.*(VALID: \\([0-9][0-9]*\\) days).*/\\1/p')"
fi

has_root_domain=false
has_www_domain=false
if echo " $domains_line " | grep -Fq " digitalsteve.net "; then
  has_root_domain=true
fi
if echo " $domains_line " | grep -Fq " www.digitalsteve.net "; then
  has_www_domain=true
fi
domains_ok=false
if [ "$has_root_domain" = "true" ] && [ "$has_www_domain" = "true" ]; then
  domains_ok=true
fi

live_dir="/etc/letsencrypt/live/$cert_name"
fullchain_path="$live_dir/fullchain.pem"
privkey_path="$live_dir/privkey.pem"
cert_installed=false
if [ -f "$fullchain_path" ] && [ -f "$privkey_path" ]; then
  cert_installed=true
fi

renewal_conf_exists=false
if [ -f "/etc/letsencrypt/renewal/${{cert_name}}.conf" ]; then
  renewal_conf_exists=true
fi

auto_renew_enabled=false
if systemctl is-enabled certbot.timer >/dev/null 2>&1; then
  auto_renew_enabled=true
elif [ -x "/etc/cron.daily/certbot" ] || [ -f "/etc/cron.d/certbot" ]; then
  auto_renew_enabled=true
fi

cert_age_days=""
renewed_recently=false
if [ -f "$fullchain_path" ]; then
  now_epoch="$(date +%s)"
  mod_epoch="$(stat -c %Y "$fullchain_path" 2>/dev/null || true)"
  if [ -n "$mod_epoch" ]; then
    cert_age_days="$(( (now_epoch - mod_epoch) / 86400 ))"
    if [ "$cert_age_days" -le "$max_cert_age_days" ]; then
      renewed_recently=true
    fi
  fi
fi

openssl_not_after=""
openssl_days_left=""
if [ -f "$fullchain_path" ]; then
  openssl_not_after="$(sudo openssl x509 -in "$fullchain_path" -noout -enddate 2>/dev/null | cut -d= -f2-)"
  if [ -n "$openssl_not_after" ]; then
    exp_epoch="$(date -d "$openssl_not_after" +%s 2>/dev/null || true)"
    now_epoch="$(date +%s)"
    if [ -n "$exp_epoch" ]; then
      openssl_days_left="$(( (exp_epoch - now_epoch) / 86400 ))"
    fi
  fi
fi

emit CERTBOT_INSTALLED "$certbot_installed"
emit ROUTE53_PLUGIN_INSTALLED "$route53_plugin_installed"
emit CERT_FOUND "$has_cert"
emit CERT_INSTALLED "$cert_installed"
emit DOMAINS_OK "$domains_ok"
emit HAS_ROOT_DOMAIN "$has_root_domain"
emit HAS_WWW_DOMAIN "$has_www_domain"
emit RENEWAL_CONF_EXISTS "$renewal_conf_exists"
emit AUTO_RENEW_ENABLED "$auto_renew_enabled"
emit RENEWED_RECENTLY "$renewed_recently"
emit CERT_AGE_DAYS "$cert_age_days"
emit VALID_DAYS "$valid_days"
emit OPENSSL_DAYS_LEFT "$openssl_days_left"
emit DOMAINS "$domains_line"
emit EXPIRY_TEXT "$expiry_line"
emit OPENSSL_NOT_AFTER "$openssl_not_after"
"""


def _parse_stdout(stdout):
    parsed = {}
    for line in (stdout or "").splitlines():
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        parsed[key.strip()] = value.strip()
    return parsed


def _wait_for_command(command_id, instance_id, timeout_seconds):
    start = time.time()
    while time.time() - start < timeout_seconds:
        invocation = ssm.get_command_invocation(
            CommandId=command_id,
            InstanceId=instance_id,
        )
        status = invocation.get("Status")
        if status in {"Success", "Failed", "Cancelled", "TimedOut"}:
            return invocation
        time.sleep(3)
    raise TimeoutError("Timed out waiting for SSM command to complete.")


def lambda_handler(event, context):
    event = event or {}
    cert_name = event.get("cert_name") or os.environ.get("CERT_NAME", "digitalsteve.net")
    max_cert_age_days = _to_int(
        event.get("max_cert_age_days") or os.environ.get("MAX_CERT_AGE_DAYS", "90"),
        default=90,
    )
    timeout_seconds = _to_int(
        event.get("ssm_timeout_seconds") or os.environ.get("SSM_TIMEOUT_SECONDS", "180"),
        default=180,
    )

    try:
        instance_id = _resolve_instance_id(event)
        script = _build_remote_script(cert_name=cert_name, max_cert_age_days=max_cert_age_days)

        command = ssm.send_command(
            InstanceIds=[instance_id],
            DocumentName="AWS-RunShellScript",
            Parameters={"commands": [script]},
            TimeoutSeconds=timeout_seconds,
            Comment=(
                "Check certbot, certbot route53 plugin, and cert status for "
                f"{cert_name}/www.digitalsteve.net"
            ),
        )
        command_id = command["Command"]["CommandId"]
        invocation = _wait_for_command(command_id, instance_id, timeout_seconds)

        status = invocation.get("Status")
        stdout = invocation.get("StandardOutputContent", "")
        stderr = invocation.get("StandardErrorContent", "")
        parsed = _parse_stdout(stdout)

        result = {
            "instance_id": instance_id,
            "command_id": command_id,
            "ssm_status": status,
            "checks": {
                "certbot_installed": _to_bool(parsed.get("CERTBOT_INSTALLED")),
                "route53_plugin_installed": _to_bool(parsed.get("ROUTE53_PLUGIN_INSTALLED")),
                "cert_found": _to_bool(parsed.get("CERT_FOUND")),
                "cert_installed": _to_bool(parsed.get("CERT_INSTALLED")),
                "domains_ok": _to_bool(parsed.get("DOMAINS_OK")),
                "has_root_domain": _to_bool(parsed.get("HAS_ROOT_DOMAIN")),
                "has_www_domain": _to_bool(parsed.get("HAS_WWW_DOMAIN")),
                "renewal_conf_exists": _to_bool(parsed.get("RENEWAL_CONF_EXISTS")),
                "auto_renew_enabled": _to_bool(parsed.get("AUTO_RENEW_ENABLED")),
                "renewed_recently": _to_bool(parsed.get("RENEWED_RECENTLY")),
            },
            "certificate": {
                "cert_name": cert_name,
                "domains": parsed.get("DOMAINS", ""),
                "expiry_text": parsed.get("EXPIRY_TEXT", ""),
                "openssl_not_after": parsed.get("OPENSSL_NOT_AFTER", ""),
                "valid_days_from_certbot": _to_int(parsed.get("VALID_DAYS")),
                "days_left_from_openssl": _to_int(parsed.get("OPENSSL_DAYS_LEFT")),
                "cert_age_days": _to_int(parsed.get("CERT_AGE_DAYS")),
            },
            "stderr": stderr.strip(),
        }

        checks = result["checks"]
        result["overall_ok"] = (
            status == "Success"
            and checks["certbot_installed"]
            and checks["route53_plugin_installed"]
            and checks["cert_found"]
            and checks["cert_installed"]
            and checks["domains_ok"]
            and checks["renewal_conf_exists"]
            and checks["auto_renew_enabled"]
            and checks["renewed_recently"]
        )

        code = 200 if result["overall_ok"] else 500
        return {"statusCode": code, "body": json.dumps(result)}
    except Exception as exc:
        logger.exception("Certificate validation failed")
        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "overall_ok": False,
                    "error": str(exc),
                }
            ),
        }
