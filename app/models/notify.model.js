const Notify = (Notify) => {

}

const sqlCustom = require('../common/sqlQuery_2')

Notify.getAll = async (result, _accName) => {
    let sql = `
        SELECT A.id, A.content, A.accName, DATE_FORMAT(A.date, '%d/%m/%Y %r') AS date , B.name FROM notify A, notify_type B
        WHERE A.id_notify_type = B.id
    `
    // sql = _accName ? sql +` AND A.accName = '${_accName}'` : sql
    sql = _accName ? sql +` AND A.accName IN ('${_accName}','all')` : sql

    try {
        const Notify_type = await sqlCustom.executeSql(sql)
        result(Notify_type)

    } catch (error) {
        result(null)
        throw error
    }
}

Notify.create = async (result, data) => {
    try {
        const create_notify = await sqlCustom.executeSql_value("INSERT INTO notify SET ?", data)
        if(create_notify.affectedRows > 0) {
            result("Thêm thông báo thành công")
        }
    } catch (error) {
        result(null)
        throw error
    }
}

Notify.delete = async (result, id) => {
    try {
        const delete_notify = await sqlCustom.executeSql(`DELETE FROM notify WHERE id = ${id}`)
        if(delete_notify.affectedRows > 0) {
            result("Xóa thành công")
        }
    } catch (error) {
        result(null)
        throw error
    }
}

module.exports = Notify