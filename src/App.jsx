import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Tryon from './Tryon'
import WebcamCapture from './WebcamCapture'
import CameraCapture from './CameraCapture'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <p className="read-the-docs">
        로고 클릭시 공식 문서로 이동. Vite + React 가 프론트 아키텍처의 시작
      </p> */}
      <br></br>
      <Tryon></Tryon>
      <br></br>
      <h1>사진 모션 캡쳐!</h1>
      <WebcamCapture></WebcamCapture>
      <h1>모바일용</h1>
      <CameraCapture></CameraCapture>
    </>
  )
}

export default App
