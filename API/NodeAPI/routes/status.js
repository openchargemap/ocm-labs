var mongo = require('mongodb');

var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');

var server = new Server('localhost', 27017, { auto_reconnect: true, safe: true });

var db = new Db('ocm_mirror', server);

exports.checkAPIStatus = function (req, res) {

	//TODO: check status, age and version of cache
	res.send(
		{
			status:
			{
				APIVersion:2,
				Status: "OK",
				Description : "Open Charge Map Mirror API V1."
			}
		}
	);
}