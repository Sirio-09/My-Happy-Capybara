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

const Task = require('./models/Task');
const LastReset = require('./models/LastReset');

const app = express();

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;

// --- CONNESSIONE E LOGICA DI RESET ALL'AVVIO ---
if (!mongoURI) {
    console.error("❌ ERRORE CRITICO: MONGO_URI non trovata!");
} else {
    mongoose.connect(mongoURI)
        .then(async () => {
            console.log("✅ MongoDB connesso con successo!");

            // --- FUNZIONE DI AUTO-RESET ---
            const oggi = new Date().toISOString().split('T')[0]; 
            try {
                const checkReset = await LastReset.findOne({ data: oggi });
                
                if (!checkReset) {
                    await Task.deleteMany({}); // Pulisce le task
                    await LastReset.deleteMany({}); // Rimuove record vecchi
                    await new LastReset({ data: oggi }).save(); // Segna reset fatto
                    console.log("🧹 Pulizia mattutina eseguita automaticamente!");
                } else {
                    console.log("✨ Pulizia già effettuata oggi.");
                }
            } catch (err) {
                console.error("Errore nel controllo reset:", err);
            }
        })
        .catch(err => console.error("❌ Errore connessione MongoDB:", err));
}

// --- ROTTE ---
app.use("/auth", authRoutes);
app.use("/utenti", utentiRoutes);
app.use("/tasks", tasksRoutes);

app.get("/", (req, res) => {
    res.send("Il server backend è attivo!");
});

// Rotta per cron-job (serve per svegliare il server)
app.get('/reset-giornaliero-segreto-capibara-99', async (req, res) => {
    // Non serve rimettere deleteMany qui perché lo fa già la funzione sopra all'avvio
    // Ma lo lasciamo per sicurezza se il server fosse già sveglio da ore
    try {
        const oggi = new Date().toISOString().split('T')[0];
        const checkReset = await LastReset.findOne({ data: oggi });
        
        if (!checkReset) {
            await Task.deleteMany({});
            await LastReset.deleteMany({});
            await new LastReset({ data: oggi }).save();
        }
        
        res.status(200).send("Il Capibara conferma: tutto pulito!");
    } catch (error) {
        res.status(500).send("Errore nel reset.");
    }
});

// --- AVVIO SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server attivo sulla porta ${PORT}`);
});