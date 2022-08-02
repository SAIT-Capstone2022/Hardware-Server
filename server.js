const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { sensorData } = require('./sensorData');
const { date } = require('joi');
const serialport = require('serialport');
const SerialPort = serialport.SerialPort;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {}
);
const connection = mongoose.connection;
connection.once('open', () => {

  var port = new SerialPort("/dev/ttyACM0"/*replace string with actual port number*/, {
    baudrate: 9600,
    parser: serialport.parsers.readline("\n")
  });

  setInterval(() => {

    const environment = {
      temperature: "",
      humidity: "",
      moistureLevel: "",
    }

    // Read the port data
    port.on("open", function () {
      console.log('open');
      port.on('data', function (data) {
        console.log(data);
        environment.temperature = data.temperature;
        environment.humidity = data.humidity;
        environment.moistureLevel = data.moistureLevel;
      });
    });

    const sensorDataPoint = {
      email: "david.dentremont@edu.sait.ca",
      temperature: environment.temperature,
      humidity: environment.humidity,
      moistureLevel: environment.moistureLevel,
      date: new Date().getUTCDate(),
    }

    sensorData.create(sensorDataPoint);
    console.log("Created new sensordata")
  }, 10000);

  console.log("MongoDB database now connected successfully");
});

// Routes

app.listen(port, () => {
  console.log('Server is running');
});

