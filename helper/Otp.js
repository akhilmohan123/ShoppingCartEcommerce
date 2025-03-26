const crypto =require("crypto")
const nodemailer=require("nodemailer")


module.exports={
 
    generateotp:()=>{
        return new Promise((resolve,reject)=>{
            resolve(crypto.randomInt(10000,99999).toString())
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
                subject:'YOur Ecart Login otp',
                text:`Your otp is :${otp}`,
                html:`<p>Your OTP is :<strong>${otp}</strong></p>`
            }
            var s=await transporter.sendMail(mailOptions)
            if(s) resolve(true)
            else  reject(false)
        })
    },
    verifyOtp:(email,otp)=>{
        return new Promise(async(resolve,reject)=>{
           await db.get().collection('OTP').find({
            email:email,
            otp:otp
           }).then((res)=>{
            if(res) resolve(true)
            else reject(false)
           })
        })
    }

}