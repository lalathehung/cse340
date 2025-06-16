const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation')

// Making a login page
router.get("/login",utilities.handleErrors(accountController.buildLogin));

// Making a registration page
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Route to process registration
router.post("/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post( "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
)

// For Profile page  -  /account/profile
router.get(
    "/profile",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildProfileView)
);

// Placeholder route for the base /account/ path
router.get(
    "/",
    utilities.checkLogin, // Protect this route
    utilities.handleErrors(accountController.buildAccountManagementView) // Placeholder for now
);

// Route for Logout
router.get("/logout", accountController.logoutAccount);

module.exports = router;