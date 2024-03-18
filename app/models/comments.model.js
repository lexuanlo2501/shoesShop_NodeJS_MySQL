const sqlCustom = require('../common/sqlQuery')

const Comments = () => {}

Comments.getAll = async (product_id, result) => {
    try {
        console.log(product_id)
        let sql = `
            SELECT comments.id as comment_id, comments.detailOrder_id, client_id, value, detail_order.product_id, rating 
            FROM comments 
                inner join detail_order on detail_order.id = comments.detailOrder_id
                inner join orders on detail_order.order_id = orders.id
        `
        product_id ?  sql += ` WHERE product_id = ${product_id}` : sql 



        const comment = await sqlCustom.executeSql(sql )
        result(comment)

    } catch (error) {
        result(null)
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

Comments.remove = async (detailOrder_id, result) => {
    const execDel = await sqlCustom.executeSql(`DELETE FROM comments WHERE detailOrder_id = ${detailOrder_id}`)
    if(execDel.affectedRows !== 0) {
        await sqlCustom.executeSql(`UPDATE detail_order SET isComment = 0 WHERE id =${detailOrder_id}`)
        result({message:"Xóa bình luận thành công", status: true})
    }
    else if(execDel.affectedRows === 0) {
        result({message:"Xóa bình luận thất bại", status: false})
    }
    console.log(execDel)
}

module.exports = Comments