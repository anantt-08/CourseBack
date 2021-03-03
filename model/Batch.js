const { string } = require('joi');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const BatchSchema = new Schema({
    coursename: {
         type: String,
         required: true
     },
     courseid:{
         type:String,
         required:true
     },
    timing:{
        type:String,
        required:true
    },
    week:{
        type:String,
        required:true
    },
    startdate:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    },
    lastdate:{
        type:String,
        default:""
    }
}
);
module.exports = Batch = mongoose.model('batches', BatchSchema);