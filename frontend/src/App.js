import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

function App() {
    const [data, setData] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [darkMode, setDarkMode] = useState(false);

    // Fetch backend data on load
    useEffect(() => {
        axios.get('https://ai-data-dashboard-backend-2.onrender.com/data')
            .then(res => setData(res.data))
            .catch(err => console.error('Error fetching data:', err));
    }, []);

    // File upload handlers
    const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

    const handleUpload = () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('file', selectedFile);

        axios.post('https://ai-data-dashboard-backend-2.onrender.com/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
            .then(res => setData(res.data))
            .catch(err => console.error('Upload error:', err));
    };

    // Filter and search
    const filteredData = data.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchText.toLowerCase())
        )
    );

    // Sorting
    const sortedData = [...filteredData];
    if (sortConfig.key) {
        sortedData.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    // Summary cards
    const totalRows = data.length;
    const valueKey = data[0] ? Object.keys(data[0])[1] : null;
    const totalValue = valueKey ? data.reduce((sum, row) => sum + Number(row[valueKey]), 0) : 0;

    return (
        <div className={darkMode ? 'dark bg-gray-900 text-white min-h-screen' : 'bg-white text-gray-900 min-h-screen'}>
            <div className="container mx-auto p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">AI Data Dashboard</h1>
                    <button
                        className="px-4 py-2 bg-gray-700 text-white rounded"
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>

                {/* File Upload + CSV Export + Search */}
                <div className="mb-4 flex flex-wrap gap-2">
                    <input type="file" accept=".csv" onChange={handleFileChange} />
                    <button onClick={handleUpload} className="px-4 py-2 bg-blue-500 text-white rounded">
                        Upload
                    </button>
                    <CSVLink data={data} filename={"export.csv"} className="px-4 py-2 bg-green-500 text-white rounded">
                        Export CSV
                    </CSVLink>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="px-2 py-1 border rounded ml-2"
                    />
                </div>

                {/* Summary Cards */}
                <div className="flex gap-4 mb-4">
                    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="font-bold">Total Rows</h2>
                        <p>{totalRows}</p>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded shadow">
                        <h2 className="font-bold">Total {valueKey}</h2>
                        <p>{totalValue}</p>
                    </div>
                </div>

                {/* Data Table */}
                <table className="min-w-full border mb-6">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                            {data[0] && Object.keys(data[0]).map((key) => (
                                <th
                                    key={key}
                                    className="border px-4 py-2 cursor-pointer"
                                    onClick={() => requestSort(key)}
                                >
                                    {key} {sortConfig.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                {Object.values(row).map((value, i) => (
                                    <td key={i} className="border px-4 py-2">{value}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Bar Chart */}
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={sortedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={Object.keys(data[0] || {})[0]} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey={Object.keys(data[0] || {})[1]} fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default App;