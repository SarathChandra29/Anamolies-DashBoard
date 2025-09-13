import React, { useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const anomalyTrend = result
    ? result.anomalies.map((a) => ({
        date: new Date(a["Transaction Date"]).toLocaleDateString(),
        amount: a["Total Spent"],
      }))
    : [];

  const anomalyByCategory = result
    ? result.anomalies.reduce((acc, a) => {
        acc[a.Category] = (acc[a.Category] || 0) + a["Total Spent"];
        return acc;
      }, {})
    : {};

  const pieData = Object.entries(anomalyByCategory).map(([key, value]) => ({
    name: key,
    value,
  }));

  const COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#9C27B0", "#4CAF50"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          📊 PulseGuard Dashboard
        </h1>

        {/* Upload Section */}
        <div className="flex flex-col items-center gap-4 mb-12 p-6 rounded-2xl bg-white/5 backdrop-blur-lg shadow-lg border border-white/10">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="p-2 bg-gray-700 border border-gray-500 rounded-lg cursor-pointer text-sm"
          />
          <button
            onClick={handleUpload}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition rounded-xl shadow-lg font-semibold"
          >
            Upload & Analyze
          </button>
        </div>

        {result && (
          <div className="space-y-12">
            {/* Results Summary */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg shadow-lg border border-white/10">
              <h2 className="text-2xl font-semibold mb-4">📌 Results</h2>
              <p className="text-lg">Total Transactions: <span className="font-bold">{result.total}</span></p>
              <p className="text-lg text-red-400">
                Anomalies Found: <span className="font-bold">{result.anomalies_found}</span>
              </p>
            </div>

            {/* Line Chart */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg shadow-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-4">📈 Anomaly Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={anomalyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="date" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: "#111", borderRadius: "10px" }} />
                  <Line type="monotone" dataKey="amount" stroke="#FF5733" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg shadow-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-4">📊 Anomaly Breakdown by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#111", borderRadius: "10px" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Table */}
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg shadow-lg border border-white/10">
              <h3 className="text-xl font-semibold mb-4">⚠️ Anomaly Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.anomalies.slice(0, 20).map((a, idx) => (
                      <tr
                        key={idx}
                        className="odd:bg-gray-900 even:bg-gray-800 hover:bg-gray-700 transition text-center"
                      >
                        <td className="px-4 py-2">
                          {new Date(a["Transaction Date"]).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{a.Category}</td>
                        <td className="px-4 py-2 text-red-400 font-bold">
                          ₹{a["Total Spent"]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm mt-2 text-gray-400">
                Showing top 20 anomalies for preview...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
