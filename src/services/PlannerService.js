const Table = require('../database/Table');

const MealPlan = new Table('meal_plans');
const MealPlanItem = new Table('meal_plan_item');
const GroceryList = new Table('lists');
const GroceryListItem = new Table('list_item');

const { toSQLDatetime } = require('../utils/sql');

function PlannerService() { }

//TODO: DRY code between meal plan and grocery list... seems the same
PlannerService.prototype.getMealPlan = async function(userId) {
    const mealPlanExists = await MealPlan.hasEntry({ user_id: userId });
    if(!mealPlanExists) return null;

    const mealPlanId = await MealPlan.getEntry({ rows: { 'user_id': userId } }).then(entry => entry.id);
    return MealPlanItem.getEntries({ rows: { plan_id: mealPlanId }, columns: ['id', 'recipe_id as recipeId', 'date'] });
}

PlannerService.prototype.addMealPlanItem = async function(userId, mealPlanItem) {
    const mealPlanExists = await MealPlan.hasEntry({ user_id: userId });
    const mealPlanId = mealPlanExists ?
        await MealPlan.getEntry({ row: { user_id: userId }}).then(entry => entry.id) :
        await MealPlan.addEntry({ user_id: userId }).then(entry => entry.insertId);
    
    mealPlanItem = { plan_id: mealPlanId, recipe_id: mealPlanItem.recipeId, date: toSQLDatetime(mealPlanItem.date) }
    const addedItemId = await MealPlanItem.addEntry(mealPlanItem).then(entry => entry.insertId);
    return MealPlanItem.getEntry({rows: { id: addedItemId }, columns: ['id', 'recipe_id as recipeId', 'date'] });
}

PlannerService.prototype.updateMealPlanItem = async function(mealPlanItemId, updates) {
    if(updates.date) updates.date = toSQLDatetime(updates.date);

    const updatedItem = await MealPlanItem.updateEntries({ id: mealPlanItemId }, updates);
    return updatedItem;
}

PlannerService.prototype.deleteMealPlanItem = async function(mealPlanItemId) {
    const deleted = await MealPlanItem.removeEntries({ id: mealPlanItemId });
    return deleted;
}

PlannerService.prototype.getGroceryList = async function(userId) {
    const listExists = await GroceryList.hasEntry({ user_id: userId });
    if(!listExists) return;

    const listId = await GroceryList.getEntry({ rows: { 'user_id': userId } }).then(entry => entry.id);
    const list = await GroceryListItem.getEntries({ rows: { list_id: listId }, columns: ['id', 'name', 'complete'] });
    return list.map(item => ({...item, complete: item.complete ? true : false }));
}

PlannerService.prototype.addGroceryListItem = async function(userId, listItem) {
    const listExists = await GroceryList.hasEntry({ user_id: userId });
    const listId = listExists ?
        await GroceryList.getEntry({ rows: { user_id: userId }}).then(entry => entry.id) :
        await GroceryList.addEntry({ user_id: userId }).then(entry => entry.insertId);
    
    listItem.list_id = listId;

    const addedItemId = await GroceryListItem.addEntry(listItem).then(entry => entry.insertId);
    return GroceryListItem.getEntry({rows: { id: addedItemId }});
}

PlannerService.prototype.updateGroceryListItem = async function(itemId, updates) {
    if(updates.complete !== undefined || updates.complete !== null) updates.complete = updates.complete ? 1 : 0;
    const updatedItem = await GroceryListItem.updateEntries({ id: itemId }, updates);
    return updatedItem;
}

PlannerService.prototype.deleteGroceryListItem = async function(itemId){
    const deleted = await GroceryListItem.removeEntries({ id: itemId });
    return deleted;
}

module.exports = PlannerService;