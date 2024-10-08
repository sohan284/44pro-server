// controllers/paymentController.js
const stripe = require("stripe")(process.env.PAYMENT_SECRET); // Initialize Stripe with your secret key

const createPaymentIntent = async (req, res) => {
  const { amount, currency } = req.body;

  // Validate required fields
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).send({ error: "Invalid or missing amount" });
  }

  if (!currency) {
    return res.status(400).send({ error: "Currency is required" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
};
