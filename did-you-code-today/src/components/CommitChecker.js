import React, { useState } from 'react';

const CommitChecker = ({ onCheck, loading }) => {
  const [username, setUsername] = useState("");

  const handleSubmit = () => {
    onCheck(username);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
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
        onClick={handleSubmit} 
        className="check-button"
        disabled={loading}
      >
        {loading ? "Checking..." : "Check My Activity"}
      </button>
    </>
  );
};

export default CommitChecker;
