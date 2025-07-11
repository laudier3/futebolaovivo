import React, { useState } from 'react';
import PaymentButton from '../components/PaymentButton';
import { PixPayment } from '../components/PaymentButtonPix';
import './Home.css'; // ✅ Importa o CSS com estilos modernos

const Home: React.FC = () => {
  const [email, setEmail] = useState('');

  const Teste = async () => {
     const res = await fetch(`http://localhost:4242/payment-status?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error("Resposta inválida do servidor");

        console.log(res)
  }

Teste()

  return (
    <>
    <div className="home-page">
      <h1>Futebol ao Vivo</h1>
      <p>Para acessar o conteúdo exclusivo, pague R$20 (acesso vitalício).</p>
      <h1>Cartão de Credito</h1>

      <input
        type="email"
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <PaymentButton email={email} />
    </div>
    <div className="home-page">
      <h1>Futebol ao Vivo</h1>
      <p>Para acessar o conteúdo exclusivo, pague R$20 (acesso vitalício).</p>
      <h1>Pix</h1>

      <PixPayment />
    </div>
    </>
  );
};

export default Home;
