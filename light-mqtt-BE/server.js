const express = require('express'); // Nhập Express
const mongoose = require('mongoose'); // Nhập Mongoose để kết nối với MongoDB
const mqtt = require('mqtt'); // Nhập MQTT để kết nối với broker
const cors = require('cors'); // Nhập CORS để xử lý các yêu cầu từ các nguồn khác
const bodyParser = require('body-parser'); // Nhập body-parser để xử lý dữ liệu JSON
const { format } = require('date-fns'); // Nhập hàm format từ date-fns để định dạng thời gian
//const WebSocket = require('ws'); // Nhập WebSocket để tạo kết nối thời gian thực

// Mô hình MongoDB
const SensorData = require('./models/SensorData'); // Nhập mô hình dữ liệu cảm biến
const History = require('./models/History'); // Nhập mô hình lịch sử

// Định nghĩa các tuyến đường
const sensorRoutes = require('./routes/sensor'); // Nhập các tuyến đường cảm biến

// Khởi tạo ứng dụng Express
const app = express();
app.use(express.json()); // Middleware để phân tích dữ liệu JSON
app.use(cors()); // Bật CORS
app.use(bodyParser.json()); // Middleware để phân tích dữ liệu JSON
app.use('/sensor', sensorRoutes); // Sử dụng các tuyến đường cảm biến

// Kết nối MongoDB
// mongoose.connect("mongodb+srv://hkieuyen26:OEBimxGzJh9sTsSC@clusteriot.l9ptk.mongodb.net/?retryWrites=true&w=majority&appName=ClusterIoT")
mongoose.connect("mongodb://localhost:27017/test")
  .then(() => console.log('Đã kết nối với MongoDB')) // Thông báo nếu kết nối thành công
  .catch((err) => console.error('Kết nối MongoDB thất bại', err)); // Thông báo nếu kết nối thất bại

// Cài đặt client MQTT
const mqttClient = mqtt.connect('mqtt://172.20.10.2:1884', {
  username: 'tky', // Tên người dùng
  password: 'tky' // Mật khẩu
});

mqttClient.on('connect', () => {
  console.log('Đã kết nối với broker MQTT'); // Thông báo nếu kết nối thành công
  mqttClient.subscribe('topic'); // Đăng ký nhận tin nhắn từ topic 'topic'
  mqttClient.subscribe('led1'); // Đăng ký nhận trạng thái đèn
  mqttClient.subscribe('fan'); // Đăng ký nhận trạng thái quạt
  mqttClient.subscribe('ac'); // Đăng ký nhận trạng thái điều hòa
  mqttClient.subscribe('led2');
  mqttClient.subscribe('led3');
});

// Xử lý tin nhắn nhận được từ MQTT
mqttClient.on('message', async (topic, message) => {
  // let data = handleMqttMessage(topic, message.toString());
  let data;
  try {
    data = JSON.parse(message.toString()); // Convert the message to JSON
  } catch (err) {
    console.error('Invalid JSON received:', message.toString()); // Notify if the message is invalid
    console.log(message.toString());
    return; // Exit if the message is invalid
  }

  // Save sensor data for 'topic' (sensor data including 'newS' field)
  if (topic === 'topic') {
    // console.log(data);
    const newSensorData = new SensorData({
      temperature: data.temperature, // Save temperature
      humidity: data.humidity, // Save humidity
      lighting: data.lighting, // Save lighting
      newS: data.new, // Save new sensor data (newS)
      timestamp: new Date() // Save current timestamp
    });

    try {
      await newSensorData.save(); // Save the sensor data to MongoDB
      // console.log('Sensor data saved successfully');

    } catch (err) {
      console.error('Error saving sensor data:', err); // Notify if there is an error saving data
    }
  }else{
    console.log(topic);
    console.log(data);
    
    // Device mapping to handle 'led1', 'fan', 'ac', 'led2', 'led3'
    const deviceMap = {
      "led1": "led1",
      "fan": "fan",
      "ac": "ac",
      "led2": "led2",  
      "led3": "led3"   
    };

    const device = deviceMap[topic];  // Get device name from topic
    const state = data.state; // Get state of the device

    // Check if the device is in the map and if the state is ON or OFF
    if (device && (state === "ON" || state === "OFF")) {
      saveDeviceHistory(device, state); // Save the device history if valid
    }
  }

  // Function to save device history when the device state changes
  function saveDeviceHistory(device, state) {
    const newHistory = new History({
      device,
      state,
      timestamp: new Date()
    });
    newHistory.save()
      .then(() => console.log(`History saved: ${device} - ${state} - ${new Date()}`))
      .catch(err => console.error('Error saving history:', err));
  }

});


