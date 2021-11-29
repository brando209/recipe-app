const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const recipeRouter = require('./src/routes/recipes');
const ingredientRouter = require('./src/routes/ingredients');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/recipes', recipeRouter);
app.use('/api/ingredients', ingredientRouter);

module.exports = app;