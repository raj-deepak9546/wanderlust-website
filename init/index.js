const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const initData=require("./data.js");

async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/test");
} 

main()
 .then(()=>{
    console.log("Connected to Db");
 })
 .catch((err)=>{
    console.log(err);
 })

  const initDb= async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=> ({...obj,owner:"6a7ed4033d6aac037ebb3d96"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
 }
 initDb();