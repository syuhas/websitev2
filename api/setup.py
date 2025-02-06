from setuptools import setup, find_packages

setup(
    name='awsdash-api',
    version='0.1.0',
    packages=find_packages(),
    entry_points={
        'console_scripts': [
            'runserver=api.run_uvicorn:run',
            'jenkins=api.jenkins:app'
        ]
    },
    install_requires=[
        'fastapi',
        'uvicorn',
        'boto3',
        'pydantic',
        'requests',
        'sqlalchemy',
        'psycopg2-binary',
        'loguru',
        'asyncpg'
    ],
    extras_require={
        'dev': ['pytest', 'pytest-cov']
    }
)