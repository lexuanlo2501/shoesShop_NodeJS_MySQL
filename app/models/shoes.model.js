const db = require("../common/connect")
const fs = require('fs')

const Shoes = (shoes) => {


}

const sqlCustom = require('../common/sqlQuery');
const { count } = require("console");



Shoes.get_all = async (query_ = {}, result=() => {}) => {
    try {
        let {_page , _limit , _type, _min, _max, _brand, _string, _isDiscount, _random, _category, _C2C="false", _sellerId, _ids, _hideLock=false} = query_
        // _ids is support for find list
        
        console.log("*---- Query ----*")
        console.log(query_)
        console.log("*---------------*")

        let sql = `SELECT *,  DATE_FORMAT(dateCreate, '%d/%m/%Y %r') AS dateCreate FROM products`
        
        let sqlHaveCategory = `
            SELECT products.*, types.category_id, DATE_FORMAT(dateCreate, '%d/%m/%Y %r') AS dateCreate 
            FROM products
                INNER JOIN types ON products.type = types.id
            WHERE types.category_id = '${_category}'
        `
        sql = _category ?  sqlHaveCategory : sql

        // HANDLE QUERY PARAMETERS
        if(_sellerId) {
            sql = sql.includes("WHERE") ? sql + ` AND seller_id='${_sellerId}'` : sql + ` WHERE seller_id='${_sellerId}'`
        }
        else {

            if(_C2C==="true") {
                if(sql.includes("WHERE")) sql = sql + ` AND seller_id IS NOT NULL`
                else sql = sql + ` WHERE seller_id IS NOT NULL`
            }
            else if (_C2C==="false") {
                if(sql.includes("WHERE")) sql = sql + ` AND seller_id IS NULL`
                else sql = sql + ` WHERE seller_id IS NULL`
            }
            else if (_C2C==="all") {
                // DÙNG ĐỂ HIỂN THỊ ĐƠN HÀNG CỦA KHÁCH HÀNG (KHÔNG PHÂN BIỆT B2C HAY C2C)
            }
            
        }
        if(_hideLock) {
            sql += sql.includes("WHERE") ?  " AND isLock = 0" :  " WHERE isLock = 0"
        }

        const Check_IDS = (_ids) => {
            const arrIDS = _ids?.split(',') || []
            return arrIDS.every(i => +i)
        }

        if(!Check_IDS(_ids)){
            result({message:`Lỗi cú pháp tham số query`, status: false})
            console.log("passss")
            return {message:`Lỗi cú pháp tham số query`, status: false}
        }
        if(_ids) {
            sql += sql.includes("WHERE") ? ` AND id IN (${_ids})` : ` WHERE id in (${_ids})`
        }
        
     
        if(sql.includes("WHERE")) sql = _brand ? sql + ` AND brand_id = '${_brand}'` : sql
        else sql = _brand ? sql + ` WHERE brand_id = '${_brand}'` : sql

        if(sql.includes("WHERE")) sql = _type ? sql + ` AND type = ${+_type}` : sql
        else sql = _type ? sql + ` WHERE type = ${+_type}` : sql
        
        if(sql.includes("WHERE")) sql = _max ? sql + ` AND price BETWEEN ${_min} AND ${_max}` : sql
        else sql =  _max ? sql + ` WHERE price BETWEEN ${_min} AND ${_max}` : sql

        if(sql.includes("WHERE")) sql = _string ? sql + ` AND name LIKE '%${_string}%'` : sql
        else sql = _string ? sql + ` WHERE name LIKE '%${_string}%'` : sql

        if(sql.includes("WHERE")) sql = _isDiscount==="true" ? sql + ` AND discount_id != 0` : sql
        else sql = _isDiscount==="true" ? sql + ` WHERE discount_id != 0` : sql

        if(_random==="true") {
            sql += ` ORDER BY RAND()`
        }

        sql = _page && _limit ? sql + ` LIMIT ${_limit} OFFSET ${_limit*(_page-1)}` : sql
        // _page+_page-2 IS INDEX OF VALUE IN DATA START

        const shoes = await new Promise((resolve, reject) => {
            db.query(sql,(err, shoes) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(shoes);
                }
            });
        });

        const shoes_id = shoes.map(i => i.id).toString() || 0
        // executeSql_all
        const AmountProducts_sold = await sqlCustom.executeSql("select product_id,COUNT(*) as sold from detail_order WHERE product_id in (" + shoes_id + ") group BY product_id")
        // console.log({AmountProducts_sold:AmountProducts_sold})

        const inventory = await sqlCustom.executeSql(`SELECT * FROM inventory WHERE product_id IN (${shoes_id || 0})`)
        const imgs = await sqlCustom.executeSql(`SELECT * FROM imgs WHERE product_id IN (${shoes_id || 0})`)
        const discounts = await sqlCustom.executeSql_SelectAll('discount')
        const types = await sqlCustom.executeSql_SelectAll('types')

        const combine = shoes.map(product => ({
            ...product,
            type: types.find(i => i.id === product.type)?.type_name,
            discount_id: discounts.find(i => i.id === product.discount_id)?.per ,
            inventory: inventory.filter(i => i.product_id === product.id).map(i => ({
                size: i.size,
                quantity: i.quantity
            })),
            imgs: imgs.filter(img => img.product_id === product.id).map(i => i.name),
            sold: AmountProducts_sold?.find( prod => prod.product_id === product.id)?.sold || 0
        }));

        
        // GET X-Total-Count
        let sqlGetXTotalCount = _category ?
        sql.split("LIMIT")[0].replace("products.*", "COUNT(*) AS totalCount")
        :
        sql.split("LIMIT")[0].replace("*", "COUNT(*) AS totalCount")
        
        const countQuery = await sqlCustom.executeSql(sqlGetXTotalCount)
        // console.log(sqlGetXTotalCount)
        // console.log(countQuery[0].totalCount)
        
        // result(combine)
        result({shoes:combine, count:countQuery[0].totalCount})

        if(_ids) {
            return {shoes:combine, count:countQuery[0].totalCount}
        }
        return(combine)
    } catch (error) {
        console.log("Error")
        result({status:false})
        throw error;
    }
};


