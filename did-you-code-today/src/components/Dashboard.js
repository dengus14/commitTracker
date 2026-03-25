import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCommitData } from "../hooks/useCommitData";
import { useStreakData } from "../hooks/useStreakDataPersisted";
import UserProfile from "./UserProfile";
import StatusMessage from "./StatusMessage";
import CommitStats from "./CommitStats";
import ActivityFeed from "./ActivityFeed";

const Dashboard = () => {
  const { user } = useAuth();
  const { loading, status, commitStats, checkCommits } = useCommitData();
  const { streakData, calculateStreak } = useStreakData();

  useEffect(() => {
    if (user && user.username) {
      checkCommits(user.username);
      calculateStreak(user.username);
    }
  }, [user, checkCommits, calculateStreak]);

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
        <h2 className="dashboard-title">{getCustomMessage()}</h2>

        <CommitStats
          commitStats={commitStats}
          loading={loading}
          currentStreak={streakData?.currentStreak}
        />

        {!loading && (
          <button
            onClick={() => checkCommits(user.username)}
            className="refresh-button"
            disabled={loading}
          >
            Refresh Activity
          </button>
        )}

        <ActivityFeed events={commitStats?.events} />
      </div>
    </div>
  );
};

export default Dashboard;
