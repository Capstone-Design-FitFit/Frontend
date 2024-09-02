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
      <br></br>
      <Tryon></Tryon>
      <br></br>
      <h1>사진 모션 캡쳐!</h1>
      <WebcamCapture></WebcamCapture>
      {/* <h1>모바일용</h1>
      <CameraCapture></CameraCapture> */}
    </>
  )
}

export default App
