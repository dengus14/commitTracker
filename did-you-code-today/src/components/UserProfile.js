import React from "react";
import { useAuth } from "../context/AuthContext";

const UserProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-info">
        <img 
          src={user.avatarUrl} 
          alt={user.username}
          className="user-avatar"
        />
        <div className="user-details">
          <h3 className="user-name">{user.displayName || user.username}</h3>
          <p className="user-username">@{user.username}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
