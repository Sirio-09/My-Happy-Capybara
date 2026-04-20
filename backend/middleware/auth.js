const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if(!token) return res.status(401).json({ messaggio: "Accesso negato, token mancante" });

    try {
        const secret = process.env.JWT_SECRET || "MiaChiaveSegretaSuperDifficile123";
        const verificato = jwt.verify(token, secret);
        req.utente = verificato;
        next();

    } catch(err) {
        res.status(401).json({ messaggio: "Token non valido", errore: err.message });
    }
};