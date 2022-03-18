const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Table = require('../database/Table');

const User = new Table("users");
const Guest = new Table("guests");
const Recipe = new Table("recipes");
const Ingredient = new Table("ingredients");
const UserRecipe = new Table("user_recipe");
const RecipeIngredient = new Table("recipe_ingredient");
const MealPlan = new Table("meal_plans");
const GroceryList = new Table("lists")

const { toSQLDatetime } = require('../utils/sql');

function UserService() { }

UserService.prototype.createUser = async function (user) {
    // Check if the userName and email already exist in the database
    const userExists = await User.hasEntry({ userName: user.userName, email: user.email }, { rowOperator: 'OR' });
    if (userExists) throw new Error("Username or email already exists");

    // Hash the new user password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;

    //Add new user to database
    const userCreated = await User.addEntry(user);
    if (!userCreated.insertId) throw new Error("User not created.")

    //Retrieve and return new user record
    return this.getUser(userCreated.insertId);
}

UserService.prototype.login = async function (credentials) {
    //Verify that the user exists
    const hasEmail = credentials.email !== undefined && credentials.email !== null;
    const credentialsUsed = hasEmail ? { email: credentials.email } : { userName: credentials.userName };
    const user = await User.getEntry({ rows: credentialsUsed });
    if (!user) throw new Error("User does not exist.");

    // Verify that the password is correct
    const validPassword = await bcrypt.compare(credentials.password, user.password);
    if (!validPassword) throw new Error("Invalid password.");

    delete user.password;
    user.token = generateToken(user);

    return user;
}

UserService.prototype.getUser = async function (userId) {
    if(!userId) throw new Error("User ID not provided.");
    const user = await User.getEntry({ rows: { id: userId } });

    if (!user) throw new Error("User does not exist.");

    delete user.password;

    return user;
}

UserService.prototype.updateUser = async function (userId, updates) {
    const { firstName, lastName } = updates;
    await User.updateEntries({ id: userId }, { firstName, lastName });
    return this.getUser(userId);
}

UserService.prototype.changeUserPassword = async function (userId, currentPassword, newPassword) {
    const user = await User.getEntry({ rows: { id: userId } });
    if (!user) throw new Error("User does not exist.");

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) throw new Error("Incorrect password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await User.updateEntries({ id: userId }, { password: hashedPassword });

    if (updated.changedRows < 1) throw new Error("Unable to update user password.");

    return true;
}

UserService.prototype.deleteUser = async function (userId) {
    const deleted = await User.removeEntries({ id: userId });
    if(deleted.affectedRows < 1) throw new Error("User not found");

    return true;
}

UserService.prototype.getGuest = async function () {
    const now = new Date();
    const notLoggedIn = guest => {
        if(guest.loginAt === null) return true;
        const msElapsed = Math.abs(new Date(guest.loginAt).getTime() - now.getTime());
        const minutesElapsed = msElapsed / (60 * 1000);
        return minutesElapsed > 5;
    }
    const guests = await Guest.getEntries();
    const available = guests.find(notLoggedIn);
    if(!available) throw new Error("No Guest Access Available. Please wait until a guest session expires. Guest sessions last for 15 minutes.")

    const guest = await this.getUser(available.id);

    //Delete everything from the previous guest
    //1. Get all recipe ids related to this guest
    const recipes = await UserRecipe.getEntries({ rows: { user_id: guest.id } });
    //2. TODO: Get all ingredients related to each recipe
    //3. TODO: Remove all ingredients which are not part of another users recipe
    //4. Remove all recipes
    const recipeIds = recipes.reduce((prev, curr) => (prev ? `${prev},${curr.recipe_id}` : curr.recipe_id), "");
    recipeIds?.length > 0 && await Recipe.removeEntries([`id IN (${recipeIds})`]);
    //5. Remove planned meals and grocery list items 
    await MealPlan.removeEntries({ user_id: guest.id });
    await GroceryList.removeEntries({ user_id: guest.id });
    //Timestamp login and generate 15 minute token
    await Guest.updateEntries({ id: available.id }, { loginAt: toSQLDatetime(now) });
    guest.token = generateToken(guest, '5m');

    return guest;
}

UserService.prototype.removeGuestResources = async function (guestId) {
    const guest = await User.getEntry({ rows: { id: guestId } });

    if(!guest || guest.type !== "guest") return;

    //1. Get all recipe ids related to this guest
    const recipes = await UserRecipe.getEntries({ rows: { user_id: guest.id } });
    //2. TODO: Get all ingredients related to each recipe
    //3. TODO: Remove all ingredients which are not part of another users recipe
    //4. Remove all recipes
    const recipeIds = recipes.reduce((prev, curr) => (prev ? `${prev},${curr.recipe_id}` : curr.recipe_id), "");
    recipeIds?.length > 0 && await Recipe.removeEntries([`id IN (${recipeIds})`]);
    //5. Remove planned meals and grocery list items 
    await MealPlan.removeEntries({ user_id: guest.id });
    await GroceryList.removeEntries({ user_id: guest.id });

    await Guest.updateEntries({ id: guest.id }, { loginAt: null });
}

function generateToken(user, exp = null) {
    const {id, firstName, lastName, userName, email, type } = user;
    const payload = {};
    if(id) payload.id = id;
    if(firstName) payload.firstName = firstName;
    if(lastName) payload.lastName = lastName;
    if(userName) payload.userName = userName;
    if(email) payload.email = email;
    if(type) payload.type = type;

    const options = {};
    if(exp) options.expiresIn = exp;

    return jwt.sign(payload, process.env.TOKEN_SECRET, options);
}

module.exports = UserService;