const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const opinionSchema = new Schema({
  author: {
    type: ObjectId,
    ref: 'User',
  },
  category: {
    type: String,
    required: true,
    default: 'Random',
    enum: ['Philosoraptor', 'Politics', 'Sex', 'Music', 'Food', 'Sports', 'Religion', 'Weird Stuff', 'Other'],
  },
  photo: {
    type: String,
    required: false,
  },
  question: {
    type: String,
    required: true,
    maxlength: 140,
  },
  response: {
    x: {
      type: String,
      default: 'Yes',
      required: false,
      maxlength: 15,
    },
    y: {
      type: String,
      default: 'No',
      required: false,
      maxlength: 15,
    },
  },
  // location: {
  //   lat: Number,
  //   long: Number
  // },
  isReported: {
    type: Boolean,
    default: false,
  },
  isChecked: {
    type: Boolean,
    default: false,
  },
  isUpdated: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const Opinion = mongoose.model('Opinion', opinionSchema);

module.exports = Opinion;
