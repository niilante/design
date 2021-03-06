var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var ProductSchema = new Schema({
  name: {
    unique: true,
    type: String
  },
  labels: Array,
  price: Number,
  discount: Number,
  // like: Number,
  size: Array,
  color: Array,
  pics: Array,
  stock: Number,
  activity: ObjectId,
  sale_num: {
    type:Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  meta:  {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
});

// ProductSchema.index({name: 1,labels: 1,color: 1,description: 1})


module.exports = ProductSchema;