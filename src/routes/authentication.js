const express = require('express');
const router = express.Router();

const { validateRegister, validateLogin} = require('../middlewares/validation');
const AuthService = require('../services/AuthService');
const service = new AuthService();

router.post('/register', validateRegister, async (req, res) => {
    const newUser = req.body;
    try {
        const userRecord = await service.register(newUser);
        delete userRecord.password;
        return res.status(200).send(userRecord);
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
        return res.status(401).json(err.message);
    }
});

module.exports = router;