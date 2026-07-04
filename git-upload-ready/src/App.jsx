import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import SignupForm from './components/SignupForm';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Hero />
        <SignupForm />
      </main>
      <Footer />
    </div>
  );
}

export default App;
