const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const IfcModelSchema = new Schema({
    title: String,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    date: String,
    uploadID: String,
}, opts);



IfcModelSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/ifcModel/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

module.exports = mongoose.model('IfcModel', IfcModelSchema)