const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const sessionMiddleware = require('./config/session');
const cookieParser = require('cookie-parser')

require("dotenv").config();

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors({
    origin: 'http://localhost:3000',
    // origin: "*",
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD','DELETE', 'PATCH'],
    credentials: true, // Allow sending cookies and other credentials
    // allowedHeaders:true,
    // allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    exposedHeaders:"X-Total-Count"
}));
app.use(cookieParser())

app.use(sessionMiddleware);

require('./app/routes/shoes.router')(app)
require('./app/routes/accounts.router')(app)
require('./app/routes/history.router')(app)
require('./app/routes/brand.router')(app)
require('./app/routes/type.router')(app)
require('./app/routes/orders.router')(app)
require('./app/routes/discount.router')(app)
require('./app/routes/category.router')(app)
require('./app/routes/sizesValue.router')(app)
require('./app/routes/notify.router')(app)
require('./app/routes/dashboard.route')(app)
require('./app/routes/comments.route')(app)










app.listen(process.env.PORT, () => {
    console.log("Server is running on 5000")
})