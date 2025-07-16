import React, { useState, useEffect } from 'react';
import { api } from 'src/services/tripeAPI';

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
  const [paid, setPaid] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // 👈 novo estado

  const startPixPayment = async () => {
    if (!email.trim()) {
      setError('Por favor, insira seu e-mail.');
      return;
    }

    setLoading(true);
    setError(null);
    setPixData(null);
    setCopied(false);
    setPaid(false);

    try {
      const response = await api.post('/create-pix-payment', {
        email,
        amount: 2000, // 👈 Aqui ajusta para R$20
      });

      const data: PixData = response.data;
      setPixData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Erro ao iniciar pagamento');
    } finally {
      setLoading(false);
    }
  };

  // Verifica se o pagamento foi feito a cada 5 segundos
  useEffect(() => {
    if (!pixData || !email || paid) return;

    let retryCount = 0;
    const maxRetries = 18; // ~90 segundos

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/payment-status?email=${encodeURIComponent(email)}`);
        const data = res.data;

        console.log("📡 Resposta da API:", data);

        if (data?.paid) {
          localStorage.setItem(`access_granted_${email}`, 'true');
          setPaid(true);
          clearInterval(interval);

          setRedirecting(true); // 👈 ativa visual de loading
          setTimeout(() => {
            window.location.href = 'https://apk.futemais.net/app2/';
          }, 2000);
        } else {
          retryCount++;
          if (retryCount >= maxRetries) {
            clearInterval(interval);
            //setError("Tempo de espera esgotado. Tente novamente.");
          }
        }
      } catch (err: any) {
        console.error('Erro ao verificar pagamento:', err.message);
        retryCount++;
        if (retryCount >= maxRetries) {
          clearInterval(interval);
          //setError("Erro ao verificar pagamento. Tente novamente.");
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pixData, email, paid]);

  const copyToClipboard = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // 👇 Tela de carregamento visível
  if (redirecting) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: '#fff',
        color: '#333',
        fontSize: '1.5rem'
      }}>
        <div style={{
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        Redirecionando, aguarde...
        <style>
          {`@keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`}
        </style>
      </div>
    );
  }

  return (
    <div className='payment'>
      {!pixData && (
        <>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className='payment-button' onClick={startPixPayment} disabled={loading || !email.trim()}>
            {loading ? 'Gerando QR Code...' : 'Pagar R$20 com Pix'}
          </button>
        </>
      )}

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

          {paid ? (
            <p style={{ color: 'green', marginTop: '1rem' }}>
              ✅ Pagamento aprovado! Redirecionando...
            </p>
          ) : (
            <p style={{ color: 'blue', marginTop: '1rem' }}>
              Aguardando confirmação do pagamento...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
