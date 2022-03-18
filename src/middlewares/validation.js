const validator = require('../helpers/validator');

const validateRecipe = (req, res, next) => {
    const validationRule = {
        "title":                        "required|string|min:3|max:96",
        "description":                  "string|min:3|max:512",
        "instructions":                 "required|array",
        "ingredients":                  "required|array",
        "ingredients.*.amount":         "numeric",
        "ingredients.*.measurement":    "in:teaspoon,tablespoon,cup,ounce,pound,milligram,gram,kilogram,milliliter,liter,pint,quart,gallon,pinch,piece,slice,stick,clove,can,box,bag,package",
        "ingredients.*.size":           "in:small,medium,large",
        "comments":                     "array",
        "categories":                   "array"
    }

    
    const body = JSON.parse(JSON.stringify(req.body));
    body.prep = JSON.parse(body.prep);
    body.cook = JSON.parse(body.cook);
    body.instructions = JSON.parse(body.instructions);
    body.ingredients = JSON.parse(body.ingredients);
    body.comments = (body.comments && JSON.parse(body.comments)) || null;
    body.categories = (body.categories && JSON.parse(body.categories)) || null;
    req.body = body;

    if(req.user.type === "guest") {
        const limitedKeys = ['instructions', 'ingredients', 'categories', 'comments'];
        const exceeded = [];
        for(let key of limitedKeys) {
            if(req.body[key]?.length > 10) {
                exceeded.push(key);
            }
        }
        if(exceeded.length > 0) return res.status(412).send("Validation Failed. Guest resource limit exceeded. The fields 'instructions', 'ingredients', 'categories', and 'comments' are limited to 10 items for guest accounts");
    }
    
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