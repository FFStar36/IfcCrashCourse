const Grid = require('gridfs-stream')
const mongoose = require('mongoose');
const IfcModel = require("../dbModels/ifcModel");
const ifcModel = require("./ifcModel");
const dbUrl = 'mongodb://localhost:27017/ifc';

module.exports.getUploadedIFC = async (req, res) => {
    const conn = mongoose.createConnection(dbUrl);

    let gfs;
    conn.once('open', function () {

        let gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads'
        })

        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads');

        gfs.files.findOne({filename: req.params.id},(err,file)=> {
            const readStream = gridfsBucket.openDownloadStream(file._id);
            readStream.pipe(res);
        })
    });
}

module.exports.deleteIFC = async (req, res, next) => {
    const conn = mongoose.createConnection(dbUrl);

    let gfs;
    conn.once('open', async function () {

        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('uploads');

        let gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads'
        })

        const {id} = req.params
        const ifcModel = await IfcModel.findById(id)

        // Drop gridFS
        gfs.files.findOne({filename: ifcModel.uploadID},(err,file)=> {
            gridfsBucket.delete(file._id)
        })

        // Drop IfcModel
        await IfcModel.findByIdAndDelete(id);

        req.flash('success', 'Successfully deleted BIM Model')
        res.redirect(`/ifcModel/dashboard`)
    });
}

