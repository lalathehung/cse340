const pool = require("../database/")

/* ***************************
 * Add vehicle to favorites
 * ************************** */
async function addFavorite(account_id, inv_id) {
    try {
        const sql = "INSERT INTO public.favorites (account_id, inv_id) VALUES ($1, $2) RETURNING *";
        const result = await pool.query(sql, [account_id, inv_id]);
        return result.rows[0];
    } catch (error) {
        console.error("Error in addFavorite model: " + error.message);
        return null;
    }
}

/* ***************************
 * Remove vehicle from favorites
 * ************************** */
async function removeFavorite(account_id, inv_id) {
    try {
        const sql = "DELETE FROM public.favorites WHERE account_id = $1 AND inv_id = $2 RETURNING *";
        const result = await pool.query(sql, [account_id, inv_id]);
        return result.rowCount > 0;
    } catch (error) {
        console.error("Error in removeFavorite model: " + error.message);
        return false;
    }
}

/* ***************************
 * Get favorites for an account
 * ************************** */
async function getFavoritesByAccountId(account_id) {
    try {
        const sql = `
            SELECT f.*, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_thumbnail
            FROM public.favorites f
            JOIN public.inventory i ON f.inv_id = i.inv_id
            WHERE f.account_id = $1
            ORDER BY i.inv_make, i.inv_model
        `;
        const result = await pool.query(sql, [account_id]);
        return result.rows;
    } catch (error) {
        console.error("Error in getFavoritesByAccountId model: " + error.message);
        return [];
    }
}

/* ***************************
 * Check if vehicle is favorited by account
 * ************************** */
async function isVehicleFavorited(account_id, inv_id) {
    try {
        const sql = "SELECT 1 FROM public.favorites WHERE account_id = $1 AND inv_id = $2";
        const result = await pool.query(sql, [account_id, inv_id]);
        return result.rowCount > 0;
    } catch (error) {
        console.error("Error in isVehicleFavorited model: " + error.message);
        return false;
    }
}

module.exports = {
    addFavorite,
    removeFavorite,
    getFavoritesByAccountId,
    isVehicleFavorited
};