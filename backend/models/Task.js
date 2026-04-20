const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    utenteId: { type: mongoose.Schema.Types.ObjectId, ref: "Utente", required: true },
    testo: { type: String, required: true },
    completata: { type: Boolean, default: false },
    dataCrazione: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Task", taskSchema);