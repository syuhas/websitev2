import boto3
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, select
from ..schema.s3buckets import S3BUCKETS, S3BUCKETOBJECTS
from ..database.database import getDatabaseSession as s
from fastapi.responses import StreamingResponse
from botocore.exceptions import ClientError

router = APIRouter()

s3 = boto3.client('s3')

@router.get("/list_buckets")
async def list_buckets():
    async with s() as session:
        sql = select(S3BUCKETS)
        buckets = (await session.execute(sql)).scalars().all()
        return buckets

@router.get("/list_object")
async def list_object(bucket: str = Query(...), key: str = Query(...)):
    async with s() as session:
        sql = select(S3BUCKETOBJECTS).where(S3BUCKETOBJECTS.bucket == bucket).where(S3BUCKETOBJECTS.key == key)
        objects = (await session.execute(sql)).scalars().all()
        return objects

@router.get("/list_objects")
async def list_objects(
    bucket: str = Query(...),
    page: int = Query(1, ge=1, description="The page number to retrieve."),
    page_size: int = Query(10, ge=1, le=1000, description="The number of items per page.")
):
    async with s() as session:
        # Calculate the offset based on the page and page_size
        offset = (page - 1) * page_size
        
        # Define the SQL query with limit and offset for pagination
        sql = (
            select(S3BUCKETOBJECTS)
            .where(S3BUCKETOBJECTS.bucket == bucket)
            .offset(offset)
            .limit(page_size)
        )
        objects = (await session.execute(sql)).scalars().all()
        
        # Return the paginated results along with metadata
        total_objects_query = select(func.count(S3BUCKETOBJECTS.id)).where(S3BUCKETOBJECTS.bucket == bucket)
        total_objects = (await session.execute(total_objects_query)).scalar()
        total_pages = (total_objects + page_size - 1) // page_size  # Calculate total pages
        
        return {
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "total_objects": total_objects,
            "objects": objects,
        }

@router.get("/search_objects")
async def search_objects(key = Query(...)):
    async with s() as session:
        sql = select(S3BUCKETOBJECTS).where(S3BUCKETOBJECTS.key.ilike(f'%{key}%'))
        objects = (await session.execute(sql)).scalars().all()
        return objects
    
@router.get("/download_object")
async def download_object(bucket: str = Query(...), key: str = Query(...)):
    try:
        response = s3.get_object(Bucket=bucket, Key=key)
        
        # Create a streaming response for the file download
        return StreamingResponse(
            response["Body"],  # The file's body is already a stream
            headers={
                "Content-Disposition": f'attachment; filename="{key}"',
                "Content-Type": response["ContentType"],
            },
        )
    except ClientError as e:
        raise HTTPException(status_code=404, detail="Object not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")