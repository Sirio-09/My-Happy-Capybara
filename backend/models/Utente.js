const mongoose = require("mongoose");

const utenteSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificato: { type: Boolean, default: false },
    codiceVerifica: { type: String, default: null },
    codiceReset: { type: String, default: null },        
    scadenzaReset: { type: Date, default: null },        
    dataCreazione: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Utente", utenteSchema);