import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import userRouter from './routes/auth.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import { getAllUsers } from './controllers/userController.js';

dotenv.config();

const { PORT = 5000 } = process.env;

mongoose
  .connect(
    'mongodb+srv://antonbaranskij12:wwwwww@cluster0.do3dnl7.mongodb.net/product-service?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('DB IS OK');
  })
  .catch((err) => {
    console.log('DB ERROR' + err);
  });

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('static'));

app.use('/auth', userRouter);

app.get('/orders', async (req, resp) => {
  try {
    const allOrders = await Order.find();

    resp.status(200).json(allOrders);
  } catch (error) {
    console.log(error);
    resp.status(403);
  }
});

app.get('/products', async (req, resp) => {
  try {
    const allProducts = await Product.find();

    resp.status(200).json(allProducts);
  } catch (error) {
    console.log(error);
    resp.status(403);
  }
});

app.get('/users', getAllUsers);

app.listen(PORT, () => {
  console.log('SERVER IS WORKING');
});
