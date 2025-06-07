const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    });
};

/* ***************************
 *  Build inventory item detail view
 *  Example: /inv/detail/5
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inventory_id = req.params.inventoryId;
    const itemData = await invModel.getInventoryByInventoryId(inventory_id);
    if (!itemData) {
        return res.render("./inventory/detail", {
            title: "Vehicle Not Found",
            nav: await utilities.getNav(),
            detailContent: '<p class="notice">Sorry, details for this vehicle could not be found.</p>',
        });
    }
    const detailViewHtml = await utilities.buildInventoryDetailView(itemData);
    let nav = await utilities.getNav();
    const vehicleName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/detail", {
        title: vehicleName,
        nav,
        detailContent: detailViewHtml,
    });
};

/* ***************************
 *  Trigger footer-based error
 *  Example: /trigger-server-error
 * ************************** */
invCont.triggerError = async function (req, res, next) {
    const err = new Error("Intentional 500 server error triggered for testing.");
    err.status = 500;
    throw err;
};

module.exports = invCont;