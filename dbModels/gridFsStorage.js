const crypto = require("crypto")
const multer = require("multer")
const {GridFsStorage} = require("multer-gridfs-storage")
const path = require("path");

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/ifc'
// Storage Obj

const storage = new GridFsStorage({
    url: dbUrl,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });
module.exports = upload