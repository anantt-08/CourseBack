const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const key = require("../../config/keys").secret;
const User = require("../../model/User");
var nodemailer = require("nodemailer");
const Joi = require('joi');
var authenticate = require("./authenticate");

router.post("/register",authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    const schema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(30)
        .required(),   
    mobile:Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required(),        
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    birth:Joi.string(),
    description: Joi.string()
         .required(),
    courseid:Joi.string()
         .required(),
    batchname:Joi.string()
        .required(),
    batchid:Joi.string()             
    .required() 
})
req.body.password=  (Math.floor(Math.random() * 9000) + 1000).toString();
    let { name,mobile,birth, email,description,password,courseid,coursename,batchname,batchid} = req.body;
    let result=schema.validate({ name: name,mobile:mobile,courseid:courseid,description:description,
        batchname:batchname,birth:birth,email:email,batchid:batchid});

    if(result.error){
        //console.log(result.error)
       return res.status(400).json({
                msg:result.error.details[0].message,
            });
    }
    User.findOne({
        email: email,
    }).then((user) => {
        if (user) {
            return res.status(400).json({
                msg:
                    "Email is already registred.",
            });
        }
        else{
            var transporter = nodemailer.createTransport({
                service: "gmail",
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "rambaghcolonyy@gmail.com", // generated ethereal user
                    pass: "Rambagh@123", // generated ethereal password
                },
                 tls:{
            rejectUnauthorized:false
        }
            });
            var mailOptions = {
                from: "rambaghcolonyy@gmail.com",
                to: req.body.email,
                subject: "Successfully Registered",
                html:
                    `<h1 style='font-family:verdana;color:red'>You Are Now Registered!</h1>
                    <p>Hello <b>${name}</b> You can Now register With-</p>
                    <h2><i>Email: ${email} </i></h2>
                     <h2><i>Password: ${password}</i> </h2> 
                    ` 
                } 
               
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Email sent: " + info.response);
                    }
                });
        
            let newUser = new User({
                name,mobile,birth,description,
                password,
                email
            });
            newUser.courseid.push({id:courseid,name:coursename})
            newUser.batchname.push({id:batchid,name:batchname})
            // Hash the password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save().then((user) => {
                        return res.status(200).json({
                            success: true,
                            msg: "Email Send to Registered Employee!",
                        });
                    })
                     .catch((err) => next(err));
                });
        
            });
        }
    });
    //The data is valid and new we can register the user
});
router.get(
    "/userlist",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res) {
        User.find({ admin: false }, function (err, User) {
            if (err) return console.error(err);
            return res.status(200).json({
                success: true,
                msg: "Listed",
                userlist: User,
            });
        });
    }
);

router.put(
    "/changecourseid/:id",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res) {
        let batchh=req.body.batchname
        let idd=req.body.batchid
        User.findByIdAndUpdate(
            req.params.id,
            {
               courseid:req.body.courseid,
                $push: {
                  batchname: {id:idd,name:batchh}
      }
            },
            { new: true ,useFindAndModify: false},
            function (err, result) {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        msg: "Something went wrong",
                    });
                }
         return res.status(200).json({
                        success: true,
                        msg: "Updated!",
                        user: result,
                    }); 
    }    
        ); 
    } 
); 
router.get("/findnameyeah/:id",authenticate.verifyUser,
authenticate.verifyAdmin,
function (req, res) {
    User.findById(req.params.id,function(err,User){
        if (err) return  res.status(404).json({
                            success: false,
                            msg: "Batch Not Found",
                        })
                        else{
                            return res.status(200).json({
                                success: true,
                                msg: "Listed",
                                userlist: User,
                            });
                        } 
    })
})

router.put(
    "/removechangecourseid/:id",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res) {
        let batchh=req.body.batchname
        let idd=req.body.batchid
        User.findByIdAndUpdate(
            req.params.id,
            {
               courseid:req.body.courseid,
                $pull: { batchname: {id:idd,name:batchh} }
            },
            { new: true ,useFindAndModify: false},
            function (err, result) {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        msg: "Something went wrong",
                    });
                }
         return res.status(200).json({
                        success: true,
                        msg: "Updated!",
                        user: result,
                    }); 
    }    
        ); 
    } 
); 

