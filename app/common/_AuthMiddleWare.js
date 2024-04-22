const { executeSql } = require('./sqlQuery')

let isAuth = async (req, res, next) => {
    let _JWT = require('../common/_JWT')
    let _token = req.headers.authorization
//    console.log("------_token")
//    console.log(_token)
    if(_token) {
        try {
            let authorData = await _JWT.check(_token)
            req.auth = authorData
            next()
        }
        catch(err) {
            return res.status(403).json("Mã token không hợp lệ")
        }
    }
    else {
        return res.status(401).json("Bạn chưa gửi kèm mã token")
    }
}

let isAunth_AdminUser =  (req, res, next) => {
    isAuth(req, res, () => {
        // console.log("-----in fn isAunth_AdminUser")
        // console.log(req.auth.data)
        if(req.auth.data.accName == req.params.id || req.auth.data.role === "admin" ) {
            next()
        }
        else {
            res.status(403).json("Bạn không có quyền thực hiện chức năng này")
        }
    })
}

let isAdmin =  (req, res, next) => {
    isAuth(req, res, () => {
        // console.log("-----in fn isAdmin")
        // console.log(req.auth.data)
        if(req.auth.data.role === "admin" ) {
            next()
        }
        else {
            res.status(403).json("Bạn không có quyền thực hiện chức năng này")
        }
    })
}

let isAdminSeller =  (req, res, next) => {
    isAuth(req, res, () => {
        // console.log("-----in fn isAdmin")
        // console.log(req.auth.data)
        if(req.auth.data.role === "admin" || req.auth.data.role === "seller" ) {
            next()
        }
        else {
            res.status(403).json("Bạn không có quyền thực hiện chức năng này")
        }
    })
}

const isAunthUpdProd_sellerAdmin =  (req, res, next) => {
    // Người bán đc phép tùy chỉnh sản phẩm của họ
    isAuth(req, res, async () => {
        const prod =(await executeSql(`SELECT seller_id FROM products WHERE id=${req.params.id}`))[0]
        if(prod.seller_id == req.auth.data.accName || req.auth.data.role === "admin" ){
            next()
        }
        else {
            res.status(403).json("Bạn không có quyền thực hiện chức năng này")
        }
    })
}

const isAunthOrders_userAdmin =  (req, res, next) => {
    // Người dùng được xem đơn hàng của họ (xác thực bằng _clientId)
    // Người bán được xem đơn hàng của họ bán được (xác thực bằng _sellerId)
    // Admin xem đc ALL (xác thực bằng role === "admin")

    isAuth(req, res, async () => {
        const {_clientId, _sellerId} = req.query
        let order = {}
        if(req.params.id) {
            // nếu có truyền params /:id thì check trong DB orders để lấy ra client_id
            order =(await executeSql(`SELECT client_id FROM orders WHERE id=${req.params.id}`))[0]
        }
        if( req.auth.data.accName === order.client_id || req.auth.data.accName === _clientId || req.auth.data.accName === _sellerId || req.auth.data.role === "admin" ){
            next()
        }
        else {
            res.status(403).json("Bạn không có quyền thực hiện chức năng này")
        }
    })
}


const isAunthOrdersModify_userAdmin =  (req, res, next) => {
    isAuth(req, res, async () => {
        const order =(await executeSql(`
            SELECT seller_id, client_id  FROM detail_order 
            INNER JOIN products ON products.id = detail_order.product_id
            INNER JOIN orders ON orders.id = detail_order.order_id
            WHERE order_id=${req.params.id} LIMIT 1
        `))[0]
        console.log(order)

        if( req.auth.data.accName === order?.seller_id || req.auth.data.accName === order?.client_id || req.auth.data.role === "admin" ){
            next()
        }
        else {
            res.status(403).json("Bạn không có quyền thực hiện chức năng này")
        }
    })
}


module.exports = {
    isAuth: isAuth,
    isAdmin: isAdmin,
    isAunth_AdminUser: isAunth_AdminUser,
    isAunthUpdProd_sellerAdmin: isAunthUpdProd_sellerAdmin,
    isAdminSeller: isAdminSeller,
    isAunthOrders_userAdmin: isAunthOrders_userAdmin,
    isAunthOrdersModify_userAdmin:isAunthOrdersModify_userAdmin,
}