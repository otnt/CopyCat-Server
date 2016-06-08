import requests
import json
import sys

buf = ''
for line in sys.stdin:
    buf += line.strip()

print len(buf)
r = requests.post('http://localhost:3000/api/v0/smart', data=json.dumps({'data':buf}), headers = {'content-type': 'application/json', 'content-length' : len(buf)})
print r.text
