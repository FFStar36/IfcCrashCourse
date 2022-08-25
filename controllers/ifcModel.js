const IfcModel = require('../dbModels/ifcModel');

// module.exports.index = async (req, res) => {
//     const ifcModel = await IfcModel.find({}).populate('popupText');
//     res.render('ifcModel/index', { ifcModel })
// }

module.exports.renderNewForm = (req, res) => {
    res.render('ifcModel/new');
}

module.exports.renderModel = (req, res) => {
    res.render('');
}

module.exports.createIfcModel = async (req, res, next) => {
    const ifcModel = new IfcModel(req.body.ifcModel);
    ifcModel.author = req.user._id;
    await ifcModel.save()
    res.redirect(`ifcModel/${ifcModel._id}`)
}

module.exports.showIfcModel = async (req, res) => {
    const ifcModel = await IfcModel.findById(req.params.id)
    //     .populate({
    //     path: 'reviews',
    //     populate: {
    //         path: 'author'
    //     }
    // }).populate('author');
    if (!ifcModel) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/');
    }
    res.render('ifcModel/ifcRender', { ifcModel });
}

module.exports.index = async (req, res) => {
    const ifcModel = await IfcModel.find({})
    res.render('ifcModel/index', { ifcModel })
}