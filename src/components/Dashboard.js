// src/components/Dashboard.js
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const { token, user, setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date('2025-03-14')); // Ajusté pour correspondre à la date de l'intervention

  useEffect(() => {
    if (!token || !user) {
      navigate('/');
      return;
    }

    const fetchInterventions = async () => {
      console.log('Token utilisé:', token);
      console.log('User:', user); // Débogage pour vérifier user
      try {
        const response = await axios.get('https://django4d-1.onrender.com/api/interventions/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', response.data);
        const employeeInterventions = response.data.filter(
          (intervention) => intervention.employee === (user?.id || 0)
        );
        console.log('Filtered Interventions:', employeeInterventions); // Débogage
        setInterventions(employeeInterventions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching interventions:', err.response?.status, err.response?.data);
        if (err.response?.status === 401) {
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
              setError('Aucun token de rafraîchissement disponible. Veuillez vous reconnecter.');
              navigate('/');
              return;
            }
            const refreshResponse = await axios.post('https://django4d-1.onrender.com/api/token/refresh/', {
              refresh: refreshToken,
            });
            const newAccessToken = refreshResponse.data.access;
            setToken(newAccessToken);
            localStorage.setItem('access_token', newAccessToken);
            const retryResponse = await axios.get('https://django4d-1.onrender.com/api/interventions/', {
              headers: { Authorization: `Bearer ${newAccessToken}` },
            });
            const employeeInterventions = retryResponse.data.filter(
              (intervention) => intervention.employee === (user?.id || 0)
            );
            setInterventions(employeeInterventions);
            setLoading(false);
          } catch (refreshErr) {
            console.error('Error refreshing token:', refreshErr);
            setError('Session expirée. Veuillez vous reconnecter.');
            navigate('/');
          }
        } else {
          setError('Erreur lors de la récupération des interventions');
          setLoading(false);
        }
      }
    };

    fetchInterventions();
  }, [token, user, navigate, setToken]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const getDateOnly = (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const isInterventionExecuted = (intervention) => {
    console.log('Checking intervention:', intervention);
    const hasSignature = intervention.signature != null && intervention.signature !== '';
    const hasRapport = intervention.rapport_pdf != null && intervention.rapport_pdf !== '';
    console.log('hasSignature:', hasSignature, 'hasRapport:', hasRapport);
    return hasSignature && hasRapport;
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const filteredInterventions = interventions.filter((intervention) => {
    const interventionDate = getDateOnly(intervention.date_execution);
    const selectedDateStr = getDateOnly(selectedDate);
    console.log('Intervention Date:', interventionDate, 'Selected Date:', selectedDateStr);
    return interventionDate === selectedDateStr;
  });

  if (loading) return <div className="text-center mt-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="container mt-4">
      <h2 className="text-danger">Mes Interventions</h2>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button className="btn btn-outline-secondary" onClick={handlePreviousDay}>
          ← Précédent
        </button>
        <div className="text-center">
          <h3 className="text-primary mb-0">{formatDate(selectedDate.toISOString())}</h3>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="form-control mt-2"
            style={{ maxWidth: '200px', margin: '0 auto' }}
          />
        </div>
        <button className="btn btn-outline-secondary" onClick={handleNextDay}>
          Suivant →
        </button>
      </div>
      <div className="row">
        {filteredInterventions.length > 0 ? (
          filteredInterventions.map((intervention) => (
            <div key={intervention.id} className="col-12 mb-3">
              <div className="card shadow-sm">
                <div className="card-body d-flex align-items-center">
                  <div className="me-3">
                    <p className="card-text mb-0">
                      <strong>{formatDate(intervention.date_execution)}</strong><br />
                      <strong>{intervention.heure_debut}</strong>
                    </p>
                  </div>
                  <div className="flex-grow-1">
                    <p className="card-text mb-0">
                      <span className="text-danger">Dératisation</span><br />
                      {intervention.bon_de_commande?.adresse_intervention || 'Non définie'}
                    </p>
                  </div>
                  <div className="ms-auto d-flex align-items-center">
                    {isInterventionExecuted(intervention) ? (
                      <span className="text-success me-2">
                        <i className="bi bi-check-circle-fill" style={{ fontSize: '1.5rem' }}></i>
                        <span style={{ fontSize: '0.8rem', marginLeft: '5px' }}>Validé</span>
                      </span>
                    ) : null}
                    <button className="btn btn-outline-danger me-2">
                      <i className="bi bi-geo-alt-fill"></i>
                    </button>
                    <button className="btn btn-outline-danger me-2">
                      <i className="bi bi-telephone-fill"></i>
                    </button>
                    <Link
                      to={`/intervention/${intervention.id}/details`}
                      className="btn btn-danger"
                    >
                      Détails
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Aucune intervention pour ce jour.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;