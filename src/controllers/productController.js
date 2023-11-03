import Product from '../models/Product.js';

import { generateRandomNumber } from '../utils/generateSN.js';

export const getAllProducts = async (req, resp) => {
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

    console.log(updatedProductsWithOrders);

    const productIds = updatedProductsWithOrders.map((product) => product._id);

    const populatedProducts = await Product.find({
      _id: { $in: productIds },
    }).populate('user');

    const productsWithOrdersAndUsers = updatedProductsWithOrders.map(
      (product) => {
        const foundProduct = populatedProducts.find((populatedProduct) =>
          populatedProduct._id.equals(product._id)
        );
        product.user = foundProduct.user;
        return product;
      }
    );

    resp.status(200).json(productsWithOrdersAndUsers);
  } catch (error) {
    console.log(error);
    resp.status(403);
  }
};

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

    const withUser = await product.populate('user');

    console.log(withUser);

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

    resp.json(updatedProductsWithOrders[updatedProductsWithOrders.length - 1]);
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
