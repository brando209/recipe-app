const express = require('express');
const router = express.Router();

const PlannerService = require('../services/PlannerService');
const service = new PlannerService();

const { authorizeJWT, authorizeGuestPost } = require('../middlewares/authorization');

router.use(authorizeJWT);

router.get('/meal', async (req, res) => {
    const mealPlan = await service.getMealPlan(req.user.id);
    mealPlan ? res.json(mealPlan) : [];
});

router.post('/meal', authorizeGuestPost, async (req, res) => {
    const plannedMeal = await service.addMealPlanItem(req.user.id, req.body);
    res.json(plannedMeal);
});

router.patch('/meal/:mealId', async (req, res) => {
    const updatedMeal = await service.updateMealPlanItem(req.params.mealId, req.body);
    res.send("Success");
});

router.delete('/meal/:mealId', async (req, res) => {
    const deletedMeal = await service.deleteMealPlanItem(req.params.mealId);
    res.send("Success");
});

router.get('/grocery', async (req, res) => {
    const list = await service.getGroceryList(req.user.id);
    return list ? res.json(list) : res.status(404).send("No grocery list found");
});

router.post('/grocery', authorizeGuestPost, async (req, res) => {
    const listItem = await service.addGroceryListItem(req.user.id, req.body);
    res.json(listItem);
});

router.patch('/grocery/:itemId', async (req, res) => {
    const updatedlistItem = await service.updateGroceryListItem(req.params.itemId, req.body);
    res.send("Success");
});

router.delete('/grocery/:itemId', async (req, res) => {
    const deletedListItem = await service.deleteGroceryListItem(req.params.itemId);
    res.send("Success");
});

module.exports = router;