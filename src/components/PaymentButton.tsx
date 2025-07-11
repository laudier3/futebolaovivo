import { useState } from 'react';
import { createCheckout } from '../services/tripeAPI';

interface PaymentButtonProps {
  email: string;
}

const PaymentButton = ({ email }: PaymentButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { checkoutUrl } = await createCheckout(email);
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('Erro ao iniciar pagamento:', err);
      alert('Erro ao iniciar pagamento. Verifique se o E-mail é valido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Redirecionando...' : 'Pagar R$20 e Acessar'}
    </button>
  );
};

export default PaymentButton;
