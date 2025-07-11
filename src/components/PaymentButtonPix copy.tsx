import React, { useState, useEffect } from 'react';

interface PixData {
  qr_code_base64: string;
  qr_code: string;
}

export const PixPayment = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const startPixPayment = async () => {
    if (!email.trim()) {
      setError('Por favor, insira seu e-mail.');
      return;
    }

    setLoading(true);
    setError(null);
    setPixData(null);
    setCopied(false);

    try {
      const response = await fetch('http://localhost:4242/create-pix-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: 1, // R$ 20,00 em centavos
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao iniciar pagamento');
      }

      const data: PixData = await response.json();
      setPixData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Faz polling para verificar o status do pagamento Pix
  useEffect(() => {
    if (pixData && email) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:4242/payment-status?email=${encodeURIComponent(email)}`);
          const { paid } = await res.json();

          if (paid) {
            localStorage.setItem(`access_granted_${email}`, 'true');
            window.location.href = 'https://apk.futemais.net/app2/';
          }
        } catch (err) {
          console.error('Erro ao verificar pagamento:', err);
        }
      }, 5000); // a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [pixData, email]);

  const copyToClipboard = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button onClick={startPixPayment} disabled={loading || !email.trim()}>
        {loading ? 'Gerando QR Code...' : 'Pagar com Pix'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {pixData && (
        <div>
          <h3>QR Code Pix</h3>
          <img
            src={`data:image/png;base64,${pixData.qr_code_base64}`}
            alt="Pix QR Code"
            style={{ maxWidth: '300px' }}
          />
          <p>Código Pix:</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              value={pixData.qr_code}
              readOnly
              style={{ width: '100%', padding: '0.4rem' }}
            />
            <button onClick={copyToClipboard}>
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <p style={{ color: 'green', marginTop: '1rem' }}>
            Aguardando confirmação do pagamento...
          </p>
        </div>
      )}
    </div>
  );
};
