const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const validate = {}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
return [
    // firstname is required and must be string
    body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a first name.")
    .isLength({ min: 1  , max: 40 })
    .withMessage('First name cannot exceed 40 characters.'), // on error this message is sent.

    // lastname is required and must be string
    body("account_lastname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a last name.")
    .isLength({ min: 2 , max: 40})
    .withMessage("Last name cannot exceed 40 characters."), // on error this message is sent.

    // valid email is required and cannot already exist in the DB
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
        throw new Error("Email already exists. Please log in or use a different email")
        }
    }),

    // password is required and must be strong password
    body("account_password")
    .trim()
    .notEmpty()
    .withMessage("A password is required.")
    .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),
]
}

/*  **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => {
  return [
    // Validate email
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account = await accountModel.getAccountByEmail(account_email);
        if (!account) {
          throw new Error("Email not found. Please register or check email spelling.");
        }
        req.accountData = account;
      }),

    // Validate password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      // Custom validator for password
      .custom(async (account_password, { req }) => {
        const accountData = req.accountData;

        if (!accountData) {
          return true; // If email not found, letting the exp validator handle mentioning so returning true here
        }
        const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);

        if (!passwordMatch) {
          throw new Error("Incorrect password. Please try again.");
        }
        return true;
      }),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/* ******************************
 * Check login data to validate user login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

module.exports = validate