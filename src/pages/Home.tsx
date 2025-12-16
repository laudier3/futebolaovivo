import React, { useState } from 'react';
import PaymentButton from '../components/PaymentButton';
import { PixPayment } from '../components/PaymentButtonPix';
import './Home.css'; // Estilos visuais
import premier from '../assets/icones/premier-league.png';
import lali from '../assets/icones/la-liga.png';
import brasileiao from '../assets/icones/brasileiao.png';
import Bundesliga from '../assets/icones/bundesliga.png';
import Ligue1 from '../assets/icones/ligue-1.png';
import Libertadores from '../assets/icones/libertadores.png';
import CopadoBrasil from '../assets/icones/copa-do-brasil.png';
import Paulistão from '../assets/icones/paulistao.png';
import MundialdeClubes from '../assets/icones/mundial.png';
import Carioca from '../assets/icones/carioca.png';
import CopadoMundo from '../assets/icones/copa-do-mundo.png';
import ChampionsLeague from '../assets/icones/champions-league.png';

const championshipIcons = [
  { name: 'Premier League', src: premier },
  { name: 'La Liga', src: lali },
  { name: 'Bundesliga', src: Bundesliga },
  { name: 'Ligue 1', src: Ligue1 },
  { name: 'Champions League', src: ChampionsLeague },
  { name: 'Libertadores', src: Libertadores },
  { name: 'Copa do Brasil', src: CopadoBrasil },
  { name: 'Brasileirão', src: brasileiao },
  { name: 'Paulistão', src: Paulistão },
  { name: 'Carioca', src: Carioca },
  { name: 'Mundial de Clubes', src: MundialdeClubes },
  { name: 'Copa do Mundo', src: CopadoMundo },
];

const Home: React.FC = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="home-container">
      {/* Vídeo de fundo */}
      <video className="background-video" autoPlay loop muted>
        <source src={require('../assets/videos/background.mp4')} type="video/mp4" />
        Seu navegador não suporta vídeo.
      </video>

      {/* Overlay escuro */}
      <div className="overlay"></div>

      <div className="home-content">
        <div className="home-hero">
          <h1>⚽ Assista aos jogos dos maiores campeonatos do mundo</h1>
        </div>

        <div className="championships-grid">
          {championshipIcons.map((item, index) => (
            <div className="championship-icon" key={index}>
              <img src={item.src} alt={item.name} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        <p>
          Apenas um pagamento e você terá <strong>acesso vitalício</strong> ao conteúdo premium de futebol ao vivo.
        </p>

        <div className="payment-section">
          <h2>💳 Pague com Cartão de Crédito</h2>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PaymentButton email={email} />
        </div>

        <div className="payment-section">
          <h2>🏦 Ou pague com Pix</h2>
          <PixPayment />
        </div>
      </div>
    </div>
  );
};

export default Home;
