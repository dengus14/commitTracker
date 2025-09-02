import React, { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Arial" }}>
      <h1>Did You Code Today?</h1>
      <input
        type="text"
        placeholder="Enter GitHub username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: "10px", margin: "10px" }}
      />
      <button onClick={checkCommits} style={{ padding: "10px 20px" }}>
        Check
      </button>
      <div style={{ marginTop: "20px", fontSize: "18px" }}>
        {loading ? "Loading..." : status}
      </div>
    </div>
  );
}

export default App;
