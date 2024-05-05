const express = require('express');
const routes = require('./routes/userRoutes');
const bodyParser = require('body-parser');
const app = express();
require('dotenv').config();
require('./config/db');
const path = require('path');
const PORT = process.env.PORT || 8080;


app.use(bodyParser.json());
app.use('/api/v1', routes); 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



app.listen(PORT, () => {
    console.log(`Server is up and running on PORT : ${PORT}`);
})
