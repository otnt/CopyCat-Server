#!/usr/bin/env bash
#
# This file is used to create a remote ec2 docker machine
#
# Reference: https://docs.docker.com/machine/drivers/aws/
# Maintainer: Pufan Jiang <jiangpufan@gmail.com>

usage() {
    echo "Usage: /bin/bash $0 [Instance Name]"
}

if [ "$#" -eq 1 ]; then
    docker-machine create --driver amazonec2 \
        --amazonec2-region us-east-1 \
        --amazonec2-vpc-id vpc-e11dbd85 \
        --amazonec2-zone c \
        --amazonec2-subnet-id subnet-403f146b \
        --amazonec2-security-group Open \
        --amazonec2-tags Name,$1 \
        --amazonec2-instance-type t2.micro \
        --amazonec2-root-size 8 \
        --amazonec2-iam-instance-profile CopyCatServer \
        --amazonec2-monitoring \
        $1 # docker machine name
else
    usage
fi
