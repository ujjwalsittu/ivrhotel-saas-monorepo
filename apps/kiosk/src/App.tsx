import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CheckIn from './pages/CheckIn';
import CheckOut from './pages/CheckOut';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-900 text-white font-sans select-none">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/check-in" element={<CheckIn />} />
                    <Route path="/check-out" element={<CheckOut />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
