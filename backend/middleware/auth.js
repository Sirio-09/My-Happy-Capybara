const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    // Prende il token dall'header della richiesta
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if(!token) return res.status(401).json({ messaggio: "Accesso negato, token mancante" });

    try {
        // Verifica il token
        const verificato = jwt.verify(token, process.env.JWT_SECRET);
        req.utente = verificato;
        next();

    } catch(err) {
        res.status(401).json({ messaggio: "Token non valido" });
    }
};