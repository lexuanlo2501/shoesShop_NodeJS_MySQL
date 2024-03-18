let isAuth = async (req, res, next) => {
    let _JWT = require('../common/_JWT')
    let _token = req.headers.authorization
   console.log("------_token")
   console.log(_token)
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


module.exports = {
    isAuth: isAuth,
    isAdmin: isAdmin,
    isAunth_AdminUser: isAunth_AdminUser,
}