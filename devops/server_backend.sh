#!/usr/bin/env bash
#
# This file build copycat server and run it in backend mode
# Maintainer: Pufan Jiang <jiangpufan@gmail.com>

docker build -t ccserver_image /home/ubuntu/CopyCat-Server && \
docker run --name ccserver -p 80:80 -p 3000:3000 ccserver_image
