const crypto =require("crypto")
const nodemailer=require("nodemailer")
var db=require("../config/connection")
const { reject } = require("promise")


module.exports={
 
    generateotp:()=>{
        return new Promise((resolve,reject)=>{
            resolve(crypto.randomInt(100000,999999).toString())
        })
    },
    sendEmail:(email,otp)=>{
        return new Promise(async(resolve,reject)=>{
            const transporter=nodemailer.createTransport({
                service:'gmail',//your email address
                auth:{
                    user:process.env.USER_EMAIL,
                    pass:process.env.USER_PASSWORD
                }
            });
            const mailOptions={
                from:process.env.USER_EMAIL,
                to:email,
                subject:'Your Ecart Login otp',
                text:`Your otp is :${otp}`,
                html:`<p>Your OTP is :<strong>${otp}</strong></p>`
            }
            var s=await transporter.sendMail(mailOptions)
            console.log(s)
            if(s) resolve(true)
            else  reject(false)
        })
    },
    verifyOtp: (otp) => {
        return new Promise(async (resolve, reject) => {
            try {
              
                
             
    
                // Then verify the OTP for that email
                const result = await db.get().collection('Otp').findOne({
                    otp: otp.toString() // Ensure otp is string to match your collection
                });
    
                console.log('Query result:', result);
                
                if (result) {
                    let email=result.email
                
                    console.log('OTP verification successful');
                    // Delete the OTP after successful verification
                    await db.get().collection('Otp').deleteOne({ 
                        email: email,
                        otp: otp.toString() 
                    });
                    resolve(email);
                } else {
                    console.log('OTP verification failed - no matching record');
                    reject(false);
                }
            } catch (error) {
                console.error('Error in verifyOtp:', error);
                reject(false);
            }
        });
    },
    addOtp:(email)=>{
        return new Promise(async(resolve,reject)=>{

            console.log(process.env.USER_EMAIL)
            var otp= await module.exports.generateotp();
            var result= await db.get().collection("user").findOne({Email:email})
            console.log(result)
            
            if(result!=null){
                console.log("1")
                await db.get().collection("Otp").deleteOne({email:email})
                await db.get().collection("Otp").insertOne({email:email,otp:otp}).then((data)=>{
                    console.log(data)
                    module.exports.sendEmail(email,otp).then((res)=>{
                        console.log(res)
                        if(res){
                            resolve(true)
                        }else{
                            reject(false)
                        }
                    })
                }).catch((err)=>{
                    reject(false)
                })
            }else{
                console.log("No")
                reject(false)
            }
           

        })
       
    }

}