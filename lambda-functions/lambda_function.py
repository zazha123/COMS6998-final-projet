import json
import time
import random
import boto3

def lambda_handler(event, context):
    # chat
    text = event['text']
    
    client = boto3.client('lex-runtime')
    bot_response = client.post_text(
        botName='MovieChat',
        botAlias='hope',
        userId='user',
        inputText=text
        )
    
    reply = bot_response['message']
    
    current_time = time.localtime()
    now = time.strftime('%m-%d-%Y %H:%M:%S', current_time)
    
    response = {
        "message": reply,
        "time": now
    }
    
    return {
        "statusCode": 200,
        "body": json.dumps(response)
    }
