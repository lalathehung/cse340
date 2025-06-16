const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid
    if (data.length > 0) {
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + 'details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **************************************
* Build the inventory item detail view HTML
* ************************************ */
Util.buildInventoryDetailView = async function (itemData) {
    if (!itemData) {
        return '<p class="notice">Sorry, details for this vehicle could not be found.</p>';
    }

    // Formatting price and mileage

    const price = parseFloat(itemData.inv_price);
    const miles = typeof itemData.inv_miles === 'number' ? itemData.inv_miles : 0;

    const formattedPrice = new Intl.NumberFormat('en-US').format(price);
    const formattedMileage = new Intl.NumberFormat('en-US').format(miles);

    // Rest of the fields like inv_make, inv_model, inv_year, inv_color, inv_description
    let html = `
        <div id="vehicle-detail-container">
            <div class="vehicle-image-section">
                <img src="${itemData.inv_image}" alt="Image of ${itemData.inv_make} ${itemData.inv_model}">
            </div>
            <div class="vehicle-info-section">
                <h1>${itemData.inv_make} ${itemData.inv_model}</h1>
                <p class="vehicle-year"><strong>Year:</strong> ${itemData.inv_year}</p>
                <p class="vehicle-price"><strong>Price:</strong> $${formattedPrice}</p>
                <p class="vehicle-description"><strong>Description:</strong> ${itemData.inv_description}</p>
                <hr>
                <p class="vehicle-mileage"><strong>Mileage:</strong> ${formattedMileage} miles</p>
                <p class="vehicle-color"><strong>Color:</strong> ${itemData.inv_color}</p>
                <!-- Add other details as needed, e.g.: -->
                <!-- <p><strong>Engine:</strong> ${itemData.inv_engine || 'N/A'}</p> -->
                <!-- <p><strong>Transmission:</strong> ${itemData.inv_transmission || 'N/A'}</p> -->
            </div>
        </div>
    `;
    return html;
}

/* ****************************************
 *  Check if user is logged in
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (req.session.loggedin) {
      next();
    } else {
      req.flash("notice", "Please log in to access this page.");
      res.redirect("/account/login"); // Redirects to login if NOT logged in
    }
};


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util