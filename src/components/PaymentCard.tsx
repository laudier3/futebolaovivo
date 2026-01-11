import React, { useState } from "react";

interface PaymentCardProps {
  title: string;
  logo: string;
  onSubmit: (email: string) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  title,
  logo,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) {
      alert("Informe um email válido");
      return;
    }
    onSubmit(email);
  };

  return (
    <div className="payment-card">
      <img src={logo} alt={title} className="payment-logo" />
      <input
        type="email"
        placeholder="Informe seu melhor email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleSubmit}>ACESSAR AGORA</button>
    </div>
  );
};
