
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/HomePage'
import EquationViewer from './pages/ResultPage'
import ChooseInputType from './pages/SelectInputPage'
import Upload from './pages/UploadPage'
import RenderLatexPage from './pages/RenderLatexPage'
import {Route, Routes} from 'react-router-dom';

function App() {
  const stepsData = [{'step': '=\\frac{x}{x-y}-\\frac{x}{x+y}+\\frac{2*x y}{x^2+y^2}', 'valid': true, 'comment': 'Initial equation'}, {'step': '=\\frac{x \\cdot(x+y)-x(x-y)}{(x-y)(x+y)}+\\frac{2*x y}{x^2+y^2}', 'valid': true, 'comment': 'Valid step'}, {'step': '=\\frac{x^2+x y-x^2+x y}{x^2-y^2}+\\frac{2*x y}{x^2+y^2}', 'valid': true, 'comment': 'Valid step'}, {'step': '=\\frac{2*x y}{x^2-y^2}+\\frac{2*x y}{x^2+y^2}', 'valid': true, 'comment': 'Valid step'}, {'step': '=\\frac{2*x y\\left[x^2+y^2+x^2-y^2\\right]}{\\left(x^2-y^2\\right)\\left(x^2+y^2\\right)}', 'valid': true, 'comment': 'Valid step'}, {'step': '=\\frac{2*x y\\left(2*x^2\\right)}{x^4-y^5}', 'valid': false, 'comment': 'Incorrect transformation'}, {'step': '=\\frac{4*x^3*y}{x^4-y^4}', 'valid': false, 'comment': 'Previous error: cannot validate this step'}];

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
