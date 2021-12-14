const jwt = require('jsonwebtoken');
const Table = require('../database/Table');

// Make sure the jwt is provided and is valid
const authorizeJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).send("No auth token");

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.status(403).send(err.message);
        }
        user.token = token;
        req.user = user;
        next();
    }); 
}

const authorizeUser = async (req, res, next) => {
    const userRecipe = new Table('user_recipe');

    const authorized = await userRecipe.hasEntry({ user_id: req.user.id, recipe_id: req.params.recipeId });
    if(!authorized) return res.status(401).send("You do not have permission to view or edit this recipe.");

    next();
}

module.exports = {
    authorizeJWT, authorizeUser
}