const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Task = require("../models/Task");
 
router.get("/", authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ utenteId: req.utente.id });
        res.json(tasks);
    } catch(err) {
        res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});
 
router.post("/", authMiddleware, async (req, res) => {
    try {
        // ECCO LA MODIFICA: estraiamo anche la scadenza dal body della richiesta
        const { testo, scadenza } = req.body;
 
        const nuovaTask = new Task({
            utenteId: req.utente.id,
            testo,
            scadenza // ECCO LA MODIFICA: la inseriamo nella nuova task da salvare
        });
 
        await nuovaTask.save();
        res.status(201).json(nuovaTask);
 
    } catch(err) {
        res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});
 
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { completata: req.body.completata },
            { returnDocument: 'after' }
        );
        res.json(task);
 
    } catch(err) {
        res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});
 
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ messaggio: "Task eliminata" });
 
    } catch(err) {
        res.status(500).json({ messaggio: "Errore del server", errore: err.message });
    }
});
 
module.exports = router;