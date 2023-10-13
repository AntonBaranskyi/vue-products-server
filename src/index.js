import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import userRouter from './routes/auth.js';

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

app.use('/auth', userRouter);

app.listen(5000, () => {
  console.log('SERVER IS WORKING');
});
