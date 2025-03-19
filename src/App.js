// src/App.js
import React, { useState } from 'react';
import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import InterventionDetail from './components/InterventionDetail';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import './App.css';

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // true par défaut pour desktop
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="app-container">
      {!isLoginPage && (
        <>
          <Sidebar 
            isOpen={isSidebarOpen} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <button 
            className="burger-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            ☰
          </button>
        </>
      )}
      <div className={`main-content ${isSidebarOpen && !isLoginPage ? 'sidebar-open' : ''}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard-employe" element={<Dashboard />} />
          <Route path="/intervention/:id/details" element={<InterventionDetail />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;