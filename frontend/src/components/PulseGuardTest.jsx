import { useState } from "react";
import axios from "axios";

export default function PulseGuardTest() {
  const [response, setResponse] = useState(null);

  const sendTest = async () => {
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", {
        amount: 250,
        category: "Groceries",
      });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setResponse({ error: "Failed to connect to backend ❌" });
    }
  };

  const getAnomalies = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:5000/anomalies");
      setResponse(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={sendTest}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Send Test Transaction
      </button>

      <button
        onClick={getAnomalies}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Get Recent Anomalies
      </button>

      {response && (
        <pre className="bg-gray-900 text-green-400 p-4 rounded">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
