const express = require('express');
const router = express.Router();

const PlannerService = require('../services/PlannerService');
const service = new PlannerService();

const { authorizeJWT } = require('../middlewares/authorization');

router.use(authorizeJWT);

router.get('/meal', async (req, res) => {
    const mealPlan = await service.getMealPlan(req.user.id);
    mealPlan ? res.json(mealPlan) : [];
});

router.post('/meal', async (req, res) => {
    const plannedMeal = await service.addMealPlanItem(req.user.id, req.body);
    res.json(plannedMeal);
});

router.patch('/meal', async (req, res) => {
    const { mealPlanItemId, mealPlanItemUpdate } = req.body;
    const updatedMeal = await service.updateMealPlanItem(mealPlanItemId, mealPlanItemUpdate);
    res.send("Success");
});

router.delete('/meal', async (req, res) => {
    const deletedMeal = await service.deleteMealPlanItem(req.body.mealPlanItemId);
    res.send("Success");
});

router.get('/grocery', async (req, res) => {
    const list = await service.getGroceryList(req.user.id);
    return list ? res.json(list) : res.status(404).send("No grocery list found");
});

router.post('/grocery', async (req, res) => {
    const listItem = await service.addGroceryListItem(req.user.id, req.body);
    res.json(listItem);
});

router.patch('/grocery', async (req, res) => {
    const { listItemId, listItemUpdate } = req.body;
    const updatedlistItem = await service.updateGroceryListItem(listItemId, listItemUpdate);
    res.send("Success");
});

router.delete('/grocery', async (req, res) => {
    const deletedListItem = await service.deleteGroceryListItem(req.body.listItemId);
    res.send("Success");
});

module.exports = router;