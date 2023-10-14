import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import expressAsyncHandler from 'express-async-handler'; // Add this line
import { generateToken, isAdmin, isAuth } from '../utils.js';

const userRouter = express.Router();

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Invalid email or password' });
  })
);

userRouter.post(
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

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      if (req.body.email !== user.email) {
        // Check if the new email already exists in the database
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
          res.status(400).send({ message: 'Email already in use' });
          return;
        }

        user.email = req.body.email || user.email;
      }
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 10);
      }
      await User.updateOne({ _id: user._id }, user, { upsert: true });
      const userUpdated = await User.findById(req.user._id); // Fetch the updated user
      res.send({
        _id: userUpdated._id,
        name: userUpdated.name,
        email: userUpdated.email,
        isAdmin: userUpdated.isAdmin,
        token: generateToken(userUpdated),
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

export default userRouter;
