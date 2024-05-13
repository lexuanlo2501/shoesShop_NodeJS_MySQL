const Accounts = require("../models/accounts.model")
const JWT = require("../common/_JWT")
const sqlCustom = require('../common/sqlQuery')


exports.get_account = (req, res) => {
    Accounts.get(response => {
        res.send(response)
    }, req.params.id)
}

exports.get_account_lite = (req, res) => {
    Accounts.get_lite(response => {
        res.send(response)
    }, req.params.id)
}

exports.create_account = (req, res) => {
    Accounts.create(response => {
        res.send(response)

    }, req.body)
}

exports.signIn = (req, res) => {
    // req.session.accName = req.body.accName;
    Accounts.signIn(req.body, response => {
        res.send(response)
    })
}


exports.signIn_2 = (req, res) => {
    // req.session.accName = req.body.accName;
    Accounts.signIn(req.body, async (response) => {
        
        if(response.status) {
            let {password, email, phoneNumber, date_create, dateOfBirth, gender,...rest} = response

            const _token = await JWT.make(rest) 
            const _refreshToken = await JWT.generateRefreshToken(rest)
            
            res.cookie("refreshToken", _refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
                // sameSite: 'none'
            })
            await sqlCustom.executeSql_value("INSERT INTO refreshtokens SET ?", {accName:response.accName, value: _refreshToken})

            res.status(200).json({accessToken: _token, status:true})
        }
        else {
            res.status(200).json(response)
        }

    })
}



exports.userLogOut = async(req, res) => {
    res.clearCookie("refreshToken")
    await sqlCustom.executeSql(`DELETE FROM refreshtokens WHERE accName = '${req.params.id}'`)
    res.status(200).json("Logged out")
}

exports.update_acc = (req, res) => {
    Accounts.update(req.params.id, req.body, response => {
        res.send(response)
    })
}

exports.change_password = (req, res) => {
    Accounts.changePassword(req.params.id, req.body, response => {
        res.send(response)
    })
}

exports.forgot_password = (req, res) => {
    Accounts.forgotPassword(req.params.id, req.body, response => {
        res.send(response)
    })
}

exports.favorite_list = (req, res) => {
    Accounts.favoriteList(req.params.id, req.body.product_id, response => {
        res.send(response)
    })
}

exports.rating_product = (req, res) => {
    Accounts.rating(req.body, (response) => {
        res.send(response)
    })
}




exports.requestRefreshToken = async(req, res) => {
    const refreshToken = req.cookies.refreshToken
    
    // console.log("-----in func requestRefreshToken")
    // console.log(req.cookies)

    if(!refreshToken) {
        return res.status(401).json("Bạn chưa đăng nhập")
    }

    // temporary method (fake database)
    // if(!refreshTokens.includes(refreshToken)){
    //     return res.status(403).json("Refresh token is not valid")
    // }

    try {
        // refreshTokens = refreshTokens.filter(token => token !== refreshToken)

        let authorData = await JWT.checkFresh(refreshToken)
       
        const newAccessToken = await JWT.make(authorData?.data) 
        const newRefreshToken = await JWT.generateRefreshToken(authorData?.data)


        res.cookie("refreshToken", newRefreshToken, {
            httpOnly:true,
            secure: false,
            path: "/",
            sameSite: "strict"
        })
        res.status(200).json({
            accessToken: newAccessToken,
        })


    }
    catch(err) {
        console.log(err)
        res.status(500).json("err")
        
    }

    // res.status(200).json(refreshToken)
}

exports.requestRefreshToken_v2 = async(req, res) => {
    // const refreshToken = req.body.refreshToken
    const refreshToken = req.cookies.refreshToken

    let refreshToken_user = await sqlCustom.executeSql(`SELECT * FROM refreshtokens WHERE accName = '${req.body.accName}'`)
    refreshToken_user = refreshToken_user[0]?.value
    if(refreshToken_user) {
        console.log("excute refreshTokens")
        console.log(refreshToken)
        if(refreshToken === refreshToken_user) {
            console.log("auth true")
        }
        let authorData = await JWT.checkFresh(refreshToken_user)
       
        const newAccessToken = await JWT.make(authorData?.data) 
        const newRefreshToken = await JWT.generateRefreshToken(authorData?.data)

        await sqlCustom.executeSql_value("UPDATE refreshtokens SET value = ? WHERE accName = ?", [newRefreshToken, req.body.accName])

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly:true,
            secure: false,
            path: "/",
            sameSite: "strict"
        })
        res.status(200).json({
            accessToken: newAccessToken,
        })
    }
    else {
        res.status(500).json("refreshToken không hợp lệ")
    }
}

// ADDRESS

exports.get_address = (req, res) => {
    try {
        Accounts.getAddress(req.params.id, response => {
            res.status(200).json(response)
        })
    } catch (error) {
        res.status(500).json("err")
        throw error
    }
}

exports.add_address = (req, res) => {
    try {
        Accounts.addAddress(req.body, response => {
            res.status(200).json(response)
        })
    } catch (error) {
        res.status(500).json("err")
        throw error
    }
}

exports.del_address = (req, res) => {
    try {
        Accounts.delAddress(req.params.id, response => {
            res.status(200).json(response)
        })
    } catch (error) {
        res.status(500).json("err")
        throw error
    }
}


