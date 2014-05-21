OCM Cache/Mirror API
-----------------------

Requires:

NodeJS/NPM
MongoDB setup (config file):http://docs.mongodb.org/manual/tutorial/install-mongodb-on-windows/
Create empty ocm_mirror database on MongoDB

install dependencies: npm install
run: node server.js

API will fetch the latest full database as JSON and insert into a ocm_mirror MongoDB database (create before running).

Query: http://localhost:3000/v2/poi/?


Notes: script creates a new SpatialPosition property (GeoJSON) for each POI and creates a Spatial Index on that property. The SpatialPosition property is not a standard part of OCM API output.