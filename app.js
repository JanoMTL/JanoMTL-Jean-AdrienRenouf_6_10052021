const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const session = require('express-session');

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

// Connexion à la base de données
mongoose.connect('mongodb+srv://JanoMTL:Boucasse05@cluster0.dlaf8.mongodb.net/API-Piquante?retryWrites=true&w=majority',
    { useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

// Lancement de Express
const app = express();

// Configuration cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
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
// Utilisation de la session pour stocker de manière persistante le JWT coté front
app.use(session({ 
  secret: 'secret_option', 
  cookie: { maxAge: 900000 },// cookie stocké pendant 15 min
  resave: false,
  saveUninitialized: false,


})) 



app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use(express.static(path.join(__dirname, 'images')));

module.exports = app;