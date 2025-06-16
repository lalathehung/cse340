const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
* Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    if (req.session.loggedin) {
        return res.redirect("/account/profile");
    }
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  if (req.session.loggedin) {
        return res.redirect("/account/profile");
    }
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult && regResult.rowCount && regResult.rowCount > 0) {  // I added these row checks as validation it got added
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body; // These were validated by checkLoginData
  const accountData = req.accountData;

  try {
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);

    if (passwordMatch) {
      // Passwords match!!! Store user info in session
      req.session.loggedin = true;
      req.session.accountData = { // Remember, do not store SENSITIVE info, like p/w
          account_id: accountData.account_id,
          account_firstname: accountData.account_firstname,
          account_lastname: accountData.account_lastname,
          account_email: accountData.account_email,
          account_type: accountData.account_type,
      };
      // Placeholder page
      req.flash("success", `Welcome back, ${accountData.account_firstname}!`);
      return res.redirect("/account/profile");  // might change to management later
    } else {
      req.flash("warning", "Invalid credentials. Please check your email and password."); // Validator should catch this but I'll keep just in case
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email, // Gonna pass back the email for messaging clarity
      });
    }
  } catch (error) {
    return next(error);
  }
}

/* ****************************************
*  Build Account Profile View
* *************************************** */
async function buildProfileView(req, res, next) {
    let nav = await utilities.getNav();
    const accountData = req.session.accountData;

    if (!accountData) {
        // Techynically won't happen with the checkLogin middleware, but maybe multi-tab concurrency protection
        req.flash("notice", "User data not found. Please log in again.");
        return res.redirect("/account/login");
    }

    res.render("account/profile", {
        title: "My Profile",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname // Pass the first name to the view for msg
    });
}

/* ****************************************
*  Build Account Management View (Placeholder for now)
* *************************************** */
async function buildAccountManagementView(req, res, next) {
    let nav = await utilities.getNav();
    const accountData = req.session.accountData;

    res.render("account/management", { // Maybe will create later??
        title: "Account Management",
        nav,
        errors: null,
        account_firstname: accountData.account_firstname
    });
}

/* ****************************************
*  Process Logout
* *************************************** */
async function logoutAccount(req, res, next) {
    if (req.session && req.session.loggedin) {
        req.flash("notice", "You have been logged out successfully.");

        req.session.destroy(err => {
            if (err) {
                console.error("Error destroying session:", err);
            }
            res.clearCookie('sessionId'); // 'sessionId' is your cookie - clearing it
            return res.redirect('/'); // Redirect to homepage
        });
    } else {
        res.redirect('/');
    }
}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    loginAccount,
    buildProfileView,
    buildAccountManagementView,
    logoutAccount
};