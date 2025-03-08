const Promise = require('promise'); // Ensure this line is correct
const {Canvas,Image}=require('canvas')
const faceapi=require('face-api.js')

//Load models

const MODEL_PATH='/models';
faceapi.env.monkeyPatch({Canvas,Image});

async function loadModels(){
    const manifest = JSON.parse(fs.readFileSync(`${MODEL_PATH}/face_recognition_model-weights_manifest.json`, 'utf8'));
    await faceapi.nets.ssdMobilenetv1()
}