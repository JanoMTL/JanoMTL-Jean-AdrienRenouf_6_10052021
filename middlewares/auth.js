

const jsonWebToken = require('jsonwebtoken');

module.exports = (req,res,next) => {
    try { 
        // On récupère le token dans le header de la requête autorisation, deuxième élément du tableau (car split)
        const token = req.headers.authorization.split(" ")[1];
         // On vérifie le token décodé avec la clé secrète 
        const decodedToken = jsonWebToken.verify(token, process.env.SECRET_TOKEN);
         // On vérifie que le userId envoyé avec la requête correspond au userId encodé dans le token
        const userId = decodedToken.userId;
        // si le token ne correspond pas au userId : 
        if(req.body.userId&&req.body.userId!==userId) {
            throw "Non authentifié!";
        } else {
            // si tout est valide on passe au prochain middleware
            next();
        }
    } catch {
        res.status(401).json({error: 'Invalid request!'});
    }
}