import json
import boto3

def lambda_handler(event, context):
    # TODO implement
    sqs = boto3.client('sqs')
    queue_url = "https://sqs.us-east-1.amazonaws.com/732821628753/MovieSQS"
    
    queue_response = sqs.send_message(
    QueueUrl = queue_url,
    MessageBody = json.dumps(event["currentIntent"]["slots"])
    )
    
    return {
        "dialogAction":{
            "type": "Close",
            "fulfillmentState": "Fulfilled",
            "message":{
                "contentType":"PlainText",
                "content":"Please wait, thank you"
            }
        }
    }
