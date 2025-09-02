import React from "react";
import { useAuth } from "../context/AuthContext";

const GitHubAuth = () => {
  const { login } = useAuth();

  return (
    <div className="auth-section">
      <p className="auth-text">
        Want to automatically track your commits? Login with GitHub!
      </p>
      <button 
        className="github-login-button"
        onClick={login}
      >
        <span className="github-icon">📦</span>
        Login with GitHub
      </button>
    </div>
  );
};

export default GitHubAuth;
