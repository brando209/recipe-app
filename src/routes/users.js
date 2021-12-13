const express = require('express');
const router = express.Router();

const UserService = require('../services/UserService');
const service = new UserService();

const { authorizeJWT } = require('../middlewares/authorization');

router.use(authorizeJWT);

router.get('/', async (req, res) => {
    try {
        const user = await service.getUser(req.user.id);
        return res.status(200).json(user);
    } catch(err) {
        res.status(400).send(err.message);
    }
});

router.delete('/', async (req, res) => {
    try {
        await service.deleteUser(req.user.id);
        return res.status(200).send("User Deleted");
    } catch(err) {
        res.status(400).send(err.message);
    }
});

router.patch('/', async (req, res) => {
    try {
        const updatedUser = await service.updateUser(req.user.id, req.body);
        return res.status(200).json(updatedUser);
    } catch(err) {
        res.status(400).send(err.message);
    }
});

router.patch('/changePassword', async (req, res) => {
    try {
        await service.changeUserPassword(req.user.id, req.body.oldPassword, req.body.newPassword);
        return res.status(200).send("Password Updated!");
    } catch(err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;