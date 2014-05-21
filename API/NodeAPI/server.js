//http://coenraets.org/blog/2012/10/creating-a-rest-api-using-node-js-express-and-mongodb/

var express = require('express'),
    poi = require('./routes/poi'),
    referencedata = require('./routes/referencedata.js');

var app = express();

app.get('/v2/poi', poi.findAll);
app.get('/v2/referencedata', referencedata.getCoreReferenceData);
//app.get('/v2/poi/:id', wines.findById);

app.listen(3000);
console.log('OCM Mirror API Server Listening On Port 3000...');

poi.initAPI();

referencedata.initCoreReferenceData();