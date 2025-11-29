
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/HomePage'
import Result from './pages/ResultPage'
import ChooseInputType from './pages/SelectInputPage'
import Upload from './pages/UploadPage'
import {Route, Routes} from 'react-router-dom';

function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/result" element={<Result/>}></Route>
        <Route path="/upload/:inputType" element={<Upload/>}></Route>
        <Route path="/select-input-options" element={<ChooseInputType/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
