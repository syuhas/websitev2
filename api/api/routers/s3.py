# this is what you see when you access the docs page, under all the s3 routes. I havent created my ec2 routes yet, so these are all you will see.
# for this, ignore all the async stuff. It just makes things marginally faster and I like using async. You can use non async stuff to start, it is a lot less complicated and I would reccomend starting there first

import boto3
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func, select

#importing my schemas here. The schemas are already created in the database, and my lambdas are filling the data with new bucket/object info as s3 is updated. This is part of the event driven stuff
from ..schema.s3buckets import S3BUCKETS, S3BUCKETOBJECTS

# you can check what is going on here. Basically I am getting the session. All of this is done in the database.py file. I can then just import the session and work with it
# the only important thing to remember here is that you need to open a session with the database to work with the data. The credentials for the engine(username and pw) are using kms and AWS Secrets Manager, which the role attached to the instance has access to both
# this file also creates the engine and uses that to connect to a session. Check it out for more info
from ..database.database import getDatabaseSession as s
from fastapi.responses import StreamingResponse
from botocore.exceptions import ClientError

router = APIRouter()

# connecting to s3 service., I do not need to pass in credentials because the IMDS service uses the role attached to the instance. And even though this is on docker, docker can access the instance metadata service as well
# so all I need to do is start an s3 session :)
s3 = boto3.client('s3')

# this is an 'endpoint'. This endpoint will list all of the buckets. The way I have this setup, you can go to the endpoint(https://digitalsteve.net/api/s3/list_buckets) and it will return
# a list of buckets in my account as json serializable data (btw look up serilization if you haven't already. Very important concept when working with db data)
# serialization = turning data objects into byte data to store or transmit
# deserialization = the oppposite, turning the byte data back into data objects
# easy example, this returns a serialized list of python dictionaries, but this is not actually a list of python dictionaries...what you get is actually one long string. It may look like it, but only because all of the '['s and '{'s are there to allow for deserizalization
# to deserialize it and use it, you need to use something like json.loads(the results) to turn it back into a python object, in this case a python list containing dictionaries, and then you can use it like you would any python dictionary
# I only bring this up here because this is a SUPER important concept when dealing with data. You need to know how to work with the data you get. And this is how you do it
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
        sql = select(S3BUCKETOBJECTS).where(S3BUCKETOBJECTS.key.ilike(f'%{key}%')).limit(100)
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
