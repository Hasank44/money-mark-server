import Contact from "../models/Contact.js";
import Price from "../models/Price.js";
import Slider from "../models/Slider.js";
import Deposit from '../models/Deposit.js';
import Withdraw from '../models/Withdraw.js';
import Transfer from '../models/Transfer.js'
import Gmail from '../models/Gmail.js';
import Facebook from '../models/Facebook.js';
import Instagram from '../models/Instagram.js';
import Telegram from '../models/Telegram.js';


export const fetchUserHistory = async userId => {
  const [contacts, prices, sliders] = await Promise.all([
    Contact.find({}).sort({ createdAt: -1 }),
    Price.find({}).sort({ createdAt: -1 }),
    Slider.find({}).sort({ createdAt: -1 }),
  ]);

  const allHistory = [
    ...prices.map(p => ({ type: "price", ...p.toObject() })),
    ...contacts.map(c => ({ type: "contact", ...c.toObject() })),
    ...sliders.map(s => ({ type: "slider", ...s.toObject() })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  return allHistory;
};

export const paymentHistory = async (userId) => {
  const [deposits, withdraws, transfers] = await Promise.all([
    Deposit.find({userId}).sort({ createdAt: -1 }),
    Withdraw.find({userId}).sort({ createdAt: -1 }),
    Transfer.find({userId}).sort({ createdAt: -1 }),
  ]);

  const payments = [
    ...deposits.map(d => ({ type: "deposit", ...d.toObject() })),
    ...withdraws.map(w => ({ type: "withdraw", ...w.toObject() })),
    ...transfers.map(t => ({ type: "transfer", ...t.toObject() })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  return payments;
};

export const sellsHistory = async (userId) => {
  const [gmailS, facebookS, instagramS, telegrams] = await Promise.all([
    Gmail.find({ userId }).sort({ createdAt: -1 }),
    Facebook.find({ userId }).sort({ createdAt: -1 }),
    Instagram.find({ userId }).sort({ createdAt: -1 }),
    Telegram.find({ userId }).sort({ createdAt: -1 }),
  ]);

  const sells = [
    ...gmailS.map(g => ({ type: "gmail", ...g.toObject() })),
    ...facebookS.map(f => ({ type: "facebook", ...f.toObject() })),
    ...instagramS.map(i => ({ type: "instagram", ...i.toObject() })),
    ...telegrams.map(t => ({ type: "telegram", ...t.toObject() })),
  ];
  return sells;
};
