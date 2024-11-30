provider "aws" {
  region = "us-east-1"
}

variable "aws_security_group" {type = string}
variable "aws_subnet_ids" {
  type = list(string)
  ephemeral = true
}
variable "aws_tf_bucket" {type = string}
variable "aws_route53_zone_id" {type = string}
variable "aws_domain" {type = string}
variable "aws_www_domain" {type = string}



terraform {
  backend "s3" {}
}

# create ec2 instance
resource "aws_instance" "instance" {
  ami = "ami-06b21ccaeff8cd686"
  instance_type = "t2.small"
  vpc_security_group_ids = [var.aws_security_group]
  key_name = "ec2"
  tags = {
    Name = "${var.aws_domain}"
  }
  iam_instance_profile = "instance_profile_role"
  subnet_id = element(var.aws_subnet_ids, 0)
}

resource "aws_route53_record" "dns" {
  zone_id = var.aws_route53_zone_id
  name = "${var.aws_domain}"
  ttl     = 300
  type = "A"
  records = [aws_instance.instance.public_ip]
}

resource "aws_route53_record" "dnswww" {
  zone_id = var.aws_route53_zone_id
  name = "${var.aws_www_domain}"
  ttl     = 300
  type = "A"
  records = [aws_instance.instance.public_ip]
}

output "instance_public_ip" {
  value = aws_instance.instance.public_ip
}

output "instance_public_dns" {
  value = aws_instance.instance.public_dns
}