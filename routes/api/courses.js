const express = require("express");
const router = express.Router();
const Course = require("../../model/Course");
//const Joi = require('joi');
var authenticate = require("./authenticate");
const bodyParser = require('body-parser');
const upload=require("./multer");
const fs = require('fs');
router.use(bodyParser.urlencoded({
    extended: false
}));

// db.collection.update(
//     {},
//     [{ $set: { username: { $toLower: "$username" } } }],
//     { multi: true }
//   )
  
router.use(bodyParser.json());

router.get("/coursecheck/:name",authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next)=>{
    let yo=req.params.name.toLowerCase();
    Course.findOne({
        name:yo,
    }).then((user) => {
        if (user) {
            return res.status(400).json({
            	success: false,
                msg:
                    "Already Registered Course!",
                user:user    
            });
        }
        else{
            return res.status(200).json({
            	success: true
            });

        }
})
});

router.post("/coursesubmit",authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    upload(req, res, function (error) {
        if (error) {
            console.log(error)
           return res.status(405).send(error);
        }
        //file is getting stored into database and after it successfully stored 
    let { name,duration,prerequisie,description } = req.body;
   let image=req.file.filename
    name=name.toLowerCase();
   // console.log(image)
    Course.create({
            name,duration,prerequisie,image,description 
    })
    .then((user) => {
              //  console.log(user)
                return res.status(200).json({
                    success: true,
                    msg: "Course Added Succesfully!",
                    user:user
                });
            })
            .catch((err) => {

                return res.status(400).json({
                               success: false,
                               msg: "Something went wrong",
                           });
       
           });
});
});

router.get(
    "/findd",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res) {
        Course.find(
            {},
            { name: 1, _id: 1 }
            , function (err, User) {
                if (err) return console.error(err);
                return res.status(200).json({
                    success: true,
                    msg: "Listed",
                    userlist: User,
                });
            });
    }
);

router.get(
    "/names",
    authenticate.verifyUser,
    function (req, res) {
        Course.find(
            {},
            { name: 1, _id: 0 }
            , function (err, User) {
                if (err) return console.error(err);
                return res.status(200).json({
                    success: true,
                    msg: "Listed",
                    userlist: User,
                });
            });
    }
);
//Course.find({}).select({name:1}).then((user)=>{}).catch((err)=>{})
//Course.find({ctype:{$in:["backend","frontend"]}})
//Course.find({ctype:{$gt:50}})
//Course.find({$or : [ {} , {} ] }) //suntaxx
//Course.find({$or : [ {ctype:"backend"} , {author:"anant"} ] }) 
//Course.find({ctype:"course"}).sort({name:1}) //on the bases of name
router.get(
    "/find",
    authenticate.verifyUser,
    function (req, res) {
        Course.find({}, function (err, User) {
            if (err) return console.error(err);
            return res.status(200).json({
                success: true,
                msg: "Listed",
                userlist: User,
            });
        }).sort( { "name": 1 } );
    }
);

router.get(
    "/find/:result",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res) {
        Course.findById(req.params.result, function (err, User) {
            if (err) return  res.status(404).json({
                success: false,
                msg: "User Not Found",
            });     
            if(User == null) {
               return res.status(404).json({
                success: false,
                msg: "User Not Found",
            });     
            }
            else{
                return res.status(200).json({
                success: true,
                msg: "Listed",
                userlist: User,
            });
            }
        });
    }
);

router.delete(
    "/find/:id",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res,next) {
         Course.findByIdAndRemove(req.params.id)
          .then((result) => {
            const path=`C:/Users/hp-u/Desktop/intern-1/frontend/public/images/${result.image}`
            fs.unlink(path, (err) => {
                if (err) {
                 console.error(err)
                 return
               }
               //file removed
             })	
       return res.status(200).json({
                        success: true,
                        msg: `${result.name} Course  Deleted Successfully`,
                        user: result,
                    });
    }, (err) => next(err))
    .catch((err) => {
         return res.status(400).json({
                        success: false,
                        msg: "Something went wrong",
                    });

    });
});

router.get("/unlink/:image",authenticate.verifyUser,authenticate.verifyAdmin, function (req, res) {
    const path=`C:/Users/hp-u/Desktop/intern-1/frontend/public/images/${req.params.image}`
    fs.unlink(path, (err) => {
        if (err) {
         console.error(err)
         return
       }
       //file removed
     })	
})

router.put(
    '/editcourseicon/:id'
    ,authenticate.verifyUser,authenticate.verifyAdmin, upload,
    function (req, res) {
        Course.findByIdAndUpdate(
            req.params.id,
            {
                image:req.file.filename
            },
            { new: true },
            function (err, result) {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        msg: "Something went wrong",
                    });
                }
         return res.status(200).json({
                        success: true,
                        msg: "Status Updated!",
                        user: result,
                    }); 
    }    
        ); 
    } 
); 

router.put("/editcoursedetail/:id",authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Course.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            duration: req.body.duration,
            prerequisie:req.body.prerequisie,
            description:req.body.description       
    }, { new: true })
    .then((result) => {
        return res.status(200).json({
            success: true,
            msg: "Course Successfully Updated",
            user: result,
        });
    }
    //for error handling of this
    , (err) => next(err))
    .catch((err) => next(err));
})


module.exports = router;
