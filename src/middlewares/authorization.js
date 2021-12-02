const jwt = require('jsonwebtoken');

// Make sure the jwt is provided and is valid
const authorizeJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) return res.status(401).send("No auth token");

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if(err) {
            return res.status(403).send(err.message);
        }
        req.user = user;
        next();
    }); 
}

module.exports = {
    authorizeJWT
}