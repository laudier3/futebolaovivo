import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Success from './pages/Success';
import PremiumContent from './pages/PremiumContent';
import './App.css'; // Importa o CSS

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/success" element={<Success />} />
          <Route path="/premium" element={<PremiumContent />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
