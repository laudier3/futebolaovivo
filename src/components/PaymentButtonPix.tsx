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
  const [paid, setPaid] = useState(false); // 👈 novo estado

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
      const response = await fetch('https://app4.apinonshops.store/create-pix-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: 1, // R$ 0,01
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

  // 👀 Polling para verificar pagamento
  useEffect(() => {
    if (!pixData || !email || paid) return;

    let retryCount = 0;
    const maxRetries = 12; // tenta por 1 minuto (12 x 5s)
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://app4.apinonshops.store/payment-status?email=${encodeURIComponent(email)}`);
        if (!res.ok) throw new Error("Resposta inválida do servidor");

        console.log(res)
        const data = await res.json();

        if (data?.paid) {
          localStorage.setItem(`access_granted_${email}`, 'true');
          setPaid(true);
          clearInterval(interval);

          setTimeout(() => {
            window.location.href = 'https://apk.futemais.net/app2/';
          }, 2000);
        } else {
          retryCount++;
          if (retryCount >= maxRetries) {
            clearInterval(interval);
            setError("Tempo de espera esgotado. Tente novamente.");
          }
        }
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
        retryCount++;
        if (retryCount >= maxRetries) {
          clearInterval(interval);
          setError("Erro ao verificar pagamento. Tente novamente.");
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

          {paid ? (
            <p style={{ color: 'green', marginTop: '1rem' }}>
              ✅ Pagamento aprovado! Redirecionando...
            </p>
          ) : (
            <p style={{ color: 'orange', marginTop: '1rem' }}>
              Aguardando confirmação do pagamento...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
