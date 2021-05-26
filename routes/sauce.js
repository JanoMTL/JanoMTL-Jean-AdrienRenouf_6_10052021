const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer-config');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const sauceCtrl = require('../controllers/sauce');


router.get('/', auth, sauceCtrl.getAllSauce);
router.get('/:id', auth, validate.id, sauceCtrl.getOneSauce);
router.post('/', auth,  multer, validate.sauce, sauceCtrl.createSauce);
router.put('/:id', auth,  multer, validate.id, sauceCtrl.modifySauce);
router.delete('/:id', auth, validate.id, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, validate.id, validate.like, sauceCtrl.likeSauce);

module.exports = router;