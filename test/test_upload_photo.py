import requests
import json
import sys

buf = ''
for line in sys.stdin:
    buf += line.strip()

print len(buf)
r = requests.post('http://CopyCatLoadBalancer-426137485.us-east-1.elb.amazonaws.com/api/v0/photos/', data=json.dumps({'data':buf, 'ownerId':'571e8f58fd825f2e17cfcccf'}), headers = {'content-type': 'application/json', 'content-length' : len(buf)})
#r = requests.post('http://ec2-54-82-236-201.compute-1.amazonaws.com/api/v0/photos/', data=json.dumps({'data':buf, 'ownerId':'571e8f58fd825f2e17cfcccf'}), headers = {'content-type': 'application/json', 'content-length' : len(buf)})
print r.text
