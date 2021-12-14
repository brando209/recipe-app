const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Table = require('../database/Table');

const User = new Table("users");

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

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email
    }, process.env.TOKEN_SECRET);
}

module.exports = UserService;