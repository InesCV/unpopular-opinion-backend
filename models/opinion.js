const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opinionSchema = new Schema ({
  // author: {
  //   type: ObjectId,
  //   ref: 'User',
  // },
  author: { 
    type: String, 
    default: 'Anonymous',
    required: true,
  },
  // categoryID: String,
  category: {
    type: String,
    required: true,
    default: 'Random',
    enum: ['Philosoraptor', 'Politics', 'Sex', 'Music', 'Food', 'Sports', 'Weird Stuff', 'Random'],
  },
  // photo: { 
  //   type: String, 
  //   default: null, 
  //   required: false,
  // },
  question: { 
    type: String, 
    required: true,
    maxlength: 140,
  },
  response: {
    x: { 
      type: String, 
      default: "Yes",
      required: false,
      maxlength: 15,
    },
    y: { 
      type: String, 
      default: "No",
      required: false,
      maxlength: 15,
    },
  },
  // location: { 
  //   lat: Number, 
  //   long: Number
  // },
  // reported: {
  //   isReported: { 
  //     type: Boolean,
  //     default: false,
  //   },
  //   isRevised: { 
  //     type: Boolean,
  //     default: false,
  //   },
  //   by: { 
  //     type: Array,
  //     ref: 'User',
  //   },
  // },
  // modified: {
  //   isModified: { 
  //     type: Boolean,
  //     default: false,
  //   },
  //   isRevised: { 
  //     type: Boolean,
  //     default: false,
  //   }
  // }
});

const Opinion = mongoose.model('Opinion', opinionSchema);

module.exports = Opinion;
