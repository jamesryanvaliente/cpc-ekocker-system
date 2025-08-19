const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile_pics/');
    },
    filename: (req, file, cb) => {
        cb(null, req.user.user_id + path.extname(file.originalname)); 
        // example: 123.jpg — using logged-in user's ID
    }
});

const upload = multer({ storage });
module.exports = upload;
