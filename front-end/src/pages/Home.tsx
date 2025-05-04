// src/pages/Home.tsx
import { Link } from "react-router-dom";
import logo from "../assets/original-519eba43b5e06c4036ad54fe2b6e496f.jpg";
import botIcon from "../assets/Furia_Esports_logo.png";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <header className="home-header">
          <img src={logo} alt="FURIA Logo" className="home-logo" />
          <h1 className="home-title">BOT FURIOSO</h1>
          <p className="home-subtitle">O assistente definitivo para fãs da FURIA</p>
        </header>

        <div className="home-main">
          <div className="home-features">
            <div className="feature-card">
              <div className="feature-icon">🤖​</div>
              <h3>Chat Inteligente</h3>
              <p>Obtenha informações em tempo real sobre a FURIA com a inteligencia artificial da furia!</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Respostas Rápidas</h3>
              <p>Tire todas suas dúvidas sobre o time</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Bate papo em tempo real</h3>
              <p>Converse com outros fãs da furia</p>
            </div>
          </div>

          <div className="home-cta">
            <Link to="/login" className="cta-button">
              <img src={botIcon} alt="Bot Icon" className="cta-icon" />
              <span>Iniciar Bot Furioso</span>
            </Link>
            <p className="cta-text">Clique para começar a interação</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;