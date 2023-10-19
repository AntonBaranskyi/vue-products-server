import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import userRouter from './routes/auth.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import { getAllUsers } from './controllers/userController.js';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

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
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origins: [
      'http://127.0.0.1:5174/',
      'https://vue-products-server.onrender.com',
    ],
  },
});

app.use(express.json());
app.use(cors());
app.use(express.static('static'));

const usersCount = new Set();

io.on('connection', (socket) => {
  console.log('connected');
  usersCount.add(socket.id);

  console.log(usersCount.size);
  socket.on('disconnect', () => {
    console.log('user disconect');

    usersCount.delete(socket.id);
  });

  socket.emit('userCount', usersCount.size);
});

app.use('/auth', userRouter);

app.get('/orders', async (req, res) => {
  try {
    const updatedOrdersWithProducts = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'id',
          foreignField: 'order',
          as: 'products',
        },
      },
    ]);

    res.status(200).json(updatedOrdersWithProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка на сервері' });
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

server.listen(PORT, () => {
  console.log('SERVER IS WORKING on ' + PORT);
});
