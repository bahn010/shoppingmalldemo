const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const Product = require('./product');

const orderSchema = new Schema({
  orderNum: {
    type: String,
    required: false,
    unique: true
  },
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

// 주문번호 자동 생성 미들웨어
orderSchema.pre('save', async function(next) {
  if (!this.orderNum) {
    // 현재 날짜 + 랜덤 숫자로 주문번호 생성
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    this.orderNum = `ORD${year}${month}${day}${random}`;
  }
  next();
});

orderSchema.methods.toJSON = function() {
  const obj = this._doc
  delete obj.__v
  return obj
}

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;