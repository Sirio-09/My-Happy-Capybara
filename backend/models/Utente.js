const mongoose = require("mongoose");

const utenteSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model("Utente", utenteSchema);