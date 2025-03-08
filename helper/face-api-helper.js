const Promise = require('promise'); // Ensure this line is correct
const {Canvas,Image}=require('canvas')
const faceapi=require('face-api.js')
const path = require('path');
const fs=require('fs')
//Load models
module.exports={
loadfaceapi:async(data)=>{
    try {
        console.log("reached api call")
    const MODEL_PATH = path.join(__dirname, '..', 'models');
    console.log("path is "+MODEL_PATH);
    faceapi.env.monkeyPatch({Canvas,Image});
    const manifest=JSON.parse(fs.readFileSync(`${MODEL_PATH}/face_recognition_model-weights_manifest.json`,'utf8'));
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
    console.log("reached the end of api without any error")
    let file=data
    console.log(typeof file)
    const image=await faceapi.bufferToImage(file)

    console.log(image)
    } catch (error) {
        console.log(error)
    }
    


}
}