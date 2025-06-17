const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const utilities = require("./index");
const validate = {};

/*  **********************************
 *  Add Classification Data Validation Rules
 * ********************************* */
validate.addClassificationRules = () => {
    return [
        // classification_name required to be alphabetic
        body("classification_name")
            .trim()
            .notEmpty().withMessage("Please provide a Classification name.")
            .isAlpha().withMessage("Classification name must contain only letters.")  // Checks if the string contains only letters (a-zA-Z)
            .isLength({ min: 1 , max: 50 }).withMessage("Classification name cannont exceed 50 letters.")
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

/*  **********************************
 *  Add Inventory Data Validation Rules
 * ********************************* */
validate.addInventoryRules = () => {
    return [
        body("classification_id")
            .trim()
            .notEmpty().withMessage("Please select a classification."),

        body("inv_make")
            .trim()
            .notEmpty().withMessage("Please provide the vehicle make.")
            .isLength({ min: 2, max: 50 }).withMessage("Make must be between 2 and 50 characters."),

        body("inv_model")
            .trim()
            .notEmpty().withMessage("Please provide the vehicle model.")
            .isLength({ min: 2, max: 50 }).withMessage("Model must be between 2 and 50 characters."),

        body("inv_year")
            .trim()
            .notEmpty().withMessage("Please provide the vehicle year.")
            .isNumeric({ no_symbols: true }).withMessage("Year must be a 4-digit number.")
            .isLength({ min: 4, max: 4 }).withMessage("Year must be a 4-digit number.")
            .custom((value) => {    //  Added to ensure proper year is added between 1900 and max currentYear + 5 (for future models)
                const currentYear = new Date().getFullYear();
                const year = parseInt(value, 10);
                if (year < 1900 || year > currentYear + 5) {
                throw new Error(`Year must be between 1900 and ${currentYear + 5}.`);
                }
                return true;
            }),

        body("inv_description")
            .trim()
            .notEmpty().withMessage("Please provide a description for the vehicle.")
            .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters."),

        body("inv_image")
            .trim()
            .notEmpty().withMessage("Please provide an image path.")
            .matches(/^\/?images\/vehicles\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/i)
            .withMessage("Image path must be a valid path like /images/vehicles/image.png."),

        body("inv_thumbnail")
            .trim()
            .notEmpty().withMessage("Please provide a thumbnail image path.")
            .matches(/^\/?images\/vehicles\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/i)
            .withMessage("Thumbnail path must be a valid path like /images/vehicles/tn-image.png."),

        body("inv_price")
            .trim()
            .notEmpty().withMessage("Please provide the vehicle price.")
            .isNumeric({ no_symbols: false }).withMessage("Price must be a valid number with 1 or zero decimals.")
            .isFloat({ min: 0.01 }).withMessage("Price must be greater than zero."),

        body("inv_miles")
            .trim()
            .notEmpty().withMessage("Please provide the vehicle mileage.")
            .isNumeric({ no_symbols: true }).withMessage("Mileage must be a valid whole number (no commas or decimals).")
            .isInt({ min: 0 }).withMessage("Mileage must be zero or more miles"),

        body("inv_color")
            .trim()
            .notEmpty().withMessage("Please provide the vehicle color.")
            .isLength({ min: 2, max: 30 }).withMessage("Color must be between 2 and 30 characters."),
    ];
};

/* ******************************
 * Check inventory data to add
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const {
        classification_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        let classificationList = await utilities.buildClassificationList(classification_id);
        res.render("inventory/add-inventory", {
            title: "Add New Inventory Item",
            nav,
            classificationList,
            errors,
            // Pass all form fields back for sticky form
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        });
        return;
    }
    next();
};

module.exports = validate;