const PORT = process.env.PORT || 3000; // Định nghĩa PORT ở đây
const server = app.listen(PORT, () => {
  console.log(`Máy chủ đang chạy trên cổng ${PORT}`); // Thông báo máy chủ đang chạy
});


// Điểm cuối để lấy tất cả dữ liệu cảm biến (có phân trang và lọc)
app.get('/sensor-data', async (req, res) => {
  const { 
    page = 1,             // Số trang mặc định là 1 nếu không được chỉ định
    limit = 10,           // Giới hạn số lượng kết quả trên mỗi trang, mặc định là 10
    temperature,          // Tham số nhiệt độ để lọc
    humidity,             // Tham số độ ẩm để lọc
    lighting,            // Tham số ánh sáng để lọc
    searchTime,
    sortTemperature,      // Tham số để sắp xếp theo nhiệt độ
    sortHumidity,         // Tham số để sắp xếp theo độ ẩm
    sortLighting,// Tham số để sắp xếp theo ánh sáng
    sortTimestamp,         // Tham số để sắp xếp theo thời gian
    startDate,
    endDate
    } = req.query;       
// console.log(req.query);
  const filter = {};      // Tạo đối tượng filter để chứa các điều kiện lọc
  const sortOptions = {}; // Tạo đối tượng sortOptions để chứa các tùy chọn sắp xếp

  // Điều kiện lọc theo các tham số nhiệt độ, độ ẩm, ánh sáng nếu chúng có giá trị
  if (temperature && !isNaN(parseFloat(temperature))) {
      filter.temperature = parseFloat(temperature); // Lọc theo nhiệt độ nếu có
  }
  if (humidity && !isNaN(parseFloat(humidity))) {
      filter.humidity = parseFloat(humidity);       // Lọc theo độ ẩm nếu có
  }
  // if (lighting && !isNaN(parseFloat(lighting))) {
  //     filter.lighting = parseFloat(lighting);       // Lọc theo ánh sáng nếu có
  // }
  if (lighting && !isNaN(parseInt(lighting)) && Number.isInteger(parseInt(lighting))) { // Kiểm tra và ép kiểu lighting thành số nguyên
    filter.lighting = parseInt(lighting);         // Lọc theo ánh sáng nếu có và đảm bảo là số nguyên
  }
  
  // Filter by date range (startDate to endDate)
  if (startDate || endDate) {
    // Ensure the filter includes both date range and regex if searchTime exists
    filter.timestamp = filter.timestamp || {}; // Use existing timestamp filter or initialize an empty object
    if (startDate) {
      filter.timestamp.$gte = new Date(startDate); // Filter from startDate
    }
    if (endDate) {
      filter.timestamp.$lte = new Date(endDate); // Filter until endDate
    }
  }
  

  // Tùy chọn sắp xếp theo các tham số nếu được cung cấp
  if (sortTemperature) {
      sortOptions.temperature = sortTemperature === 'desc' ? -1 : 1; // Sắp xếp nhiệt độ giảm dần hoặc tăng dần
  }
  if (sortHumidity) {
      sortOptions.humidity = sortHumidity === 'desc' ? -1 : 1;       // Sắp xếp độ ẩm giảm dần hoặc tăng dần
  }
  if (sortLighting) {
      sortOptions.lighting = sortLighting === 'desc' ? -1 : 1;       // Sắp xếp ánh sáng giảm dần hoặc tăng dần
  }
  if (sortTimestamp) {
      sortOptions.timestamp = sortTimestamp === 'desc' ? -1 : 1;     // Sắp xếp theo thời gian giảm dần hoặc tăng dần
  }

  console.log("filter te,hu,li:", filter);         // In ra điều kiện lọc để kiểm tra
  console.log("sortData:", sortOptions); // In ra tùy chọn sắp xếp để kiểm tra

  try {
      // Trang thai thiet bi
      const aggregation = [
        {
          $sort: { timestamp: -1 } // Sort by timestamp in descending order
        },
        {
          $group: {
            _id: "$device", // Group by device
            state: { $first: "$state" }, // Get the latest state
            timestamp: { $first: "$timestamp" } // Get the latest timestamp
          }
        }
      ];
  
      // Execute the aggregation query
      const historyData = await History.aggregate(aggregation);
      console.log("h");
      console.log(historyData);
     
      const historyResult = historyData.reduce((acc, item) => {
        acc[item._id] = item.state;
        return acc;
      }, {});
      
      // console.log(historyResult);
      // Tìm kiếm dữ liệu cảm biến theo điều kiện lọc và sắp xếp, phân trang
      let pipeline = [];


      if(searchTime){
        const reg = "" + searchTime.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&") + ""; // Escape special regex chars
        // console.log(reg);
        const tmp = {
          $match: {
            $expr: {
              $regexMatch: {
                input: { 
                  $dateToString: { format: "%m/%d/%Y, %H:%M:%S", date: "$timestamp", timezone: "Asia/Ho_Chi_Minh" } //%d/%m/%Y, %H:%M:%S
                }, // Convert to stringMM/dd/yyyy, h:mm:ss a
                regex: `^${reg}`,
                options: "i"
              }
            }
          },
        };
        pipeline.push(tmp);
      }


      pipeline.push({ $match : filter});
      pipeline.push({ $sort: sortOptions });
      // pipeline.push({ $skip: (page - 1) * limit });
      // pipeline.push({ $limit: parseInt(limit, 10) });
      const sensors = await SensorData.aggregate(pipeline);

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit, 10);
      const paginatedSensors = sensors.slice(startIndex, endIndex);
      
      // Calculate total number of documents
      const totalDocuments = sensors.length;
      const totalPages = Math.ceil(totalDocuments / limit); 
      console.log(JSON.stringify(pipeline, null, 2));
      
      
      console.log(paginatedSensors);
          
      res.json({
        status: historyResult,
        data: paginatedSensors,
        totalDocuments,
        totalPages: totalPages, // Tính số trang
        currentPage: page // Trang hiện tại
      });
  } catch (error) {
      console.error('Lỗi khi lấy dữ liệu cảm biến:', error); // In lỗi nếu có
      res.status(500).json({ message: 'Lỗi nội bộ' });       // Trả về lỗi cho client nếu có sự cố
  }
});


