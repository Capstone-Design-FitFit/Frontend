// 키포인트 구조를 바꾸는 코드. 몸 부위를 키로 가지도록 구조 수정
export function convertStructure(keypoints){
    let keypointsConverted = {}
    keypoints.forEach(point => {
      keypointsConverted[point.name] = {...point};
      delete keypointsConverted[point.name].name;
      delete keypointsConverted[point.name].score;
      delete keypointsConverted[point.name].z;
    })
  
    return keypointsConverted
}

//동작을 벡터 형태로 전환한다. 변환된 벡터를 평행 이동하고 정규화한다.
//정규화란 벡터의 크기를 일정하게 만드는 것이다. 벡터가 같은 크기를 가지게 되어 유사도 비교가 가능하다.
export function vectorizeAndNormalize(keypoints) {
    //convertPoseToVectors를 호출하여 동작을 벡터 형태로 변환한다.
    let [vectorPoseXY, vectorPoseTransform] = convertPoseToVectors(keypoints);
    
    //scaleAndTranslate를 호출하여 벡터의 크기를 조정한다.
    vectorPoseXY = scaleAndTranslate(vectorPoseXY, vectorPoseTransform);
  
    //L2Normalization를 호출하여 벡터를 정규화한다.
    vectorPoseXY = L2Normalization(vectorPoseXY);
  
    //정규화된 벡터값과 그 벡터의 신뢰도 점수를 반환한다.
    return vectorPoseXY
}
  
  //주어진 포즈를 벡터로 변환하는 함수
function convertPoseToVectors(keypoints) {
    let vectorPoseXY = [];
  
    //x,y 좌표를 원점으로 이동시키기 위한 변수 선언 
    let translateX = Number.POSITIVE_INFINITY;
    let translateY = Number.POSITIVE_INFINITY;
  
    //키포인트들의 위치를 정규화하기 위한 변수 선언
    let scaler = Number.NEGATIVE_INFINITY;
  
    
    const bodyParts = [
      "nose", "left_eye", "right_eye", "left_ear", "right_ear", 
      "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
      "left_wrist", "right_wrist", "left_hip", "right_hip",
      "left_knee", "right_knee"
    ]
  
    //모든 키포인트의 x, y 좌표값을 vectorPoseXY에 저장한다.
    bodyParts.forEach(bodyPoint => {
      let x;
      let y;
      if (keypoints[bodyPoint]){
        x = keypoints[bodyPoint].x;
        y = keypoints[bodyPoint].y;
      } else {
        x = 0.0;
        y = 0.0;
      }
  
      vectorPoseXY.push(x, y);
      
      // translateX와 translateY는 모든 키포인트를 원점에 가깝게 이동시키기 위한 최소값을 찾는데 사용됨
      // 이를 통해 포즈의 절대적인 위치보다는 키포인트들 간의 상대적인 위치에 집중
      //벡터의 크기 조절을 위한 변환값을 계산한다.
      translateX = Math.min(translateX, x);
      translateY = Math.min(translateY, y);
      scaler = Math.max(scaler, Math.max(x, y));
  
    });
    //변환된 벡터값, 신뢰도 점수,합계를 반환한다.
    return [
      vectorPoseXY,
      [translateX / scaler, translateY / scaler, scaler]
    ]
}
  
function scaleAndTranslate(vectorPoseXY, transformValues) {
    const [transX, transY, scaler] = transformValues;
    //주어진 변환 값을 사용하여 벡터를 평행 이동시킨다.
    return vectorPoseXY.map((position, index) => {
      //평행 이동한 벡터를 반환한다.
      return (index % 2 === 0 ?
        position / scaler - transX :
        position / scaler - transY);
    });
}
  
function L2Normalization(vectorPoseXY) {
    //벡터 안에 존재하는 각 위치 값을 제곱한 다음 모두 더한다.
    let absVectorPoseXY = 0;
    vectorPoseXY.forEach(position => {
      absVectorPoseXY += Math.pow(position, 2);
    });
    //더한 값의 제곱근을 구하여 벡터를 정규화해줄 값을 구한다. 
    absVectorPoseXY = Math.sqrt(absVectorPoseXY);
    //원래 벡터를 위에서 구한 값으로 나눠 정규화한다.
    //정규화된 벡터를 반환한다.
    return vectorPoseXY.map(position => {
      return position / absVectorPoseXY;
    });
}
  
function cosineSimilarity(vectorPose1XY, vectorPose2XY) {
    let v1DotV2 = 0;
    let absV1 = 0;
    let absV2 = 0;
  
    // 두 벡터의 내적을 계산한다.
    vectorPose1XY.forEach((v1, index) => {
      const v2 = vectorPose2XY[index];
      v1DotV2 += v1 * v2;
      absV1 += v1 * v1;
      absV2 += v2 * v2;
    })
    // 각 벡터의 절대값을 계산한다.
    absV1 = Math.sqrt(absV1);
    absV2 = Math.sqrt(absV2);
    //내적을 두 벡터의 절대 값의 곱으로 나누어 코사인 유사도를 계산한다. 코사인 유사도를 반환한다.
    return v1DotV2 / (absV1 * absV2);
}
  
export function cosineDistanceMatching(vectorPose1XY, vectorPose2XY) {
    //cosineSimilarity 함수를 이용하여 두 벡터의 코사인 유사도를 계산한다.
    const cosSimilarity = cosineSimilarity(vectorPose1XY, vectorPose2XY)
    //코사인 거리를 계산하여 반환한다.
    return Math.sqrt(2 * (1 - cosSimilarity));
}