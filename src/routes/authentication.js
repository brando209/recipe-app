const express = require('express');
const router = express.Router();

const { validateRegister, validateLogin} = require('../middlewares/validation');
const { authorizeJWT } = require('../middlewares/authorization');

const UserService = require('../services/UserService');
const service = new UserService();

router.post('/register', validateRegister, async (req, res) => {
    const newUser = req.body;
    try {
        const userRecord = await service.createUser(newUser);
        return res.status(200).json(userRecord);
    } catch(err) {
        return res.status(400).send(err.message);
    }
});

router.post('/login', validateLogin, async (req, res) => {
    try {
        const { user, token } = await service.login({
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password
        })
        return res.status(200).json({ user, token });
    } catch(err) {
        return res.status(401).send(err.message);
    }
});

router.get('/login', authorizeJWT, async (req, res) => {
    try {
        const user = await service.getUser(req.user.id);
        return res.status(200).json(user);
    } catch(err) {
        return res.status(401).send(err.message);
    }
});

module.exports = router;