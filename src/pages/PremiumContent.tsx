import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PremiumContent = () => {
  const [params] = useSearchParams();
  const email = params.get('email');
  const navigate = useNavigate();

  useEffect(() => {
    const accessKey = `access_granted_${email}`;
    const granted = localStorage.getItem(accessKey);

    if (!granted) {
      alert('Acesso não autorizado.');
      navigate('/');
    } else {
      // Redireciona o usuário para o conteúdo premium diretamente
      window.location.href = "https://apk.futemais.net/app2/";
    }
  }, [email, navigate]);

  return (
    <div>
      <p>Redirecionando para o futebol ao vivo...</p>
    </div>
  );
};

export default PremiumContent;
            