router.put(
    "/deleteaccount/:id",
    authenticate.verifyUser,
    function (req, res) {
        User.findByIdAndUpdate(
            req.params.id,
            {
                delete: req.body.delete,
                status:false
            },
            { new: true , useFindAndModify: false},
            function (err, result) {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        msg: "Something went wrong",
                    });
                }
         return res.status(200).json({
                        success: true,
                        msg: "Permanently Deleted!",
                        user: result,
                    }); 
    }    
        ); 
    } 
); 


router.put(
    "/changestatus/:id",
    authenticate.verifyUser,
    function (req, res) {
        User.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status,
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

router.delete(
    "/allowLogin/:id",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res,next) {
         User.findByIdAndRemove(req.params.id)
          .then((result) => {
       return res.status(200).json({
                        success: true,
                        msg: "User Deleted Successfully",
                        user: result,
                    });
    }, (err) => next(err))
    .catch((err) => {
         return res.status(400).json({
                        success: false,
                        msg: "Something went wrong",
                    });

    });
    }
);

router.post("/login", (req, res) => {
    User.findOne({
        email: req.body.email,
    }).then((user) => {
        if (!user) {
            return res.status(404).json({
                user: user,
                msg: "Username is not found.",
                success: false,
            });
        }
        if(!user.status && !user.delete){
            return res.status(401).json({
                user: user,
                msg: "Account Deleted Permanently!",
                success: false
            })
        }
        if(!user.status && user.delete){
            return res.status(401).json({
                user: user,
                msg: "Account Blocked Contact Admin!",
                success: false
            })
        }
        bcrypt.compare(req.body.password, user.password).then((isMatch) => {
            if (isMatch) {
                // User's password is correct and we need to send the JSON Token for that user
                const payload = {
                    _id: user._id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                };
                jwt.sign(
                    payload,
                    key,
                    {
                        expiresIn: 404800,
                    },
                    (err, token) => {
                        res.status(200).json({
                            success: true,
                            token: `Bearer ${token}`,
                            user: user,
                            msg: "Hurry! You are now logged in.",
                        });
                    }
                );
            } else {
                return res.status(404).json({
                    msg: "Incorrect password.",
                    success: false,
                });
            }
        });
    });
});

router.get("/profile", authenticate.verifyUser, (req, res) => {
    return res.json({
        user: req.user,
    });
});

router.get(
    "/find/:result",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res) {
        User.findById(req.params.result, function (err, User) {
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


router.post("/reset", function (req, res) {
    User.findOne({ email: req.body.email }, function (error, userData) {
        if (userData == null) {
            return res.status(404).json({
                success: false,
                msg: "Email is not register",
            });
        }

        var transporter = nodemailer.createTransport({
            service: "gmail",
            secure: false, // true for 465, false for other ports
            auth: {
                user: "rambaghcolonyy@gmail.com", // generated ethereal user
                pass: "Rambagh@123", // generated ethereal password
            },
             tls:{
        rejectUnauthorized:false
    }
        });
        var currentDateTime = new Date();
        var mailOptions = {
            from: "rambaghcolonyy@gmail.com",
            to: req.body.email,
            subject: "Password Reset",
            html:
                "<h1 style='font-family:verdana;color:red'>Welcome To Security Password RESET !</h1><p>\
            <h3>hellow <img src='cid:unique@nodemailer.com' />" + 
                userData.name +
                "</h3>\
            If You are requested to reset your password then click on below link<br/>\
            <a href='http://localhost:3000/change-password/" +
                currentDateTime +
                "+++" +
                userData.email +
                "'>Click On This Link</a>\
             </p>"
            } 
       
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
                User.updateOne(
                    { email: userData.email },
                    {
                        token: currentDateTime,
                    },
                    { multi: true },
                    function (err, affected, resp) {
                        return res.status(200).json({
                            success: false,
                            msg: info.response,
                            userlist: resp,
                        });
                    }
                );
            }
        });
    });
});
router.delete(
    "/allowLogin/:id",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res,next) {
         User.findByIdAndRemove(req.params.id)
          .then((result) => {
       return res.status(200).json({
                        success: true,
                        msg: "User Deleted Successfully",
                        user: result,
                    });
    }, (err) => next(err))
    .catch((err) => {
         return res.status(400).json({
                        success: false,
                        msg: "Something went wrong",
                    });

    });
    }
);
router.get(
    "/userlist",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res) {
        User.find({ admin: false }, function (err, User) {
            if (err) return console.error(err);
            return res.status(200).json({
                success: true,
                msg: "Listed",
                userlist: User,
            });
        });
    }
);

