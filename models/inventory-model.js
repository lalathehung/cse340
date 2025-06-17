const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}

/* ***************************
 *  Get inventory item data by inventory_id (inv_id)
 * ************************** */
async function getInventoryByInventoryId(inventory_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory
            WHERE inv_id = $1`,
            [inventory_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getInventoryByInventoryId error: " + error)
    }
}

/* ***************************
 *  Add New Classification to Database
 * ************************** */
async function addClassification(classification_name) {
    try {
        const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
        const result = await pool.query(sql, [classification_name]);
        return result;
    } catch (error) {
        console.error("Error in addClassification model: " + error.message);
        return null;
    }
}


/* ****************************************
 *  Check if a classification name already exists
 * ************************************ */
async function checkExistingClassificationByName(classification_name) {
    try {
        const sql = "SELECT * FROM public.classification WHERE classification_name = $1";
        const result = await pool.query(sql, [classification_name]);
        return result.rowCount > 0; // Returns true if it exosts, basically
    } catch (error) {
        console.error("Error in checkExistingClassificationByName model: " + error.message);
        return false;
    }
}

/* ***************************
 *  Add New Inventory Item to Database
 * ************************** */
async function addInventoryItem(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
) {
    try {
        const sql = `INSERT INTO public.inventory (
                        inv_make, inv_model, inv_year, inv_description, inv_image,
                        inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
                     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
        const result = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        ]);
        return result; // I could add result.row[0] to return specific item...
    } catch (error) {
        console.error("Error in addInventoryItem model: " + error.message);
        return null;
    }
}


module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryByInventoryId,
    addClassification,
    checkExistingClassificationByName,
    addInventoryItem
};