const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(req.body)
        cb(null, 'C:/Users/hp-u/Desktop/intern-1/frontend/public/images');
    },

    filename: (req, file, cb) => {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, file.fieldname + '-' + Date.now()+ '.' +extension)
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|JPG|PNG|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter}).single("image");
module.exports = upload;
