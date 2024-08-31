import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { vectorizeAndNormalize, cosineDistanceMatching, convertStructure } from './CosineSimilarity';

const WebcamCapture = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [detector, setDetector] = useState(null);
    const [startCamera, setStartCamera] = useState(false);
    const [captured, setCaptured] = useState(false);
    const [clothImage, setClothImage] = useState(null);
    const clothImageRef = useRef(clothImage);

    const targetIndices = ['0', '2', '5', '7', '8', '11', '12', '13', '14', '15', '16', '23', '24', '25', '26'];
    let cosineScore = 0;

    //arms_down_average
    // 포즈 데이터들만 따로 가지고 있는 파일 하나 만들어야 할 듯
    const targetPose = {
        nose: { x: 383.14868960588115, y: 166.57613904839698 },
        right_shoulder: { x: 248.3069796284956, y: 350.9076214737701 },
        right_elbow: { x: 209.32135619718306, y: 595.7821501530924 },
        right_wrist: { x: 209.10193921616656, y: 805.4902752704634 },
        left_shoulder: { x: 518.631160542968, y: 346.0913216676873 },
        left_elbow: { x: 558.9818305776689, y: 590.4522829148806 },
        left_wrist: { x: 549.8331653806899, y: 793.8501676872833 },
        right_hip: { x: 292.66959845776734, y: 783.0465711367583 },
        right_knee: { x: 284.6468300898204, y: 984.1205370508983 },
        left_hip: { x: 470.330921254213, y: 784.9308321928302 },
        left_knee: { x: 478.2944522238164, y: 988.8775147776184 },
        right_eye: { x: 352.530296689486, y: 137.5175559670992 },
        left_eye: { x: 413.1435443387542, y: 137.19208525212235 },
        right_ear: { x: 313.4173382621787, y: 158.23918306161954 },
        left_ear: { x: 451.5738539350578, y: 156.1445775354981 }
    }; 

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
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });
                if (webcamRef.current) {
                    webcamRef.current.srcObject = stream;
                    webcamRef.current.onloadedmetadata = () => {
                        webcamRef.current.play();
                    };
                }
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
                    const pose = poses[0]; // 인식되는 포즈중 첫번째만 출력 , 포즈가 두개이면 경고창이 나오게 하면 될듯
                    const userPose = convertStructure(pose.keypoints);
                    const userPoseVector = vectorizeAndNormalize(userPose);
                    const targetPoseVector = vectorizeAndNormalize(targetPose);
                    cosineScore = 1 - cosineDistanceMatching(userPoseVector,targetPoseVector);
                    drawCanvas(pose, video, video.videoWidth, video.videoHeight, canvasRef);
                    // 캡쳐 조건 추가
                    if (cosineScore >= 0.9){
                        if (!captured){
                            setCaptured(true);
                            captureAndSendImage();
                        }
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
                    if (score > 0.8){
                        ctx.beginPath();
                        ctx.arc(x, y, 5, 0, 2 * Math.PI);
                        if (cosineScore > 0.9){
                            ctx.fillStyle = 'green';
                        } else {
                            ctx.fillStyle = 'red';
                        }
                        ctx.fill();
                    }
                }
            });
        }
    };

    useEffect(() => {
        clothImageRef.current = clothImage;  // clothImage 상태가 변경될 때마다 ref 업데이트
    }, [clothImage]);

    //TODO userID 구현
    const userID = 'jinsoo9123'

    // 이미지 캡처 및 FastAPI 전송 함수 추가
    const captureAndSendImage = async () => {
        if (!clothImageRef.current) {
            alert('Cloth image is not set');
            setCaptured(false);
            return;
        }
        
        const canvas = canvasRef.current;
        const vtonImage = canvas.toDataURL('image/png');  // 이미지 데이터 URL 생성
    
        // 이미지 전송을 위해 Data URL을 Blob으로 변환
        const blob = await (await fetch(vtonImage)).blob();  // Data URL을 Blob으로 변환
    
        const formData = new FormData();
        formData.append('garm_img', clothImageRef.current, 'garment_image.png');  // 파일 입력으로 받은 garm_img
        formData.append('vton_img', blob, 'pose_capture.png');  // 서버에 보낼 파일 설정 (Blob 형태)
    
        // FastAPI 서버로 이미지 전송
        try {
            const response = await fetch('http://localhost:8000/api/tryon', {  // 서버의 URL로 변경
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

    function handleStartCamera(){
        setStartCamera(true);
    }

    const handleClothImageChange = (e) => {
        setClothImage(e.target.files[0]);
    };

    return (
        <div>
            <input type="file" accept="image/*" onChange={handleClothImageChange} />
            <video
                ref={webcamRef}
                style={{ display: 'none' }}
                autoPlay
                playsInline
                muted
                width="640"
                height="480"
            />
            <canvas ref={canvasRef} style={{ width: '768px', height: '1024px' }} />
        </div>
    );
};

export default WebcamCapture;
