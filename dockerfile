# 
FROM python:3.10



# 
COPY ./requirements.txt /code/requirements.txt

# 
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# 
COPY ./app /code/app
#COPY ./app/ptmprofiler /code/app/ptmprofiler

# 
WORKDIR /code/app
# 
CMD ["gunicorn"  , "-b", "0.0.0.0:80", "-k", "uvicorn.workers.UvicornWorker", "main:app"]
