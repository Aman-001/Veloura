const mongoose = require('mongoose');
const config = require('config');

const dbgr = require("debug")("development:mongoose");

const envUri = process.env.MONGODB_URI;
const configUri = config.has("MONGODB_URI") ? config.get("MONGODB_URI") : null;
const baseUri = envUri || configUri;

if (!baseUri) {
    throw new Error("MONGODB_URI is not set. Provide it via environment variables or config.");
}

const dbName = process.env.MONGODB_DB || "Veloura";

const buildMongoUri = (uri, databaseName) => {
    const parsed = new URL(uri);

    // Atlas SRV URLs often end with `/?retryWrites=...`; in that case the database
    // name must be inserted before the query string, not appended at the end.
    if (!parsed.pathname || parsed.pathname === "/") {
        parsed.pathname = `/${databaseName}`;
    }

    return parsed.toString();
};

const mongoUri = buildMongoUri(baseUri, dbName);

const globalForMongoose = globalThis;
if (!globalForMongoose.__mongooseConnectionPromise) {
    globalForMongoose.__mongooseConnectionPromise = mongoose.connect(mongoUri);
}

globalForMongoose.__mongooseConnectionPromise
    .then(() => {
        dbgr('Connected to MongoDB'); //it wont get printed in console until we set the env (i.e.)$env:DEBUG = "development:*"

    })
    .catch(err => {
        console.log('Error connecting to MongoDB:', err);
    });

module.exports = mongoose.connection;

//$env:NODE_ENV="development"; $env:DEBUG="development:*"; node app.js 
//this line i need to learn it later