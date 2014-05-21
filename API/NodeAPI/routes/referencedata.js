var mongo = require('mongodb');

var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');

var server = new Server('localhost', 27017, { auto_reconnect: true, safe: true });

var db = new Db('ocm_mirror', server);

exports.getCoreReferenceData = function (req, res) {
    db.open(function (err, db) {

        db.collection('reference', function (err, refDataCollection) {
            refDataCollection.findOne({}, function (err, doc) {
                res.send(doc);
                db.close();
            });

        });

    });

};

exports.initCoreReferenceData = function () {
    var request = require('request');

    db.open(function (err, db) {
        if (!err) {

            console.log("Fetching core reference data");
            request('http://api.openchargemap.io/v2/referencedata/', function (error, response, results) {
                if (!error && response.statusCode === 200) {
                    //results variable now contains reference data object

                    var referenceDataCollection = db.collection("reference");

                    referenceDataCollection.remove();
                    console.log(results.toString());
                    var refData = eval('(' + results + ')');

                    referenceDataCollection.insert(refData, function (err, result) {
                        if (err != null) console.log(err.toString());
                        else {
                            console.log("Reference data refreshed OK");
                        }
                        db.close();
                    });


                } else {
                    console.log(error);
                }
            });

        }

    });
};