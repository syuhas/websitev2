# token = 114681cbe74bc3b760823ffff5b9f2c355

import requests
import boto3
import json
from jenkinsapi import build, api as jenkins
from jenkinsapi.api import Jenkins
import typer
from loguru import logger

jenkins_url = 'https://jenkins.digitalsteve.net/'

app = typer.Typer()

def get_jenkins_credentials():
    ssm = boto3.client('ssm')
    username = ssm.get_parameter(Name='/jenkins/user', WithDecryption=True)['Parameter']['Value']
    token = ssm.get_parameter(Name='/jenkins/token', WithDecryption=True)['Parameter']['Value']
    return username, token

def get_jenkins_session():
    username, token = get_jenkins_credentials()
    session = Jenkins(
        jenkins_url,
        username=username,
        password=token
    )
    return session

def trigger_job(job_name: str, params: dict):
    server = get_jenkins_session()
    try:
        server.build_job(job_name, params=params)
        return 'Job started successfully'
    except Exception as e:
        return 'Error starting job: ' + str(e)

def get_build_params(job_name: str):
    server = get_jenkins_session()
    job = server.get_job(job_name)
    params = job.get_params()
    return params

@app.command()
def list_build_params(job_name: str):
    server = get_jenkins_session()
    job = server.get_job(job_name)
    params = job.get_params()
    for param in params:
        print(param['name'])

@app.command()
def list_jobs():
    server = get_jenkins_session()
    jobs = server.get_jobs()
    for job in jobs:
        builds = job[1].get_last_build()
        print(builds)
            

@app.command()
def start_build(job_name: str):
    params = get_build_params(job_name)
    input_params = {}
    logger.info('Please enter job parameters')
    for param in params:
        choices = ""
        if 'choices' in param:
            for choice in param['choices']:
                choices += choice + '|'
            choices = choices[:-1] if choices.endswith('|') else choices
            input_params[param['name']] = typer.prompt(param['name'], default=choices)

        elif 'allValueItems' in param:
            for choice in param['allValueItems']['values']:
                choices += choice['value'] + '|'
            choices = choices[:-1] if choices.endswith('|') else choices
            input_params[param['name']] = typer.prompt(param['name'], default=choices)
        else:
            input_params[param['name']] = typer.prompt(param['name'])

    response = trigger_job(job_name=job_name, params=input_params)
    logger.info(response)





if __name__ == '__main__':
    app(prog_name="jenkins")