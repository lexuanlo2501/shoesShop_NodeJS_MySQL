const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require("dotenv").config();

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors({
    // origin: 'http://localhost:3000',
    // origin: true,
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // Allow sending cookies and other credentials
    // allowedHeaders:true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    exposedHeaders:"X-Total-Count"
}));

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With,content-type, Accept');
//     next()
// })


require('./app/routes/shoes.router')(app)
require('./app/routes/accounts.router')(app)
require('./app/routes/history.router')(app)
require('./app/routes/brand.router')(app)
require('./app/routes/type.router')(app)
require('./app/routes/orders.router')(app)
require('./app/routes/discount.router')(app)





app.listen(process.env.PORT, () => {
    console.log("Server is running on 5000")
})