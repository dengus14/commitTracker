import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCommitData } from "../hooks/useCommitData";
import UserProfile from "./UserProfile";
import StatusMessage from "./StatusMessage";
import CommitStats from "./CommitStats";

const Dashboard = () => {
  const { user } = useAuth();
  const { loading, status, commitStats, checkCommits } = useCommitData();

  // Automatically check commits when user is authenticated
  useEffect(() => {
    if (user && user.username) {
      checkCommits(user.username);
    }
  }, [user, checkCommits]);

  return (
    <div className="dashboard">
      <UserProfile />
      
      <div className="dashboard-content">
        <h2 className="dashboard-title">
          Did <strong>YOU</strong> code today, {user?.displayName || user?.username}?
        </h2>
        
        {loading && (
          <div className="loading-message">
            🔍 Checking your GitHub activity...
          </div>
        )}
        
        <StatusMessage status={status} loading={loading} />
        
        <CommitStats commitStats={commitStats} loading={loading} />
        
        {!loading && (
          <button 
            onClick={() => checkCommits(user.username)}
            className="refresh-button"
            disabled={loading}
          >
            🔄 Refresh Activity
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
