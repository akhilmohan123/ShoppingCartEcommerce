const{MongoClient}=require("mongodb")
require("dotenv").config()
const state={
    db:null,
};

const dbname="shopping";
const client=new MongoClient(process.env.DB_URL);
const connect=async(cb)=>{
    try{
        await client.connect();
        const db=client.db(dbname);
        state.db=db;
        return cb();
    }catch(err){
        return cb(err);
    }
};
const get=()=>state.db;
module.exports={
    connect,
    get,
};