import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx'
import './App.css'
import IndexPage from './pages/IndexPage'
import TestPanelPage from './pages/TestPanelPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/test-panel" element={<TestPanelPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
