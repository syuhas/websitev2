import boto3
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
import json
from botocore.exceptions import ClientError




def getDatabaseCredentials() -> dict:
    secret_id = "arn:aws:secretsmanager:us-east-1:061039789243:secret:rds!db-555390f8-60f2-4d37-ad75-e63d8f0cbfa9-0s9oyX"
    region = "us-east-1"
    session = boto3.session.Session()
    client = session.client('secretsmanager', region_name=region)

    try:
        secret_response = client.get_secret_value(SecretId=secret_id)
        secret = secret_response['SecretString']
        json_secret = json.loads(secret)
        credentials = {
            'username': json_secret['username'],
            'password': json_secret['password']
        }
        return credentials
    except ClientError as e:
        raise e
    
def getEngine() -> create_async_engine:
    credentials = getDatabaseCredentials()
    engine = create_async_engine(
        # f'postgresql://{credentials["username"]}:{credentials["password"]}@resources.czmo2wqo0w7e.us-east-1.rds.amazonaws.com:5432'
        f'postgresql+asyncpg://{credentials["username"]}:{credentials["password"]}@resources.czmo2wqo0w7e.us-east-1.rds.amazonaws.com:5432'
    )

    return engine

@asynccontextmanager
async def getDatabaseSession() -> AsyncGenerator[AsyncSession, None]:
    engine = getEngine()
    async_session = sessionmaker(bind=engine, class_=AsyncSession)
    async with async_session() as session:
        async with session.begin():
            try:
                yield session
            finally:
                await session.close()