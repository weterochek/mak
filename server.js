const dotenv = require('dotenv');
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const URL = "mongodb+srv://weter:drakon25@cluster0.3v6ie.mongodb.net/moviebox?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors());
app.use(express.json()); // Здесь добавлены скобки

// Подключение к MongoDB
mongoose
  .connect(URL, { useNewUrlParser: true, useUnifiedTopology: true }) // Заменили uri на URL
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Схема и модель пользователя
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Регистрация
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).send("Пользователь успешно зарегистрирован!");
  } catch (error) {
    res.status(400).send("Ошибка при регистрации: " + error.message);
  }
});

// Авторизация
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Пользователь не найден");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Неверные учетные данные");

    res.status(200).send("Авторизация успешна!");
  } catch (error) {
    res.status(500).send("Ошибка на сервере");
  }
});

// Проверка соединения
app.get("/connect", (req, res) => {
  res.send("Соединение с сервером успешно!");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
