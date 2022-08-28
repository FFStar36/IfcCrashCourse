const IfcModel = require('../dbModels/ifcModel');

module.exports.renderNewForm = (req, res) => {
    res.render('ifcModel/new');
}

module.exports.renderModel = (req, res) => {
    res.render('');
}

module.exports.createIfcModel = async (req, res) => {
    let date = new Date()
    const ifcModel = new IfcModel(req.body.ifcModel)
    ifcModel.author = req.user._id;
    ifcModel.uploadID = req.file.filename;
    ifcModel.date = date.toString()
    await ifcModel.save()

    res.redirect(`ifcModel/${ifcModel._id}`)
}


module.exports.showLastIfcModel = async (req, res) => {
    const ifcModel = await IfcModel.findOne({author: req.user._id}).sort({date: -1})

    if (!ifcModel) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/');
    }
    res.render('ifcModel/ifcRender', { ifcModel });
}

module.exports.showIfcModel = async (req, res) => {
    let date = new Date()

    const ifcModel = await IfcModel.findByIdAndUpdate(req.params.id,
        {
            date: date.toString()
        })

    if (!ifcModel) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/');
    }
    res.render('ifcModel/ifcRender', { ifcModel });
}

module.exports.index = async (req, res) => {
    const ifcModel = await IfcModel.find({author: req.user._id}).sort({date: -1})
    res.render('ifcModel/index', { ifcModel })
}

module.exports.editTimetable = async (req, res) => {
    res.render('ifcModel/editTimetable')
}

