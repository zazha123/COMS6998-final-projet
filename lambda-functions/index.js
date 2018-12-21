'use strict';
var uuid = require('uuid')
var AWS = require('aws-sdk'),
documentClient = new AWS.DynamoDB.DocumentClient();
var dynamodb = new AWS.DynamoDB();
			
exports.handler = function (event, context, callback) {
	if (event.http_method === "GET") {
		console.log("starting handling get request");
		const {http_method, user, movie} = event;
		if(user != ''){
			var params = {
				ExpressionAttributeValues: {
					":u": {
						S: user
					}
				},
				FilterExpression: "username = :u",
				TableName: "Comment"
			};
			dynamodb.scan(params, function (err, data) {
				var response = {
				statusCode: 200,
				headers:{
        			"Access-Control-Allow-Headers": 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        			"Access-Control-Allow-Origin": '*',
        			"Access-Control-Allow-Methods": 'POST, GET, OPTIONS'
				},
                        body: {data},
                        isBase64Encoded: false
                    }
			callback(err, response);
			});
		} else if (movie != '') {
			var params = {
				ExpressionAttributeValues: {
					":m": {
						S: movie
					}
				},
				FilterExpression: "movieID = :m",
				TableName: "Comment"
			};
			dynamodb.scan(params, function (err, data) {
				var response = {
				statusCode: 200,
				headers:{
					"X-Requested-With": '*',
        			"Access-Control-Allow-Headers": 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        			"Access-Control-Allow-Origin": '*',
        			"Access-Control-Allow-Methods": 'POST, GET, OPTIONS'
				},
                        body: {data},
                        isBase64Encoded: false
                    }
			callback(err, response);
			});
		}
	}

	else if (event.http_method === "POST") {
		console.log("starting handling POST request");
		console.log(event);
		
		var translate = new AWS.Translate();
		var params2 = {
			SourceLanguageCode: 'auto', 
			TargetLanguageCode: 'en',
			Text: event.comment.comment
		};
		
	translate.translateText(params2, function(err, data2) {
		if (err) console.log(err, err.stack); // an error occurred
		else{
			console.log(data2);           // successful response
			var comment = event.comment.comment;
			var comprehend = new AWS.Comprehend();
			var com_params = {
				LanguageCode: 'en',
				TextList: [
					data2["TranslatedText"]
				]
			};
			comprehend.batchDetectSentiment(com_params, function(err, data1){
			if(err)
				console.log(err, err.stack);
			else{
				console.log(data1);
				var params = {
				Item: {
					"ID": uuid.v1(),
					"time": event.comment.time,
					"movieID": event.comment.movieID,
					"movie": event.comment.movie,
					"rating": event.comment.rating,
					"comment": event.comment.comment,
					"username": event.comment.username,
					"img": event.comment.img,
					"translation": data2["TranslatedText"],
					"attitude": data1["ResultList"][0]["Sentiment"]
				},
				TableName: 'Comment'
			};
			console.log(params);
			documentClient.put(params, function (err, data) {

			console.log("sent successfully")
			var response = {
				statusCode: 200,
				headers:{
					"X-Requested-With": '*',
        			"Access-Control-Allow-Headers": 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        			"Access-Control-Allow-Origin": '*',
        			"Access-Control-Allow-Methods": 'POST, GET, OPTIONS'
				},
                        body: {data},
                        isBase64Encoded: false
                    }
				callback(err, response);
			});
		  }
	     });
	   }
      });
    }
}

