import React, { useState, useEffect } from 'react';
import 'chart.js/auto';
import { Router,BrowserRouter,Routes,Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignupPage from './pages/Signup';
function App() {
  

  
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
