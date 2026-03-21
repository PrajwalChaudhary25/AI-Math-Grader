
import './App.css';
import Navbar from './components/Navbar';
import Home from './pages/HomePage'
import EquationViewer from './pages/ResultPage'
import ChooseInputType from './pages/SelectInputPage'
import Upload from './pages/UploadPage'
import RenderLatexPage from './pages/RenderLatexPage'
import {Route, Routes} from 'react-router-dom';
import PreprocessingResultPage  from './pages/PreprocessingResultPage';
import ScoreAndFeedback from './pages/scoreAndFeedback';

function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}></Route>
        <Route path="/upload/:inputType" element={<Upload/>}></Route>
        <Route path="/select-input-options" element={<ChooseInputType/>}></Route>
        <Route path="/render-latex" element={<RenderLatexPage/>}></Route>
        <Route path="/result" element={<EquationViewer/>}></Route>
        <Route path="/score-and-feedback" element={<ScoreAndFeedback/>}></Route>

        {/* Routes to see intermediate results can be added here */}
        <Route path="/preprocessing-result" element={<PreprocessingResultPage/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
