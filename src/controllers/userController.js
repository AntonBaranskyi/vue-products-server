import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import uuid from 'uuid';
import User from '../models/User.js';
// import { config } from 'dotenv';

export const register = async (req, resp) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return resp.status(400).json(errors.array());
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new User({
      email: req.body.email,
      fullName: req.body.fullName,
      passwordHash: hash,
      avatarUrl: req.body.avatarUrl,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user._doc;

    resp.json({ ...userData, token });
  } catch (error) {
    console.log(error);
    resp.status(500).json({
      message: 'Fail to register',
    });
  }
};

export const login = async (req, resp) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );

    if (!user || !isValidPassword) {
      return resp.status(404).json({
        message: 'Invalid login or password',
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user._doc;
    resp.json({ ...userData, token });
  } catch (error) {
    resp.status(404).json({
      message: 'Invalid login or password',
    });
  }
};

export const getAllUsers = async (req, resp) => {
  try {
    const allUsers = await User.find();

    console.log(allUsers);

    resp.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    resp.status(404).json({
      message: 'Error with fetching all users data',
    });
  }
};

export const checkMe = async (req, resp) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return resp.json({
        message: 'Not found user',
      });
    }

    const { ...userData } = user._doc;

    resp.json(userData);
  } catch (error) {
    resp.status(403).json({
      message: 'Fail to get user',
    });
  }
};
