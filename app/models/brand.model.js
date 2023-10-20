const db = require("../common/connect")

const Brands = (Brand) => {

}

const sqlCustom = require('../common/sqlQuery')

Brands.get_all = async (result) => {
    try {
        const brands = await sqlCustom.executeSql_SelectAll("brands")
        result(brands)
    } catch (error) {
        result(null)
        throw error
    }
}


Brands.create = async (data, result) => {
    try {
        await sqlCustom.executeSql_value(`INSERT INTO brands SET ?`,data)
        result("Thêm hãng sản phẩm thành công")
    } catch (error) {
        result(null)
        throw error
    }
}

Brands.delete = async (id, result) => {
    try {
        await sqlCustom.executeSql(`DELETE FROM brands WHERE brand_id = '${id}'`)
        result("Xóa hãng sản phẩm thành công")
    } catch (error) {
        result(null)
        throw error
    }
}


module.exports = Brands
