const db = require("../common/connect")

const History = {

}

History.get = async (result) => {
    try {
        await new Promise((resolve, reject) => {
            db.query("SELECT *, DATE_FORMAT(history_date, '%d/%m/%Y %r') AS history_date FROM history", (err, history) => {
                if(err) {
                    reject(err)
                    console.log(err)
                    result(null)
                    throw err
                }
                else {
                    result(history)
                    resolve()
                }
    
            })
        })
    } catch (error) {
        console.log(error)
        throw error
    }
    
}

History.create = async (data, result = () => {}) => {
    await new Promise((resolve, reject) => {
        db.query("INSERT INTO history SET ?", data, err => {
            if(err) {
                console.log(err)
                reject(err)
                result("Thực hiện ghi lịch sử thức bại")
                throw err
            }
            else {
                result("Đã ghi vào lịch sử giao dịch")
                resolve()
            }
        })

    })
}

module.exports = History