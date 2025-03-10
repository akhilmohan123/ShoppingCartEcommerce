const Promise = require('promise'); // Ensure this line is correct
const { Canvas, Image } = require('canvas');
const faceapi = require('face-api.js');
const path = require('path');
const fs = require('fs');

// Load models
function extractAgeAndGender(faceResults) {
    return faceResults.map(face => ({
        age: face.age,
        gender: face.gender
    }));
}

module.exports = {
      loadfaceapi: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("Reached API call");

                const MODEL_PATH = path.join(__dirname, '..', 'models');
                console.log("Model path is " + MODEL_PATH);
                faceapi.env.monkeyPatch({ Canvas, Image });

                // Check if model files exist
                const modelFiles = [
                    'ssdMobilenetv1', 
                    'faceLandmark68Net', 
                    'faceRecognitionNet', 
                    'ageGenderNet'
                ];
                modelFiles.forEach(model => {
                    const modelPath = path.join(MODEL_PATH, `face-api.js-${model}-weights_manifest.json`);
                    if (!fs.existsSync(modelPath)) {
                        console.error(`Model file for ${model} is missing at ${modelPath}`);
                    }
                });

                // Load models
                await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
                await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
                await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
                await faceapi.nets.ageGenderNet.loadFromDisk(MODEL_PATH);

                // Validate if the model loading was successful
                console.log("Models loaded successfully.");

                // Check if 'data' is a valid image or canvas
                if (!data) {
                    reject('No valid input data provided.');
                    return;
                }

                // Detect faces
                const detections = await faceapi.detectAllFaces(data).withFaceLandmarks().withAgeAndGender();
                console.log("Detections: ", detections);

                if (detections && detections.length > 0) {
                    const result = extractAgeAndGender(detections);
                    console.log("Extracted age and gender: ", result);
                    resolve(result);
                } else {
                    reject("No faces detected");
                }

            } catch (error) {
                console.error('Error during face API detection: ', error);
                reject(error);
            }
        });
    }
};
