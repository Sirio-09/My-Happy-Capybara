const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Utente = require("../models/Utente");

// GET /utenti/profilo - route protetta
router.get("/profilo", authMiddleware, async (req, res) => {
    try {
        const utente = await Utente.findById(req.utente.id).select("-password");
        res.json(utente);

    } catch(err) {
        res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});

module.exports = router;