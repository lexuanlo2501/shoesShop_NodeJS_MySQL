const db = require("../common/connect")
const Activity = () => {

}

const sqlCustom = require('../common/sqlQuery')


Activity.getAll = async (result) => {
    try {
        const acti = await sqlCustom.executeSql("SELECT * FROM activity_admin")
        result(acti)
    } catch (error) {
        result(null)
        throw error
    }
}

module.exports = Activity