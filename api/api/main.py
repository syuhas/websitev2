from fastapi import Depends, FastAPI
from .routers.s3 import router as s3_router
from .schema.s3buckets import S3BUCKETS
from sqlalchemy import select, and_, or_
from .database.database import getDatabaseSession




app = FastAPI(root_path='/api')


@app.get("/health")
async def health():
    return {"status": "I am healthy!"}

app.include_router(s3_router, prefix="/s3", tags=["s3"])

