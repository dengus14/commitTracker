import React from 'react';

const GitHubAuth = () => {
  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:5001/auth/github';
  };

  return (
    <div className="auth-section">
      <p className="auth-text">
        Want to automatically track your commits? Login with GitHub!
      </p>
      <button 
        className="github-login-button"
        onClick={handleGitHubLogin}
      >
        Login with GitHub
      </button>
    </div>
  );
};

export default GitHubAuth;
