const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const responseSchema = new Schema({
  opinion: {
    type: ObjectId,
    ref: 'Opinion',
  },
  responses: [
    {
      user: ObjectId,
      response: {
        type: String,
        enum: [x, y],
      },
    }
  ],
    type: String,
    required: true,
    maxlength: 15,
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
