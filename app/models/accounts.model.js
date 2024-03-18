const db = require("../common/connect")
const md5 = require("md5")
const sqlCustom = require('../common/sqlQuery')


const Accounts = (acc) => {

}



Accounts.get = async (result, id) => {
    
    // Kết nối đến cơ sở dữ liệu và nhận đối tượng db
   
    try {
        let sql = 
        id ? 
        `SELECT accName,fullName,email,phoneNumber, DATE_FORMAT(dateOfBirth, '%Y-%m-%d') as dateOfBirth,gender,role,isLock, DATE_FORMAT(date_create, '%d/%m/%Y %r') AS date_create, favorite FROM accounts WHERE accName='${id}'`
        :
        "SELECT accName,fullName,email,phoneNumber, DATE_FORMAT(dateOfBirth, '%Y-%m-%d') as dateOfBirth,gender,role,isLock, DATE_FORMAT(date_create, '%d/%m/%Y %r') AS date_create, favorite FROM accounts"
    
        const acc = await sqlCustom.executeSql(sql)
        let infor_acc = id ? acc[0] : acc
        if(id) {

            infor_acc.favorite = infor_acc.favorite ? acc[0]?.favorite.split(",").map(i => +i) : []
            const favorite_list_detail = []


            const favorite_list = await sqlCustom.executeSql(`
                SELECT A.id, A.brand_id, A.name, A.price, A.BC_color, A.img ,B.per 
                FROM products A, discount B 
                WHERE A.id IN (${infor_acc.favorite.toString() || 0}) AND A.discount_id = B.id
            `)
            console.log(favorite_list)

           
            infor_acc.favorite = favorite_list
            
        }
        result(infor_acc)

    } catch (error) {
        result(null)
        throw error
    }

    
    
    
}

Accounts.create = async (result, data) => {
    try {
        const {passwordCF, ...restData} = data
        if(passwordCF !== restData.password) {
            result({message:"Xác nhận mật khẩu không khớp", status:false})
            return
        }
        let dataRegister = {accName:"",fullName:"",email:"",password:"",phoneNumber:"",dateOfBirth:"",gender:""}
        dataRegister = {...restData, password:md5(restData.password)}


        // PHƯƠNG ÁN TẠM THỜI CHO 3 HÀM CHECK DƯỚI, KHÔNG TỐI ƯU CODE
        const check_accName = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM accounts WHERE accName = ?", dataRegister.accName, (err, resultSQL) => {
                if(err) reject(err)
                else resolve(resultSQL.length)
            })
        })
        const check_email = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM accounts WHERE email = ?", dataRegister.email, (err, resultSQL) => {
                if(err) reject(err)
                else resolve(resultSQL.length)
            })
        })
        const check_phoneNumber = await new Promise((resolve, reject) => {
            db.query("SELECT * FROM accounts WHERE phoneNumber = ?", dataRegister.phoneNumber, (err, resultSQL) => {
                if(err) reject(err)
                else resolve(resultSQL.length)
            })
        })

        if(check_accName+check_email+check_phoneNumber === 0) {
            await new Promise((resolve, reject) => {
                db.query("INSERT INTO accounts SET ?", dataRegister, (err, acc) => {
                    if (err) {
                        reject(err);
                        result({message:"Err", status:false})
                    } else {
                        resolve();
                        result({message:"Tạo tài khoản thành công", status:true})
                    }
                })
            })
        }
        else {
            let errMess = []
            if(check_accName === 1) {
                errMess.push("Tên tài khoản")
            }
            if (check_email === 1) {
                errMess.push("Email")
            }
            if (check_phoneNumber === 1) {
                errMess.push("Số điện thoại")
            }
            result({message:"Đã tồn tại " + errMess.join(", "), status:false})
        }

       
        
    } catch (error) {
        throw error
    }
    
}

