from fastapi import Depends, FastAPI
from .routers.s3 import router as s3_router
from .schema.s3buckets import S3BUCKETS
from sqlalchemy import select, and_, or_
from .database.database import getDatabaseSession




app = FastAPI(
    root_path='/api',
    title="S3 Bucket API",
    description="API to list metadata of S3 buckets and objects",
    version="0.1"
)


@app.get("/health")
async def health():
    return {"status": "I am healthy!"}

app.include_router(s3_router, prefix="/s3", tags=["s3"])