router.put("/update", function (req, res) {
    User.findById(req.body._id, function (err, userData) {
        bcrypt
            .compare(req.body.currentPassword, userData.password)
            .then((isMatch) => {
                if (isMatch) {
                    if (req.body.password) {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(
                                req.body.password,
                                salt,
                                (err, hash) => {
                                    if (err) throw err;
                                    hasedPassword = hash;
                                    User.findOne({
                                        email: req.body.email,
                                    }).then((user) => {
                                        if (user) {
                                            return res.status(400).json({
                                                msg:
                                                    "Email is already registred.",
                                            });
                                        }
                                        else{
                                            let condition = { _id: req.body._id };
                                            let dataForUpdate = {
                                                name: req.body.name,
                                                email: req.body.email,
                                                mobile:req.body.mobile,
                                                description:req.body.description,
                                                password: hasedPassword,
                                                updatedDate: new Date(),
                                            };
                                            User.findOneAndUpdate(
                                                condition,
                                                dataForUpdate,
                                                { new: true, useFindAndModify: false },
                                                function (err, updatedUser) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                    if (!updatedUser) {
                                                        return res.status(404).json({
                                                            msg: "User Not Found.",
                                                            success: false,
                                                        });
                                                    }
                                                    return res.status(200).json({
                                                        success: true,
                                                        msg:
                                                            "User Successfully Updated",
                                                        updatedData: updatedUser,
                                                    });
                                                }
                                            );
                                        }
                                    });
                                    
                                }
                            );
                        });
                    } else {
                        let condition = { _id: req.body._id };
                        User.findOne({
                            email: req.body.email,
                        }).then((user) => {
                            if (user) {
                                return res.status(400).json({
                                    msg:
                                        "Email is already registred.",
                                });
                            }
                            else{
                                let dataForUpdate = {
                                    name: req.body.name,
                                    email: req.body.email,
                                       mobile:req.body.mobile,
                                                description:req.body.description,
                                    updatedDate: new Date(),
                                };
                                User.findOneAndUpdate(
                                    condition,
                                    dataForUpdate,
                                    { new: true , useFindAndModify: false},
                                    function (err, updatedUser) {
                                        if (err) {
                                            console.log(err)
                                        }
                                        if (!updatedUser) {
                                            return res.status(404).json({
                                                msg: "User Not Found.",
                                                success: false,
                                            });
                                        }
                                        return res.status(200).json({
                                            success: true,
                                            msg: "User Successfully Updated",
                                            updatedData: updatedUser,
                                        });
                                    }
                                );
                            }
                        });

                    }
                } else {
                    return res.status(400).json({
                        msg: "Incorrect password.",
                        success: false,
                    });
                }
            });
    });
});
router.put("/updae", function (req, res) {
    User.findById(req.body._id, function (err, userData) {
        bcrypt
            .compare(req.body.currentPassword, userData.password)
            .then((isMatch) => {
                if (isMatch) {
                    if (req.body.password) {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(
                                req.body.password,
                                salt,
                                (err, hash) => {
                                    if (err) throw err;
                                    hasedPassword = hash;
                                            let condition = { _id: req.body._id };
                                            let dataForUpdate = {
                                                name: req.body.name,
                                                mobile:req.body.mobile,
                                                description:req.body.description,
                                                password: hasedPassword,
                                                updatedDate: new Date(),
                                            };
                                            User.findOneAndUpdate(
                                                condition,
                                                dataForUpdate,
                                                { new: true, useFindAndModify: false },
                                                function (err, updatedUser) {
                                                    if (err) {
                                                        console.log(err)
                                                    }
                                                    if (!updatedUser) {
                                                        return res.status(404).json({
                                                            msg: "User Not Found.",
                                                            success: false,
                                                        });
                                                    }
                                                    return res.status(200).json({
                                                        success: true,
                                                        msg:
                                                            "User Successfully Updated",
                                                        updatedData: updatedUser,
                                                    });
                                                }
                                            );
                                      
                                }
                            );
                        });
                    } else {
                        let condition = { _id: req.body._id };
                                let dataForUpdate = {
                                    name: req.body.name,
                                       mobile:req.body.mobile,
                                                description:req.body.description,
                                    updatedDate: new Date(),
                                };
                                User.findOneAndUpdate(
                                    condition,
                                    dataForUpdate,
                                    { new: true , useFindAndModify: false},
                                    function (err, updatedUser) {
                                        if (err) {
                                            console.log(err)
                                        }
                                        if (!updatedUser) {
                                            return res.status(404).json({
                                                msg: "User Not Found.",
                                                success: false,
                                            });
                                        }
                                        return res.status(200).json({
                                            success: true,
                                            msg: "User Successfully Updated",
                                            updatedData: updatedUser,
                                        });
                                    }
                                );
                    }
                } else {
                    return res.status(400).json({
                        msg: "Incorrect password.",
                        success: false,
                    });
                }
            });
    });
});

