const express = require('express'); // Nhập Express
const router = express.Router(); // Tạo router mới
const SensorData = require('../models/SensorData'); // Nhập mô hình dữ liệu cảm biến

// Điểm cuối để lấy tất cả dữ liệu cảm biến
router.get('/', async (req, res) => {
  try {
    const sensors = await SensorData.find(); // Lấy tất cả dữ liệu cảm biến
    res.json(sensors); // Trả về dữ liệu cảm biến
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu cảm biến:', error); // Thông báo lỗi
    res.status(500).json({ message: 'Lỗi nội bộ' }); // Trả về lỗi nội bộ
  }
});

// Xuất router
module.exports = router;
