const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors');
require('dotenv').config();
const AuthRouter = require('./Routes/AuthRouter');
const ExamRouter = require('./Routes/ExamRouter');
const PORT = process.env.PORT || 3000;
require('./Models/db');

app.use(bodyParser.json());
app.use(cors()); //anyone can request to server (i.e client);
app.use('/auth', AuthRouter);
app.use('/api', ExamRouter);


app.listen(PORT ,()=> {
    console.log("Server is running");
})