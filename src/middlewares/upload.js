const multer = require('multer');

const uniqueFilename = (prefix) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    return prefix + '-' + uniqueSuffix;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, uniqueFilename(file.fieldname));
    }
})

const upload = multer({ storage: storage });

module.exports = { upload, uniqueFilename };