// src/App.js
import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import InterventionDetail from './components/InterventionDetail';
import Login from './components/Login';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard-employe" element={<Dashboard />} />
          <Route path="/intervention/:id/details" element={<InterventionDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;