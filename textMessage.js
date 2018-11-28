'use strict';

const env = process.env;

const MessagingResponse = require('twilio').twiml.MessagingResponse;
const AWS = require('aws-sdk');
const querystring = require('querystring');
const request = require('request-promise');
const uuid4 = require('uuid4');
const _ = require('lodash');

module.exports.incoming = (event, context, callback) => {

  console.log("Incoming text received: %s", JSON.stringify(event, null, 2));

  const params = querystring.parse(event.body);

  let filename;

  if (params.MediaUrl0) {
    console.log('Got media file: %s', params.MediaUrl0);

    const spliturl = _.split(params.MediaUrl0, '/');

    filename = spliturl[spliturl.length - 1];

    console.log('File name %s', filename);

    var req = require('request');

    request.get({ url: params.MediaUrl0, encoding: null })
        .then(res => {
          var s3 = new AWS.S3({ params: { Bucket: env.s3bucketmedia, Key: filename }});

          s3.upload({Body: res, ACL: "private"}, function (err, data) {  //2 months
            console.log(err,data);
          });
        })
        .catch(err => {
          console.log("Failed to download media file: %s", err);
        });
}

if (params.Body) {
  console.log('Got a text body: %s', params.Body);

  if (!filename) {
    console.log('creating a custom filename');
    filename = uuid4();
  }

  var s3 = new AWS.S3({ params: { Bucket: env.s3buckettext, Key: filename + '.txt' }});
  s3.upload({Body: params.Body, ACL: "private"}, function (err, data) {  //2 months
    console.log(err,data);
  });
}

callback(null, {
    statusCode: 200,
    headers: { 'content-type': 'text/xml' },
    body: createTwiml()
  });

}

function createTwiml() {
  const twiml = new MessagingResponse();
  twiml.message('Your message is being sent.  Thank you!');
  return twiml.toString();
}
