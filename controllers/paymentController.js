import axios from "axios";
import User from "../models/User.js";
import Price from "../models/Price.js";
import Active from "../models/Active.js";

export const paymentCreate = async (req, res) => {
  try {
    const authUserId = req.user?._id;
    const { userId } = req.body;

    if (!authUserId || !userId) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
    const user = await User.findById(authUserId);
    if (!user || !user._id.equals(userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    if (!user.isVerified) {
      return res.status(400).json({ message: "Verify email first" });
    }
    if (!user.isLoggedIn) {
      return res.status(400).json({ message: "Login first" });
    }
    if (user.status !== "Inactive") {
      return res.status(400).json({ message: "Account already active" });
    }
    const price = await Price.findOne({ priceName: "accountActive" });
    if (!price) {
      return res.status(404).json({ message: "Price not found" });
    }
    const payload = {
      cus_name: user.userName || "Customer",
      cus_email: user.email,
      amount: price.amount,
      redirect_url: `${process.env.FRONT_URL}/payment-success`,
      cancel_url: `${process.env.FRONT_URL}`,
      webhook_url: `${process.env.APP_URL}/api/v3/payment/webhook`,
      metadata: {
        userId: user._id.toString(),
      },
    };
    const response = await axios.post(
      "https://api.zinipay.com/v1/payment/create",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "zini-api-key": process.env.ZINIPAY_API_KEY,
        },
      }
    );
    if (!response.data?.payment_url || !response.data?.val_id) {
      return res.status(500).json({ message: "Gateway error" });
    };
    const invoiceId = response.data.val_id;
    await Active.create({
      userId: user._id,
      transactionId: invoiceId,
      amount: price.amount,
      paymentAddress: null
    });
    return res.status(200).json({
      success: true,
      url: response.data.payment_url,
      invoiceId,
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Payment create failed",
    });
  }
};

export const paymentSuccess = async (req, res) => {
  try {
    const { invoiceId, valId } = req.body;
    if (!invoiceId || !valId) return res.redirect(process.env.FRONT_URL);
    const payment = await Active.findOne({ transactionId: valId });
    if (!payment) return res.redirect(process.env.FRONT_URL);
    if (payment.status === "Completed") {
      return res.redirect(`${process.env.FRONT_URL}`);
    };
    const user = await User.findById(payment.userId);
    if (!user) return res.redirect(process.env.FRONT_URL);
    const verifyResponse = await axios.post(
      "https://api.zinipay.com/v1/payment/verify",
      { invoiceId },
      {
        headers: {
          "Content-Type": "application/json",
          "zini-api-key": process.env.ZINIPAY_API_KEY,
        },
      }
    );
    const data = verifyResponse.data;
    if (data.status !== "COMPLETED") {
      payment.status = "Failed";
      payment.isVerified = true;
      await payment.save();
      return res.redirect(`${process.env.FRONT_URL}`);
    };
    if (data.status === 'COMPLETED') {
      payment.status = "Completed";
      payment.isVerified = true;
      payment.amount = Number(data.amount);
      payment.transactionId = data.transaction_id;
      payment.payWith = data.payment_method;
      payment.paymentAddress = data.senderNumber;
      await payment.save();
      user.status = "Active";
      await user.save();
      const r1 =
        (await Price.findOne({ priceName: "referLabel1" }))?.amount || 0;
      const r2 =
        (await Price.findOne({ priceName: "referLabel2" }))?.amount || 0;
      const r3 =
        (await Price.findOne({ priceName: "referLabel3" }))?.amount || 0;
      const parentUser = await User.findOne({ referCode: user.referredBy });
      if (parentUser) {
        parentUser.balance += r1;
        parentUser.referEarn += r1;
        await parentUser.save();
        const grandParent = parentUser.referredBy
          ? await User.findOne({ referCode: parentUser.referredBy })
          : null;
        if (grandParent) {
          grandParent.balance += r2;
          grandParent.referEarn += r2;
          await grandParent.save();
          const greatGrandParent = grandParent.referredBy
            ? await User.findOne({ referCode: grandParent.referredBy })
            : null;
          if (greatGrandParent) {
            greatGrandParent.balance += r3;
            greatGrandParent.referEarn += r3;
            await greatGrandParent.save();
          };
        };
      };
    };
    return res.redirect(`${process.env.FRONT_URL}`);
  } catch (error) {
    return res.redirect(
      `${process.env.FRONT_URL}`
    );
  };
};

export const paymentWebhook = async (req, res) => {
  try {
    const { status, invoiceId, metadata } = req.body;
    // console.log(status, invoiceId, metadata);
    const transactionId = invoiceId || metadata?.transactionId;
    if (!transactionId) return res.sendStatus(400);
    const payment = await Active.findOne({ transactionId });
    if (!payment) return res.sendStatus(404);
    if (payment.status === "Completed") {
      return res.sendStatus(200);
    }
    if (status === "COMPLETED") {
      payment.status = "Completed";
      payment.isVerified = true;
      await payment.save();

      const user = await User.findById(payment.userId);
      if (user.status !== "Active") {
        user.status = "Active";
        await user.save();
        const r1 =
          (await Price.findOne({ priceName: "referLabel1" }))?.amount || 0;
        const r2 =
          (await Price.findOne({ priceName: "referLabel2" }))?.amount || 0;
        const r3 =
          (await Price.findOne({ priceName: "referLabel3" }))?.amount || 0;
        const parentUser = await User.findOne({ referCode: user.referredBy });
        if (parentUser) {
          parentUser.balance += r1;
          parentUser.referEarn += r1;
          await parentUser.save();
          const grandParent = parentUser.referredBy
            ? await User.findOne({ referCode: parentUser.referredBy })
            : null;
          if (grandParent) {
            grandParent.balance += r2;
            grandParent.referEarn += r2;
            await grandParent.save();
            const greatGrandParent = grandParent.referredBy
              ? await User.findOne({ referCode: grandParent.referredBy })
              : null;
            if (greatGrandParent) {
              greatGrandParent.balance += r3;
              greatGrandParent.referEarn += r3;
              await greatGrandParent.save();
            }
          }
        }
      }
    };
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.sendStatus(500);
  }
};
