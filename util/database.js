const MongoClient = require("mongodb").MongoClient;
let db;

exports.mongoConnect = (callback) => {
    MongoClient.connect("mongodb://localhost:27017")
        .then(client => {
           db = client.db("shop");
           callback();
        })
        .catch(err => console.log(err.message));
};

exports.getDb = () => {
    if (db) {
        return db
    }
    throw("No db found");
}

