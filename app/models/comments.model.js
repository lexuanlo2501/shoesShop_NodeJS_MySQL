const sql = require('msnodesqlv8')
const sqlCustom = require('../common/sqlQuery')

const Comments = () => {}

Comments.getAll = async (_query, result) => {
    const {_productId, _page=0, _limit=0, _sellerID, _showLock=false} = _query
    try {
        // console.log(_productId)
        let sql = `
            SELECT accounts.accName, seller_id, comments.id as comment_id, comments.detailOrder_id, fullName, value, detail_order.product_id, rating, DATE_FORMAT(date, '%d/%m/%Y %r') as date, comments.isLock
            FROM comments 
                inner join detail_order on detail_order.id = comments.detailOrder_id
                inner join orders on detail_order.order_id = orders.id
                inner join products on products.id = detail_order.product_id
                inner join accounts on accounts.accName = client_id
        `
            // WHERE comments.isLock = 0

        _productId ?  sql += ` WHERE product_id = ${_productId}` : sql 

        if(!_showLock) {
            sql += sql.includes("WHERE") ?  " AND comments.isLock = 0" :  " WHERE comments.isLock = 0"
        }
        if(_sellerID) {
            sql += sql.includes("WHERE") ?  ` AND seller_id='${_sellerID}' ` :  ` WHERE seller_id='${_sellerID}'`
        }

        sql += " ORDER BY comments.id DESC"
        sql = _page && _limit ? sql + ` LIMIT ${_limit} OFFSET ${_limit*(_page-1)}` : sql

      

        const comment = await sqlCustom.executeSql(sql)

        if(_productId) {
            let Comments_reply = await Promise.all(comment.map(async i => {
                const {seller_id, ...restData} = i
                return {
                    ...restData, 
                    reply: (await sqlCustom.executeSql(`SELECT *, DATE_FORMAT(date, '%d/%m/%Y %r') as date FROM replycomment WHERE comment_id='${i.comment_id}' ORDER BY id DESC`))
                }
            }))


            let sqlGetXTotalCount = `
                SELECT COUNT(*) AS totalCount
                FROM comments 
                    inner join detail_order on detail_order.id = comments.detailOrder_id
                    inner join orders on detail_order.order_id = orders.id
                    inner join products on products.id = detail_order.product_id
                    inner join accounts on accounts.accName = client_id
                WHERE product_id = ${_productId}
            `
            // GET X-Total-Count
            const getCount = await sqlCustom.executeSql(sqlGetXTotalCount)

            result({comments: Comments_reply, count: getCount[0].totalCount})
            return 
        }

        // GET X-Total-Count
        let sqlGetXTotalCount = await sqlCustom.executeSql(`SELECT COUNT(*) AS totalCount FROM comments`)
        result({comments: comment, count: sqlGetXTotalCount[0].totalCount})

    } catch (error) {
        result(null)
        throw error
    }

}

Comments.checkPermit = async (data, result) => {
    try {
        const {product_id, accName} = data
        const sqlFind_orderDetail = `
            SELECT detail_order.id as detailOrder_id, orders.client_id
            FROM detail_order
            INNER JOIN orders ON orders.id = detail_order.order_id
            WHERE detail_order.product_id = ${product_id} AND orders.client_id = '${accName}' AND isComment = 0
        `
        const dataFind = await sqlCustom.executeSql(sqlFind_orderDetail)
        if(dataFind.length) {
            result({message:"Được phép cmt", status:true, detailOrder_ID: dataFind[0].detailOrder_id})
            //thêm trường detailOrder_ID vào response để bên FE lấy detailOrder_ID cho api đánh giá số sao
        }
        else {
            result({message:"Không được phép cmt", status:false})

        }
    } catch (error) {
        result({message:"Error", status:false})
        throw error
    }
  

}

