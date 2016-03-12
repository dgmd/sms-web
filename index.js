///////////////////////////////////////////////////////////////////////////////
// Express

// Load Express (http://expressjs.com/)
var express = require('express');
var app = express();

// Use Express body-parser middleware to parse requests (https://github.com/expressjs/body-parser)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// Set our default port to 5000 unless the environment defines one (as on Heroku; check out https://github.com/heroku/node-js-sample for a sample)
app.set('port', (process.env.PORT || 5000));


///////////////////////////////////////////////////////////////////////////////
// Firebase

// Load and configure Firebase (check out https://www.firebase.com/docs/web/quickstart.html for more)
var Firebase = require("firebase");
var fb = new Firebase("https://sms-web.firebaseio.com/");
fb.remove(); // Remove all the data on our Firebase DB; this way each time we deploy to Heroku or locally we get a fresh DB


///////////////////////////////////////////////////////////////////////////////
// twilio

// Load and configure twilio, which we'll use to send SMS messages — see https://twilio.github.io/twilio-node/ for more
var twilio_options = {
    account_sid: 'AC4c7e361ffe2675c8003322fbff77451f',
    auth_token: '5d5d41cfc613ac014d4e52a1edad0e57',
    number: '+16178700392'
};
var twilio_client = require('twilio')(twilio_options.account_sid, twilio_options.auth_token);

// Declare an error handler for when we send messages and get an error we want to log
var twilio_err = function(error, message) {
    if (error) {
        console.log('Oops! There was an error:', error);
    }
};


///////////////////////////////////////////////////////////////////////////////
// opencnam

// Load and configure opencnam (http://www.opencnam.com/), a caller ID API, reached via node-opencnam https://github.com/telephonyresearch/node-opencnam
var opencnam = require('opencnam');
var opencnam_options = {
    account_sid: 'ACe2f3627a22e54a97a0f53c8903614990',
    auth_token: 'AUf4db49f5f30c45f8846725de0fcd8ac5'
};


///////////////////////////////////////////////////////////////////////////////
// Our SMS and DB logic 

var thank = function(number) {
    twilio_client.sms.messages.create({
        to: number,
        from: twilio_options.number,
        body: "Thanks for your interest!  We'll be in touch…"
    }, twilio_err);
}

// Declare a function to run when we receive a POST request from Twilio
var respondTo = function(req, name) { // Takes the request object and the name we compute with opencnam
    var data = {}; // Create an empty dictionary to send to Firebase
    data[req.body.MessageSid] = { // Point it at our unique MessageSid from Twilio
        from: req.body.From, // Save who the message is from…
        body: req.body.Body, // …what they say…
        name: name // …and the name we're passed
    };
    fb.set(data); // And then update the data on Firebase— see https://www.firebase.com/docs/web/guide/saving-data.html for more

    thank(req.body.From); // Send a thank-you SMS
};


///////////////////////////////////////////////////////////////////////////////
// Express routing

// When we receive a POST request at `/`
app.post('/', function(req, res) {
    opencnam.lookup(req.body.From, opencnam_options, function(err, name) { // …look up the caller ID
        if (!err) { // If we don't get an error
            respondTo(req, name); // respond to the request we receive and pass along the name we computer
        } else { // Otherwise log the error
            console.log("Oops, OpenCNAM error", err);
        }
    });
});

// When we receive a GET request at `/` (_i.e._ when someone goes to our homepage)
app.get('/', function(req, res) {
    // Serve up our `index.html` file relative to the current directory
    res.sendFile('./index.html', { root: '.' });
});

// Actually turn on our Express server now that we've configured it
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
