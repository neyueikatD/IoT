const mongoose = require('mongoose'); // Nhập Mongoose để tạo mô hình

const sensorDataSchema = new mongoose.Schema({
  temperature: { type: Number, required: true }, // Nhiệt độ
  humidity: { type: Number, required: true }, // Độ ẩm
  lighting: { type: Number, required: true }, // Ánh sáng
  newS: {type: Number, required: true},//camr bieens moiws
  timestamp: { type: Date, default: Date.now } // Thời gian
});

// Xuất mô hình
module.exports = mongoose.model('SensorData', sensorDataSchema);
