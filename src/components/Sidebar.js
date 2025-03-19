// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <button className="close-btn" onClick={toggleSidebar}>
          ✕
        </button>
      </div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard-employe" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={toggleSidebar}
        >
          Dashboard
        </NavLink>
        {/* Ajoutez d'autres liens selon vos besoins */}
      </nav>
    </div>
  );
};

export default Sidebar;