const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Schema for storing weather search history
const weatherSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  description: String,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});

const Weather = mongoose.model("Weather", weatherSchema);

// Route 1: Fetch LIVE weather from OpenWeatherMap & store in DB
app.get("/api/weather/:city", async (req, res) => {
  try {
    const city = req.params.city;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );

    const data = response.data;

    // Save to database
    const record = new Weather({
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity
    });
    await record.save();

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

// Route 2: Save a search manually (called from frontend)
app.post("/api/weather/save", async (req, res) => {
  try {
    const record = new Weather(req.body);
    await record.save();
    res.json({ message: "Saved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save" });
  }
});

// Route 3: Get search history from database
app.get("/api/weather/history/all", async (req, res) => {
  try {
    const history = await Weather.find().sort({ timestamp: -1 }).limit(20);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));