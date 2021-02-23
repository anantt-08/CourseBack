const multer = require('multer');
var fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      var dir = `C:/Users/hp-u/Desktop/intern-1/frontend/src/files`;
      let extArray = file.mimetype.split("/");
      console.log(extArray)
      if(extArray[1]==="pdf"){
        cb(null,`${dir}/pdf`);
      
      }
    //   else if(extArray[1]==="vnd.openxmlformats-officedocument.presentationml.presentation"){
    //     cb(null,`${dir}/ppt`);
    //   }
      else{
        cb(null,`${dir}/program`);
      }
    },
    filename: (req, file, cb) => {
            if(file.originalname.length>6)
            cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.substr(file.originalname.length-6,file.originalname.length));
          else
            cb(null, file.fieldname + '-' + Date.now() +  '.' + file.originalname);
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(pdf|PDF|rar|RAR|zip|ZIP)$/)) {
        return cb(new Error('You can only upload RAR,PDF,PPTX Files!'), false);
    }

    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter }).array("files",3);
module.exports = upload;
