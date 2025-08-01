const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const Product = require('./product');
const orderSchema = new Schema({
  shippingAddress: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    default: "preparing"
  },
  items: [{
    productId: {
      type: mongoose.ObjectId,
      ref: 'Product',
      required: true
    },
    size: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    price: {
      type: Number,
      required: true
    }
  }]
}, {timestamps: true});


orderSchema.methods.toJSON = function() {
  const obj = this._doc
  delete obj.__v
  delete obj.creatWdAt
  delete obj.updatedAt  
  return obj
}

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;