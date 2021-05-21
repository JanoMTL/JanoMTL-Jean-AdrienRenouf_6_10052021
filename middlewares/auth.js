const jsonwebtoken = require('jsonwebtoken');


module.exports = (req, res, next) => {
    try {
        const token = req.session.token; 
        const decodedToken = jsonwebtoken.verify(token, 'Secret_token');
        const userId = decodedToken.userId;
        if (req.body.userId && req.body.userId !== userId) {
            console.log("User ID non valable");
            throw "User ID non valable";  
        } else {
            next();
        }
    } catch (error) {
        res.status(401).json({ error: error | 'Requête non authentifiée' });
    }
}