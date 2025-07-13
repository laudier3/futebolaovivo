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


/*import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4242',
});

export const createCheckout = async (email: string) => {
  const response = await api.post('/create-checkout-session', { email });
  return response.data;
};

/*import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:4242",
});

export const createCheckout = async (email: string) => {
  const response = await api.post('/create-checkout-session', { email });
  return response.data;
};*/
