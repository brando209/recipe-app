const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const recipeRouter = require('./src/routes/recipes');
const ingredientRouter = require('./src/routes/ingredients');
const authRouter = require('./src/routes/authentication');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/recipes', recipeRouter);
app.use('/api/ingredients', ingredientRouter);
app.use('/api/auth', authRouter);

module.exports = app;