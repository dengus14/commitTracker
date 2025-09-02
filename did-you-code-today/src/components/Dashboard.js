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

  // Custom message based on commit count
  const getCustomMessage = () => {
    if (loading) return "Checking your activity...";
    
    if (commitStats && commitStats.todayCount > 0) {
      return `Hey, you have made ${commitStats.todayCount} commit${commitStats.todayCount > 1 ? 's' : ''} today, keep it going`;
    } else if (commitStats) {
      return "Looks like someone is taking a break, huh?";
    }
    return "";
  };

  return (
    <div className="dashboard">
      <UserProfile />
      
      <div className="dashboard-content">
        <h2 className="dashboard-title">
          {getCustomMessage()}
        </h2>
        
        <CommitStats commitStats={commitStats} loading={loading} />
        
        {!loading && (
          <button 
            onClick={() => checkCommits(user.username)}
            className="refresh-button"
            disabled={loading}
          >
            Refresh Activity
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
