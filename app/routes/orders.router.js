
const moment = require('moment');
const _AuthMiddleWare = require('../common/_AuthMiddleWare')


function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}


module.exports = (router) => {

    const ordersController = require("../controllers/orders.controller")
    router.get("/orders", ordersController.get_orders)
    router.get("/orders/:id", ordersController.get_orders)
    router.post("/orders", _AuthMiddleWare.isAuth,ordersController.create_orders)
    router.delete("/orders/:id", ordersController.delete_orders)
    router.patch("/orders/:id", ordersController.update_orders)
    router.post("/rating", ordersController.rating_product)

    router.get("/revenue_day", ordersController.revenue_day)



    // router.post('/create_payment_url', function (req, res, next) {

    //     var ipAddr = req.headers['x-forwarded-for'] ||
    //         req.connection.remoteAddress ||
    //         req.socket.remoteAddress ||
    //         req.connection.socket.remoteAddress;

    
    //     var config = require('config');
    
        
    //     var tmnCode = config.get('vnp_TmnCode');
    //     var secretKey = config.get('vnp_HashSecret');

    //     var vnpUrl = config.get('vnp_Url');
    //     var returnUrl = config.get('vnp_ReturnUrl');
    
    //     var date = new Date();
    //     function dateFormat(date, format) {
    //         const year = date.getFullYear();
    //         const month = String(date.getMonth() + 1).padStart(2, '0');
    //         const day = String(date.getDate()).padStart(2, '0');
    //         const hours = String(date.getHours()).padStart(2, '0');
    //         const minutes = String(date.getMinutes()).padStart(2, '0');
    //         const seconds = String(date.getSeconds()).padStart(2, '0');

    //         if(format === "yyyymmddHHmmss") {
    //             return +`${year}${month}${day}${hours}${minutes}${seconds}`;
    //         }
    //         else {
    //             return +`${year}${month}${day}`;
    //         }
            
    //     }

    //     var createDate = dateFormat(date,"yyyymmddHHmmss")
    //     // var orderId = dateFormat(date)
    //     var orderId = dateFormat(date,"yyyymmddHHmmss")
    //     var amount = req.body.amount;
    //     var bankCode = req.body.bankCode;
        
    //     var orderInfo = req.body.orderDescription;
    //     var orderType = req.body.orderType;
    //     var locale = req.body.language;
    //     if(locale === null || locale === ''){
    //         locale = 'vn';
    //     }
    //     var currCode = 'VND';
    //     var vnp_Params = {};
    //     vnp_Params['vnp_Version'] = '2.1.0';
    //     vnp_Params['vnp_Command'] = 'pay';
    //     vnp_Params['vnp_TmnCode'] = tmnCode;
    //     // vnp_Params['vnp_Merchant'] = ''
    //     vnp_Params['vnp_Locale'] = locale;
    //     vnp_Params['vnp_CurrCode'] = currCode;
    //     vnp_Params['vnp_TxnRef'] = orderId;
    //     vnp_Params['vnp_OrderInfo'] = orderInfo;
    //     vnp_Params['vnp_OrderType'] = orderType;
    //     vnp_Params['vnp_Amount'] = amount * 100;
    //     vnp_Params['vnp_ReturnUrl'] = returnUrl;
    //     vnp_Params['vnp_IpAddr'] = ipAddr;
    //     vnp_Params['vnp_CreateDate'] = createDate;
    //     if(bankCode !== null && bankCode !== ''){
    //         vnp_Params['vnp_BankCode'] = bankCode;
    //     }
    
    //     var sortObject = require('sortObject').default;
    //     vnp_Params = sortObject(vnp_Params);


    
    //     var querystring = require('qs');
    //     var signData = querystring.stringify(vnp_Params, { encode: false });
    //     var crypto = require("crypto");     
    //     var hmac = crypto.createHmac("sha512", secretKey);
    //     var signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    //     vnp_Params['vnp_SecureHash'] = signed;
    //     vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    
    //     // res.redirect(vnpUrl)
    //     res.send(vnpUrl)

    // });


        
    router.post('/create_payment_url', function (req, res, next) {
        
        process.env.TZ = 'Asia/Ho_Chi_Minh';
        
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let config = require('config');
        
        let tmnCode = config.get('vnp_TmnCode');
        let secretKey = config.get('vnp_HashSecret');
        let vnpUrl = config.get('vnp_Url');
        let returnUrl = config.get('vnp_ReturnUrl');
        let orderId = moment(date).format('DDHHmmss');
        let amount = req.body.amount;
        // let bankCode = req.body.bankCode;
        
        let locale = req.body.language;
        if(locale === null || locale === ''){
            locale = 'vn';
        }
        let currCode = 'VND';
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        // if(bankCode !== null && bankCode !== ''){
        //     vnp_Params['vnp_BankCode'] = bankCode;
        // }

        vnp_Params = sortObject(vnp_Params);

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");     
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

        // res.redirect(vnpUrl)
        res.send(vnpUrl)
    });

    router.get('/vnpay_return', function (req, res, next) {
        let vnp_Params = req.query;

        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);

        let config = require('config');
        let tmnCode = config.get('vnp_TmnCode');
        let secretKey = config.get('vnp_HashSecret');

        let querystring = require('qs');
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");     
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     

        if(secureHash === signed){
            //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua

            res.render('success', {code: vnp_Params['vnp_ResponseCode']})
        } else{
            res.render('success', {code: '97'})
        }
    });


    router.get('/vnpay_ipn', function (req, res, next) {
        var vnp_Params = req.query;
        var secureHash = vnp_Params['vnp_SecureHash'];
    
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
    
        vnp_Params = sortObject(vnp_Params);
        var config = require('config');
        var secretKey = config.get('vnp_HashSecret');
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");     
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
         
    
        if(secureHash === signed){
            var orderId = vnp_Params['vnp_TxnRef'];
            var rspCode = vnp_Params['vnp_ResponseCode'];
            //Kiem tra du lieu co hop le khong, cap nhat trang thai don hang va gui ket qua cho VNPAY theo dinh dang duoi
            res.status(200).json({RspCode: '00', Message: 'success'})
        }
        else {
            res.status(200).json({RspCode: '97', Message: 'Fail checksum'})
        }
    });


}


// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1806000&vnp_Command=pay&vnp_CreateDate=20210801153333&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+%3A5&vnp_OrderType=other&vnp_ReturnUrl=https%3A%2F%2Fdomainmerchant.vn%2FReturnUrl&vnp_TmnCode=WF87XKNJ&vnp_TxnRef=5&vnp_Version=2.1.0&vnp_SecureHash=3e0d61a0c0534b2e36680b3f7277743e8784cc4e1d68fa7d276e79c23be7d6318d338b477910a27992f5057bb1582bd44bd82ae8009ffaf6d141219218625c42
// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1806000&vnp_Command=pay&vnp_CreateDate=20210801153333&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+%3A5&vnp_OrderType=other&vnp_ReturnUrl=https%3A%2F%2Fdomainmerchant.vn%2FReturnUrl&vnp_TmnCode=DEMOV210&vnp_TxnRef=5&vnp_Version=2.1.0&vnp_SecureHash=3e0d61a0c0534b2e36680b3f7277743e8784cc4e1d68fa7d276e79c23be7d6318d338b477910a27992f5057bb1582bd44bd82ae8009ffaf6d141219218625c42

// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=2806000&vnp_Command=pay&vnp_CreateDate=20231014155233&vnp_CurrCode=VND&vnp_IpAddr=192.168.1.52&vnp_OrderInfo=THANH TOAN&vnp_OrderType=other&vnp_ReturnUrl=http://localhost:3000/order&vnp_TmnCode=WF87XKNJ&vnp_TxnRef=20231014&vnp_Version=2.1.0&vnp_SecureHash=a912da3c04fb099b6732f5cdbcff739c62907b0a9e5ced16957f14d0277b8f47e898c2e28ab9bb1c01698f210d3a9c33e742db8b472bebdbf38197cbd9c36346





// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1000000&vnp_Command=pay&vnp_CreateDate=20231014211108&vnp_CurrCode=VND&vnp_IpAddr=%3A%3A1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+cho+ma+GD%3A14211108&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Forder&vnp_TmnCode=WF87XKNJ&vnp_TxnRef=14211108&vnp_Version=2.1.0&vnp_SecureHash=42066d61c18d59d7e56c926fc90131f844c34bd70629a9f41e9609012b47ddd168e762a9aba0446ae46ddb7a93dbab56b2e2fef9777c772875e83104c327ac69

// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1000000&vnp_Command=pay&vnp_CreateDate=20231014205645&vnp_CurrCode=VND&vnp_IpAddr=%3A%3A1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+cho+ma+GD%3A14205645&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Forder&vnp_TmnCode=WF87XKNJ&vnp_TxnRef=14205645&vnp_Version=2.1.0&vnp_SecureHash=2bbe2332494c81e1410e40651224ebe14045cdaeb8a114eb282fb8fd7f1f1f2dfe3ef2af02763e7b6ead5cf3faa3e2f18fcdfbfc837f5c9458bf7285c529d8de

// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1000000&vnp_Command=pay&vnp_CreateDate=20231014205645&vnp_CurrCode=VND&vnp_IpAddr=%3A%3A1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+cho+ma+GD%3A14205645&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A3000%2Forder&vnp_TmnCode=WF87XKNJ&vnp_TxnRef=14205645&vnp_Version=2.1.0&vnp_SecureHash=2bbe2332494c81e1410e40651224ebe14045cdaeb8a114eb282fb8fd7f1f1f2dfe3ef2af02763e7b6ead5cf3faa3e2f18fcdfbfc837f5c9458bf7285c529d8de