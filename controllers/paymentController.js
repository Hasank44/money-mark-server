import axios from "axios";
import User from "../models/User.js";
import Price from "../models/Price.js";


export const createPayment = async (req, res) => {
  try {
    const { _id } = req.user;

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const price = await Price.findOne({ priceName: "accountActive" });
    if (!price) {
      return res.status(404).json({ success: false, message: "Price not found" });
    }

    const payload = {
      fullname: user.fullName,
      email: user.email,
      amount: price.amount.toString(),
      success_url: `${process.env.APP_URL}/api/v3/payment/success/:transaction_id`,
      cancel_url: `${process.env.APP_URL}/api/v3/payment/cancel`,
    };

    const response = await axios.post(
      "https://payment.rupantorpay.com/api/payment/checkout",
      payload,
      {
        headers: {
          accept: "application/json",
          "X-API-KEY": process.env.RUPANTOR_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response)
    return res.status(200).json({
      success: true,
      payment_url: response.data.payment_url,
      payment_id: response.data.payment_id || null,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Payment creation failed",
      error: error.response?.data || error.message,
    });
  }
};

export const paymentSuccess = async ( req, res) => { 
  const { transaction_id} = req.params
  try {
    const response = await axios.post(
    "https://payment.rupantorpay.com/api/payment/verify-payment",
    { },
    {
      headers: {
        accept: "application/json",
        "X-API-KEY": process.env.RUPANTOR_API_KEY,
        "Content-Type": "application/json",
      },
    }
    );
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Payment creation failed",
      error: error.response?.data || error.message,
    });
  }

  return response.data;
};

export const paymentCancel = async (req, res) => {
  return res.redirect(`${process.env.FRONT_URL}/payment-cancel`);
};

// export const paymentSuccess = async (req, res) => {
//   try {
//     console.log('caall')
//     const { payment_id, status } = req.body;
//     if (!payment_id) {
//       return res.status(400).json({ success: false, message: "payment_id missing" });
//     }
//     if (status !== "success") {
//       return res.status(200).json({ received: true });
//     }
//     const verify = await verifyPayment();
//     if (verify.status === true) {
//       const email = verify?.data?.email;
//       const user = await User.findOne({ email });
//       if (user && !user.isActive) {
//         user.isActive = true;
//         user.paymentId = payment_id;
//         await user.save();
//       }
//     }

//     res.status(200).json({ received: true });
//   } catch (error) {
//     console.error(error.response?.data || error.message);
//     res.status(500).json({ success: false, message: "Webhook failed" });
//   }
// };
