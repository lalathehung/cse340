const { param, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const utilities = require("./index");
const validate = {};

/* **********************************
 * Favorite Action Validation Rules
 * ********************************* */
validate.favoriteRules = () => {
    return [
        param("inventoryId")
            .isInt({ min: 1 }).withMessage("Invalid vehicle ID.")
            .custom(async (inventoryId) => {
                const vehicleExists = await invModel.getInventoryByInventoryId(inventoryId);
                if (!vehicleExists) {
                    throw new Error("Vehicle not found.");
                }
                return true;
            })
    ];
};

/* ******************************
 * Check favorite data
 * ***************************** */
validate.checkFavoriteData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const inventory_id = req.params.inventoryId;
        const itemData = await invModel.getInventoryByInventoryId(inventory_id);
        const detailViewHtml = await utilities.buildInventoryDetailView(itemData);
        let nav = await utilities.getNav();
        const vehicleName = itemData ? `${itemData.inv_make} ${itemData.inv_model}` : "Vehicle Not Found";

        req.flash("error", errors.array().map(err => err.msg).join("; "));
        res.render("inventory/detail", {
            title: vehicleName,
            nav,
            detailContent: detailViewHtml,
            inventory_id,
            isFavorited: false,
            errors
        });
        return;
    }
    next();
};

module.exports = validate;