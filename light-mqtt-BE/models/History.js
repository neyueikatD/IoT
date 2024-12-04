// const mongoose = require('mongoose'); // Nhập Mongoose để tạo mô hình

// const historySchema = new mongoose.Schema({
//   action: { type: String, required: true }, // Hành động
//   device: { type: String, required: true }, // Thiết bị
//   time: { type: Date, default: Date.now } // Thời gian
// });

// // Xuất mô hình
// module.exports = mongoose.model('History', historySchema);

const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  device: { type: String, required: true },          // Tên thiết bị: led1, fan, hoặc ac
  state: { type: String, required: true },           // Trạng thái thiết bị: "ON" hoặc "OFF"
  timestamp: { type: Date, default: Date.now } // Thời gian thay đổi trạng thái
});

module.exports = mongoose.model('History', historySchema);
