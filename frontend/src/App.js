
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/HomeSection'
import Result from './components/ResultSection'
import ChooseInputType from './components/SelectInputType'
import Upload from './components/UploadPage'
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
