import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './DataSensors.css';

const SensorData = () => {
  const [sensorData, setSensorData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    temperature: '',
    humidity: '',
    lighting: '',
    startDate: '',
    endDate: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  const fetchData = async () => {
    try {
      const { temperature, humidity, lighting, startDate, endDate } = filters;
      const { key, direction } = sortConfig;

      const sortParams = {
        temperature: 'sortTemperature',
        humidity: 'sortHumidity',
        lighting: 'sortLighting',
        timestamp: 'sortTimestamp',
      };

      const sortQueryParam = sortParams[key];

      const response = await axios.get('http://localhost:3000/sensor-data', {
        params: {
          page: currentPage,
          limit: 10,
          temperature,
          humidity,
          lighting,
          startDate,
          endDate,
          [sortQueryParam]: direction,
        },
      });

      setSensorData(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching sensor data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, filters, sortConfig]);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected + 1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // const handleSort = (key) => {
  //   setSortConfig((prevConfig) => ({
  //     key,
  //     direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
  //   }));
  // };

  // const renderSortArrow = (key) => {
  //   if (sortConfig.key === key) {
  //     return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  //   }
  //   return '';
  // };
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  const getSortClass = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc';
    }
    return '';
  };
  

  return (
    <div>
      {/* <div className='filter'>
        <label>Temperature:</label>
        <input
          type="number"
          name="temperature"
          value={filters.temperature}
          onChange={handleFilterChange}
        />
        <label>Humidity:</label>
        <input
          type="number"
          name="humidity"
          value={filters.humidity}
          onChange={handleFilterChange}
        />
        <label>Lighting:</label>
        <input
          type="number"
          name="lighting"
          value={filters.lighting}
          onChange={handleFilterChange}
        />
        <br></br>
        <label>Start Date:</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <label>End Date:</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
      </div> */}
      <div className="filter">
      {/* Hàng 1: Temperature, Humidity, Lighting */}
      <div className="filter-row">
        <div className="filter-group">
          <label>Temperature:</label>
          <input
            type="number"
            name="temperature"
            value={filters.temperature}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Humidity:</label>
          <input
            type="number"
            name="humidity"
            value={filters.humidity}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>Light:</label>
          <input
            type="number"
            name="lighting"
            value={filters.lighting}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Hàng 2: Start Date, End Date */}
      <div className="filter-row">
        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
      </div>
    </div>

      {sensorData.length === 0 ? (
        <p>No data to display.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="no-sort">ID</th>
              <th className={getSortClass('temperature')} onClick={() => handleSort('temperature')}>Temperature</th>
              <th className={getSortClass('humidity')} onClick={() => handleSort('humidity')}>Humidity</th>
              <th className={getSortClass('lighting')} onClick={() => handleSort('lighting')}>Light</th>
              <th >Wind</th>
              <th className={getSortClass('timestamp')} onClick={() => handleSort('timestamp')}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {sensorData.map((sensor, index) => (
              <tr key={sensor._id}>
                <td>{index + 1 + (currentPage - 1) * 10}</td>
                <td>{sensor.temperature}</td>
                <td>{sensor.humidity}</td>
                <td>{sensor.lighting}</td>
                <td>{sensor.newS}</td>
                <td>{new Date(sensor.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <ReactPaginate
          previousLabel={'Previous'}
          nextLabel={'Next'}
          breakLabel={'...'}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={'pagination'}
          activeClassName={'active'}
        />
      )}
    </div>
  );
};

export default SensorData;
