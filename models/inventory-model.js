const pool = require("../database/index")
async function getClassifications() {
    try {
        const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
        console.log("Classifications data:", data.rows)
        return data.rows
    } catch (error) {
        console.error("getClassifications error:", error.stack)
        return []
    }
}
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
             JOIN public.classification AS c
             ON i.classification_id = c.classification_id
             WHERE i.classification_id = $1`,
            [classification_id]
        )
        console.log(`Inventory for classification ${classification_id}:`, data.rows)
        return data.rows
    } catch (error) {
        console.error("getInventoryByClassificationId error:", error.stack)
        return []
    }
}
async function getInventoryByInventoryId(inventory_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory WHERE inv_id = $1`,
            [inventory_id]
        )
        console.log(`Inventory for inv_id ${inventory_id}:`, data.rows)
        return data.rows[0]
    } catch (error) {
        console.error("getInventoryByInventoryId error:", error.stack)
        return null
    }
}
module.exports = { getClassifications, getInventoryByClassificationId, getInventoryByInventoryId }