import requests
import json

#r = requests.post('http://CopyCatLoadBalancer-426137485.us-east-1.elb.amazonaws.com/api/v0/photos/', data=json.dumps({'data':buf}), \
#r = requests.post('http://ec2-54-82-236-201.compute-1.amazonaws.com/api/v0/albums/', data=json.dumps({'name':'test','imageUrl':'https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwj69OCD49bMAhVX-mMKHbuVCScQjRwIBw&url=http%3A%2F%2Fmostlychelsea.com%2F2015%2F05%2Fdont-be-a-copycat-find-your-own-way%2F&psig=AFQjCNEYFKP3b7CEcGS2t-dJhKl789vpMA&ust=1463219360243576', 'ownerId':'56d1fa5043667c107ded881f',
r = requests.post('http://localhost/api/v0/users/', data=json.dumps({'name':'test_user_2','profilePictureUrl': 'http://www.usip.org/sites/default/files/Andrew-Wilder_1.jpg'}), headers = {'content-type': 'application/json'})
print r.text
