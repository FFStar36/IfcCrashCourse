const express = require('express');
const router = express.Router();
const ifcModel = require('../controllers/ifcModel');
const { isLoggedIn} = require('../middleware');

// app.get('/ifcModel', (req, res) => {
//     // es fehlt ID zum bearbeiten etc. Eigentlich /:id/edit
//     res.render('module/model')
// });

router.post('/',isLoggedIn, ifcModel.createIfcModel)

router.get('/new', isLoggedIn, ifcModel.renderNewForm)

router.route('/dashboard')
    .get(isLoggedIn, ifcModel.index)

router.route('/:id')
    .get(isLoggedIn, ifcModel.showIfcModel)


module.exports = router;