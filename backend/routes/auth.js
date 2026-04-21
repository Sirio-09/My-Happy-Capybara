const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const validator = require("email-validator");
const Utente = require("../models/Utente");

// Configurazione Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

function generaCodice() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /auth/register
router.post("/register", async (req, res) => {
    try {
        const { nome, email, password } = req.body;

        if(!nome || !email || !password) {
            return res.status(400).json({ messaggio: "Compila tutti i campi" });
        }

        // Controlla se l'email è valida
        if(!validator.validate(email)) {
            return res.status(400).json({ messaggio: "Email non valida" });
        }

        const esisteGia = await Utente.findOne({ email });
        if(esisteGia) return res.status(400).json({ messaggio: "Email già registrata" });

        const passwordHashata = await bcrypt.hash(password, 10);
        const codiceVerifica = generaCodice();

        const nuovoUtente = new Utente({ 
            nome, 
            email, 
            password: passwordHashata,
            codiceVerifica 
        });
        await nuovoUtente.save();

        // Manda email con codice
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Codice di Verifica - My Happy Capybara",
            html: `
                <h2>Benvenuto/a ${nome}!</h2>
                <p>Il tuo codice di verifica è:</p>
                <h1 style="color: #EC407A; font-size: 32px;">${codiceVerifica}</h1>
                <p>Inseriscilo nel modulo per verificare la tua email.</p>
            `
        });

        res.status(201).json({ 
            messaggio: "Utente registrato! Controlla la tua email per il codice di verifica.",
            emailPerVerifica: email
        });

    } catch(err) {
        console.error("ERRORE REGISTRAZIONE:", err);
        res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});

// POST /auth/verify
router.post("/verify", async (req, res) => {
    try {
        const { email, codice } = req.body;

        const utente = await Utente.findOne({ email });
        if(!utente) return res.status(400).json({ messaggio: "Email non trovata" });

        if(utente.codiceVerifica !== codice) {
            return res.status(400).json({ messaggio: "Codice non valido" });
        }

        utente.verificato = true;
        utente.codiceVerifica = null;
        await utente.save();

        res.json({ messaggio: "Email verificata con successo! Puoi ora fare il login." });

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

        if(!utente.verificato) {
            return res.status(400).json({ messaggio: "Email non verificata. Controlla la tua email per il codice." });
        }

        const passwordCorretta = await bcrypt.compare(password, utente.password);
        if(!passwordCorretta) {
            return res.status(400).json({ messaggio: "Email o password errati" });
        }

        const secret = process.env.JWT_SECRET || "7k9mP2qL5nW8xR3vB6jH4dF1gT9sY0uC_aE8mN5pQ2xW7jL3sD6vH9tK1rY4bF0";

        const token = jwt.sign(
            { id: utente._id, nome: utente.nome },
            secret,
            { expiresIn: "1d" }
        );

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

// POST /auth/forgot-password - Manda email con link reset
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        const utente = await Utente.findOne({ email });
        if(!utente) return res.status(400).json({ messaggio: "Email non trovata" });

        // Genera codice reset casuale
        const codiceReset = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Salva il codice e la scadenza (30 minuti)
        utente.codiceReset = codiceReset;
        utente.scadenzaReset = Date.now() + 30 * 60 * 1000;
        await utente.save();

        // Manda email con codice
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Ripristina la tua password - My Happy Capybara",
            html: `
                <h2>Ripristino Password</h2>
                <p>Hai richiesto di ripristinare la tua password.</p>
                <p>Il tuo codice di verifica è:</p>
                <h1 style="color: #EC407A; font-size: 32px;">${codiceReset}</h1>
                <p>Questo codice scade tra 30 minuti.</p>
                <p>Se non hai richiesto il ripristino, ignora questa email.</p>
            `
        });

        res.json({ messaggio: "Email inviata con il codice di ripristino" });

    } catch(err) {
        res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});

// POST /auth/reset-password - Ripristina la password
router.post("/reset-password", async (req, res) => {
    try {
        const { email, codice, nuovaPassword } = req.body;

        const utente = await Utente.findOne({ email });
        if(!utente) return res.status(400).json({ messaggio: "Email non trovata" });

        // Controlla il codice
        if(utente.codiceReset !== codice) {
            return res.status(400).json({ messaggio: "Codice non valido" });
        }

        // Controlla se il codice è scaduto
        if(Date.now() > utente.scadenzaReset) {
            return res.status(400).json({ messaggio: "Codice scaduto. Richiedi un nuovo ripristino" });
        }

        // Hashea la nuova password
        const nuovaPasswordHashata = await bcrypt.hash(nuovaPassword, 10);
        
        utente.password = nuovaPasswordHashata;
        utente.codiceReset = null;
        utente.scadenzaReset = null;
        await utente.save();

        res.json({ messaggio: "Password ripristinata con successo" });

    } catch(err) {
        res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});

module.exports = router;