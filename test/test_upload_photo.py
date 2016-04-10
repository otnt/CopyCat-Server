import requests
import json
import sys

buf = ''
for line in sys.stdin.readline():
    buf += line.strip()

    r = requests.post('http://CopyCatLoadBalancer-426137485.us-east-1.elb.amazonaws.com/api/v0/photos/', data=json.dumps({'data':buf}), \
            headers = {'content-type': 'application/json', 'content-length' : len(buf)})
    print r.text
