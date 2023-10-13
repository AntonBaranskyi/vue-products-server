import mongoose from 'mongoose';
import Order from './Order.js';

const ProductSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number, required: true },
    isNew: { type: Number, required: true },
    photo: { type: String },
    title: { type: String, required: true },
    type: { type: String, required: true },
    specification: { type: String, required: true },
    guarantee: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },

    price: [
      {
        value: Number,
        symbol: String,
        isDefault: Boolean,
      },
    ],
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Orders' },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Products', ProductSchema);
