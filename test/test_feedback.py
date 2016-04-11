import requests
import json
import sys

data=json.dumps({\
        'contact':'"pufan jiang", <onethreeninetwo@gmail.com>' ,\
        'subject': 'feedback', \
        'text': 'I have a feedback!' \
        })

#r = requests.post('http://52.90.52.232/api/v0/feedback/', data=data,
r = requests.post('http://127.0.0.1/api/v0/feedback/', data=data,
        headers = {'content-type': 'application/json', 'content-length' : len(data)})
print r.text
