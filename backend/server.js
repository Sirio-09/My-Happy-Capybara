const fs = require('fs');
console.log("📁 File visti da Node.js in questa cartella:");
console.log(fs.readdirSync(__dirname));

require("dotenv").config({ path: __dirname + '/.env' });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const utentiRoutes = require("./routes/utenti");
const tasksRoutes = require("./routes/tasks");
const Task = require('./models/Task'); // Importa il modello Task per il reset

const app = express();

app.use(express.json());
app.use(cors());

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

// --- ROTTE STANDARD ---
app.use("/auth", authRoutes);
app.use("/utenti", utentiRoutes);
app.use("/tasks", tasksRoutes);

app.get("/", (req, res) => {
    res.send("Il server backend è attivo!");
});

// --- ROTTA SEGRETA PER IL RESET DELLE 6:00 ---
// Questa è la rotta che cron-job.org chiamerà ogni mattina
app.get('/reset-giornaliero-segreto-capibara-99', async (req, res) => {
    try {
        // Cancella tutte le task di tutti gli utenti
        await Task.deleteMany({}); 
        
        console.log("Il Capibara ha fatto le pulizie mattutine!");
        res.status(200).send("Reset di tutte le task completato con successo.");
    } catch (error) {
        console.error("Errore durante il reset:", error);
        res.status(500).send("Errore nel reset.");
    }
});

// --- AVVIO DEL SERVER --- (Sempre alla fine!)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server avviato correttamente sulla porta ${PORT}`);
    
    if (!process.env.PORT) {
        console.log("⚠️ Nota: Sto usando la porta 3000 perché non ho trovato PORT nel file .env");
    }
});