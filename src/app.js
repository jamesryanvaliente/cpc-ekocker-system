const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const userRouter = require('./routes/userRoute');
app.use('/user', userRouter);

const adminRouter = require('./routes/adminRoute');
// const { pool } = require('./database/connection');
app.use('/admin', adminRouter);

module.exports = app;