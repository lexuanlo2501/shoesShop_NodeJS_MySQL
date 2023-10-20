const db = require("../common/connect")

const sqlCustom = require('../common/sqlQuery')

const Discounts = (discount) => {

}

Discounts.get = async (result) => {
    try {
        const discounts = await sqlCustom.executeSql_SelectAll("discount")
        result(discounts)
    } catch (error) {
        result(null)
        throw error
    }
}

Discounts.create = async (data, result) => {
    try {
        await sqlCustom.executeSql_value(`INSERT INTO discount SET ?`,data)
        result("Thêm khuyến mãi thành công")
    } catch (error) {
        result(null)
        throw error
    }
}

Discounts.delete = async (id, result) => {
    try {
        await sqlCustom.executeSql(`DELETE FROM discount WHERE id = ${id}`)
        result("Xóa khuyến mãi thành công")
    } catch (error) {
        result(null)
        throw error
    }
}

module.exports = Discounts