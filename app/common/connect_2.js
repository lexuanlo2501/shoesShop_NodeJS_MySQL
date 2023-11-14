const mysql = require('mysql')

const connection_2 = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME_2
})

connection_2.connect(function(err){
    if(err) console.log("Fail connection_2")
    else console.log("Success connection_2")
})

module.exports = connection_2