// Shoes.find = async (id, result=()=>{}) => {

//    let sql = `
//         SELECT A.id, A.name, A.img,A.brand_id, A.BC_color, A.description, A.price, A.seller_id ,A.dateCreate, A.isLock, B.type_name as type, C.per as discount_id
//         FROM products A, types B, discount C
//         WHERE A.id = ${id} AND A.type = B.id AND A.discount_id = C.id
//     `

//     try {
//         // const product = await sqlCustom.executeSql_getByID("products", "id", id)

//         let product = (await sqlCustom.executeSql(sql))[0]
//         if (await product) {
//             const inven = await sqlCustom.executeSql(`SELECT * FROM inventory WHERE product_id = ${id}`)
//             // const imgs = await sqlCustom.executeSql_getByID("imgs", "product_id", id) || []
//             const imgs = await sqlCustom.executeSql(`SELECT * FROM imgs WHERE product_id = ${id}`) || []
            
//             const data = {
//                 ...product,
                
//                 inventory: [...inven].map(i => ({
//                     size: i.size,
//                     quantity: i.quantity
//                 })),
//                 imgs: [...imgs].map(img => img?.name)
//             };
//             result(data)
//             return data;
//         }
//         else {
//             result("Không tìm thấy mã sản phẩm " + id)
//             return 
//         }

        
//     } catch (error) {
//         result(null)
//         throw error;
//     }
// };


Shoes.find = async (id, result=()=>{}) => {
    if(!+id) {
        result({message:`Không tìm thấy sản phẩm có mã ${id}`, status: false})
        return
    }

    let productFind = await Shoes.get_all({_ids:id})
    console.log(productFind)
    if(productFind.shoes.length) {
        result(productFind.shoes[0])
        return
    }
    else {
        result({message:`Không tìm thấy sản phẩm có mã ${id}`, status: false})
        return
    }
};

        


Shoes.findList = async (ids="d", result=()=>{},  _page=0, _limit=0,) => {
    // console.log(ids)
    let products = await Shoes.get_all({_ids:ids,_C2C:"all", _page , _limit})
    // {shoes:products.shoes, count:products.count}
    result(products)
    return(products)
}


Shoes.create = async (data, result) => {
    try {
        const {inventory=[], imgs=[], ...restData} = data
        // console.log(inventory)

        const product = await sqlCustom.executeSql_value("INSERT INTO products SET ?", {...restData, brand_id:restData.brand_id.toUpperCase()})
        

        if(inventory.length) {
            let initial_inventory = inventory
            let values = initial_inventory.map(i => [product.insertId, i.size, i.quantity])

            await sqlCustom.executeSql_value("INSERT INTO inventory (product_id, size, quantity) VALUES  ?", [values])
        }

        if(imgs.length) {
            let initial_imgs = imgs
            let values = initial_imgs.map(img => [ img, product.insertId])
            // values = [...values, [restData.img, product.insertId]]

            
            await sqlCustom.executeSql_value("INSERT INTO imgs (name, product_id) VALUES  ?", [values])

        }


        // GHI VÀO LỊCH SỬ GIAO DỊCH

        const historyModel = require("../models/history.model")
        await historyModel.create({
            "admin_id": "lelolo123",
            "content": `Thêm sản phẩm mã: ${product.insertId}` + inventory.reduce((accu, curr) => accu+` size ${curr.size}: ${curr.quantity},`, ''),
            "activity": "Add"
        })

        result("Thêm sản phẩm thành công") 

    } catch (error) {
        console.log(error)
        result("Thêm sản phẩm thất bại") 
        throw error
    }
    

   
}