// Điểm cuối xử lý điều khiển thiết bị
app.post('/control', (req, res) => {
  const { device, action } = req.body;

  const validDevices = ['led1', 'fan', 'ac','led2','led3']; // Ensure valid device names
  if (!validDevices.includes(device)) {
    return res.status(400).json({ message: 'Thiết bị không hợp lệ' });
  }

  if (!['ON', 'OFF'].includes(action)) {
    return res.status(400).json({ message: 'Hành động không hợp lệ' });
  }

  if (!mqttClient.connected) {
    return res.status(500).json({ message: 'MQTT broker không kết nối' });
  }

  // Publish the action to the specified device topic
  mqttClient.publish(`home/${device}`, action, { qos: 1 }, (err) => {
    if (err) {
      console.error('Lỗi khi gửi tin nhắn MQTT:', err);
      return res.status(500).json({ message: 'Lỗi khi gửi tin nhắn' });
    }

    // Send initial response to indicate request has been sent
    res.json({ message: `Đã gửi yêu cầu ${action} cho ${device}. Chờ xác nhận...` });
  });
});


// Điểm cuối để lấy dữ liệu lịch sử thiết bị (có phân trang, lọc và sắp xếp)
app.get('/history', async (req, res) => {
  const { 
    page = 1,             // Số trang mặc định là 1
    limit = 10,           // Giới hạn số lượng kết quả trên mỗi trang, mặc định là 10
    device,               // Tham số thiết bị để lọc
    state,               // Tham số hành động để lọc
    searchTime,
    startDate,            // Thời gian bắt đầu
    endDate,              // Thời gian kết thúc
    sortTimestamp         // Tham số để sắp xếp theo thời gian
  } = req.query;

  const filter = {};      // Tạo đối tượng filter để chứa các điều kiện lọc
  const sortOptions = {}; // Tạo đối tượng sortOptions để chứa các tùy chọn sắp xếp

  // Điều kiện lọc theo thiết bị nếu có
  if (device) {
    filter.device = device;
  }

  // Điều kiện lọc theo hành động nếu có
  if (state) {
    filter.state = state;
  }

  // Điều kiện lọc theo khoảng thời gian (từ startDate đến endDate)
  if (startDate || endDate) { 
    filter.time = {}; // Tạo điều kiện lọc cho trường thời gian
    if (startDate) {
      filter.time.$gte = new Date(startDate); // Lọc từ ngày bắt đầu (>= startDate)
    }
    if (endDate) {
      filter.time.$lte = new Date(endDate);   // Lọc đến ngày kết thúc (<= endDate)
    }
  }

  // Tùy chọn sắp xếp theo thời gian nếu có

  if (sortTimestamp) {
    console.log("stt " + typeof sortTimestamp);
    console.log("stt " + sortTimestamp);
      sortOptions.timestamp = sortTimestamp === 'desc' ? -1 : 1;     // Sắp xếp theo thời gian giảm dần hoặc tăng dần
  }

  try {
      // // Tính tổng số tài liệu (lịch sử) phù hợp với điều kiện lọc
      // const totalDocuments = await History.countDocuments(filter);
      // const totalPages = Math.ceil(totalDocuments / limit); // Tính số trang

      // // Tìm kiếm dữ liệu lịch sử theo điều kiện lọc và sắp xếp, phân trang
      // const histories = await History.find(filter)
      //     .sort(sortOptions)               // Áp dụng tùy chọn sắp xếp
      //     .skip((page - 1) * limit)        // Bỏ qua các tài liệu để phân trang
      //     .limit(parseInt(limit));         // Giới hạn số lượng tài liệu trên mỗi trang
      let pipeline = [];


      if(searchTime){
        const reg = "" + searchTime.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&") + ""; // Escape special regex chars
        // console.log(reg);
        const tmp = {
          $match: {
            $expr: {
              $regexMatch: {
                input: { 
                  $dateToString: { format: "%m/%d/%Y, %H:%M:%S", date: "$timestamp", timezone: "Asia/Ho_Chi_Minh" } //%d/%m/%Y, %H:%M:%S
                }, // Convert to stringMM/dd/yyyy, h:mm:ss a
                regex: `^${reg}`,
                options: "i"
              }
            }
          },
        };
        pipeline.push(tmp);
      }


      pipeline.push({ $match : filter});
      pipeline.push({ $sort: sortOptions });
      // pipeline.push({ $skip: (page - 1) * limit });
      // pipeline.push({ $limit: parseInt(limit, 10) });
      const historyData = await History.aggregate(pipeline);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit, 10);
      const paginatedHistorys = historyData.slice(startIndex, endIndex);
      
      // Calculate total number of documents
      const totalDocuments = historyData.length;
      const totalPages = Math.ceil(totalDocuments / limit); 
      
      res.json({
        data: paginatedHistorys,
        totalDocuments: totalDocuments,
        totalPages: totalPages, // Tính số trang
        currentPage: page // Trang hiện tại
      });
  } catch (error) {
      console.error('Lỗi khi lấy dữ liệu lịch sử:', error); // In lỗi nếu có
      res.status(500).json({ message: 'Lỗi nội bộ' });       // Trả về lỗi cho client nếu có sự cố
  }
});






