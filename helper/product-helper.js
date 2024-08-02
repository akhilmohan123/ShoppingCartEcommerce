
const { resolve } = require("promise");
var db=require("../config/connection")

var objectId=require("mongodb").ObjectId;
module.exports={
    addProduct:(product,callback)=>{
       
        db.get().collection('products').insertOne(product).then((data)=>{
         
           callback(data.insertedId.toString())
        })
    }
    ,getAllproduct:()=>{
        return new Promise(async( resolve,reject)=>{
             let product= await  db.get().collection('products').find().toArray()
             resolve(product)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            
            db.get().collection('products').deleteOne({_id:new objectId(proId)}).then((response)=>{
               resolve(response)
            })
        })
    },
    getproduct:(proid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('products').findOne({_id:new objectId(proid)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proid,product)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('products').updateOne({_id:new objectId(proid)},{
                $set:{
                    Name:product.Name,
                    Category:product.Category,
                    Price:product.Price,
                    Description:product.Description
                }
            }).then((r)=>{
                resolve()
            })
        })
    }   ,
    signupadmin:(userdata)=>{
        return new Promise(async(resolve,reject)=>{
            userdata.Password=await bcrypt.hash(userdata.Password,10)
            db.get().collection('admin').insertOne(userdata).then((data)=>{
            resolve(data.insertedId)
        })})
                
    },
    signuplogin:(userdata)=>{
        let response={}
        let loginstatus=false
        return new Promise(async(resolve,reject)=>{
            
            let user=await db.get().collection('admin').findOne({Email:userdata.Email})
            if(user){
                bcrypt.compare(userdata.Password,user.Password).then((status)=>{
                 if(status){
                     console.log("logged")
                     response.admin=admin
                     response.admin.status=status
                     resolve(response)
                 }else{
                    console.log("failed")
                    resolve({status:false})
                 }
                 
                
                })
                
            }else{
                console.log("failed")
                resolve({status:false})
            }
        })
    },
    }
