import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { vectorizeAndNormalize, cosineDistanceMatching, convertStructure } from './CosineSimilarity';

const CameraCapture = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [detector, setDetector] = useState(null);
    const [captured, setCaptured] = useState(false);
    const targetIndices = ['0', '2', '5', '7', '8', '11', '12', '13', '14', '15', '16', '23', '24', '25', '26'];
    let cosineScore = 0;

    // Example target pose data
    const targetPose = { /* Same as before */ };

    useEffect(() => {
        const loadModel = async () => {
            await tf.setBackend('webgl');
            await tf.ready();
            const model = poseDetection.SupportedModels.BlazePose;
            const detectorConfig = {
                runtime: 'tfjs',
                modelType: 'heavy',
            };
            const detector = await poseDetection.createDetector(model, detectorConfig);
            setDetector(detector);
        };
        loadModel();
    }, []);

    useEffect(() => {
        const setupCamera = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: 'environment',  // 전면 카메라: 'user'
                        },
                    });
                    if (webcamRef.current) {
                        webcamRef.current.srcObject = stream;
                        webcamRef.current.onloadedmetadata = () => {
                            webcamRef.current.play();
                        };
                    }
                } catch (error) {
                    alert('카메라 접근 권한을 허용해주세요.');
                }
            } else {
                alert('이 브라우저는 카메라를 지원하지 않습니다.');
            }
        };

        setupCamera();
    }, []);

    useEffect(() => {
        const detectPose = async () => {
            if (
                webcamRef.current &&
                webcamRef.current.readyState === 4 &&
                detector
            ) {
                const video = webcamRef.current;
                const poses = await detector.estimatePoses(video);
                if (poses && poses.length > 0) {
                    const pose = poses[0];
                    const userPose = convertStructure(pose.keypoints);
                    const userPoseVector = vectorizeAndNormalize(userPose);
                    const targetPoseVector = vectorizeAndNormalize(targetPose);
                    cosineScore = 1 - cosineDistanceMatching(userPoseVector, targetPoseVector);
                    drawCanvas(pose, video, video.videoWidth, video.videoHeight, canvasRef);

                    if (cosineScore >= 0.9 && !captured) {
                        setCaptured(true);
                        captureAndSendImage();
                    }
                }
            }
        };
        const interval = setInterval(detectPose, 100);
        return () => clearInterval(interval);
    }, [detector, captured]);

    const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
        const ctx = canvas.current.getContext('2d');
        canvas.current.width = videoWidth;
        canvas.current.height = videoHeight;

        ctx.clearRect(0, 0, videoWidth, videoHeight);
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

        if (pose) {
            targetIndices.forEach(index => {
                const keypoint = pose.keypoints[index];
                if (keypoint) {
                    const { x, y, score } = keypoint;
                    if (score > 0.8) {
                        ctx.beginPath();
                        ctx.arc(x, y, 5, 0, 2 * Math.PI);
                        ctx.fillStyle = cosineScore > 0.9 ? 'green' : 'red';
                        ctx.fill();
                    }
                }
            });
        }
    };

    const captureAndSendImage = async () => {
        const canvas = canvasRef.current;
        const image = canvas.toDataURL('image/png');
        const blob = await (await fetch(image)).blob();
        const formData = new FormData();
        formData.append('file', blob, 'pose_capture.png');
        formData.append('userID', 'jinsoo9123');

        try {
            const response = await fetch('http://localhost:8000/api/send_capture_image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Image successfully sent to the server!');
            } else {
                alert('Failed to send image to the server.');
            }
        } catch (error) {
            alert('Error sending image to the server:', error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <video
                ref={webcamRef}
                style={{ display: 'none' }}
                autoPlay
                playsInline
                muted
                width="640"
                height="480"
            />
            <canvas ref={canvasRef} style={{ width: '100%', maxWidth: '768px', height: 'auto' }} />
        </div>
    );
};

export default CameraCapture;
