/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const staticRoutes = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute)

// 500 handler for testing
app.get("/trigger-server-error", (req, res, next) => {
  const err = new Error("Intentional 500 server error triggered for testing.");
  err.status = 500;
  next(err);
});

// 404 Handler
app.use(async (req, res, next) => {
  const err = new Error('Sorry, we appear to have lost that page.');
  err.status = 404;
  next(err);
})

/* ***********************
* Express Error Handler
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  const statusCode = err.status || 500;
  let displayTitle;
  let displayMessage;

  switch (statusCode) {
    case 404:
      displayTitle = "404 Not Found";
      displayMessage = err.message || 'Sorry, we appear to have lost that page.';
      break;
    case 500:
      displayTitle = "500 Internal Server Error";
      displayMessage = err.message || 'Oh no! There was a crash. Maybe try a different route?';
      break;

    default:
      if (statusCode >= 500 && statusCode < 600) {
        displayTitle = `${statusCode} Server Error`;
      } else if (statusCode >= 400 && statusCode < 500) {
        displayTitle = `${statusCode} Client Error`;
      } else {
        displayTitle = 'Server Error'; // Generic fallback
      }
      displayMessage = err.message || 'An unexpected error occurred. Please try again.';
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
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`) // I made the link clickable!! :)
})