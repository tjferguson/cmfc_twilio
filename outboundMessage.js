'use strict';

const env = process.env;

const client = require('twilio')(env.twilioAccountSid, env.twilioAuthToken);

module.exports.send = (event, context, callback) => {

  const filename = event.Records[0].s3.object.key;

  console.log("Filename: %s", filename);

  client.messages
    .create({
      from: ''
      to: ''
      mediaUrl: '' + filename
    })
      .then(call => console.log(call.sid))
      .catch(err => console.error(err));

}
