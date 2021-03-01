const mongoose=require('mongoose');
const Schema=mongoose.Schema;
// Create the User Schema
const UserSchema = new Schema({
    name: {
         type: String,
         required: true
     },
     courseid:{
         type:[]
     }
     ,
     batchname:{
        type:[]
    }
     ,
    admin:{
        type:Boolean,
        default:false
    },
     mobile:{
         type:Number,
         default:null
     },
     canlogin:{
        type:Boolean,
        default:false
     }
     ,
    birth : {
     type: String,
     required: true
 },
 description: {
    type: String,
    required: true
},
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        min:4,
        max:20
    },
    delete:{
        type:Boolean,
        default:1
    },
    status:{
        type:Boolean,
        default:1
    },
    token:{
        type:String,
        default:''
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: null
    }
});
module.exports = User = mongoose.model('users', UserSchema);