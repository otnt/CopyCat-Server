import requests
import json

#r = requests.post('http://localhost/api/v0/users/', data=json.dumps({'name':'test_user_3','profilePictureUrl': 'http://www.usip.org/sites/default/files/Andrew-Wilder_1.jpg'}), headers = {'content-type': 'application/json'})
r = requests.post('http://CopyCatLoadBalancer-426137485.us-east-1.elb.amazonaws.com/api/v0/users/', data=json.dumps({'name':'test_user_4','profilePictureUrl': 'http://www.usip.org/sites/default/files/Andrew-Wilder_1.jpg'}), headers = {'content-type': 'application/json'})
print r.text
