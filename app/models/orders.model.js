const { query } = require("express")
const db = require("../common/connect")


const Orders = (shoes) => {

}

const sqlCustom = require('../common/sqlQuery')



Orders.get = async (result, id, _client_id, _status, _day, _month, _year) => {
   
    let sql = id ? 
    `SELECT *, DATE_FORMAT(date_order, '%d/%m/%Y %r') AS date_order FROM orders WHERE id='${id}'`
    :
    "SELECT *, DATE_FORMAT(date_order, '%d/%m/%Y %r') AS date_order FROM orders"

    if(_client_id) {
        if(sql.includes("WHERE")) {
            sql = sql + ` AND client_id = '${_client_id}'`
        }
        else {
            sql = sql + ` WHERE client_id = '${_client_id}'`
        }
    }



    if(_day) {
        sql = sql.includes("WHERE") ? sql + ` AND DAY(date_order)=${_day}` : sql + ` WHERE DAY(date_order)=${_day}`
    }
    if(_month) {
        sql = sql.includes("WHERE") ? sql + ` AND MONTH(date_order)=${_month}` : sql + ` WHERE MONTH(date_order)=${_month}`
    }
    if(_year) {
        sql = sql.includes("WHERE") ? sql + ` AND YEAR(date_order)=${_year}` : sql + ` WHERE YEAR(date_order)=${_year}`
    }

   
    if(_status) {
        sql = sql.includes("WHERE") ? sql + ` AND status = '${_status}'` :  sql + ` WHERE status = '${_status}'`
    }

    const ord = await new Promise((resolve, reject) => {
        db.query(sql, (err, ord) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(ord);
        })
    })

    const detail = id ? await sqlCustom.executeSql(`SELECT * FROM detail_order WHERE order_id = ${id}`) : await sqlCustom.executeSql("SELECT * FROM detail_order")

    const filerOrder = (arr, id) => {
        return arr.filter(i => i.order_id === id)
    }

    

    const shoesModel = require("../models/shoes.model")
    const dataFind = await shoesModel.get_all()

    // const dataFind_list = await shoesModel.find(100)
    // console.log(dataFind_list)

    
    
    let orders = [...ord].map( i => {
        let products_order =  filerOrder(detail, i.id).map( (prod) => {
            const findProduct  = dataFind.find(product => product.id === prod.product_id)
            console.log(findProduct)
            return {
                ...findProduct,
                size: prod.size,
                quantity: prod.quantity,
                rating: prod.rating,
                discount: prod.discount,
                detail_order_id: prod.id, /* đây là id của bảng detail order, mục đích thêm trường này vào để dùng cho route đánh giá sản phẩm */

            }
        })

        return {
            ...i,
            products: products_order
        }
    })

    // if(orders.length === 0) {
    //     result("Không tồn tại mã đơn "+id)
    // }
    // else {
    //     result(id ? orders[0] :orders)
    // }
    if(id && orders.length === 0) {
        result("Không tồn tại mã đơn "+id)
    }
    else {
        result(id ? orders[0] : orders)
    }

}

