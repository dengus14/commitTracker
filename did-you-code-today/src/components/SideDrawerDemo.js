import React, { useState } from "react";
import SideDrawer from "./SideDrawer";

const SideDrawerDemo = () => {
  const [basicDrawerOpen, setBasicDrawerOpen] = useState(false);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#e6edf3', marginBottom: '2rem' }}>
        Side Drawer Examples
      </h2>

      {/* Example Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className="check-button"
          onClick={() => setBasicDrawerOpen(true)}
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
        >
          Open Basic Drawer
        </button>

        <button 
          className="github-login-button"
          onClick={() => setSettingsDrawerOpen(true)}
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
        >
          Open Settings Drawer
        </button>
      </div>

      {/* Basic Drawer Example */}
      <SideDrawer
        isOpen={basicDrawerOpen}
        onClose={() => setBasicDrawerOpen(false)}
        title="Basic Navigation"
      >
        <div>
          <h3 style={{ color: '#e6edf3', marginBottom: '1rem' }}>
            Simple Navigation Menu
          </h3>
          
          <nav>
            <ul className="drawer-nav">
              <li className="drawer-nav-item">
                <a href="#home" className="drawer-nav-link">
                  🏠 Home
                </a>
              </li>
              <li className="drawer-nav-item">
                <a href="#about" className="drawer-nav-link">
                  ℹ️ About
                </a>
              </li>
              <li className="drawer-nav-item">
                <a href="#contact" className="drawer-nav-link">
                  📧 Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </SideDrawer>

      {/* Settings Drawer Example */}
      <SideDrawer
        isOpen={settingsDrawerOpen}
        onClose={() => setSettingsDrawerOpen(false)}
        title="Settings & Preferences"
      >
        <div>
          {/* Settings Form */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#e6edf3', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Theme Settings
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#8b949e', display: 'block', marginBottom: '0.5rem' }}>
                Theme Mode:
              </label>
              <select 
                className="username-input"
                style={{ width: '100%' }}
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#8b949e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" defaultChecked />
                Enable notifications
              </label>
            </div>
          </div>

          {/* User Actions */}
          <div style={{ borderTop: '1px solid #30363d', paddingTop: '1.5rem' }}>
            <h3 style={{ color: '#e6edf3', marginBottom: '1rem', fontSize: '1.1rem' }}>
              Account Actions
            </h3>
            
            <button 
              className="check-button"
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              Export Data
            </button>
            
            <button 
              className="logout-button"
              style={{ width: '100%' }}
            >
              Clear Cache
            </button>
          </div>
        </div>
      </SideDrawer>

      {/* Educational Content */}
      <div style={{ background: '#21262d', border: '1px solid #30363d', padding: '2rem', borderRadius: '4px' }}>
        <h3 style={{ color: '#e6edf3', marginBottom: '1rem' }}>
          How the Side Drawer Works:
        </h3>
        
        <ul style={{ color: '#8b949e', lineHeight: '1.6' }}>
          <li><strong>State Management:</strong> Uses React useState to track open/closed state</li>
          <li><strong>CSS Transforms:</strong> translateX(-100%) hides, translateX(0) shows the drawer</li>
          <li><strong>Overlay:</strong> Semi-transparent background prevents interaction with main content</li>
          <li><strong>Keyboard Support:</strong> Press Escape key to close</li>
          <li><strong>Accessibility:</strong> Proper ARIA labels and focus management</li>
          <li><strong>Body Scroll Lock:</strong> Prevents scrolling when drawer is open</li>
        </ul>
      </div>
    </div>
  );
};

export default SideDrawerDemo;
