const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    console.log("🔍 Middleware auth chiamato");
    console.log("Authorization header:", req.header("Authorization"));
    
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token estratto:", token);

    if(!token) {
        console.log("❌ Token mancante");
        return res.status(401).json({ messaggio: "Accesso negato, token mancante" });
    }

    try {
        const secret = process.env.JWT_SECRET || "MiaChiaveSegretaSuperDifficile123";
        console.log("Secret usato:", secret === process.env.JWT_SECRET ? "da ENV" : "di default");
        
        const verificato = jwt.verify(token, secret);
        console.log("✅ Token verificato:", verificato);
        
        req.utente = verificato;
        next();

    } catch(err) {
        console.log("❌ Errore verifica token:", err.message);
        res.status(401).json({ messaggio: "Token non valido", errore: err.message });
    }
};