const utilities = require("../utilities/");
const baseController = {};

// Existing homepage controller
baseController.buildHome = async function (req, res) {
    const nav = await utilities.getNav();
    res.render("index", { title: "Home", nav });
};

// New error trigger controller
baseController.triggerError = async function (req, res, next) {
    throw new Error("Footer-based error triggered");
};

module.exports = baseController;