router.post("/updatePass", function (req, res) {
    const schema = Joi.object({   
        password:Joi.string()
        .min(4)
        .max(20)
        .required(),        
        confirm_password: Joi.string()
             .required()
    })
    let { email,password,confirm_password} = req.body;
        let result=schema.validate({ password:password,confirm_password:confirm_password});
        if(result.error){
            //console.log(result.error)
           return res.status(400).json({
                    msg:result.error.details[0].message,
                });
        }
    User.findOne({ email: req.body.email }, function (errorFind, userData) {
        if (
            req.body.password === req.body.confirm_password
        ) {
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) throw err;
                    let newPassword = hash;
                    let condition = { _id: userData._id };
                    let dataForUpdate = {
                        password: newPassword,
                        canlogin:true,
                        updatedDate: new Date(),
                    };
                    User.findOneAndUpdate(
                        condition,
                        dataForUpdate,
                        { new: true,useFindAndModify: false },
                        function (error, updatedUser) {
                            if (error) {
                                if (
                                    err.name === "MongoError" &&
                                    error.code === 11000
                                ) {
                                    return res
                                        .status(500)
                                        .json({
                                            msg: "Mongo Db Error",
                                            error: error.message,
                                        });
                                } else {
                                    return res
                                        .status(500)
                                        .json({
                                            msg: "Unknown Server Error",
                                            error:
                                                "Unknow server error when updating User",
                                        });
                                }
                            } else {
                                if (!updatedUser) {
                                    return res.status(404).json({
                                        msg: "User Not Found.",
                                        success: false,
                                    });
                                } else {
                                    return res.status(200).json({
                                        success: true,
                                        msg:
                                            "Your password are Successfully Updated",
                                        updatedData: updatedUser,
                                    });
                                }
                            }
                        }
                    );
                });
            });
        }
        if (errorFind) {
            return res.status(401).json({
                msg: "Something Went Wrong",
                success: false,
            });
        }
    });
});
router.post("/updatePassword", function (req, res) {
    User.findOne({ email: req.body.email }, function (errorFind, userData) {
        if (
            userData.token == req.body.linkDate &&
            req.body.password == req.body.confirm_password
        ) {
            bcrypt.genSalt(10, (errB, salt) => {
                bcrypt.hash(req.body.password, salt, (err, hash) => {
                    if (err) throw err;
                    let newPassword = hash;
                    let condition = { _id: userData._id };
                    let dataForUpdate = {
                        password: newPassword,
                        updatedDate: new Date(),
                    };
                    User.findOneAndUpdate(
                        condition,
                        dataForUpdate,
                        { new: true , useFindAndModify: false},
                        function (error, updatedUser) {
                            if (error) {
                                if (
                                    err.name === "MongoError" &&
                                    error.code === 11000
                                ) {
                                    return res
                                        .status(500)
                                        .json({
                                            msg: "Mongo Db Error",
                                            error: error.message,
                                        });
                                } else {
                                    return res
                                        .status(500)
                                        .json({
                                            msg: "Unknown Server Error",
                                            error:
                                                "Unknow server error when updating User",
                                        });
                                }
                            } else {
                                if (!updatedUser) {
                                    return res.status(404).json({
                                        msg: "User Not Found.",
                                        success: false,
                                    });
                                } else {
                                    return res.status(200).json({
                                        success: true,
                                        msg:
                                            "Your password are Successfully Updated",
                                        updatedData: updatedUser,
                                    });
                                }
                            }
                        }
                    );
                });
            });
        }
        if (errorFind) {
            return res.status(401).json({
                msg: "Something Went Wrong",
                success: false,
            });
        }
    });
});
module.exports = router;