Shoes.delete = async (id, result) => {
    try {
        // SỬ LÝ XÓA FILE ẢNH TRONG FOLDER public/imgs
        const handleDeleteFileImg = (img_imgs) => {
            let filePath = __dirname + "/public/imgs/" + img_imgs; // TẠO ĐƯỜNG DẪN ĐỂ XÓA ẢNH
            filePath = filePath.replace("\\app\\models","").replaceAll("/", "\\")
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath);
                console.log("xóa thành công file ảnh")
            }
        }
        
        // LẤY RA CÁC TÊN ẢNH (imgs) của products
        let imgsInDB = await sqlCustom.executeSql_value("SELECT * FROM imgs WHERE product_id = ?", id)
        const product = await sqlCustom.executeSql_value(`SELECT img FROM products WHERE id = ?`, id)
        // imgsInDB.map(img => img.name).forEach((filename) => {
        //     handleDeleteFileImg(filename)
        // });
        imgsInDB = [...imgsInDB.map(img => img.name), product[0].img]
        // console.log(product)
        // console.log(imgsInDB)


        imgsInDB.forEach((filename) => {
            let filePath = __dirname + "/public/imgs/" + filename;
            filePath = filePath.replace("\\app\\models","").replaceAll("/", "\\")
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } 
                catch (err) {

                }
            } 
        });


        await new Promise((resolve, reject) => {
            db.query("DELETE FROM inventory WHERE product_id = ?", id, (err ) => {
                if(err) {
                    result(null)
                    reject(err)
                    throw err
                }
                else {
                    resolve()
                }
               
            })
    
        })

        await new Promise((resolve, reject) => {
            db.query("DELETE FROM imgs WHERE product_id = ?", id, (err ) => {
                if(err) {
                    result(null)
                    reject(err)
                    throw err
                }
                else {
                    resolve()
                }
               
            })
    
        })
        
        await new Promise((resolve, reject) => {
            db.query("DELETE FROM products WHERE id=?",id,(err, product ) => {
                if(err) {
                    result({result:null})
                    reject(err)
                    throw err
                }
        
                if(product.affectedRows === 0) result("Không tồn tại mã sản phẩm " +id)
                else {
                    result("Xóa thành công sản phẩm mã " +id)
                    resolve()
                }
            })
        })


        const historyModel = require("../models/history.model")
        await historyModel.create({
            "admin_id": "lelolo123",
            "content": `Xóa sản phẩm có mã: ${id}`,
            "activity": "Delete"
        })
        
    } catch (error) {
        result(null)
        throw error
    }
    
}


Shoes.update = (id, data, result) => {
    const {inventory=[],imgs=[], ...restData} = data
    db.query(Object.keys(restData).length ? 'UPDATE products SET ?  WHERE id=?':"select * from brands", [restData, id], (err, shoes) => {
        if(err) {
            // console.log(restData)
            throw err
        }
        inventory.forEach(element => {
            const {quantity, size} = element
            db.query('UPDATE inventory SET quantity=?  WHERE product_id=? AND size=?',[quantity, id, size], (err,inven) => {
                if(err) throw err
            })
        });
        
        const imgs_update = [...imgs].map(i => [i, id])
        // console.log(imgs)
        if(imgs.length) {
            // DELETE ALL IMG HAVE ID = id
            db.query("DELETE FROM imgs WHERE product_id = ?",id, err => {
                if(err) throw err
            })
            // ADD DATA IMG UPDATE
            db.query("INSERT INTO imgs (name, product_id) VALUES ?",[imgs_update], err => {
                if(err) throw err
            })

        }

        result("Sửa thành công")
    })
}

Shoes.im_exportProd = async (prodID, data, result) => {
    try {
        await sqlCustom.executeSql(`UPDATE inventory SET quantity = quantity + ${data.quantity} WHERE product_id = '${prodID}' AND size = '${data.size}' `)
        const mess = (quantity) => {
            let action = quantity>0 ? "nhập" : "xuất"
            return `Bạn đã ${action} kho ${quantity} sản phẩm, size ${data.size} vào mã sản phẩm ${prodID}`
        }
        result(mess(data.quantity))
    } catch (error) {
        result(null)
        throw error
    }
}

Shoes.modifyDiscount = async (data, result) => {
    try {
        if(data.action === "remove") {
            await Promise.all(
                data.list.map(async (prod_id) => {
                    return await sqlCustom.executeSql(`UPDATE products SET discount_id = 0 WHERE id=${prod_id}`)
                })
            )
            result("Đã gỡ khuyến mãi SP mã: " + data.list.toString())

        }
        else if(data.action === "add") {
             await Promise.all(
                data.list.map(async (prod_id) => {
                    return await sqlCustom.executeSql(`UPDATE products SET discount_id = ${data.discount_id} WHERE id=${prod_id}`)
                })
            )
             result("Đã sữa khuyến mãi SP mã: " + data.list.toString())
        }
        
    } catch (error) {
        result(null)
        throw error
    }
}





module.exports = Shoes