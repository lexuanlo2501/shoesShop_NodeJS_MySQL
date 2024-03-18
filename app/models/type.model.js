const Type = () => {

}
const db = require("../common/connect")

const sqlCustom = require('../common/sqlQuery')


Type.get_all = async (result) => {
    try {
        const types = await sqlCustom.executeSql_SelectAll("types")
        result(types)
    } catch (error) {
        result(null)
        throw error
    }
}

Type.create = async (data, result) => {
    try {
        await sqlCustom.executeSql_value(`INSERT INTO types SET ?`,data)
        result("Thêm loại sản phẩm thành công")
    } catch (error) {
        result(null)
        throw error
    }
}

Type.delete = async (id, result) => {
    try {
        await sqlCustom.executeSql(`DELETE FROM types WHERE id = ${id}`)
        result("Xóa loại sản phẩm thành công")
    } catch (error) {
        result(null)
        throw error
    }
}

Type.update = async (id, dataBody, result) => {
    try {
        const category = await sqlCustom.executeSql(`SELECT * FROM category WHERE id = ${dataBody.category_id}`)
        if(category.length) {
             await sqlCustom.executeSql(`
                UPDATE types
                SET category_id = ${dataBody.category_id}
                WHERE id = ${id};
            `)
            result("Cập nhật loại sản phẩm thành công")
        }
        else {
            result(`Không tồn tại ${dataBody.category_id} trong bảng category`)

        }
       
    } catch (error) {
        result(null)
        throw error
    }
}

module.exports = Type