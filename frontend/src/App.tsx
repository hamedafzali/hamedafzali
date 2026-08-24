import React from "react";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import About from "./components/About";
import Portfolio from "./components/Portfolio";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { PortfolioDataProvider } from "./context/PortfolioData";
import "./App.css";

function App() {
  return (
    <PortfolioDataProvider>
      <div className="App">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navigation />
        <main id="main-content">
          <Hero />
          <About />
          <Portfolio />
          <Contact />
        </main>
        <Footer />
      </div>
    </PortfolioDataProvider>
  );
}

export default App;
