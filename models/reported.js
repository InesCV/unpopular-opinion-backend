const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const reportedSchema = new Schema({
  isReported: {
    type: Boolean,
    default: false,
  },
  isRevised: {
    type: Boolean,
    default: false,
  },
  reportedBy: [
    {
      type: ObjectId,
      ref: 'User',
    },
  ],
  revisedBy: {
    type: ObjectId,
    ref: 'User',
  },
});

const Reported = mongoose.model('Reported', reportedSchema);

module.exports = Reported;
