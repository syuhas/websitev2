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
        # this calculates the offset, the offset is eesntially what db item you are starting on in simple terms
        offset = (page - 1) * page_size
        
        # this is the sql statement that sqlalchemy is turning into pure sql, and I am telling it where to start, and lmit the amount of objects to give me. That will be the 'page' you are on
        sql = (
            select(S3BUCKETOBJECTS)
            .where(S3BUCKETOBJECTS.bucket == bucket)
            .offset(offset)
            .limit(page_size)
        )
        # I am executing the sql statement here. Basically saying, give me all the results as scalar values. Scalar values, in math, are just values that have a quanityt/size, and not a direction. So like a number or ascii character
        objects = (await session.execute(sql)).scalars().all()
        
        # now return the paginated results
        total_objects_query = select(func.count(S3BUCKETOBJECTS.id)).where(S3BUCKETOBJECTS.bucket == bucket)
        total_objects = (await session.execute(total_objects_query)).scalar()
        total_pages = (total_objects + page_size - 1) // page_size  # this will calculate the total pages you can get from this bucket, based on the defined page size
        
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
        
        # streaming response is a little complicated, ignore it for now. But all you need to know is it's involved with downloading the object in the db
        return StreamingResponse(
            response["Body"],
            headers={
                "Content-Disposition": f'attachment; filename="{key}"',
                "Content-Type": response["ContentType"],
            },
        )
    except ClientError as e:
        raise HTTPException(status_code=404, detail="Object not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
