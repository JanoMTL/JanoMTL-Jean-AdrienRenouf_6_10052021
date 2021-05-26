const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
// le Plugin 'path' sert dans l'upload des images
const path = require('path');
const morgan = require('morgan');
//'helmet' protège l'application de certaines vulnérabilités (sécurisation des requêtes HTTP, sécurisation les en-têtes, contrôle la prélecture DNS du navigateur, empêche le détournement de clics
// et ajout d'une protection XSS mineure)
const helmet = require('helmet');
const session = require('express-session');

// utilisation du module 'dotenv' pour masquer les informations de connexion à la base de données à l'aide de variables d'environnement
require('dotenv').config();

// Déclaration des routes 

//route dédiée aux sauces
const sauceRoutes = require('./routes/sauce');

//route dédiée aux utilisateurs
const userRoutes = require('./routes/user');

// Connexion à la base de données
mongoose.connect(process.env.SECRET_DB,
    { useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Création d'une application express
const app = express();

// Configuration cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.SECRET_ORIGIN);
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Parse le body des requetes en json
app.use(express.json());

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
// Sécurise les headers
app.use(helmet());
// Utilisation de la session pour stocker de manière persistante le token coté front
app.use(session({ 
  secret: process.env.SECRET_SESSION, 
  resave: false,
  saveUninitialized: false,
})) 

/** ---------- Routes ------ */

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

// permet de charger les fichiers qui sont dans le repertoire images
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;