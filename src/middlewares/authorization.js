const jwt = require('jsonwebtoken');
const Table = require('../database/Table');
const UserRecipe = new Table('user_recipe');
const MealPlan = new Table('meal_plans');
const MealPlanItem = new Table('meal_plan_item');
const List = new Table('lists');
const ListItem = new Table("list_item");

// Make sure the jwt is provided and is valid
const authorizeJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).send("No auth token");

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if(err) {
            if(err.message === 'jwt expired') return res.status(403).send("Your session has expired. Please log in again to continue.");
            return res.status(403).send(err.message);
        }
        user.token = token;
        req.user = user;
        next();
    }); 
}

const authorizeUser = async (req, res, next) => {
    const authorized = await UserRecipe.hasEntry({ user_id: req.user.id, recipe_id: req.params.recipeId });
    if(!authorized) return res.status(401).send("You do not have permission to view or edit this recipe.");

    next();
}

const authorizeGuestPost = async (req, res, next) => {
    if(req.user.type !== "guest") return next();
    let numItems;
    //Guest POST recipe
    if(req.originalUrl === "/api/recipes") {
        numItems = await UserRecipe.getEntries({ rows: { user_id: req.user.id } }).then(recipes => recipes.length);
        if(numItems >= 5) {
            return res.status(401).send("Resource Limit Exceeded: Guest accounts may create up to 5 recipes.");
        } 
    }
    //Guest POST grocery item
    if(req.originalUrl === "/api/planner/meal") {
        numItems = await MealPlan.getEntries({ rows: { user_id: req.user.id }, joins: [{ table: `${MealPlanItem.tableName} mpi`, on: `${MealPlan.tableName}.id=mpi.plan_id`}] }).then(items => items.length);
        if(numItems >= 10) {
            return res.status(401).send("Resource Limit Exceeded: Guest accounts may create up to 10 meal plan items.");
        }
    }
    //Guest POST meal plan item
    if(req.originalUrl === "/api/planner/grocery") {
        numItems = await List.getEntries({ rows: { user_id: req.user.id }, joins: [{ table: `${ListItem.tableName} li`, on: `${List.tableName}.id=li.list_id`}] }).then(items => items.length);
        if(numItems >= 5) {
            return res.status(401).send("Resource Limit Exceeded: Guest accounts may create up to 5 grocery list items.");
        }
    }
    next();
}

module.exports = {
    authorizeJWT, authorizeUser, authorizeGuestPost
}