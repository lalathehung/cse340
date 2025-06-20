/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
require("dotenv").config()
const app = express()
const staticRoutes = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const baseController = require("./controllers/baseController")
const accountCont = require("./controllers/accountController")
const invCont = require("./controllers/invController")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require("./database/")
const favoriteValidation = require("./utilities/favorite-validation")

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require("connect-pg-simple")(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
}))

// Handle favicon.ico, prevent session error
app.get("/favicon.ico", (req, res) => res.status(204).end())

app.use(require("connect-flash")())
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

// Make session data can be used in header partial
app.use(function (req, res, next) {
  res.locals.loggedin = req.session.loggedin || false
  next()
})

// Use Express to replace body-parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)

// Account Routes
app.use("/account", accountRoute)

// Favorites routes
app.get("/account/favorites", utilities.checkLogin, utilities.handleErrors(accountCont.buildFavoritesView))
app.get("/inv/add-favorite/:inventoryId", utilities.checkLogin, favoriteValidation.favoriteRules(), favoriteValidation.checkFavoriteData, utilities.handleErrors(invCont.addFavorite))
app.get("/inv/remove-favorite/:inventoryId", utilities.checkLogin, favoriteValidation.favoriteRules(), favoriteValidation.checkFavoriteData, utilities.handleErrors(invCont.removeFavorite))

// 500 handler for testing
app.get("/trigger-server-error", (req, res, next) => {
  const err = new Error("Intentional 500 server error triggered for testing.")
  err.status = 500
  next(err)
})

// 404 Handler
app.use(async (req, res, next) => {
  const err = new Error("Sorry, we appear to have lost that page.")
  err.status = 404
  next(err)
})

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  const statusCode = err.status || 500
  let displayTitle
  let displayMessage

  switch (statusCode) {
    case 404:
      displayTitle = "404 Not Found"
      displayMessage = err.message || "Sorry, we appear to have lost that page."
      break
    case 500:
      displayTitle = "500 Internal Server Error"
      displayMessage = err.message || "Oh no! There was a crash. Maybe try a different route?"
      break
    default:
      if (statusCode >= 500 && statusCode < 600) {
        displayTitle = `${statusCode} Server Error`
      } else if (statusCode >= 400 && statusCode < 500) {
        displayTitle = `${statusCode} Client Error`
      } else {
        displayTitle = "Server Error"
      }
      displayMessage = err.message || "An unexpected error occurred. Please try again."
  }

  res.render("errors/error", {
    title: displayTitle,
    message: displayMessage,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 10000
const host = process.env.HOST || "0.0.0.0"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})