import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4242',
  headers: {
    'Content-Type': 'application/json',
  },
});


export async function createCheckout(email: string) {
  const response = await axios.post(`http://localhost:4242/create-checkout-session`, {
    email,
  });
  console.log('E-mail enviado para pagamento:', email);
  return response.data; // { checkoutUrl }
}

export { api }