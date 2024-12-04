import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import './Dashboard.css';

const Dashboard = () => {
  const [sensorData, setSensorData] = useState([]);
  const [temperature, setTemperature] = useState(10);
  const [humidity, setHumidity] = useState(0);
  const [lighting, setLighting] = useState(0);
  const [isLightOn, setIsLightOn] = useState(false);
  const [isFanOn, setIsFanOn] = useState(false);
  const [isACOn, setIsACOn] = useState(false);


  const fetchData = async () => {
    
    try {
      const response = await axios.get('http://localhost:3000/sensor-data?page=1&limit=10&sortTimestamp=desc');
      // console.log(response);
      const data = response.data.data ;
      console.log(response.data.status);
      const deviceStatus = response.data.status;
      setIsACOn(deviceStatus.ac === 'ON');
      setIsACOn(deviceStatus.fan === 'ON');
      setIsACOn(deviceStatus.led1 === 'ON');
      setIsACOn(deviceStatus.led2 === 'ON');
      setIsACOn(deviceStatus.led3 === 'ON');
      //get trang thai
      setSensorData(data);
      // const ledState = response.data.ledState
      // Cập nhật state với dữ liệu mới nhất
      if (data.length > 0) {
        const latestData = data[0]; // Lấy dữ liệu mới nhất
        // console.log(latestData);
        setTemperature(latestData.temperature || 1);
        // console.log(temperature);
        // 
        setHumidity(latestData.humidity || 10);
        setLighting(latestData.lighting || 10);
      }else{
        console.log("fet");

      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };  
  
  useEffect(() => {
    const intervalId = setInterval(fetchData, 2000); // 2000 ms = 2 seconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to set up interval only once on mount


  const chartCategories = sensorData.length > 0 ? sensorData.map(data => data.timestamp) : [];
  const chartTemperatureData = sensorData.length > 0 ? sensorData.map(data => data.temperature || 0) : [];
  const chartHumidityData = sensorData.length > 0 ? sensorData.map(data => data.humidity || 0) : [];
  const chartLightingData = sensorData.length > 0 ? sensorData.map(data => data.lighting || 0) : [];

  // Environment thresholds
  const getTemperatureClass = () => 
    (temperature < 25 || temperature > 28 ? 'alert' : 'normal');
  
  const getHumidityClass = () => 
    (humidity < 55 || humidity > 65 ? 'alert' : 'normal');
  
  const getLightingClass = () => 
    (lighting < 100 || lighting > 500 ? 'alert' : 'normal');

  const handleControl = async (device, action) => {
    console.log(`Controlling device: ${device}, Action: ${action}`);
    try {
      const response = await axios.post('http://localhost:3000/control', {
        device,
        action,
      });
  
      // Only update state if the request was successful
      // if (response.status === 200) {
      //   if (device === 'led1') {
      //     setIsLightOn(action === 'ON');
      //   } else if (device === 'fan') {
      //     setIsFanOn(action === 'ON');
      //   } else if (device === 'ac') {
      //     setIsACOn(action === 'ON');
      //   }
      // }
    } catch (error) {
      console.error('Error controlling device:', error);
    }
  };
  

  return (
    <div className="dashboard">
      <div className="row stats">
        <div className={`col stat-box ${getTemperatureClass()}`}>
          <h3><i className="fa fa-thermometer-half" aria-hidden="true" style={{ marginRight: '10px' }}></i> Temperature</h3>
          <p style={{ fontSize: '25px' }}>{temperature} °C</p>
          <br></br>

        </div>
        <div className={`col stat-box ${getHumidityClass()}`}>
          <h3><i className="fa fa-tint" aria-hidden="true" style={{ marginRight: '10px' }}></i> Humidity</h3>
          <p style={{ fontSize: '25px' }}>{humidity} %</p>
        </div>
        <div className={`col stat-box ${getLightingClass()}`}>
          <h3><i className="fa fa-sun" aria-hidden="true" style={{ marginRight: '10px' }}></i> Light</h3>
          <p style={{ fontSize: '25px' }}>{lighting.toFixed(0)} lx</p>
        </div>
      </div>
      <div className="row" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div className="col" style={{ flex: '2', marginRight: '10px' }}>
          <Chart
            options={{
              chart: { id: 'temperature-humidity-chart' },
              xaxis: { categories: chartCategories },
              title: { text: 'Temperature and Humidity' },
              colors: ['#FFB3B3', '#1E90FF'], // Light red for temperature, blue for humidity
            }}
            series={[
              { name: 'Temperature', data: chartTemperatureData },
              { name: 'Humidity', data: chartHumidityData },
            ]}
            type="line"
            height={350}
          />
        </div>
        <div className="col" style={{ flex: '2', marginRight: '10px' }}>
          <Chart
            options={{
              chart: { id: 'lighting-chart' },
              xaxis: { categories: chartCategories },
              title: { text: 'Light' },
              colors: ['#FFD700'], // Yellow for lighting
            }}
            series={[{ name: 'Light', data: chartLightingData }]}
            type="line"
            height={350}
          />
        </div>
        <div className="col" style={{ flex: '1', marginLeft: 'auto', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Device Control</h3>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4 style={{ margin: '0', flex: '1' }}>Light</h4>
              <i className="fa fa-lightbulb" aria-hidden="true" style={{ margin: '0 30px', fontSize: '30px' }}></i>
              <button 
                onClick={() => handleControl('led1', isLightOn ? 'OFF' : 'ON')} 
                style={{ 
                  padding: '8px 12px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  backgroundColor: isLightOn ? '#4CAF50' : '#f44336', // Green for ON, Red for OFF
                  color: 'white', 
                  cursor: 'pointer' 
                }}
              >
                {isLightOn ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4 style={{ margin: '0', flex: '1' }}>Fan</h4>
              <i className="fa fa-fan" aria-hidden="true" style={{ margin: '0 30px', fontSize: '30px' }}></i>
              <button 
                onClick={() => handleControl('fan', isFanOn ? 'OFF' : 'ON')} 
                style={{ 
                  padding: '8px 12px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  backgroundColor: isFanOn ? '#4CAF50' : '#f44336', // Green for ON, Red for OFF
                  color: 'white', 
                  cursor: 'pointer' 
                }}
              >
                {isFanOn ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4 style={{ margin: '0', flex: '1' }}>AC</h4>
              <i className="fa fa-snowflake" aria-hidden="true" style={{ margin: '0 30px', fontSize: '30px' }}></i>
              <button 
                onClick={() => handleControl('ac', isACOn ? 'OFF' : 'ON')} 
                style={{ 
                  padding: '8px 12px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  backgroundColor: isACOn ? '#4CAF50' : '#f44336', // Green for ON, Red for OFF
                  color: 'white', 
                  cursor: 'pointer' 
                }}
              >
                {isACOn ? 'ON' : 'OFF'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
