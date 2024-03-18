const jwt = require('jsonwebtoken')
const _APP = require('./_APP')


const generateRefreshToken = (user) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            {data:user}, 
            _APP.REFRESH_TOKEN,
            {
                algorithm: "HS256",
                expiresIn: "365d"
            },
            (err, _token) => {
                if(err) {
                    console.log(err)
                    return reject(err)
                }
                return resolve(_token)
            }
        )
    })
}


const make = (user) => {
    return new Promise((resolve, reject) => {
        jwt.sign(
            {data:user}, 
            _APP.ACCESS_TOKEN,
            {
                algorithm: "HS256",
                expiresIn: _APP.TOKEN_TIME_LIFE
            },
            (err, _token) => {
                if(err) {
                    console.log(err)
                    return reject(err)
                }
                return resolve(_token)
            }
        )
    })
}

let check = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, _APP.ACCESS_TOKEN, (err, data) => {
            if(err) {
                console.log(err)
                return reject(err)
            }
            return resolve(data)
        })
    })
}

let checkFresh = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, _APP.REFRESH_TOKEN, (err, data) => {
            if(err) {
                console.log(err)
                return reject(err)
            }
            return resolve(data)
        })
    })
}


module.exports = {
    make: make,
    check: check,
    generateRefreshToken: generateRefreshToken,
    checkFresh: checkFresh
}