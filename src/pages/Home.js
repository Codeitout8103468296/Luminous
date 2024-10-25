import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const Home = () => {
  const navigate = useNavigate();
  const [rates, setRates] = useState([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [latestRate, setLatestRate] = useState(null);
  const [timeAmount, setTimeAmount] = useState(1);
  const [timeUnit, setTimeUnit] = useState('hours');
  const chartRef = useRef(null);
  const email = sessionStorage.getItem('email');

  const updateChartData = (updatedRates) => {
    const chart = chartRef.current;
    if (chart) {
      chart.data.labels = updatedRates.map((entry) => new Date(entry.timestamp).toLocaleTimeString());
      chart.data.datasets[0].data = updatedRates.map((entry) => entry.rate);
      chart.update('none');
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`http://localhost:3001/historicaldata?amount=${timeAmount}&unit=${timeUnit}&email=${email}`);
      const data = await response.json();
      const filteredData = data.slice(-50); // Keep only the last 50 entries
      setRates(filteredData);
      updateChartData(filteredData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const fetchTotalSavings = async () => {
    try {
      const response = await fetch(`http://localhost:3001/totalsavings?amount=${timeAmount}&unit=${timeUnit}&email=${email}`);
      const data = await response.json();
      setTotalSavings(data.totalSavings);
    } catch (error) {
      console.error('Error fetching total savings:', error);
    }
  };

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    const socket = io('http://localhost:3001');
    socket.emit('set_user_email', email);

    fetchHistoricalData();
    fetchTotalSavings();

    socket.on('new_rate', (newRate) => {
      setRates((prevRates) => {
        const updatedRates = [...prevRates, newRate].slice(-50);
        updateChartData(updatedRates);
        return updatedRates;
      });
      setLatestRate(newRate.rate);
    });

    socket.on('update_total_savings', ({ totalSavings }) => setTotalSavings(totalSavings));

    return () => socket.disconnect();
  }, [timeAmount, timeUnit, email, navigate]);

  const currentStatus = latestRate > 50 ? 'Solar' : 'Normal';

  const chartData = {
    labels: rates.map((entry) => new Date(entry.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Electricity Rate',
        data: rates.map((entry) => entry.rate),
        fill: false,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <div className="home-page min-h-screen flex flex-col items-center gap-4 bg-gradient-to-br from-[#00BFB3] to-[#008B8B] p-4">
      <div className='w-full bg-white shadow-lg p-4 md:p-8 rounded-2xl'>
        <div className='flex justify-between items-center text-4xl font-semibold'>
          <span>Electricity Rates</span>
          <button
            onClick={() => {
              sessionStorage.removeItem('email');
              navigate('/login');
            }}
            className="bg-red-500 text-white text-lg px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Log Out
          </button>
        </div>
        <div className="w-full mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="chart-section h-[20rem] md:h-[40rem]">
            <Line data={chartData} options={{ maintainAspectRatio: false }} ref={chartRef} />
          </div>
          <div className="info-section grid grid-cols-1 gap-4">
            {/* Latest Rate */}
            <div className="bg-white shadow-md rounded-lg p-4 md:p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-600">Latest Rate</h2>
              <p className={`text-2xl md:text-3xl font-bold ${latestRate > 50 ? 'text-blue-500' : 'text-gray-600'}`}>
                {latestRate ? `${latestRate} USD` : 'Loading...'}
              </p>
            </div>

            {/* Current Mode */}
            <div className="bg-white shadow-md rounded-lg p-4 md:p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-600">Current Mode</h2>
              <p className={`text-2xl md:text-3xl font-bold ${currentStatus === 'Solar' ? 'text-green-500' : 'text-red-500'}`}>
                {currentStatus}
              </p>
              <p className="text-sm text-gray-500">
                {currentStatus === 'Solar' ? 'Solar energy usage mode' : 'Normal energy usage mode'}
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="bg-white shadow-md rounded-lg p-4 md:p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-600">Select Time Range for Savings</h2>
              <div className="flex justify-center items-center mt-4 space-x-2">
                <input
                  type="number"
                  value={timeAmount}
                  onChange={(e) => setTimeAmount(Number(e.target.value))}
                  className="border p-2 rounded w-16 text-center"
                />
                <select
                  value={timeUnit}
                  onChange={(e) => setTimeUnit(e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>

            {/* Total Savings */}
            <div className="bg-white shadow-md rounded-lg p-4 md:p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-600">Total Savings</h2>
              <p className="text-2xl md:text-3xl font-bold text-green-500">${totalSavings}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
