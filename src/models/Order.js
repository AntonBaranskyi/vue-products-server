import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    updated: { type: Date, default: Date.now },
    description: {
      type: String,
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Products' }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Orders', OrderSchema);
