import requests
import json

# r = requests.post('http://ec2-52-90-75-183.compute-1.amazonaws.com/api/v0/reports/', data=json.dumps({'content': {'reportType': '', 'contentType': 'photo', 'contentId': '573e2f06ec6080100096befa'}, 'reporter': {'ownerId': '5737e9390c7956dc7d4ada46', 'reporterEmail': ''}}), headers = {'content-type': 'application/json'})
r = requests.post('http://CopyCatLoadBalancer-426137485.us-east-1.elb.amazonaws.com/api/v0/reports/', data=json.dumps({'content': {'reportType': '', 'contentType': 'photo', 'contentId': '573e2f06ec6080100096befa'}, 'reporter': {'ownerId': '5737e9390c7956dc7d4ada46', 'reporterEmail': ''}}), headers = {'content-type': 'application/json'})
print r.text
