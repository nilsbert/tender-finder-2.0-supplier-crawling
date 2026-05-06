import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SourcingApp from './domains/sourcing/SourcingApp';
import { AuthProvider } from './domains/auth/AuthProvider';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="standalone-ms-ui scheme-dark">
          <Routes>
            <Route path="/sourcing/*" element={<SourcingApp />} />
            <Route path="*" element={<Navigate to="/sourcing" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
