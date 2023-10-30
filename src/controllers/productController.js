import Product from '../models/Product.js';

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
