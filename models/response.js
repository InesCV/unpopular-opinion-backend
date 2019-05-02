const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const responseSchema = new Schema({
  author: {
    type: ObjectId,
    ref: 'User',
  },
  opinion: {
    type: ObjectId,
    ref: 'Opinion',
  },
  response: {
    type: String,
    required: true,
    maxlength: 15,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
