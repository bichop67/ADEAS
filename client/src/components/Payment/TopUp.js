import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const TopUp = () => {
  const [amount, setAmount] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      const { data } = await axios.post('/api/payment/create-payment-intent', { amount: parseFloat(amount) }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        alert(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          await axios.post('/api/payment/confirm', { amount: parseFloat(amount) }, {
            headers: { 'x-auth-token': localStorage.getItem('token') }
          });
          alert('Paiement réussi !');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Une erreur est survenue lors du paiement.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Montant"
        required
      />
      <CardElement />
      <button type="submit" disabled={!stripe}>Payer</button>
    </form>
  );
};

export default TopUp;