// import React, { useState } from 'react';

// function Tryon() {
//     const [personImage, setPersonImage] = useState(null);
//     const [clothImage, setClothImage] = useState(null);
//     const [resultImage, setResultImage] = useState(null);
//     const [loading, setLoading] = useState(false);  // 로딩 상태 관리
//     const [error, setError] = useState(null);       // 오류 상태 관리

//     const handlePersonImageChange = (event) => {
//         setPersonImage(event.target.files[0]);
//     };

//     const handleClothImageChange = (event) => {
//         setClothImage(event.target.files[0]);
//     };

//     const handleSubmit = async () => {
//         setLoading(true);  // 폼 제출 시 로딩 상태로 전환
//         setError(null);    // 이전 오류 메시지 초기화

//         const formData = new FormData();
//         formData.append('person_image', personImage);
//         formData.append('cloth_image', clothImage);

//         try {
//             const response = await fetch('http://127.0.0.1:8000/api/process-images/', {
//                 method: 'POST',
//                 body: formData,
//             });

//             if (!response.ok) {
//                 throw new Error('Something went wrong!');  // 서버 응답이 성공적이지 않을 경우 오류 발생
//             }

//             const data = await response.json();
//             setResultImage(data.result_image);
//         } catch (err) {
//             setError(err.message);  // 오류 메시지 설정
//         } finally {
//             setLoading(false);  // 폼 제출이 완료되면 로딩 상태 해제
//         }
//     };

//     return (
//         <div className="App">
//             <h1>Virtual Try-On</h1>
//             <input type="file" onChange={handlePersonImageChange}/>
//             <input type="file" onChange={handleClothImageChange} />
//             <button onClick={handleSubmit} disabled={loading}>
//                 {loading ? 'Loading...' : 'Submit'}  {/* 로딩 중이면 버튼에 로딩 메시지 표시 */}
//             </button>

//             {loading && <p>Loading... Please wait.</p>}  {/* 로딩 중일 때 표시 */}
//             {error && <p style={{ color: 'red' }}>Error: {error}</p>}  {/* 오류 발생 시 오류 메시지 표시 */}
//             {resultImage && !loading && (
//                 <div>
//                     <h2>Result Image</h2>
//                     <img src={`data:image/png;base64,${resultImage}`} alt="Result" />
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Tryon;


import React, { useState } from "react";

function App() {
  const [vtonImage, setVtonImage] = useState(null);
  const [garmImage, setGarmImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);  // 로딩 상태 관리
  const [error, setError] = useState(null);       // 오류 상태 관리

  const handleVtonImageChange = (e) => {
    setVtonImage(e.target.files[0]);
  };

  const handleGarmImageChange = (e) => {
    setGarmImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("vton_img", vtonImage);
    formData.append("garm_img", garmImage);

    try {
      const response = await fetch("http://localhost:8000/api/tryon", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok){
        throw new Error('Something went wrong!');
      }

      const data = await response.json();
      setResultImage(`data:image/jpeg;base64,${data.result}`); // Base64 데이터를 이미지로 설정
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);  // 폼 제출이 완료되면 로딩 상태 해제
    }
  };

  return (
    <div>
      <h1>Virtual Try-On</h1>
      <input type="file" accept="image/*" onChange={handleVtonImageChange} />
      <input type="file" accept="image/*" onChange={handleGarmImageChange} />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Loading...' : 'TryOn'}  {/* 로딩 중이면 버튼에 로딩 메시지 표시 */}
      </button>
      {loading && <p>Loading... Please wait.</p>}  {/* 로딩 중일 때 표시 */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}  {/* 오류 발생 시 오류 메시지 표시 */}

      {resultImage && !loading && (
        <div>
          <h2>Result Image</h2>
          <img src={resultImage} alt="Virtual Try-On Result" />
        </div>
      )}
    </div>
  );
}

export default App;
