import React from 'react';

const StatusMessage = ({ status, loading }) => {
  const getStatusClass = () => {
    if (loading) return "loading";
    if (status.includes("✅")) return "status-success";
    if (status.includes("❌")) return "status-error";
    if (status.includes("⚠️")) return "status-warning";
    return "";
  };

  if (!status && !loading) return null;

  return (
    <div className={`status-container ${getStatusClass()}`}>
      {loading ? "🔍 Checking your GitHub activity..." : status}
    </div>
  );
};

export default StatusMessage;
