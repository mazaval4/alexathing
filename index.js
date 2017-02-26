var https = require('https');
const AWS=require('aws-sdk');
const fs=require('fs');

require('./awsauth.js');

var polly = new AWS.Polly();




exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to an Alexa Skill, this is running on a deployed lambda function", true),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name) {
          case "HelloWorldIntent":
            context.succeed(
          generateResponse(
            buildSpeechletResponse("Hello how are you", true),
            {}
          )
        )
            break;

          case "TranslatePhrase":
            var fs = require('fs');
            //  polly.describeVoices({"LanguageCode":"es-US"},function(err,data){
            //     if(err) console.log("error");
            //     else {var json = JSON.stringify(data);
            //     var lim = JSON.parse(json);
            //     console.log(lim.Voices[0].Name)
            //      console.log(lim.Voices[0].Id)}
                
            // });
            
            var params = {
OutputFormat: 'mp3',               // You can also specify pcm or ogg_vorbis formats.
Text: 'Good morning, Trevor.',     // This is where you'll specify whatever text you want to render.
VoiceId: 'Carla'                   // Specify the voice ID / name from the previous step.
};

var synthCallback = function (err, data) {
 if (err) console.log(err, err.stack); // an error occurred
 else console.log(data); // successful response

fs.writeFile('/tmp/testing.mp3', data.AudioStream, function (err) {
 if (err) {
 console.log('An error occurred while writing the file.');
 console.log(err);
 }
 console.log('Finished writing the file to the filesystem')
 });
 
 
 
// Create S3 service object
var s3 = new AWS.S3({apiVersion: '2006-03-01'});

// call S3 to retrieve upload file to specified bucket
var uploadParams = {Bucket: 'piddles', Key: '', Body: '/tmp/testing.mp3'};
var file = '/tmp/testing.mp3';


var fileStream = fs.createReadStream(file);
fileStream.on('error', function(err) {
  console.log('File Error', err);
});
uploadParams.Body = fileStream;

var path = require('path');
uploadParams.Key = path.basename(file);

// call S3 to retrieve upload file to specified bucket
s3.upload (uploadParams, function (err, data) {
  if (err) {
    console.log("Error", err);
  } if (data) {
    console.log("Upload Success", data.Location);
  }
});
 
 
 
};
polly.synthesizeSpeech(params, synthCallback);




            
            break;


          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "SSML",
    ssml: '<speak><audio src="https://piddles.s3.amazonaws.com/testing.mp3" /> </speak>'
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}