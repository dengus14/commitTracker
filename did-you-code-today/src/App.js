import React from "react";
import "./index.css";
import GitHubAuth from "./components/GitHubAuth";
import CommitChecker from "./components/CommitChecker";
import StatusMessage from "./components/StatusMessage";
import CommitStats from "./components/CommitStats";
import Divider from "./components/Divider";
import { useCommitData } from "./hooks/useCommitData";

function App() {
  const { loading, status, commitStats, checkCommits } = useCommitData();

  return (
    <div className="app-container">
      <div className="main-card">
        <h1 className="title">Did You Code Today?</h1>
        <p className="subtitle">
          Track your daily coding activity on GitHub
        </p>
        <GitHubAuth />
        <Divider text="or check manually" />
        <CommitChecker onCheck={checkCommits} loading={loading} />
        <StatusMessage status={status} loading={loading} />
        <CommitStats commitStats={commitStats} loading={loading} />
      </div>
    </div>
  );
}

export default App;
