const express = require("express");
const router = express.Router();
const Topic = require("../../model/Topic");
var authenticate = require("./authenticate");
const bodyParser = require('body-parser');
const upload=require("./fileupload");
const fs = require('fs');
router.use(bodyParser.urlencoded({
    extended: false
}));
const Joi = require('joi');
router.use(bodyParser.json());

router.post("/check",authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    let {topicname,batch,time,courseid} = req.body;
    const schema = Joi.object({
        topicname: Joi.string()
            .min(3)
            .max(40)
            .required(),   
        time:Joi.string()
        .required(),
        batch:Joi.string(),
           courseid:Joi.string()
     .required()  
    })
        let result=schema.validate({ topicname:topicname,time:time,batch:batch,courseid:courseid});
    
        if(result.error){
            //console.log(result.error)
           return res.status(400).json({
                    msg:result.error.details[0].message,
                });
        }
      return res.status(200).json({
          status:true
      });  

})
router.post("/topicsubmit",authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next) => {
    upload(req, res, function (error) {
        if (error) {
            console.log(error)
           return res.status(405).send(error);
        }
      
        let {topicname,batch,time,courseid,coursename} = req.body;
          let program= req.files[0].filename
          let pdf=""
          let ppt=""
         if(req.files.length==1){
             pdf=""
             ppt=""
          //   console.log("Bye")
         }
         else if(req.files.length==2){
          //  console.log("TRUE/FALSE",req.body.locate)
            if(req.body.locate==="true"){
                 pdf=req.files[1].filename
                 ppt=""
              //   console.log("YOOOO")
             }   
             else{
                ppt=req.files[1].filename
                pdf=""
              //  console.log("HURRR")
             }
          }
          else {
               pdf=req.files[1].filename
              ppt=req.files[2].filename
              //console.log("Bitch")
          }
          Topic.create({
            courseid,coursename,topicname,program,pdf,ppt,batch,time
    })
    .then((user) => {
              //  console.log(user)
                return res.status(200).json({
                    success: true,
                    msg: "Topic Added Succesfully!",
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
    "/result",
    authenticate.verifyUser,
    function (req, res) {
        Topic.find({}, function (err, User) {
            if (err) return console.error(err);
            return res.status(200).json({
                success: true,
                msg: "Listed",
                userlist: User,
            });
        });
    }
);


router.delete(
    "/result/:id",
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    function (req, res,next) {
         Topic.findByIdAndRemove(req.params.id)
          .then((result) => {
             if(result.pdf!=""){
            const path=`C:/Users/hp-u/Desktop/intern-1/frontend/src/files/pdf/${result.pdf}`
            fs.unlink(path, (err) => {
                if (err) {
                 console.error(err)
                 return
               }
               //file removed
             })	
            }
            if(result.ppt!=""){
             const pathh=`C:/Users/hp-u/Desktop/intern-1/frontend/src/files/pdf/${result.ppt}`
            fs.unlink(pathh, (err) => {
                if (err) {
                 console.error(err)
                 return
               }
               //file removed
             })	
            }
             const pathhh=`C:/Users/hp-u/Desktop/intern-1/frontend/src/files/program/${result.program}`
            fs.unlink(pathhh, (err) => {
                if (err) {
                 console.error(err)
                 return
               }
               //file removed
             })	
       return res.status(200).json({
                        success: true,
                        msg: `${result.topicname}  Deleted Successfully`,
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


router.get(
    "/batch",
    authenticate.verifyUser,
    function (req, res) {
        Topic.distinct("batch").then((user)=>{
                return res.status(200).json({
                    success: true,
                    msg: "Listed",
                    userlist: user,
                })
        }).catch((err)=>{
            console.log(err)
        })
    }
);

router.get(
    "/findbyid/:result",
    authenticate.verifyUser,
    function (req, res) {
        Topic.find({courseid:req.params.result}, function (err, User) {
            if (err) return  res.status(404).json({
                success: false,
                msg: "Topic Not Found",
            });         
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



// router.get("/coursecheck/:name",authenticate.verifyUser,authenticate.verifyAdmin,(req, res,next)=>{
//     let yo=req.params.name.toLowerCase();
//     Course.findOne({
//         name:yo,
//     }).then((user) => {
//         if (user) {
//             return res.status(400).json({
//             	success: false,
//                 msg:
//                     "Already Registered Course!",
//                 user:user    
//             });
//         }
//         else{
//             return res.status(200).json({
//             	success: true
//             });

//         }
// })
// });


// router.get(
//     "/find/:result",
//     authenticate.verifyUser,
//     authenticate.verifyAdmin,
//     function (req, res) {
//         Course.findById(req.params.result, function (err, User) {
//             if (err) return  res.status(404).json({
//                 success: false,
//                 msg: "User Not Found",
//             });     
//             if(User == null) {
//                return res.status(404).json({
//                 success: false,
//                 msg: "User Not Found",
//             });     
//             }
//             else{
//                 return res.status(200).json({
//                 success: true,
//                 msg: "Listed",
//                 userlist: User,
//             });
//             }
//         });
//     }
// );


// router.get("/unlink/:image",authenticate.verifyUser,authenticate.verifyAdmin, function (req, res) {
//     const path=`C:/Users/hp-u/Desktop/intern-1/frontend/public/images/${req.params.image}`
//     fs.unlink(path, (err) => {
//         if (err) {
//          console.error(err)
//          return
//        }
//        //file removed
//      })	
// })

// router.put(
//     '/editcourseicon/:id'
//     ,authenticate.verifyUser,authenticate.verifyAdmin, upload,
//     function (req, res) {
//         Course.findByIdAndUpdate(
//             req.params.id,
//             {
//                 image:req.file.filename
//             },
//             { new: true },
//             function (err, result) {
//                 if (err) {
//                     return res.status(400).json({
//                         success: false,
//                         msg: "Something went wrong",
//                     });
//                 }
//          return res.status(200).json({
//                         success: true,
//                         msg: "Status Updated!",
//                         user: result,
//                     }); 
//     }    
//         ); 
//     } 
// ); 

// router.put("/editcoursedetail/:id",authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) => {
//     Course.findByIdAndUpdate(req.params.id, {
//             name: req.body.name,
//             duration: req.body.duration,
//             prerequisie:req.body.prerequisie,
//             description:req.body.description       
//     }, { new: true })
//     .then((result) => {
//         return res.status(200).json({
//             success: true,
//             msg: "Course Successfully Updated",
//             user: result,
//         });
//     }
//     //for error handling of this
//     , (err) => next(err))
//     .catch((err) => next(err));
// })


module.exports = router;
