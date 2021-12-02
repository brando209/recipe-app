const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Table = require('../database/Table');

function AuthService() {
    this.userTable = new Table("users");
}

AuthService.prototype.register = async function (user) {
    // Check if the userName and email already exist in the database
    const userExists = await this.userTable.hasEntry({ userName: user.userName, email: user.email }, { rowOperator: 'OR' });
    if (userExists) throw new Error("Username or email already exists");

    // Hash the new user password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;

    //Add new user to database
    const userCreated = await this.userTable.addEntry(user);
    if (!userCreated.insertId) throw new Error("User not created")

    //Retrieve and return new user record
    const newUser = await this.userTable.getEntry({ rows: { id: userCreated.insertId } });
    if (!newUser) throw new Error("Unable to retrieve user record")

    return newUser;
}

AuthService.prototype.login = async function (credentials) {
    //Verify that the user exists
    const hasEmail = credentials.email !== undefined && credentials.email !== null;
    const credentialsUsed = hasEmail ? { email: credentials.email } : { userName: credentials.userName };
    const user = await this.userTable.getEntry({ rows: credentialsUsed });
    if (!user) throw new Error("User does not exist");

    // Verify that the password is correct
    const validPassword = await bcrypt.compare(credentials.password, user.password);
    if (!validPassword) throw new Error("Invalid password.");

    delete user.password
    user.token = generateToken(user);

    return { user }
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

module.exports = AuthService;