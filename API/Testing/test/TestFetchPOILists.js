var supertest = require("supertest");
var should = require("should");
var assert = require("assert");

var server = supertest.agent("http://api.openchargemap.io");
//var server = supertest.agent("http://localhost:8080");

// Begin Tests

describe("Fetch POI List via API V0", function () {
    it("Return a list of 5 US based POIs", function (done) {
        testFetchPOIList("/?output=json&countrycode=US&maxresults=" + 5, 5, 2)
            .expect(200, done); // complete test (HTTP Status 200 OK)
    });
});

describe("Fetch POI List via API V1", function () {
    it("Return a list of 5 US based POIs", function (done) {
        testFetchPOIList("/v1/?output=json&countrycode=US&maxresults=" + 5, 5, 2)
            .expect(200, done);
    });
});

describe("Fetch POI List via API V2", function () {
    it("Return a list of 5 GB based POIs", function (done) {
        testFetchPOIList("/v2/poi/?output=json&countrycode=GB&maxresults=" + 5, 5, 1)
            .expect(200, done);
    });
});

describe("Fetch POI List via API V3", function () {
    it("Return a list of 5 US based POIs", function (done) {
        testFetchPOIList("/v3/poi/?output=json&countrycode=US&maxresults=" + 5, 5, 2)
            .expect(200, done);
    });
});

/////////////////// Test Helpers ///////////////////////////
function testFetchPOIList(apiParams, expectedNumPOIs, expectedCountryID) {

    return (server
        .get(apiParams)
        .expect("Content-type", /json/)

        .expect(function (res) {

            assert(res.body.length == expectedNumPOIs, "Did not get the required number of POIs.");
            assert(res.body[0].AddressInfo != null, "POI should have an AddressInfo.");

            if (expectedCountryID != null) {
                assert(res.body[0].AddressInfo.CountryID == expectedCountryID, "POI does not match expected country.");
            }
        }));

}