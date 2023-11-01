import Product from '../models/Product.js';

import { generateRandomNumber } from '../utils/generateSN.js';

export const createProduct = async (req, resp) => {
  try {
    const serialNumber = generateRandomNumber(4);
    const doc = new Product({
      serialNumber,
      title: req.body.title,
      isNew: req.body.isNew,
      type: 'Monitors',
      specification: 'Specification 2',
      guarantee: {
        start: Date.now(),
        end: Date.now(),
      },
      price: [
        {
          value: req.body.price.value,
          symbol: 'USD',
          isDefault: true,
        },
      ],
      order: req.body.order,
      user: req.body.userId,
    });

    const product = await doc.save();

    console.log(product);

    resp.json(product);
  } catch (error) {
    console.log(error);
    return resp.status(500).json({
      message: 'Cannot create order',
    });
  }
};

export const deleteOne = async (req, resp) => {
  try {
    const productId = req.params.id;

    await Product.deleteOne({
      _id: productId,
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
