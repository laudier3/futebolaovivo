import axios from 'axios';

const api = axios.create({
  baseURL: 'https://app4.apinonshops.store',
  headers: {
    'Content-Type': 'application/json',
  },
});


export async function createCheckout(email: string) {
  const response = await axios.post(`https://app4.apinonshops.store/create-checkout-session`, {
    email,
  });
  console.log('E-mail enviado para pagamento:', email);
  return response.data; // { checkoutUrl }
}

export { api }