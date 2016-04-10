#!/usr/bin/env bash

docker build -t ccserver_image /home/ubuntu/CopyCat-Server && \
docker run -it --rm --name ccserver -p 80:80 -p 3000:3000 ccserver_image
