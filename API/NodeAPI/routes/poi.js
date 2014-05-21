var mongo = require('mongodb');

var Db = require('mongodb').Db,
    //MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    //ReplSetServers = require('mongodb').ReplSetServers,
    //ObjectID = require('mongodb').ObjectID,
    //Binary = require('mongodb').Binary,
    //GridStore = require('mongodb').GridStore,
    //Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');

var server = new Server('localhost', 27017, { auto_reconnect: true, safe: true });
var refreshPOIList = false;

var db = new Db('ocm_mirror', server);
var apiReady = false;

var apiReadyCheck = function (req, res) {
    if (apiReady) {
      
        return true;
    } else {
        apiReportError("Mirror API Not Ready");
        return false;
    }
};

var apiReportError = function (req, res, msg) {
    res.send({ error: msg })
};

exports.findAll = function (req, res) {
    if (apiReadyCheck(req, res)) {
        db.open(function (err, db) {
            if (err == null) {
                db.collection('poi', function (err, poiCollection) {

                    if (err == null) {
                        //TODO: handle error
                    }
                    var latitude = parseFloat(req.query.latitude);
                    var longitude = parseFloat(req.query.longitude);

                    var p_distance = req.query.distance;

                    var maxDistance = 1000;
                    if (p_distance != null) maxDistance = parseFloat(p_distance) * 1000; //distance in meters fom KM

                    console.log("latitude:" + latitude);
                    console.log("longitude:" + longitude);
                    console.log("distance:" + maxDistance);

                    var findOptions = {};
                    if (latitude != null && !isNaN(latitude) && longitude != null && !isNaN(longitude) && maxDistance != null && !isNaN(maxDistance)) {
                        findOptions.SpatialPosition = {
                            $near:
                                 {
                                     $geometry: {
                                         type: "Point",
                                         coordinates: [longitude, latitude]
                                     },
                                     $maxDistance: maxDistance
                                 }
                        };
                    }


                    var poiList = poiCollection.find(findOptions);

                    if (poiList && poiList != null) {
                        poiList.toArray(function (err, result) {
                            if (err) console.log(err.toString());
                            else {

                                console.log("poi.findAll returning " + result.length.toString() + " POIs maxdistance:" + maxDistance);
                                res.send(result);
                                db.close();
                            }
                        });

                    } else {
                        if (err && err != null) {
                            console.log("poi.findAll returned no results");
                            res.send({ message: "no matching results" });
                        } else {
                            console.log("poi.findAll returned error");
                            res.send({ error: err.toString() });
                        }

                    }
                });
            } else {
                apiReportError(err.toString);s
            }
            
        });
    }
}

var populatePOICacheDB = function () {

    //fetch fresh POI collection from main api
    var request = require('request');
    request('http://api.openchargemap.io/v2/poi/?includecomments=true&maxresults=50000', function (error, response, results) {
        if (!error && response.statusCode === 200) {
            //results variable now contains poi array
            var poiCollection = db.collection("poi");

            poiCollection.remove();

            var poiList = eval(results);

            //create spatialPosition GeoJSON column for indexing
            for (var i = 0; i < poiList.length; i++) {
                poiList[i].SpatialPosition = {
                    type: "Point",
                    coordinates: [poiList[i].AddressInfo.Longitude, poiList[i].AddressInfo.Latitude]
                }
            }

            //create spatial index
            poiCollection.ensureIndex({ SpatialPosition: "2dsphere" }, { "name": "SpatialIndex" });

            //            poiCollection.ensureIndex({ "SpatialPosition.coordinates": "2d" }, { "name": "SpatialIndex" });

            console.log("POI results: " + poiList.length);

            // Insert a into POI Cache
            if (poiCollection != null) {
                poiCollection.insert(poiList, function (err, result) {
                    if (err!=null) console.log(err.toString());
                    else {
                        console.log("POI Inserted OK, mirror API initialisation completed");
                        apiReady = true;
                    }
                    db.close();
                });

            } else {
                console.log("No POI Collection found");
            }

        } else {
            console.log(error);
        }
    });

}

exports.initAPI = function (req, res){

    console.log("Performing initAPI for OCM Mirror API");
    db.open(function (err, db) {
        if (!err) {
            console.log("Connected to 'ocm_mirror' database");
            var poiCollection = db.collection('poi');

            if (poiCollection == null) {
                console.log(err.toString() + " The 'POI' collection doesn't exist. Fetching from Main API");
                populatePOICacheDB();

            } else {
                poiCollection.find().toArray(function (err, results) {
                    if (results === null || results.length === 0) {
                        console.log("The 'POI' collection is empty. Fetching from Main API");
                        populatePOICacheDB();
                    } else {
                        console.log("Current DB has " + results.length + " POIs");
                        apiReady = true;
                    }
                });
            }
        }
    });
}