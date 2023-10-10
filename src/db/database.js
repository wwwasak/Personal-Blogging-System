const sqlite = require("sqlite");
const sqlite3 = require('sqlite3');
const fs = require('fs');


const dbPromise = sqlite.open({
    filename: "./blog-database.db",
    driver: sqlite3.Database
});


module.exports = {
    dbPromise
};
