const validator = require('../helpers/validator');

const validateRecipe = (req, res, next) => {
    const durationRule = {
        days: "numeric|min:0|max:30",
        hours: "numeric|min:0|max:24",
        minutes: "numeric|min:0|max:480"
    }

    const validationRule = {
        "title":                        "required|string|min:3|max:96",
        "description":                  "string|min:3|max:512",
        "instructions":                 "required|array",
        "ingredients":                  "required|array",
        "ingredients.*.amount":         "numeric",
        "ingredients.*.measurement":    "in:teaspoon,tablespoon,cup,ounce,pound,milligram,gram,kilogram,milliliter,liter,pint,quart,gallon,pinch,piece,slice,stick,clove,can,box,bag,package",
        "ingredients.*.size":           "in:small,medium,large",
        "prepTime":                     durationRule,
        "cookTime":                     durationRule,
        "totalTime":                    durationRule,
        "comments":                     "array",
        "categories":                   "array"
    }

    const body = JSON.parse(JSON.stringify(req.body));
    body.instructions = JSON.parse(JSON.stringify(body.instructions));
    body.ingredients = JSON.parse(JSON.stringify(body.ingredients));
    body.prepTime = JSON.parse(JSON.stringify(body.prepTime));
    body.cookTime = JSON.parse(JSON.stringify(body.cookTime));
    body.totalTime = JSON.parse(JSON.stringify(body.totalTime));
    body.comments = (body.comments && JSON.parse(JSON.stringify(body.comments))) || null;
    body.categories = (body.categories && JSON.parse(JSON.stringify(body.categories))) || null;
    req.body = body;

    if(req.user.type === "guest") {
        const limitedKeys = ['instructions', 'ingredients', 'categories', 'comments'];
        const exceeded = [];
        for(let key of limitedKeys) {
            if(req.body[key]?.length > 10) {
                exceeded.push(key);
            }
        }
        if(exceeded.length > 0) return res.status(412).send("Guest resource limit exceeded. The fields 'instructions', 'ingredients', 'categories', and 'comments' are limited to 10 items for guest accounts");
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