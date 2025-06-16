const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    const grid = await utilities.buildClassificationGrid(data);

    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

/* ***************************
 *  Build inventory item detail view
 *  Example: /inv/detail/5
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inventory_id = req.params.inventoryId;
    const itemData = await invModel.getInventoryByInventoryId(inventory_id);

    const detailViewHtml = await utilities.buildInventoryDetailView(itemData);
    let nav = await utilities.getNav();
    const vehicleName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/detail", {
        title: vehicleName,
        nav,
        detailContent: detailViewHtml,
    });
}

/* ***************************
 *  Build Inventory Management View
 *  Accessed via GET /inv/
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
    let nav = await utilities.getNav();

    if (!req.session.loggedin) { // Example protection
       req.flash("notice", "Please log in to access vehicle management.");
       return res.redirect("/account/login");
    }

    res.render("./inventory/management", {
        title: "Vehicle Management",
        nav,
        errors: null,
    });
};

/* ***************************
 *  Build Add New Classification View
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
    let nav = await utilities.getNav();
    const classifications = await invModel.getClassifications();

    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        classification_name: "", // Initialize for sticky form
        classifications: classifications.rows,
    });
};

/* ***************************
 *  Process Adding a New Classification
 * ************************** */
invCont.processAddClassification = async function (req, res, next) {
    const { classification_name } = req.body;
    let nav = await utilities.getNav();

    const addResult = await invModel.addClassification(classification_name);

    if (addResult && addResult.rowCount > 0) { // Veryifying query was good
        // Since it got added I have to regenerate to nav to call and refresh again
        let updatedNav = await utilities.getNav(req, res);

        req.flash("success", `The classification "${classification_name}" was successfully added.`);
        // Rendering to the management view
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav: updatedNav,
            errors: null,
        });
    } else {
        // Failure to add
        req.flash("error", `Adding the classification "${classification_name}" failed. Please try again.`);
        res.status(501).render("./inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: { array: () => [{ msg: "Failed to add classification to the database." }] },
            classification_name,
        });
    }
};

module.exports = invCont