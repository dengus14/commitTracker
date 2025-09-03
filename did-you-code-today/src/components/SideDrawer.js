import React, { useEffect } from "react";

const SideDrawer = ({ isOpen, onClose, children, title = "Menu" }) => {
  // Close drawer when pressing Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay - covers the entire screen when drawer is open */}
      <div 
        className={`drawer-overlay ${isOpen ? 'drawer-overlay--open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      
      {/* Drawer Panel - the actual sliding content */}
      <div 
        className={`side-drawer ${isOpen ? 'side-drawer--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <h2 id="drawer-title" className="drawer-title">{title}</h2>
          <button 
            className="drawer-close-button"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        
        {/* Drawer Content */}
        <div className="drawer-content">
          {children}
        </div>
      </div>
    </>
  );
};

export default SideDrawer;