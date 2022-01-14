const validator = require('../helpers/validator');

const validateRecipe = (req, res, next) => {
    const validationRule = {
        "title":                        "required|string|min:3|max:30",
        "description":                  "string|min:3|max:512",
        "instructions":                 "required|array",
        "ingredients":                  "required|array",
        "ingredients.*.amount":         "numeric",
        "ingredients.*.measurement":    "in:teaspoon,tablespoon,cup,ounce,pound,gram",
        "ingredients.*.size":           "in:small,medium,large",
        "comments":                     "array"
    }

    const body = JSON.parse(JSON.stringify(req.body));
    body.prep = JSON.parse(body.prep);
    body.cook = JSON.parse(body.cook);
    body.instructions = JSON.parse(body.instructions);
    body.ingredients = JSON.parse(body.ingredients);
    body.comments = (body.comments && JSON.parse(body.comments)) || null;
    body.categories = (body.categories && JSON.parse(body.categories)) || null;
    req.body = body;

    validator(body, validationRule, {}, (err, success) => {
        if (!success) {
            res.status(412).send("Validation failed.");
        } else {
            next();
        }
    });
}

const validateRegister = (req, res, next) => {
    const validationRule = {
        "firstName": "required|string|min:3|max:32",
        "lastName": "required|string|min:3|max:32",
        "userName": "required|string|min:3|max:32",
        "email": "required|email",
        "password": "required|string|min:6|max:64",
    }

    const bodyObj = JSON.parse(JSON.stringify(req.body));

    validator(bodyObj, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send("Validation failed.");
        } else {
            next();
        }
    });
}

const validateLogin = (req, res, next) => {
    const validationRule = {
        "userName": "required_without:email|string|min:3|max:32",
        "email": "required_without:userName|email",
        "password": "required|string|min:6|max:64",
    }

    const bodyObj = JSON.parse(JSON.stringify(req.body));

    validator(bodyObj, validationRule, {}, (err, status) => {
        if (!status) {
            res.status(412).send("Validation failed.");
        } else {
            next();
        }
    });
}

module.exports = {
    validateRecipe, validateRegister, validateLogin
}