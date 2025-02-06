import boto3

from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

ec2 = boto3.client('ec2')
