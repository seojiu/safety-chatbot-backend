import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import WorkerLogin from './pages/WorkerLogin';
import WorkerHome from './pages/WorkerHome';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerResult from './pages/WorkerResult';
import ManagerDashboard from './pages/ManagerDashboard';
import WorkerDetail from './pages/WorkerDetail';
import WorkerChat from './pages/WorkerChat';
import WorkerProfile from './pages/WorkerProfile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/worker/login" element={<WorkerLogin />} />
          <Route path="/worker/dashboard" element={<WorkerHome />} />
          <Route path="/worker/profile" element={<WorkerProfile />} />
          <Route path="/worker/survey" element={<WorkerDashboard />} />
          <Route path="/worker/result/:id" element={<WorkerResult />} />
          <Route path="/worker/chat/:id" element={<WorkerChat />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/worker/:id" element={<WorkerDetail />} />
          <Route path="/manager/worker/:id/chat" element={<WorkerChat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
