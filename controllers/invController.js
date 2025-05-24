const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = parseInt(req.params.classificationId, 10) 
    let nav = await utilities.getNav()

    // Check if classification_id is valid
    if (isNaN(classification_id) || classification_id < 1) {
        return res.render("errors/error", {
            title: "Invalid Classification",
            message: "Sorry, the classification ID is invalid.",
            nav
        })
    }

    const data = await invModel.getInventoryByClassificationId(classification_id)
    if (!data || data.length === 0) {
        return res.render("errors/error", {
            title: "No Vehicles Found",
            message: "Sorry, no vehicles found for this classification.",
            nav
        })
    }

    const className = data[0].classification_name
    const grid = await utilities.buildClassificationGrid(data)
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

module.exports = invCont