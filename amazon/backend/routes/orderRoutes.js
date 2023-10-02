import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import expressAsyncHandler from 'express-async-handler'; // Add this line
import { generateToken, isAuth } from '../utils.js';
import Order from '../models/orderModel.js';

const orderRouter = express.Router();

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });
    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  })
);

orderRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    try {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
      });
      const user = await newUser.save();
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        // Mongoose validation error (including custom error message)
        res.status(400).json({ message: err.message });
      } else {
        // Other types of errors
        res.status(500).json({ message: 'Server error' });
      }
    }
  })
);

export default orderRouter;
