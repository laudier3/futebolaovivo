import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fut.urlcurt.site/',
  headers: {
    'Content-Type': 'application/json',
  },
});


export async function createCheckout(email: string) {
  const response = await axios.post(`https://fut.urlcurt.site/create-checkout-session`, {
    email,
  });
  console.log('E-mail enviado para pagamento:', email);
  return response.data; // { checkoutUrl }
}

export { api }