# PTMprofiler

The aim of PTMprofiler was to create a user friendly way to access the various python scripts aimed at looking at post-translational modifications that I had created during the first cornavirus lockdown.

The project itself has also served as a useful way for me to learn about the basics of deployment via docker, and rather more javascript than I intended!

## Running a local instance via uvicorn

This option is good from running the code on your own machine for yourself or for the development of ptmprofiler.

You will need to have python 3.10 or above aswell as having fastapi and uvicorn installed. A full list of dependencies is contained within requirements.txt

If you have conda installed you can do the following:

`conda create -n ptmprofiler python=3.10`

`conda activate ptmprofiler`


`pip install --no-cache-dir --upgrade -r ./requirements.txt`

This will create a conda enviroment which contains all of the required dependencies for running ptmprofiler.

Now you can naviage to the app directory:

`cd ./app`

Run uvicorn to start ptmprofiler:

`uvicorn main:app --reload`

The output should describe how to access the running webserver.

## Deploying using docker
In the root of the cloned git directory run the following command to create the container image.

`docker build -t ptmprofilerimg .`

Then run the container using the following command

`docker run -d --name ptmprofiler -p 80:80 ptmprofilerimg`

You should now be able to naviate to *localhost* in your browser to view ptmprofiler.
