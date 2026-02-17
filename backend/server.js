const express = require('express');
const mongoose = require('mongoose');
const app = express();
const logger = require('./middlewares/logger');
const {NotFoundRoute,errorHandler} = require('./middlewares/error');
const authPath = require('./routes/auth');
const userPath = require('./routes/users');
const scanPath = require('./routes/scan');
const filterScanPath = require('./routes/filterScan');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');



//! run dotenv
dotenv.config();

// Connect to Database
mongoose
.connect(process.env.MONGO_URI)
.then(()=>{console.log("connect to database successfully")})
.catch((error)=>{console.log("Connection is Faild",error)})

//middleware
app.use(express.json());
app.use(cors());

// Static folders
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(logger);

//routes
app.use('/api/auth',authPath);
app.use('/api/users',userPath);
app.use('/api/scan',scanPath);
app.use('/api/filter',filterScanPath);

// Routes لصفحات HTML
// استبدال اسماء الروابط لما الموقع ينزل
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/login.html')); 
});

app.get('/scan-page', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/scan.html'));
});

app.get('/dashboard-page', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/html/dashboard.html'));
});






// error handling
app.use(NotFoundRoute);
app.use(errorHandler);





const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0',()=>{
    console.log(`Server is running in ${process.env.NODE_ENV} on port ${PORT}`);
});