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
    exposedHeaders:"X-Total-Count"
}));


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