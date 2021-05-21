const express = require('express');
const router = express.Router();
const multer = require('../middlewares/multer-config');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate-inputs');
const sauceCtrl = require('../controllers/sauce');


router.get('/', sauceCtrl.getAllSauce);
router.get('/:id', validate.id, sauceCtrl.getOneSauce);
router.post('/', multer, validate.sauce, sauceCtrl.createSauce);
router.put('/:id', multer, validate.id, sauceCtrl.modifySauce);
router.delete('/:id', validate.id, sauceCtrl.deleteSauce);
router.post('/:id/like', validate.id, validate.like, sauceCtrl.likeSauce);

module.exports = router;