const db = require("./connect")

exports.executeSql = async (sql) => {
    return await new Promise((resolve, reject) => {
        db.query(sql, (err, data) => {
            if (err) {
                reject(err);
                throw err
            }
            else {
                // if(data.length>1) {
                //     resolve(data);
                // }
                // else{
                //     resolve(data[0]);

                // }
                resolve(data);

            }
        });
    });
}

exports.executeSql_value = async (sql, value) => {
    return await new Promise((resolve, reject) => {
        db.query(sql, value,(err, data) => {
            if (err) {
                reject(err);
                throw err
            }
            else {
                resolve(data);
            }
        });
    });
}

exports.executeSql_getByID = async (table, field_id, id) => {
    return await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM ${table} WHERE ${field_id} = ?`, id, (err, data) => {
            if (err) {
                reject(err);
                throw err
            }
            else {
                resolve(data.length>1 ? data : data[0]);
            }
        });
    });
}

exports.executeSql_SelectAll = async (table) => {
    return await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM ${table}`, (err, data) => {
            if (err) {
                reject(err);
                throw err
            }
            else {
                resolve(data);
            }
        });
    });
}