const invModel = require("../models/inventory-model")
const favoriteModel = require("../models/favorite-model")
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
    
    // Check if vehicle is favorited
    let isFavorited = false;
    if (req.session.loggedin) {
        isFavorited = await favoriteModel.isVehicleFavorited(req.session.accountData.account_id, inventory_id);
    }

    res.render("./inventory/detail", {
        title: vehicleName,
        nav,
        detailContent: detailViewHtml,
        inventory_id,
        isFavorited
    });
}

/* ***************************
 *  Build Inventory Management View
 *  Accessed via GET /inv/
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
    let nav = await utilities.getNav();

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
        classification_name: "",
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

    if (addResult && addResult.rowCount > 0) {
        let updatedNav = await utilities.getNav(req, res);

        req.flash("success", `The classification "${classification_name}" was successfully added.`);
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav: updatedNav,
            errors: null,
        });
    } else {
        req.flash("error", `Adding the classification "${classification_name}" failed. Please try again.`);
        res.status(501).render("./inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: { array: () => [{ msg: "Failed to add classification to the database." }] },
            classification_name,
        });
    }
};

/* ***************************
 *  Build Add New Inventory Item View
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();

    res.render("./inventory/add-inventory", {
        title: "Add New Inventory Item",
        nav,
        classificationList,
        errors: null,
        inv_make: "",
        inv_model: "",
        inv_year: "",
        inv_description: "",
        inv_image: "/images/vehicles/no-image.png",
        inv_thumbnail: "/images/vehicles/no-image-tn.png",
        inv_price: "",
        inv_miles: "",
        inv_color: "",
        classification_id: "",
    });
};

/* ***************************
 *  Process Adding a New Inventory Item
 * ************************** */
invCont.processAddInventory = async function (req, res, next) {
    const {
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
    } = req.body;

    let nav = await utilities.getNav();

    const addResult = await invModel.addInventoryItem(
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        parseFloat(String(inv_price).replace(/,/g, '')),
        parseInt(String(inv_miles).replace(/,/g, '')),
        inv_color,
        parseInt(classification_id)
    );

    if (addResult && addResult.rowCount > 0) {
        req.flash("success", `The vehicle "${inv_make} ${inv_model}" was successfully added to inventory.`);
        res.status(201).render("./inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
        });
    } else {
        req.flash("error", `Adding "${inv_make} ${inv_model}" failed. Please try again.`);
        let classificationList = await utilities.buildClassificationList(classification_id);
        res.status(501).render("./inventory/add-inventory", {
            title: "Add New Inventory Item",
            nav,
            classificationList,
            errors: { array: () => [{ msg: "Failed to add vehicle to the database." }] },
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
        });
    }
};

/* ****************************************
 * Process Add Favorite
 * *************************************** */
invCont.addFavorite = async function (req, res, next) {
    const inv_id = parseInt(req.params.inventoryId);
    const accountData = req.session.accountData;

    if (!accountData) {
        req.flash("notice", "Please log in to add this vehicle to your favorites.");
        return res.redirect(`/account/login?redirect=/inv/detail/${inv_id}`);
    }

    const result = await favoriteModel.addFavorite(accountData.account_id, inv_id);
    if (result) {
        req.flash("success", "Vehicle added to your favorites!");
    } else {
        req.flash("error", "Failed to add vehicle to favorites. Please try again.");
    }
    res.redirect(`/inv/detail/${inv_id}`);
}

/* ****************************************
 * Process Remove Favorite
 * *************************************** */
invCont.removeFavorite = async function (req, res, next) {
    const inv_id = parseInt(req.params.inventoryId);
    const accountData = req.session.accountData;

    if (!accountData) {
        req.flash("notice", "Please log in to remove this vehicle from your favorites.");
        return res.redirect(`/account/login?redirect=/inv/detail/${inv_id}`);
    }

    const success = await favoriteModel.removeFavorite(accountData.account_id, inv_id);
    if (success) {
        req.flash("success", "Vehicle removed from your favorites.");
    } else {
        req.flash("error", "Failed to remove vehicle from favorites. Please try again.");
    }
    res.redirect(`/inv/detail/${inv_id}`);
}

module.exports = invCont