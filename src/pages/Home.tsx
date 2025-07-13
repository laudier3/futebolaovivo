import React, { useState } from 'react';
import PaymentButton from '../components/PaymentButton';
import { PixPayment } from '../components/PaymentButtonPix';
import './Home.css'; // ✅ Importa o CSS com estilos modernos
import { api } from 'src/services/tripeAPI';

//console.log(process.env.REACT_APP_URL, "teste")

const Home: React.FC = () => {
  const [email, setEmail] = useState('');

  const Teste = async () => {
    try {
      const res = await api.get(`/payment-status?email=${encodeURIComponent(email)}`);
      console.log(res.data, "teste"); // os dados vêm em res.data
    } catch (err) {
      console.error("Erro ao buscar status de pagamento:", err);
    }
  };

  Teste();

  return (
    <>
    <h1>Assita todos os jogos do momento dos pricipais coampeonato</h1>
    <h1>E você so paga uma vez e tem acesso pra sempre.</h1>
    <div className="home-page">
      <h1>Futebol ao Vivo</h1>
      <p>Para acessar o conteúdo exclusivo, pague R$20 (acesso vitalício ao FutebolaoVivo).</p>
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
      <p>Para acessar o conteúdo exclusivo, pague R$20 (acesso vitalício ao FutebolaoVivo).</p>
      <h1>Pix</h1>

      <PixPayment />
    </div>
    </>
  );
};

export default Home;
