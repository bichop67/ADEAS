import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import TopUp from './components/Payment/TopUp';
import PrivateRoute from './components/PrivateRoute';

const stripePromise = loadStripe('pk_live_51OQ9RsJP8iuf9C8WDXLSWyaZMFekEZEYYRVlg4IZI6EQcMz8ln5YPPLSs2oxfseeXKq01kWcV8a9fnZcKo536Kgs00NKvWEUQi');

function App() {
  return (
    <Router>
      <Elements stripe={stripePromise}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/topup" element={<PrivateRoute><TopUp /></PrivateRoute>} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Elements>
    </Router>
  );
}

export default App;