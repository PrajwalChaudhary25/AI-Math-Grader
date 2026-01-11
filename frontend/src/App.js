
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/HomePage'
import EquationViewer from './pages/ResultPage'
import ChooseInputType from './pages/SelectInputPage'
import Upload from './pages/UploadPage'
import RenderLatexPage from './pages/RenderLatexPage'
import {Route, Routes} from 'react-router-dom';

function App() {
  const stepsData = [{'step': '2^{x+1}+2^{x}=96', 'valid': true, 'comment': 'Initial equation'}, {'step': '2^{x}(2+1)=96', 'valid': true, 'comment': 'Valid step'}, {'step': '2^{x}=\\frac{96}{4}', 'valid': false, 'comment': 'Incorrect transformation'}, {'step': '2^{x}=32', 'valid': false, 'comment': 'Previous error: cannot validate this step'}, {'step': '2^{x}=2^{5}', 'valid': false, 'comment': 'Previous error: cannot validate this step'}, {'step': 'x=5 .', 'valid': false, 'comment': 'Previous error: cannot validate this step'}];

  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        {/* <Route path="/result" element={<Result/>}></Route> */}
        <Route path="/upload/:inputType" element={<Upload/>}></Route>
        <Route path="/select-input-options" element={<ChooseInputType/>}></Route>
        <Route path="/render-latex" element={<RenderLatexPage/>}></Route>
        <Route path="/result" element={<EquationViewer data={stepsData}/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
