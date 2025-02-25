const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middlewares/auth');
const Order = require('../models/Order');
const User = require('../models/User');

router.post('/buy-number', auth, async (req, res) => {
  const { service, country } = req.body;
  const apiKey = process.env.SMSPVA_API_KEY;

  try {
    const priceResponse = await axios.get('https://smspva.com/prices', {
      params: { service, country, api_key: apiKey },
    });
    const basePrice = priceResponse.data.price;
    const resalePrice = basePrice + 0.10;

    const user = await User.findById(req.user.id);
    if (user.credits < resalePrice) {
      return res.status(400).json({ error: 'Crédits insuffisants' });
    }

    const response = await axios.get('https://smspva.com/requestnumber', {
      params: { service, country, api_key: apiKey },
    });
    const { number, id: orderId } = response.data;

    const order = new Order({
      user: req.user.id,
      service,
      country,
      number,
      status: 'pending',
    });
    await order.save();

    user.credits -= resalePrice;
    await user.save();

    res.json({ message: 'Numéro acheté avec succès', order });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'achat du numéro' });
  }
});

router.get('/receive-sms/:orderId', auth, async (req, res) => {
  const { orderId } = req.params;
  const apiKey = process.env.SMSPVA_API_KEY;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ error: 'Accès refusé' });

    const response = await axios.get('https://smspva.com/getsms', {
      params: { id: orderId, api_key: apiKey },
    });
    const { sms } = response.data;

    if (sms) {
      order.smsCode = sms;
      order.status = 'received';
      await order.save();
      res.json({ sms });
    } else {
      res.json({ message: 'SMS non encore reçu, veuillez réessayer plus tard' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la réception du SMS' });
  }
});

router.get('/orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

module.exports = router;