const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

require('dotenv').config();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


const mongoURI = process.env.Local_DB_Address;
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log("MongoDB connected")).catch(err => console.log(err));

app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT}`));