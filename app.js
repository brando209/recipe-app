const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const recipeRouter = require('./src/routes/recipes');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/recipes', recipeRouter);

module.exports = app;