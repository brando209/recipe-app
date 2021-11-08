const validator = require('../helpers/validator');

const validateRecipe = (req, res, next) => {
    const validationRule = {
        "title":                        "required|string|min:3|max:30",
        "description":                  "string|min:3|max:512",
        "instructions":                 "required|array",
    }

    const body = JSON.parse(JSON.stringify(req.body));

    validator(body, validationRule, {}, (err, success) => {
        if (!success) {
            res.status(412).send({ success: false, message: 'Validation failed', data: err.errors });
        } else {
            next();
        }
    });
}

module.exports = {
    validateRecipe
}