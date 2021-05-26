
// plugin bcrypt pour hasher le mot de passe des utilisateurs
const bcrypt = require('bcrypt');
//package jsonwebtoken pour attribuer un token à un utilisateur au moment ou il se connecte
const jsonwebtoken = require('jsonwebtoken');
// Plugin CryptoJS pour le cryptage de l'email, méthode 'HmacSHA256' SANS salage (pour pouvoir ensuite rechercher l'utilisateur simplement lors du login)
const cryptojs = require('crypto-js');

const User = require('../models/user');


exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: cryptojs.HmacSHA256(req.body.email, process.env.SECRET_EMAIL).toString(), 
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    const cryptedResearchedEmail = cryptojs.HmacSHA256(req.body.email, process.env.SECRET_EMAIL).toString();
    User.findOne( { email: cryptedResearchedEmail })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'Identifiant invalide' })
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(404).json({ error: 'Identifiant invalide' })
                    }
                    const newToken = jsonwebtoken.sign(
                        { userId: user._id },
                        process.env.SECRET_TOKEN,
                        { expiresIn: '60s' }
                    );
                    req.session.token = newToken; // envoi du token en session 
                    res.status(200).json({
                        userId: user._id,
                        token: newToken  
                    })
                })
        })
        .catch(error => res.status(500).json({ error }));
};