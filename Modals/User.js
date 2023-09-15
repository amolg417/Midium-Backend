let mongoose=require('mongoose');

let userSchema=mongoose.Schema({
    Name:{type:String},
    Email:{type:String,required:true,unique:true},
    Password:{type:String,required:true},
    Profile:{type:String}
})

let UserModal=mongoose.model("Users",userSchema)
module.exports=UserModal