import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Success = () => {
  const [params] = useSearchParams();
  const email = params.get('email');
  const navigate = useNavigate();

  useEffect(() => {
    if (email) {
      localStorage.setItem(`access_granted_${email}`, 'true');
      navigate(`/premium?email=${email}`);
    }
  }, [email, navigate]);

  return <p>Processando acesso...</p>;
};

export default Success;
