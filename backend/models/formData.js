const mongoose = require('mongoose');

const formDataSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true
    },
},
    { timestamps: true }
);


module.exports = mongoose.model('FormDataModel', formDataSchema);