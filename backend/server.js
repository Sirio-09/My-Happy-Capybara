const fs = require('fs');
console.log("📁 File visti da Node.js in questa cartella:");
console.log(fs.readdirSync(__dirname));

require("dotenv").config({ path: __dirname + '/.env' });

// 1. CARICA LE VARIABILI D'AMBIENTE 
// (Usiamo __dirname per forzare la ricerca del .env esattamente in questa cartella)
require("dotenv").config({ path: __dirname + '/.env' });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 2. IMPORT DELLE ROTTE
const authRoutes = require("./routes/auth");
const utentiRoutes = require("./routes/utenti");

const app = express();

// 3. MIDDLEWARE
app.use(express.json());
app.use(cors());

// 4. CONNESSIONE A MONGODB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ ERRORE CRITICO: MONGO_URI non trovata nel file .env!");
    console.error("Controlla che il file .env esista, non abbia l'estensione .txt nascosta e sia scritto correttamente.");
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log("✅ MongoDB connesso con successo!"))
        .catch(err => {
            console.error("❌ Errore durante la connessione a MongoDB:");
            console.error(err.message);
        });
}

// 5. ROTTE
app.use("/auth", authRoutes);
app.use("/utenti", utentiRoutes);

// Rotta di test base
app.get("/", (req, res) => {
    res.send("Il server backend è attivo!");
});

// 6. AVVIO DEL SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server avviato correttamente su http://localhost:${PORT}`);
    
    if (!process.env.PORT) {
        console.log("⚠️ Nota: Sto usando la porta 3000 perché non ho trovato PORT nel file .env");
    }
});