import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import './History.css';

const History = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    device: '',
    state: '',
  });
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  // Fetch history data from backend with pagination, filtering, and sorting
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { device, state } = filters;
      const { key, direction } = sortConfig;
      const response = await axios.get('http://localhost:3000/history?sortTimestamp=desc', {
        params: {
          page: currentPage,
          limit: 10, // Limit per page
          device,
          state,
          sortKey: key,
          sortDirection: direction,
        },
      });

      setHistoryData(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching history data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage, filters, sortConfig]);

  // Handle page change for ReactPaginate
  const handlePageClick = (data) => {
    setCurrentPage(data.selected +1);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="container">
      {/* Filter Section */}
      <div className="filters">
        <label>
          Device:
          <select
            name="device"
            value={filters.device}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả</option>
            <option value="ac">ac</option>
            <option value="led1">led</option>
            <option value="fan">fan</option>
            <option value="led2">led2</option>
            <option value="led3">led3</option>
          </select>
        </label>
        <label>
          Action:
          <select
            name="state"
            value={filters.state}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả</option>
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <table >
            <thead>
              <tr>
                <th className='no-sort'>ID</th>
                <th onClick={() => handleSort('device')}>Device</th>
                <th onClick={() => handleSort('state')}>Action</th>
                <th onClick={() => handleSort('timestamp')}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {historyData.map((item, index) => (
                
                <tr key={item._id}>
                  <td>{(currentPage - 1) * 10 + index + 1}</td>
                  <td>{item.device}</td>
                  <td>{item.state}</td>
                  <td>{new Date(item.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
};

export default History;
