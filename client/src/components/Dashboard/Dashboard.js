import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [credits, setCredits] = useState(0);
  const [formData, setFormData] = useState({ service: '', country: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchCredits();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/sms/orders', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const fetchCredits = async () => {
    try {
      const res = await axios.get('/api/auth/credits', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setCredits(res.data.credits);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/sms/buy-number', formData, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchOrders();
      fetchCredits();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Une erreur est survenue');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h2>Tableau de bord</h2>
      <p>Crédits : {credits}</p>
      <Link to="/topup">Recharger</Link>
      <h3>Acheter un numéro</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Service"
          name="service"
          value={formData.service}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          placeholder="Pays"
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
        />
        <button type="submit">Acheter</button>
      </form>
      <h3>Mes commandes</h3>
      {orders.length === 0 ? (
        <p>Aucune commande pour le moment.</p>
      ) : (
        <ul>
          {orders.map(order => (
            <li key={order._id}>
              {order.service} - {order.country} - {order.number} - {order.status}
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
};

export default Dashboard;