import React, { useState } from "react";
import "./index.css";

function App() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const getStatusClass = () => {
    if (loading) return "loading";
    if (status.includes("✅")) return "status-success";
    if (status.includes("❌")) return "status-error";
    if (status.includes("⚠️")) return "status-warning";
    return "";
  };

  const checkCommits = async () => {
    if (!username) {
      setStatus("⚠️ Please enter a GitHub username.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/events/public`
      );
      const events = await response.json();

      if (!Array.isArray(events)) {
        setStatus("❌ Could not fetch events. Try again later.");
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const hasCommitToday = events.some(
        (event) =>
          event.type === "PushEvent" &&
          event.created_at.startsWith(today)
      );

      if (hasCommitToday) {
        setStatus("✅ You coded today! Great job 🚀");
      } else {
        setStatus("❌ No commits yet today. Time to code! 💻");
      }
    } catch (error) {
      setStatus("❌ Error fetching data.");
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkCommits();
    }
  };

  return (
    <div className="app-container">
      <div className="main-card">
        <h1 className="title">Did You Code Today?</h1>
        <p className="subtitle">
          Track your daily coding activity on GitHub
        </p>
        
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="username-input"
            disabled={loading}
          />
        </div>
        
        <button 
          onClick={checkCommits} 
          className="check-button"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check My Activity"}
        </button>
        
        {(status || loading) && (
          <div className={`status-container ${getStatusClass()}`}>
            {loading ? "🔍 Checking your GitHub activity..." : status}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
