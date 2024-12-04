import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import './Dashboard2.css';

const Db2 = () => {
  const [sensorData, setSensorData] = useState([]);
  const [newS, setNewS] = useState(0);
  const [isLight2On, setIsLight2On] = useState(false);
  const [isLight3On, setIsLight3On] = useState(false);


  const fetchData = async () => {
    
    try {
      const response = await axios.get('http://localhost:3000/sensor-data?page=1&limit=100&sortTimestamp=desc');
      console.log(response);
      const data = response.data.data ;
      //get trang thai
      setSensorData(data);
      // const ledState = response.data.ledState
      // Cập nhật state với dữ liệu mới nhất
      if (data.length > 0) {
        const latestData = data[0]; // Lấy dữ liệu mới nhất
        console.log(latestData);
        setNewS(latestData.newS || 1);
        console.log(newS);
        // 
        setNewS(latestData.newS || 10);
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
  const chartData = sensorData.length > 0 ? sensorData.map(data => data.newS || 0).reverse()  : [];
  

  // Environment thresholds
  const getWindyClass = () => 
    (newS < 10 || newS > 90 ? 'alert' : 'normal');
  const handleControl = async (device, action) => {
    console.log(`Controlling device: ${device}, Action: ${action}`);
    try {
      const response = await axios.post('http://localhost:3000/control', {
        device,
        action,
      });
  
      // Only update state if the request was successful
      if (response.status === 200) {
        if (device === 'led2') {
          setIsLight2On(action === 'ON');
        } else if (device === 'led3') {
          setIsLight3On(action === 'ON');
        } 
      }
    } catch (error) {
      console.error('Error controlling device:', error);
    }
  };
  

  return (
    <div className="dashboard2">
      <div className="row stats">
        <div className={`col stat-box ${getWindyClass()}`}>
          <h3><i className="fa fa-sun" aria-hidden="true" style={{ marginRight: '10px' }}></i> Cảm biến gió</h3>
          <p style={{ fontSize: '25px' }}>{newS.toFixed(0)} m/s</p>
        </div>
        <div className="col" style={{ flex: '1', marginLeft: 'auto', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ marginBottom: '15px', textAlign: 'center' }}>Device Control</h3>
          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4 style={{ margin: '0', flex: '1' }}>Led2</h4>
              <i className="fa fa-lightbulb" aria-hidden="true" style={{ margin: '0 30px', fontSize: '30px' }}></i>
              <button 
                onClick={() => handleControl('led2', isLight2On ? 'OFF' : 'ON')} 
                style={{ 
                  padding: '8px 12px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  backgroundColor: isLight2On ? '#4CAF50' : '#f44336', // Green for ON, Red for OFF
                  color: 'white', 
                  cursor: 'pointer' 
                }}
              >
                {isLight2On ? 'ON' : 'OFF'}
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4 style={{ margin: '0', flex: '1' }}>Led3</h4>
              <i className="fa fa-fan" aria-hidden="true" style={{ margin: '0 30px', fontSize: '30px' }}></i>
              <button 
                onClick={() => handleControl('led3', isLight3On ? 'OFF' : 'ON')} 
                style={{ 
                  padding: '8px 12px', 
                  border: 'none', 
                  borderRadius: '5px', 
                  backgroundColor: isLight3On ? '#4CAF50' : '#f44336', // Green for ON, Red for OFF
                  color: 'white', 
                  cursor: 'pointer' 
                }}
              >
                {isLight3On ? 'ON' : 'OFF'}
              </button>
            </div>
            
          </div>
        </div>
      </div>
      {/* style={{ flex: '1', marginLeft: 'auto', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' } */}
      <div className="row " style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',backgroundColor: '#f9f9f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <div className="col" style={{ flex: '2', marginRight: '10px' }}>
          <Chart
            options={{
              chart: { id: 'Wind-chart' },
              xaxis: { categories: chartCategories },
              title: { text: 'Gió' },
              colors: ['#FFD700'], 
            }}
            series={[{ name: 'Gió', data: chartData }]}
            type="line"
            height={350}
          />
        </div>
        
      </div>
    </div>
  );
};

export default Db2;
