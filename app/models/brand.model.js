
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


Brands.create = async (dataBody, result) => {
    try {
        await sqlCustom.executeSql_value(`INSERT INTO brands SET ?`,dataBody)
        result("Thêm hãng sản phẩm thành công")
    } catch (error) {
        result(null)
        throw error
    }
}

Brands.update = async (ID, dataBody, result) => {
    try {
        await sqlCustom.executeSql_value(`
        UPDATE brands
        SET ?
        WHERE id = ${ID};
    `, dataBody)
    } catch (error) {
        result({"message":"Cập nhập thất bại","status":false})
        throw error
    }
}

Brands.delete = async (id, result) => {
    try {
        const checkProd = await sqlCustom.executeSql("SELECT * FROM products WHERE brand_id ='" + id +"' LIMIT 1")
        console.log(checkProd)
        if(checkProd.length === 0) {
            await sqlCustom.executeSql(`DELETE FROM brands WHERE brand_id = '${id}'`)
            result({message: "Xóa hãng sản phẩm thành công.", status: true})
        }
        else {
            result({message: "Không được phép xóa hãng mà tồn tại sản phẫm mang giá trị của hãng này.", status: false})
        }
    } catch (error) {
        result(null)
        throw error
    }
}


module.exports = Brands
