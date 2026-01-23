
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/HomePage'
import EquationViewer from './pages/ResultPage'
import ChooseInputType from './pages/SelectInputPage'
import Upload from './pages/UploadPage'
import RenderLatexPage from './pages/RenderLatexPage'
import {Route, Routes} from 'react-router-dom';
import PreprocessingResultPage  from './pages/PreprocessingResultPage';

function App() {
  const stepsData = [{'step': '2^{x+1}+2^{x}=96', 'valid': true, 'comment': 'Initial equation', 'branches': 1, 'parsed': 'Eq(2**x + 2**(x + 1), 96)'}, {'step': '2^{x}(2+1)=96', 'valid': true, 'comment': 'Valid algebraic transformation', 'branches': 1, 'parsed': 'Eq(2**x*(1 + 2), 96)'}, {'step': '2^{x}=\\frac{96}{3}', 'valid': true, 'comment': 'Valid algebraic transformation', 'branches': 1, 'parsed': 'Eq(2**x, 96/3)'}, {'step': '2^{x}=32', 'valid': true, 'comment': 'Valid algebraic transformation', 'branches': 1, 'parsed': 'Eq(2**x, 32)'}, {'step': '2^{x}=2^{5}', 'valid': true, 'comment': 'Valid algebraic transformation', 'branches': 1, 'parsed': 'Eq(2**x, 2**5)'}, {'step': 'x=5 .', 'valid': true, 'comment': 'Valid algebraic transformation', 'branches': 1, 'parsed': 'Eq(x, 5)'}];

  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/upload/:inputType" element={<Upload/>}></Route>
        <Route path="/select-input-options" element={<ChooseInputType/>}></Route>
        <Route path="/render-latex" element={<RenderLatexPage/>}></Route>
        <Route path="/result" element={<EquationViewer data={stepsData}/>}></Route>

        {/* Routes to see intermediate results can be added here */}
        <Route path="/preprocessing-result" element={<PreprocessingResultPage/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
