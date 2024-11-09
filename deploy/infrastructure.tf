provider "aws" {
  region = "us-east-1"
}

variable "aws_security_group" {type = string}
variable "aws_subnet_ids" {type = list(string)}
variable "aws_vpc_id" {type = string}
variable "aws_tf_bucket" {type = string}
variable "aws_ssl_certificate_arn" {type = string}
variable "aws_route53_zone_id" {type = string}
variable "aws_domain" {type = string}
variable "aws_subdomain" {
  type    = string
  default = ""
}

locals {
  load_balancer_pre = "${var.aws_subdomain != "" ? "${var.aws_subdomain}-${var.aws_domain}-lb" : "${var.aws_domain}-lb"}"
  load_balancer_name = replace(local.load_balancer_name, ".", "-")
  target_group_pre = "${var.aws_subdomain != "" ? "${var.aws_subdomain}-${var.aws_domain}-tg" : "${var.aws_domain}-tg"}"
  target_group_name = replace(local.target_group_name, ".", "-")
}

terraform {
  backend "s3" {}
}

# create ec2 instance
resource "aws_instance" "instance" {
  ami = "ami-06b21ccaeff8cd686"
  instance_type = "t2.micro"
  vpc_security_group_ids = [var.aws_security_group]
  key_name = "ec2"
  tags = {
    Name = "${var.aws_subdomain}.${var.aws_domain}"
  }
  iam_instance_profile = "instance_profile_role"
  subnet_id = element(var.aws_subnet_ids, 0)
}

# create target group for load balancer
resource "aws_lb_target_group" "target_group" {
  # name = "${var.aws_subdomain != "" ? "${var.aws_subdomain}-${var.aws_domain}-tg" : "${var.aws_domain}-tg"}"
  name = local.target_group_name
  port = 80
  protocol = "HTTP"
  vpc_id = var.aws_vpc_id
  
  health_check {
    path = "/"
    interval = 30
    timeout = 5
    healthy_threshold = 2
    unhealthy_threshold = 2
  }
}

# create load balancer
resource "aws_lb" "load_balancer" {
  # name = "${var.aws_subdomain != "" ? "${var.aws_subdomain}-${var.aws_domain}-lb" : "${var.aws_domain}-lb"}".replace(".", "-")
  name = local.load_balancer_name
  internal = false
  load_balancer_type = "application"
  security_groups = [var.aws_security_group]
  subnets = var.aws_subnet_ids
}

# create http listener for load balancer
resource "aws_lb_listener" "http-lb-listener" {
  load_balancer_arn = aws_lb.load_balancer.arn
  port = 80
  protocol = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn
  }
}

# create https listener for load balancer
resource "aws_lb_listener" "https-lb-listener" {
  load_balancer_arn = aws_lb.load_balancer.arn
  port = 443
  protocol = "HTTPS"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn
  }

  certificate_arn = var.aws_ssl_certificate_arn
  ssl_policy = "ELBSecurityPolicy-TLS13-1-3-2021-06"
}

# register instance with the target group
resource "aws_lb_target_group_attachment" "target_group-attachment" {
  target_group_arn = aws_lb_target_group.target_group.arn
  target_id = aws_instance.instance.id
  port = 80
}

resource "aws_route53_record" "dns" {
  zone_id = var.aws_route53_zone_id
  name = "${var.aws_subdomain}.${var.aws_domain}"
  type = "A"

  alias {
    name = aws_lb.load_balancer.dns_name
    zone_id = aws_lb.load_balancer.zone_id
    evaluate_target_health = true
  }
}

output "instance_id" {
  value = aws_instance.instance.id
}

output "instance_public_ip" {
  value = aws_instance.instance.public_ip
}

output "instance_public_dns" {
  value = aws_instance.instance.public_dns
}

output "instance_name" {
  value = aws_instance.instance.tags.Name  
}
