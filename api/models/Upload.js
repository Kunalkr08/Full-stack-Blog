const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UploadSchema = new Schema({
    Image : String,
},{
    timestamps : true
})

const UploadImageModel = model("Image", UploadSchema);

module.exports = UploadImageModel