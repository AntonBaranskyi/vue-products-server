import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import userRouter from './routes/auth.js';
import { checkMe, getAllUsers } from './controllers/userController.js';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import {
  createProduct,
  deleteOne,
  getAllProducts,
} from './controllers/productController.js';
import {
  createOrder,
  deleteOrder,
  getAllOrders,
} from './controllers/orderController.js';

import checkAuth from './utils/checkAuth.js';
import fs from 'fs';

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
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
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
app.use('/uploads', express.static('uploads'));

const usersCount = new Set();

io.on('connection', (socket) => {
  console.log('connected');
  usersCount.add(socket.id);

  console.log(usersCount.size);
  socket.on('disconnect', () => {
    console.log('user disconnect');

    usersCount.delete(socket.id);

    io.emit('userCount', usersCount.size);
  });

  io.emit('userCount', usersCount.size);
});

app.use('/auth', userRouter);

app.get('/orders', getAllOrders);

app.get('/products', getAllProducts);

app.post('/products', createProduct);

app.post('/orders', createOrder);

app.get('/users', getAllUsers);

app.delete('/products/:id', deleteOne);

app.delete('/orders/:id', deleteOrder);

app.get('/me', checkAuth, checkMe);

app.post('/upload', upload.single('image'), (req, resp) => {
  resp.json({
    url: `src/uploads/${req.file.originalname}`,
  });
});

server.listen(PORT, () => {
  console.log('SERVER IS WORKING on ' + PORT);
});
