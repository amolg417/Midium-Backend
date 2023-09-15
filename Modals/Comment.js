let mongoose=require('mongoose');

let commentSchema=mongoose.Schema({
    Description:{type:String},
    CreatedAt:{type:Number},
    User:{type:mongoose.Types.ObjectId,ref:"Users"},
    PostId:{type:mongoose.Types.ObjectId,ref:"Blogs"}
})

let commentModal=mongoose.model("Comments",commentSchema)

module.exports=commentModal