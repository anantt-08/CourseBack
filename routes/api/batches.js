const express = require("express");
const router = express.Router();
const Batch = require("../../model/Batch");
var authenticate = require("./authenticate");
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: false
}));
const Joi = require('joi');
router.use(bodyParser.json());


router.get(
    "/find",
    authenticate.verifyUser,
    function (req, res) {
        Batch.find(
            {}, function (err, User) {
                if (err) return console.error(err);
                return res.status(200).json({
                    success: true,
                    msg: "Listed",
                    userlist: User,
                });
            }).sort( { "coursename": 1 } );
    }
);
router.get(
    "/find/:id",
    authenticate.verifyUser,
    function (req, res) {
        Batch.find({courseid:req.params.id})
        .then((result) => {
     return res.status(200).json({
                      success: true,
                      msg: `Success`,
                      user: result,
                  });
        }).catch((err)=>{
            console.log(err)
        })
    }
);

router.delete(
    "/deletebatch/:id",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res,next) {
         Batch.findByIdAndRemove(req.params.id)
          .then((result) => {
       return res.status(200).json({
                        success: true,
                        msg: `Batch  Deleted Successfully`,
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

router.put("/editbatch/:id",authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
    Batch.findByIdAndUpdate(req.params.id, {
            coursename: req.body.coursename,
            timing: req.body.timing,
            week:req.body.week,
            startdate:req.body.startdate,
            courseid:req.body.courseid       
    }, { new: true })
    .then((result) => {
        return res.status(200).json({
            success: true,
            msg: "Batch Successfully Updated",
            user: result,
        });
    }
    //for error handling of this
    , (err) => next(err))
    .catch((err) => next(err));
})

router.post("/batch",authenticate.verifyUser,authenticate.verifyAdmin,(req, res) => { 
    const schema = Joi.object({
        coursename: Joi.string()
            .required(),   
        timing:  Joi.string()
        .required(), 
        week: Joi.string()
             .required(),
        startdate:Joi.string()
             .required(),
        courseid:Joi.string()          
    })
        let { coursename,timing,week, startdate,courseid} = req.body;
        let result=schema.validate({coursename:coursename,courseid:courseid,timing:timing,week:week, startdate:startdate});
    
        if(result.error){
           return res.status(400).json({
                    msg:result.error.details[0].message,
                });
        }
    Batch.create({
        coursename,courseid,timing,week, startdate
    })
    .then((user) => {
                //console.log(user)
                return res.status(200).json({
                    success: true,
                    msg: "Batch Added Succesfully!",
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


module.exports = router;