Accounts.signIn = async (data, result) => {
    try {
        const {accName, password} = data
        
        await new Promise((resolve, reject) => {
            db.query("SELECT *, DATE_FORMAT(date_create, '%d/%m/%Y %r') AS date_create FROM accounts WHERE accName = ? AND password = ?", [accName, md5(password)], (err, acc) => {
                if (err) {
                    reject(err);
                    result({"message":"Tên đăng nhập hoặc mật khẩu không chính xác","status":false})
                } else if (acc.length === 1) {
                    resolve();
                    const {password, ...restData} = acc[0]
                    result({...restData, status:true , favorite: acc[0].favorite ? acc[0].favorite.split(",").map(i => +i) : [] })
                // result( id ? {...acc[0], favorite: acc[0].favorite.split(",").map(i => +i)} : acc)

                } else if(acc.length === 0) {
                    resolve();
                    result({"message":"Tên đăng nhập hoặc mật khẩu không chính xác","status":false})
                }
                
            })
        })
    } catch (error) {
        throw error
    }
}

Accounts.update = async (id,data, result) => {
    try {
        if(!data.email && !data.accName && !data.phoneNumber) {
            await sqlCustom.executeSql_value(`UPDATE accounts SET ? WHERE accName='${id}'`, data)
            result('Cập nhật thành công')
        }
        else {
            result('Chưa có tính năng thay đổi thông như: Số điện thoại, tên tài khoản, email')
        }
    } catch (error) {
        result(null)
        throw error
    }
}

Accounts.changePassword = async (id,data, result) => {
    try {
        const {oldPass, newPass, pass_confirm} = data
        const userInfor = await sqlCustom.executeSql(`SELECT password FROM accounts WHERE accName = '${id}'`)
        
        if(md5(oldPass) === userInfor[0].password && newPass === pass_confirm) {
            await sqlCustom.executeSql_value(`UPDATE accounts SET ? WHERE accName='${id}'`, {password:md5(newPass)})
            result("Đổi mật khẩu thành công")
        }
        else if (md5(oldPass) !== userInfor[0].password) {
            result("Mật khẩu cũ không chính xác")
        }
        else if (newPass !== pass_confirm) {
            result("Mật khẩu không khớp")
        }
    } catch (error) {
        result(null)
        throw error
    }
}

Accounts.forgotPassword = async (id,data, result) => {
    try {
        const {newPass, pass_confirm} = data
        if (newPass === pass_confirm) {
            await sqlCustom.executeSql_value(`UPDATE accounts SET ? WHERE email='${id}'`, {password:md5(newPass)})
            result("Đổi mật khẩu thành công")
        }
        else {
            result("Mật khẩu không khớp")
        }
    } catch (error) {
        result(null)
        throw error
    }
}

Accounts.favoriteList = async (accName, product_id, result) => {
    try {
        // LẤY DS SP YÊU THÍCH TỪ THÔNG TIN user 
        const inforUser_favorite = await sqlCustom.executeSql(`SELECT favorite FROM accounts WHERE accName = '${accName}'`)
        
        const handleFavorite = (arr, id) => {
            let result = arr.includes(id) ? arr.filter(i => i!==id):[...arr, id]
            return result
        }

        // SỬ LÝ CHUỖI THÀNH MẢNG VD favorite:"60,61,59" ==> [60,62,59]
        let favorite_result = handleFavorite(inforUser_favorite[0].favorite.split(',').map(i => +i) , product_id)
        await sqlCustom.executeSql_value(`UPDATE accounts SET ? WHERE accName='${accName}'`, {favorite: favorite_result.toString()})
        
        
        result(favorite_result)


    } catch (error) {
        result(null)
        throw error
    }
}

Accounts.rating = async (data, result) => {
    try {
        await sqlCustom.executeSql_value("INSERT INTO rate SET ?", data)
        // db.query("INSERT INTO accounts SET ?", dataRegister, (err, acc) => {
        result("Đánh giá sản phẩm thành công")
    } catch (error) {
        result(null)
        throw error
    }
}




module.exports = Accounts
