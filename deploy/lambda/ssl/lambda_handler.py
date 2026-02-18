# create and update ssl certs for www.digitalsteve.net and digitalsteve.net
# we will use letsencrypt for this
# assume that the lambda has access to use the route53 extension
# and that the domain is managed by route53
# also assume that the lambda has access to write to the s3 bucket where the certs are stored

import json
import logging
import os
import boto3
import botocore
import subprocess
import tempfile
import shutil




logger = logging.getLogger()

logger.setLevel(logging.INFO)
s3 = boto3.client('s3')
route53 = boto3.client('route53')
# No ACM client needed for Let's Encrypt process
sts = boto3.client('sts')
account_id = sts.get_caller_identity().get('Account')
region = os.environ.get('AWS_REGION', 'us-east-1')
bucket_name = os.environ.get('SSL_CERT_BUCKET', 'my-ssl-cert-bucket')
domain_name = os.environ.get('DOMAIN_NAME', 'digitalsteve.net')
email = os.environ.get('LETSENCRYPT_EMAIL', 'syuhas22@gmail.com')
hosted_zone_id = os.environ.get('HOSTED_ZONE_ID', 'Z3P5QSUBK4POTI')