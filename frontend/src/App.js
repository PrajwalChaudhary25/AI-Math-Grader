
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/HomeSection'
import Result from './components/ResultSection'
import {Route, Routes} from 'react-router-dom';

function App() {
  return (
    <div>
      <Navbar/>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/result" element={<Result/>}></Route>
          </Routes>
    </div>
  );
}

export default App;
