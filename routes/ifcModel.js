const express = require('express');
const router = express.Router();
const ifcModel = require('../controllers/ifcModel');
const {isLoggedIn} = require('../middleware');
const upload = require("../dbModels/gridFsStorage");
const {getUploadedIFC, deleteIFC} = require("../controllers/gridFS");

router.post('/', isLoggedIn, upload.single('file'), ifcModel.createIfcModel);

router.get('/new', isLoggedIn, ifcModel.renderNewForm)

router.route('/dashboard')
    .get(isLoggedIn, ifcModel.index)

router.route('/model')
    .get(isLoggedIn, ifcModel.showLastIfcModel)

router.route('/ifc/:id')
    .get(isLoggedIn, getUploadedIFC)

router.route('/editTimetable')
    .get(isLoggedIn, ifcModel.editTimetable)

router.route('/delete/:id')
    .get(isLoggedIn, deleteIFC)



router.route('/:id')
    .get(isLoggedIn, ifcModel.showIfcModel)

module.exports = router;