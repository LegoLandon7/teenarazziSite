import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from 'react'

import Navbar from '../components/NavBar.tsx'
import Footer from '../components/Footer.tsx'

import Home from './Home.tsx'
import About from './About.tsx';
import Socials from './Socials.tsx';

import Admin from './Admin.tsx';

import ScrollToTop from '../utils/ScrollToTop.tsx'

function App() {
  useEffect(() => {
    console.log(
      '%c ⛔ Do not paste unknown code in here, unless you know what you\'re doing!',
      'color: #ff4444; font-size: 14px; font-weight: bold;'
    );
  }, []);

  return (
    <BrowserRouter>
    <ScrollToTop />
      <Navbar />
    
      <main className='main-content'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/socials" element={<Socials />} />

          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      
      <Footer />
    </BrowserRouter>
  )
}

export default App