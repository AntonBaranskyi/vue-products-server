import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import userRouter from './routes/auth.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import { getAllUsers } from './controllers/userController.js';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import { createProduct, deleteOne } from './controllers/productController.js';
import { createOrder, deleteOrder } from './controllers/orderController.js';

import checkAuth from './utils/checkAuth.js';
import User from './models/User.js';

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
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'src/uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

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

  io.emit('userCount', usersCount.size);
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
    const updatedProductsWithOrders = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'order',
          foreignField: 'id',
          as: 'orders',
        },
      },
    ]);

    const productIds = updatedProductsWithOrders.map((product) => product._id);

    const populatedProducts = await Product.find({
      _id: { $in: productIds },
    }).populate('user');

    resp.status(200).json(populatedProducts);
  } catch (error) {
    console.log(error);
    resp.status(403);
  }
});

app.post('/products', createProduct);

app.post('/orders', createOrder);

app.get('/users', getAllUsers);

app.delete('/products/:id', deleteOne);

app.delete('/orders/:id', deleteOrder);

app.get('/me', checkAuth, async (req, resp) => {
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
});

app.post('/upload', upload.single('image'), (req, resp) => {
  resp.json({
    url: `/uploads/${req.file.originalname}`,
  });
});

server.listen(PORT, () => {
  console.log('SERVER IS WORKING on ' + PORT);
});
