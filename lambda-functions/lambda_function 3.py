import json
import boto3
from botocore.vendored import requests
from urllib.parse import urlencode

def lambda_handler(event, context):
    # TODO implement
    sqs = boto3.client("sqs")
    queue_url = "https://sqs.us-east-1.amazonaws.com/732821628753/MovieSQS"
    
    response = sqs.receive_message(
        QueueUrl = queue_url,
        AttributeNames = ["SentTimeStamp"],
        MaxNumberOfMessages = 1,
        MessageAttributeNames=['All'],
        VisibilityTimeout = 0,
        WaitTimeSeconds = 0
    )
    if not 'Messages' in response.keys():
        return {'Processed and deleted message: ' : None}
        
    message = response["Messages"][0]
    message_body = json.loads(message["Body"])
    print(message_body)
    
    api_key = "AIzaSyC-euld0Pxdaxf_Y4DjoUTjpuw2rwJHIL0"
    #query = "Cinema with" + message_body["Movie"] + " being on in " + message_body["Location"] + " for " +  message_body["People"] + " people" + " at " + message_body["Time"]
    query = "Cinemas in New York"
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json?" + urlencode({"key": api_key, "query": query})
    res = requests.get(url).json()
    cinemas = []
    for cinema in res["results"]:
        cinemas.append({"name": cinema['name'], "address": cinema["formatted_address"]})
    
    '''
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('Movie')
    response = table.put_item(
        Item={
            "ID":response["ResponseMetadata"]["RequestId"],
            "PhoneNumber":message_body["Telephone"],
            "Location":message_body["Location"],
            "Movie":message_body["Movie"],
            "NumberofPeople":message_body["People"],
            "Time":message_body["Time"],
            "data":cinemas
        }
    )
    '''
    
    msg = 'Cinema name: ' + cinemas[0]['name'] +'; Address: ' + cinemas[0]['address']
    client = boto3.client("sns")
    res = client.publish(
        PhoneNumber = "+1" + message_body["Telephone"],
        Message = msg
    )

    sqs.delete_message(
        QueueUrl = queue_url,
        ReceiptHandle = message["ReceiptHandle"]
    )

    return {"Sent SNS": res}
