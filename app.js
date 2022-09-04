const express = require('express');

const cors = require('cors');

const indexRouter = require('./routes/index');


// Create the express app
const app = express();

app.use(cors());

const morgan = require('morgan');

//midedware
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//routers
app.use(indexRouter);

//starting express server
const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('Server listening on port 3001');
});