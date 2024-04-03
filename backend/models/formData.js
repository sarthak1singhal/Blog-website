const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true
    },
    types: {
        type: String,
        enum: ['Startup Founder', 'Angel Investor', 'Others'],
        required: true
    }
},
    { timestamps: true }
);


module.exports = mongoose.model('FormDataModel', formDataSchema);