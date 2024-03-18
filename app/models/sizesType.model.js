const SizeType = () => {}
const sqlCustom = require('../common/sqlQuery')

SizeType.get_all = async (result) => {
    try {
        const sizeType = await sqlCustom.executeSql("SELECT * FROM sizes_type")
        result(sizeType.map(i => i.id))
    } catch (error) {
        result(null)
        throw error
    }
}

module.exports = SizeType
 