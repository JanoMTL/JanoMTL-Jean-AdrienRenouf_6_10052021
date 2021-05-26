const Sauce = require('../models/sauce');

// Récupération du module 'file system' de Node permettant de gérer ici les téléchargements et modifications d'images
const fs = require('fs');

/**----- Afficher toutes les Sauces ------*/
exports.getAllSauce = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(404).json({ error }));
};

/**-------Afficher la sauce demandée----------*/
exports.getOneSauce = (req, res, next) => {
    if (!req.params.id){
        res.status(400).json({ message: 'bad request'})
    }

    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if(sauce==null){
                return res.status(404).json({ message: 'ressource inexistante'})
            }
            res.status(200).json(sauce)
            
        })
        .catch(error => res.status(500).json({ error }));
};

/**--------------créer un nouvelle sauce------------*/
exports.createSauce = (req, res, next) => {
    if (!req.body.sauce){
        res.status(400).json({ message: 'bad request'})
    }
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
        .catch(error => {
            console.log(json({ error }));
            res.status(404).json({ error });
        });
};

/**-----------------Modifier une Sauce existante-----------------*/
exports.modifySauce = (req, res, next) => {
    if (req.file) {
        /** si l'image est modifiée,  suppression de l'ancienne image dans le dossier /image*/
        if (!req.params.id){
            res.status(404).json({ message: 'bad request'})
        }
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    /** mise à jour des autres caractéristiques de la sauce modifiée*/
                    const sauceObject = {
                        ...JSON.parse(req.body.sauce),
                        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                    }
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                        .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                        .catch(error => res.status(400).json({ error }));
                })
            })
            .catch(error => res.status(500).json({ error }));
    } else {
        /** Si il l'image n'est pas modifiée */
        const sauceObject = { ...req.body };
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
            .catch(error => res.status(400).json({ error }));
    }
};

/**-----------------------Supprimer une sauce existante--------------------*/
exports.deleteSauce = (req, res, next) => {
    if (!req.params.id){
        res.status(400).json({ message: 'bad request'})
    }
        Sauce.findOne({ _id: req.params.id })
        
        .then(sauce => {
            if(sauce==null){
                return res.status(404).json({ message: 'ressource inexistante'})
            }
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprimée'}))
                    .catch(error => res.status(400).json({ error }));
            })
        })
        .catch(error => res.status(500).json({ error }));
};

/**------------Aimer / ne pas aimer une sauce existante ------------------------ */
exports.likeSauce = (req, res, next) => {
    if (!req.params.id){
        res.status(400).json({ message: 'bad request'})
    }
    const userId = req.body.userId;
    const like = req.body.like;
    const sauceId = req.params.id;
    Sauce.findOne({ _id: sauceId })
        .then(sauce => {
            if(sauce==null){
                return res.status(404).json({ message: 'ressource inexistante'})
            }
            // nouvelles valeurs à modifier
            const newValues = {
                usersLiked: sauce.usersLiked,
                usersDisliked: sauce.usersDisliked,
                likes: 0,
                dislikes: 0
            }
            /** Situation */
            switch (like) {
                case 1:  /** Sauce aimée */
                    newValues.usersLiked.push(userId);
                    break;
                case -1:  /** Sauce non aimée */
                    newValues.usersDisliked.push(userId);
                    break;
                case 0:  /** Annulation du like / dislike */
                    if (newValues.usersLiked.includes(userId)) {
                        /** Annulation du like */
                        const index = newValues.usersLiked.indexOf(userId);
                        newValues.usersLiked.splice(index, 1);
                    } else {
                        /** annulation du dislike*/ 
                        const index = newValues.usersDisliked.indexOf(userId);
                        newValues.usersDisliked.splice(index, 1);
                    }
                    break;
            };

            /**  Calcul du nombre de likes / dislikes*/
            newValues.likes = newValues.usersLiked.length;
            newValues.dislikes = newValues.usersDisliked.length;

            /** Update du nombre de like /dislike */
            if (!req.params.id){
                res.status(400).json({ message: 'bad request'})
            }
            Sauce.updateOne({ _id: sauceId }, newValues )
            
                .then(() => res.status(200).json({ message: 'Merci pour votre avis !' }))
                .catch(error => res.status(400).json({ error }))  
        })
        .catch(error => res.status(500).json({ error }));
}