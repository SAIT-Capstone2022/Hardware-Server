const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sensorData } = require('./sensorData');
const { date } = require('joi');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require("@serialport/parser-readline");
const { parse } = require('dotenv');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const serialport = new SerialPort({
  path: "COM5",
  baudRate: 9600,
});

const parser = serialport.pipe(new ReadlineParser({ delimiter: '\r\n'}));

// Database Connection
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {}
);
const connection = mongoose.connection;
connection.once('open', () => {
    
      parser.on('data', (data) =>  {

        const newestValue = JSON.parse(data);
 
        const sensorDataPoint = {
          email: "david.dentremont@edu.sait.ca",
          temperature: newestValue.temp,
          humidity: newestValue.humidity,
          moistureLevel: newestValue.moisture,
          date: new Date().toISOString(),
        };

        sensorData.create(sensorDataPoint);

        console.log("New Data Point Created");

      });

  console.log("MongoDB database now connected successfully");
});


// Routes

app.listen(port, () => {
  console.log('Server is running');
});

