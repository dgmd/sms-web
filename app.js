var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));

var Firebase = require("firebase");
var fb = new Firebase("https://sms-web.firebaseio.com/");

var twilio_options = {
    account_sid: 'AC4c7e361ffe2675c8003322fbff77451f',
    auth_token: '5d5d41cfc613ac014d4e52a1edad0e57',
    number: '+16178700392'
};

// var opencnam = require('opencnam');
// var opencnam_options = {
//   account_sid: 'ACe2f3627a22e54a97a0f53c8903614990',
//   auth_token:  'AUf4db49f5f30c45f8846725de0fcd8ac5'
// };

var twilio = require('twilio');
var client = twilio(twilio_options.account_sid, twilio_options.auth_token);

var twilio_err = function(error, message) {
    if (!error) {
        console.log('Success! The SID for this SMS message is:');
        console.log(message.sid);

        console.log('Message sent on:');
        console.log(message.dateCreated);
    } else {
        console.log('Oops! There was an error:', error);
    }
}

app.post('/', function(req, res) {
	console.log(req.body);
    var data = {};
    data[req.body.MessageSid] = {
        from: req.body.From,
        body: req.body.Body
    };
    fb.set(data);

    client.sms.messages.create({
        to: req.body.From,
        from: twilio_options.number,
        body: "Thanks for your interest!  We'll be in touch…"
    }, twilio_err);
});

app.get('/', function(req, res) {
	console.log(req);
	res.sendFile('./index.html', {root: '.'});
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// opencnam.lookup('2024561111', options, function (err, cnam) {
//   if (!err) {
//     console.log(cnam);
//   } else {
//     console.log(err);
//   }
// });
