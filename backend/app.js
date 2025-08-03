const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require("./routes/index")
const port = process.env.PORT || 5000;
const app = express();

require('dotenv').config();
// CORS 설정 개선
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.com', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// 루트 경로 핸들러 추가
app.get('/', (req, res) => {
  res.json({ message: 'Shopping Mall API is running!' });
});

// API 라우트 설정
app.use("/api", indexRouter)




const mongoURI = process.env.Local_DB_Address;
if (mongoURI) {
  mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection error:", err));
} else {
  console.log("MongoDB URI not found, skipping database connection");
}

// AWS Elastic Beanstalk에서는 8080 포트를 사용
app.listen(port, () => console.log(`Server running on port ${port}`));