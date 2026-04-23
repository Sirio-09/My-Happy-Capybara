const mongoose = require('mongoose');

const LastResetSchema = new mongoose.Schema({
    data: { type: String, required: true }
});
module.exports = mongoose.model('LastReset', LastResetSchema);