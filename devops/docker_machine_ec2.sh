#!/usr/bin/env bash
#https://docs.docker.com/machine/drivers/aws/
usage() {
    echo "Usage: /bin/bash docker_machine_ec2.sh [Instance Name]"
}

if [ "$#" -eq 1 ]; then
    docker-machine create --driver amazonec2 \
        --amazonec2-region us-east-1 \
        --amazonec2-vpc-id vpc-e11dbd85 \
        --amazonec2-zone c \
        --amazonec2-subnet-id subnet-403f146b \
        --amazonec2-security-group Open \
        --amazonec2-tags Name,$1 \
        --amazonec2-instance-type m4.large \
        --amazonec2-root-size 8 \
        --amazonec2-iam-instance-profile CopyCatServer \
        --amazonec2-monitoring \
        $1
else
    usage
fi
