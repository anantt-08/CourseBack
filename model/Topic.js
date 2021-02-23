const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const TopicSchema = new Schema({
    courseid: {
        type:String,
        required:true
     },
     coursename: {
        type:String,
        required:true
     },
    topicname:{
        type:String,
        required:true
    },
    program:{
        type:String,
        required:true
    },
    pdf:{
        type:String,
        default:""
    },
    ppt:{
        type:String,
        default:""
    },
    batch:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    }
},
 {
    timestamps: true
}
);
module.exports = Topic = mongoose.model('topics', TopicSchema);


