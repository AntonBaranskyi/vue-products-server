import mongoose from 'mongoose';
import Product from './Product.js';

const OrderSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    title: {
      type: String,
      required: true,
    },
    updated: { type: Date, default: Date.now },
    description: {
      type: String,
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }], // Додайте поле "products"
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Orders', OrderSchema);
