const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const recipeRouter = require('./src/routes/recipes');
const ingredientRouter = require('./src/routes/ingredients');
const authRouter = require('./src/routes/authentication');
const userRouter = require('./src/routes/users');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/recipes', recipeRouter);
app.use('/api/ingredients', ingredientRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
});


module.exports = app;