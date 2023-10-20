const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware');

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

// const proxy = createProxyMiddleware({
//     target: 'localhost:5000/create_payment_url',
//     changeOrigin: true,
//     onProxyRes: (proxyRes, req, res) => {
//       if (proxyRes.headers.location) {
//         // Redirect đến URL mới
//         const newLocation = 'https://sandbox.vnpayment.vn' + proxyRes.headers.location;
//         res.setHeader('Location', newLocation);
//         res.status(301).end();
//       }
//     },
//   });
// app.use('/', proxy);

require('./app/routes/shoes.router')(app)
require('./app/routes/accounts.router')(app)
require('./app/routes/history.router')(app)
require('./app/routes/brand.router')(app)
require('./app/routes/type.router')(app)
require('./app/routes/orders.router')(app)
require('./app/routes/discount.router')(app)











app.listen(5000, () => {
    console.log("Server is running on 5000")
})