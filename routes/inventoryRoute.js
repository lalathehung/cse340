// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require('../utilities/inventory-validation');

router.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(invController.buildManagementView)
);

// Classification route GET
router.get(
    "/add-classification",
    utilities.checkLogin,
    utilities.handleErrors(invController.buildAddClassification)
);

// Classification route POST to add new
router.post(
    "/add-classification",
    utilities.checkLogin,
    invValidate.addClassificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.processAddClassification)
);


// GET - Get Cars by Classification id
router.get("/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
);

// GET - Making a Details page of the car by id
router.get("/detail/:inventoryId",
    utilities.handleErrors(invController.buildByInventoryId)
);

module.exports = router;