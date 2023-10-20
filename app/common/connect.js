const mysql = require('mysql')

const connection = mysql.createConnection({
    host: "localhost",
    user: 'root',
    password: '',
    database: 'shoes'
})

connection.connect(function(err){
    if(err) console.log("Fail")
})

module.exports = connection