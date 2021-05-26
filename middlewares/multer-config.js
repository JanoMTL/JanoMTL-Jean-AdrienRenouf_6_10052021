//package Multer qui permet de gérer les fichiers entrants dans les requêtes HTTP
const multer = require('multer');

// On crée un dictionnaire des types MIME pour définire le format des images
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};
// Création d'un objet de configuration pour préciser à multer où enregistrer les fichiers images et les renommer
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
         // On génère un nouveau nom avec le nom d'origine, on supprime les espaces (white space avec split) et on insère des underscores à la place
        const name = file.originalname.split('.')[0].split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + '_' + Date.now() + '.' + extension);// Genère le nom complet du fichier- Nom d'origine + numero unique + . + extension
    }
})

module.exports = multer({ storage }).single('image');