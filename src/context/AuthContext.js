// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [user, setUser] = useState(() => {
    const storedToken = localStorage.getItem('access_token');
    return storedToken ? { id: jwtDecode(storedToken).user_id } : null;
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        console.log('Utilisateur décodé au chargement:', decoded);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.log('Token expiré, rafraîchissement nécessaire');
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            axios
              .post('https://django4d-1.onrender.com/api/token/refresh/', {
                refresh: refreshToken,
              })
              .then((response) => {
                const newAccessToken = response.data.access;
                setToken(newAccessToken);
                localStorage.setItem('access_token', newAccessToken);
                setUser({ id: jwtDecode(newAccessToken).user_id }); // Met à jour user avec user_id
              })
              .catch((err) => {
                console.error('Error refreshing token:', err);
                setToken(null);
                setUser(null);
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
              });
          } else {
            setToken(null);
            setUser(null);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } else {
          setToken(storedToken);
          setUser({ id: decoded.user_id }); // Met à jour user avec user_id
        }
      } catch (err) {
        console.error('Invalid token:', err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};