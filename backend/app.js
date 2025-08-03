const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require("./routes/index")
const port = process.env.PORT || 5000;
const app = express();

require('dotenv').config();
// CORS 설정 개선
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// 루트 경로 핸들러 추가
app.get('/', (req, res) => {
  res.json({ message: 'Shopping Mall API is running!' });
});

// MongoDB 연결 상태 확인 엔드포인트
app.get('/db-status', (req, res) => {
  const dbStatus = {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    database: mongoose.connection.db ? mongoose.connection.db.databaseName : null,
    host: mongoose.connection.host || null,
    port: mongoose.connection.port || null
  };
  
  res.json({
    message: 'Database Status Check',
    status: dbStatus.connected ? 'Connected' : 'Disconnected',
    details: dbStatus
  });
});

// API 라우트 설정
app.use("/api", indexRouter)


const mongoURI = process.env.Local_DB_Address;
if (mongoURI) {
  mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.log("❌ MongoDB connection failed:", err.message));
} else {
  console.log("⚠️ MongoDB URI not found");
}

// AWS Elastic Beanstalk에서는 8080 포트를 사용
app.listen(port, () => console.log(`Server running on port ${port}`));