Orders.create = async (data, result) => {
    // data gửi từ client qua body nếu có thuộc tính id thì đó là thanh toán VNP

    const checkIdOrders = await sqlCustom.executeSql(`SELECT id  FROM orders WHERE id='${data.id}'`)
    console.log(checkIdOrders)

    if(checkIdOrders.length===0) {
        try {
            const {products, ...restData} = data
            
    
            // LẤY SẢN PHẨM TRONG KHO RA ĐỂ SO SÁNH SỐ LƯỢNG ĐẶT 
            let get_product_Inventory = []
            await Promise.all(
                products.map(async (product) => {
                    return new Promise((resolve, reject) => {
                        db.query('SELECT * FROM inventory WHERE product_id = ? AND size= ?',[product.product_id, product.size] , (err, prod_inven) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                                get_product_Inventory.push(prod_inven[0])
                            }
                        })
                    })
                })
            )
          
    
            console.log(get_product_Inventory)
    
            // CHECK ĐƠN HÀNG CÓ CÒN ĐỦ SỐ LƯỢNG ĐỂ BÁN 
            const messSoldOut = [] 
            get_product_Inventory.forEach((item, index) => {
                let quantity_inventory = item.quantity
                let quantity_order = products[index].quantity
    
                if(quantity_inventory - quantity_order < 0) {
                    // messSoldOut.push(`Không đủ số lượng bán: Sản phầm mã ${item.product_id}, size ${item.size}, còn ${quantity_inventory} SP, số lượng mua ${quantity_order}`)
                    // messSoldOut.push(`HẾT HÀNG: Sản phầm mã ${item.product_id}, size ${item.size}, còn ${quantity_inventory} SP, số lượng mua ${quantity_order}`)
                    messSoldOut.push({"product_id": item.product_id, "message":`size ${item.size}, còn ${quantity_inventory} SP, số lượng mua ${quantity_order}`})
                }
            });
            console.log(messSoldOut)
    
            if(messSoldOut.length === 0) {
                // THÊM VÀO BẢNG orders vào đặt biến promise đế lấy ra insertId từ data vừa thêm
                let valueProd_id = products?.map(e => e.product_id).toString()
                const  producst_sql = await sqlCustom.executeSql(`SELECT A.id, A.price, B.per FROM products A, discount B WHERE A.id IN (${valueProd_id}) AND A.discount_id = B.id`)      
                const amount = products.reduce((caccu, curr) => {
                    let findProd = producst_sql.find(i => i.id === curr.product_id)
                    let price = (findProd.price-findProd.price*(findProd.per/100)) * curr.quantity
                    return caccu + price
                },0)
                const order = await new Promise((resolve, reject) => {
                    db.query("INSERT INTO orders SET ?",{...restData, amount:amount}, (err, order_ins) => {
                        if (err) {
                            reject(err);
                            throw err
                        } else {
                            resolve(order_ins);
                        }
                    })
                })

                // THÊM THÔNG BÁO CÓ ĐƠN HÀNG
                const content = `Mã đơn ${order.insertId}: Số Lượng ${products.length} đôi`
                await sqlCustom.executeSql(`INSERT INTO notify(id_notify_type, content, to_admin_all) VALUES (7,"${content}","admin")`)
    
                // THÊM VÀO BẢNG detail_order 
                await new Promise((resolve, reject) => {
                    let findDiscount_prod = (id) => producst_sql.find(prod => prod.id === id).per

                    let values = restData.id ?
                    products.map(i => [restData.id, i.product_id, i.size, i.quantity, findDiscount_prod(i.product_id)])
                    :
                    products.map(i => [order.insertId, i.product_id, i.size, i.quantity, findDiscount_prod(i.product_id)])
    
                    db.query("INSERT INTO detail_order (order_id, product_id, size, quantity, discount) VALUES ?", [values], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
    
                })
    
                // TRỪ SỐ LƯỢNG SẢN PHẨM TRONG BẢNG inventory KHI ĐẶT HÀNG THÀNH CÔNG
                await new Promise((resolve, reject) => {
                    products.forEach(element => {
                        db.query('UPDATE inventory SET quantity = quantity-?  WHERE product_id=? AND size=?', [element.quantity, element.product_id, element.size], (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        })
                    });
                    
                })
                result({"message":"Đặt hàng thành công", "status":true})
    
            }
            else {
                result({"message":messSoldOut, "status":false})
            }
    
    
    
            
    
    
    
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    
    
}

Orders.delete = async (id, result) => {
    try {

         // LẤY THÔNG TIN ĐƠN HÀNG TRƯỚC KHI XÓA
         const detail_order = await new Promise((resolve, reject) =>{
            db.query("SELECT * FROM detail_order WHERE order_id = ?", id, (err, detail_order) => {
                if(err) {
                    reject(err)
                }
                else {
                    resolve(detail_order)
                }
            })

        })

        // XÓA CHI TIẾT ĐƠN HÀNG
        await new Promise((resolve, reject) => {
            db.query("DELETE FROM detail_order WHERE order_id = ?", id, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })

        // XÓA ĐƠN HÀNG
        await new Promise((resolve, reject) => {
            db.query("DELETE FROM orders WHERE id = ?", id, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            })
        })
        
        // THÊM SỐ LƯỢNG (KHÔI PHỤC LẠI) SẢN PHẨM TỪ ĐƠN HỦY VÀO inventory(kho)
        await Promise.all(
            detail_order.map(async (element, index) => {
                console.log({index:index, ob:element})
                return new Promise((resolve, reject) => {
                    db.query('UPDATE inventory SET quantity = quantity+?  WHERE product_id=? AND size=?', [element.quantity, element.product_id, element.size], (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    })
                })
            })
        )

        result("Hủy đơn thành công")

    } catch (error) {
        result("Hủy đơn thất bại")
        console.log(error);
        throw error;
    }

}

Orders.update = async (id, data, result) => {
    try {
        const {...restData} = data
        const sqlUpdate = await sqlCustom.executeSql_value("UPDATE orders SET ? WHERE id = ?", [restData, id])
        console.log(sqlUpdate)

        if(restData.status === 2) {
            accName = await sqlCustom.executeSql(`SELECT client_id FROM orders WHERE id = ${id}`)
            console.log(accName)
            // db.query("INSERT INTO detail_order (order_id, product_id, size, quantity, discount) VALUES ?", [values], (err) => {
            // db.query("INSERT INTO orders SET ?",{...restData, amount:amount}, (err, order_ins) => {
            let content = "Đơn hàng đã được xác nhận. Đơn vị vận chuyển đang giao hàng đến bạn"
            await sqlCustom.executeSql_value(`INSERT INTO notify(id_notify_type, content, accName) VALUES (1,"${content}","${accName[0].client_id}")`)
            

        }

        result("Cập nhật thành công")


    } catch (error) {
        result(null)
        throw error
    }
}

Orders.rating = async (data, result) => {
    //data = {
    //     detail_order_id: 1
    //     rating: 5
    // }
    try {
        await sqlCustom.executeSql_value("UPDATE detail_order SET rating = ? WHERE id = ?", [data.rating, data.detail_order_id])
        result("Đánh giá sản phẩm thành công, cảm ơn bạn đã phản hồi cho chúng tôi")
    } catch (error) {
        result("Đánh giá sản phẩm thất bại")
        throw error
    }

    

}

Orders.revenueDay = async (_month, _year, result) => {
    let d = new Date()
    try {
        // let sql = `
        //     SELECT MONTH(date_order) as month , SUM(amount) as amount FROM orders 
        //     WHERE year(date_order)=${_year || d.getFullYear()}
        //     GROUP BY MONTH(date_order)
        // `

       let sql = `SELECT Day(date_order) as day , SUM(amount) as amount FROM orders 
        WHERE MONTH(date_order)=${_month} AND YEAR(date_order)=${_year}
        GROUP BY Day(date_order)`

        let data = await sqlCustom.executeSql(sql)
        result(data)
        
    } catch (error) {
        console.log(error)
        result(null)
        throw error
    }
}


module.exports = Orders