Comments.submit = async (data, result) => {

    try {
        const {value, product_id, accName} = data
        if (!value || !product_id || !accName) {
            result({message:"Bạn gửi thiếu tham số, yêu cầu value, product_id, accName", status:false})
            return
        }

        const sqlFind_orderDetail = `
            SELECT detail_order.id as detailOrder_id, orders.client_id
            FROM detail_order
            INNER JOIN orders ON orders.id = detail_order.order_id
            WHERE detail_order.product_id = ${product_id} AND orders.client_id = '${accName}' AND isComment = 0
        `
    
        const dataFind = await sqlCustom.executeSql(sqlFind_orderDetail)

        console.log(data)
        console.log(dataFind)

        if(dataFind.length === 0) {
            result({message:"Bạn không được phép đánh giá vì chưa mua sản phẩm hoặc bạn đã đánh giá rồi", status:false})
            return 
        }
        else {
            const detail_order_find = (dataFind[0]).detailOrder_id
            await sqlCustom.executeSql(`UPDATE detail_order SET isComment = 1 WHERE id =${detail_order_find}`)
            await sqlCustom.executeSql_value("INSERT INTO comments SET ?", {value: value, detailOrder_id: detail_order_find})
            result({message:"Gửi bình luận thành công", status:true})
        }

    
    
    } catch (error) {
        result(null)
        throw error
    }
   
}

Comments.remove = async (id, result) => {
    try {
        const findDetailOrder = (await sqlCustom.executeSql(`
            SELECT comments.id, comments.detailOrder_id FROM comments
            INNER JOIN detail_order ON comments.detailOrder_id = detail_order.id
            WHERE comments.id = ${id}  
        `))[0]
        if(!findDetailOrder?.id) {
            result(null)
            return
        }

        const execDel_reply = await sqlCustom.executeSql(`DELETE FROM replycomment WHERE comment_id = ${id}`)

        const execDel_cmt = await sqlCustom.executeSql(`DELETE FROM comments WHERE id = ${id}`)
        if(execDel_cmt.affectedRows !== 0) {
            // Cập nhật lại trạng thái chưa comment trong detail_order
            await sqlCustom.executeSql(`UPDATE detail_order SET isComment = 0 WHERE id =${findDetailOrder.detailOrder_id}`)
            result({message:"Xóa bình luận thành công", status: true})
        }
        else if(execDel_cmt.affectedRows === 0) {
            result({message:"Xóa bình luận thất bại", status: false})
        }
        // console.log(execDel_cmt)
    } catch (error) {
        result(null)
        throw error
    }
    
}

Comments.update = async (id, dataBody, result) => {
    try {
        // const excute = await sqlCustom.executeSql_value(`UPDATE accounts SET ? WHERE accName='${id}'`, data)

        const execUpd = await sqlCustom.executeSql_value(`UPDATE comments SET ? WHERE id = ${id}`, dataBody)
        if(execUpd.changedRows) {
            result({message:"Cập nhật bình luận thành công", status: true})
        }
        else {
            result({message:"Cập nhật bình luận thất bại", status: false})
        }

    } catch (error) {
        result(null)
        throw error
    }

      
}

// REPLY

Comments.replyComments = async (dataBody, result) => {
    const {comment_id, value} = dataBody
    try {
        const addReply = await sqlCustom.executeSql(`INSERT INTO replycomment (value, comment_id) VALUES ('${value}', '${comment_id}') `)
        // console.log({reply: addReply})
        if(addReply.affectedRows) {
            result({message:"Gửi phản hồi thành công", status: true})
        }
        else {
            result({message:"Gửi phản hồi thất bại", status: false})

        }
    } catch (error) {
       
        result(null)
        throw error
    }
}

Comments.removeReply = async (id, result) => {
    try {
        const deleteData = await sqlCustom.executeSql(`DELETE FROM replycomment WHERE id='${id}'`)
        if(deleteData.affectedRows !== 0) {
            result({message:"Xóa phản hồi thành công", status: true})
        }
        else if(deleteData.affectedRows === 0) {
            result({message:"Xóa phản hồi thất bại", status: false})
        }

    } catch (error) {
        result(null)
        throw error
    }
}



module.exports = Comments