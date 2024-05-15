const { executeSql } = require("../common/sqlQuery")

const Dashboard = (Dashboard) => {

}

Dashboard.get = async (_query,result) => {
    try {
        const {_year, _sellerID} = _query

        const categories = await executeSql("SELECT id, name FROM category")

        if(!_year) {
            result({"message":"Vui lòng nhập tham số _year", "status":false})
            return
        }

        const sqlGetHotProduct = (categoryID) => {
            return `
                SELECT product_id, SUM(quantity) as total FROM detail_order
                INNER JOIN orders ON orders.id = detail_order.order_id
                INNER JOIN products ON products.id = detail_order.product_id
                INNER JOIN types ON products.type = types.id
                WHERE YEAR(date_order)=${_year} AND products.seller_id IS NULL AND types.category_id = ${categoryID}
                GROUP BY product_id
                ORDER BY SUM(quantity) DESC
                LIMIT 3
            `
        }

        let hotProductCategory = await Promise.all(categories.map(async i => {
            return {
                categoryID: i.id,
                categoryName: i.name,
                products: (await executeSql(sqlGetHotProduct(i.id)))
            }
        }))

        const hot_product = await executeSql(`
            SELECT product_id, SUM(quantity) as total FROM detail_order
            INNER JOIN orders ON orders.id = detail_order.order_id
            INNER JOIN products ON products.id = detail_order.product_id
            WHERE YEAR(date_order)=${_year} AND products.seller_id IS NULL
            GROUP BY product_id
            ORDER BY SUM(quantity) DESC
            LIMIT 3
        `)

        // INNER JOIN products ON products.id = detail_order.product_id
        // WHERE products.seller_id IS NULL
        // console.log(hot_product)
        const shoesModel = require("../models/shoes.model")
        const dataFind_shoes = (await shoesModel.findList(hot_product.map(i => i.product_id).toString()||"0")).shoes
        // console.log(dataFind_shoes)

        const accounts = await executeSql(`SELECT COUNT(*) as number FROM accounts`)

        const mostPurchAcc =  await executeSql(`
            SELECT client_id, COUNT(*) as total FROM orders
            ${ _year ? `WHERE YEAR(date_order)=${_year}`:""}
            GROUP BY client_id
            ORDER BY COUNT(*) DESC
            LIMIT 5`
        )

        const order_brand_pay = await executeSql(`
            SELECT B.brand_id, COUNT(*) as total FROM detail_order A, products B, orders C
            WHERE A.product_id = B.id AND A.order_id = C.id AND status = 3 ${_year ? `AND YEAR(date_order)=${_year}` : ""}
            GROUP BY B.brand_id`
        )

       const quantity_product = await executeSql(`
            SELECT brands.brand_id, COUNT(products.brand_id) AS quantity
            FROM brands
            LEFT JOIN products ON brands.brand_id = products.brand_id
            GROUP BY brands.brand_id;`
        )


        let d = new Date()
        const revenue_month = await executeSql(`
            SELECT MONTH(date_order) as month , SUM(amount) as amount FROM orders 
            WHERE year(date_order)=${_year || d.getFullYear()}
            GROUP BY MONTH(date_order)`
        )

        const numberOfOrders =  await executeSql(`SELECT COUNT(*) as total FROM orders WHERE YEAR(date_order)=${_year}`)
       
        
        result({
            "hot_product":hot_product.map(i => ({...i, ...dataFind_shoes?.find(shoes=>shoes.id===i.product_id)})),
            "number_accounts":accounts[0].number,
            "most_purchAcc": mostPurchAcc,
            "order_brand_pay": order_brand_pay,
            "quantity_product": quantity_product,
            "revenue_month": revenue_month,
            "number_of_orders":numberOfOrders[0].total,
            "hotProductCategory":hotProductCategory
        })
        
    } catch (error) {
        result(null)
        throw error
    }
}



module.exports = Dashboard
