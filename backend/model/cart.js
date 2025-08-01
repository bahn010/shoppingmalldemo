const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user');
const Product = require('./product');
const cartSchema = new Schema({
    userId: {
        type: mongoose.ObjectId,
        ref: 'User',
        required: true
    },
    items:[{
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
        }
    }]
}, {timestamps: true});


cartSchema.methods.toJSON = function() {
  const obj = this._doc
  delete obj.__v
  delete obj.creatWdAt
  delete obj.updatedAt  
  return obj
}

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;