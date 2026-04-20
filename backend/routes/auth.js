const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Utente = require("../models/Utente");

// POST /auth/register
router.post("/register", async (req, res) => {
    try {
        const { nome, email, password } = req.body;

        const esisteGia = await Utente.findOne({ email });
        if(esisteGia) return res.status(400).json({ messaggio: "Email già registrata" });

        const passwordHashata = await bcrypt.hash(password, 10);
        const nuovoUtente = new Utente({ nome, email, password: passwordHashata });
        await nuovoUtente.save();

        res.status(201).json({ messaggio: "Utente registrato con successo!" });

    } catch(err) {
        res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});

// POST /auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const utente = await Utente.findOne({ email });
        if(!utente) {
            return res.status(400).json({ messaggio: "Email o password errati" });
        }

        const passwordCorretta = await bcrypt.compare(password, utente.password);
        if(!passwordCorretta) {
            return res.status(400).json({ messaggio: "Email o password errati" });
        }

        // Usiamo una stringa fissa come segreto per evitare errori di configurazione
        const secret = "MiaChiaveSegretaSuperDifficile123";

        const token = jwt.sign(
            { id: utente._id, nome: utente.nome },
            secret,
            { expiresIn: "1d" }
        );

        // Risposta con il nome incluso
        return res.json({ 
            messaggio: "Login effettuato!", 
            token: token, 
            nome: utente.nome 
        });

    } catch(err) {
        console.error("ERRORE LOGIN:", err);
        return res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});

module.exports = router;