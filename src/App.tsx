import "./App.css";
import { PaymentCard } from "./components/PaymentCard";

function App() {
  return (
    <div
      className="app"
       style={{
        backgroundImage: "url('/bg-streaming.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000",
      }}
    >
      <div className="overlay">
        <h1>GARANTA SEU ACESSO AGORA</h1>
        <p>Selecione a forma de pagamento e informe seu email</p>

        <div className="payments">
          <PaymentCard
            title="PIX"
            logo="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadopago/logo__large.png"
            onSubmit={(email) => alert(`PIX: ${email}`)}
          />

          <PaymentCard
            title="Mercado Pago"
            logo="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.18.9/mercadopago/logo__large.png"
            onSubmit={(email) => alert(`MP: ${email}`)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
