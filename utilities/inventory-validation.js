const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const validate = {};

/*  **********************************
 *  Add Classification Data Validation Rules
 * ********************************* */
validate.addClassificationRules = () => {
    return [
        // classification_name required to be alphabetic
        body("classification_name")
            .trim()
            .notEmpty()
            .withMessage("Please provide a Classification name.")
            .isAlpha() // Checks if the string contains only letters (a-zA-Z)
            .withMessage("Classification name must contain only letters.")
            .isLength({ min: 1 , max: 50 })
            .withMessage("Classification name cannont exceed 50 letters.")
            .custom(async (classification_name) => {
               const classificationExists = await invModel.checkExistingClassificationByName(classification_name);
               if (classificationExists) {
                   throw new Error("Classification name already exists. Please use a different name.");
               }
            })
    ];
};

/* ******************************
 * Check classification data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        let nav = await require("../utilities/").getNav();
        const classificationsData = await invModel.getClassifications();
        res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name, // Pass back for sticky form
            classifications: classificationsData.rows,
        });
        return;
    }
    next();
};

module.exports = validate;