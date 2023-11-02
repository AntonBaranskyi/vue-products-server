import Order from '../models/Order.js';
import Product from '../models/Product.js';

import mongoose from 'mongoose';

export const getAllOrders = async (req, res) => {
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
};

export const createOrder = async (req, resp) => {
  try {
    const lastOrder = await Order.findOne({}, {}, { sort: { id: -1 } });

    let newId = 1;
    if (lastOrder) {
      newId = lastOrder.id + 1;
    }

    const doc = new Order({
      title: req.body.title,
      id: newId,
    });

    const order = await doc.save();

    resp.json(order);
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: 'Cannot create order',
    });
  }
};

export const deleteOrder = async (req, resp) => {
  try {
    const orderId = req.params.id;

    const order = await Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(orderId),
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'id',
          foreignField: 'order',
          as: 'products',
        },
      },
    ]);

    if (order[0].products.length > 0) {
      for (const productId of order[0].products) {
        await Product.deleteOne({ _id: productId });
      }
    }

    await Order.deleteOne({
      _id: orderId,
    });

    resp.json({
      succes: true,
    });
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: 'Cannot delete product',
    });
  }
};
