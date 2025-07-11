import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import mercadopago from 'mercadopago';
import fs from 'fs';
import "dotenv/config"

const app = express();

const stripe = new Stripe(`${process.env.STRIPE_SECRETE_KEY}`, {
  //apiVersion: '2024-04-10',
});

// Configure seu access token do Mercado Pago aqui
mercadopago.configurations.setAccessToken(process.env.MERCADOPAGO_ACCESS_TOKEN || 'SEU_ACCESS_TOKEN_AQUI');

app.use(cors());
app.use(express.json());

const PAGAMENTOS_PENDENTES_FILE = 'pendentes.json';

function registrarPagamentoPendente(id: string, email: string) {
  let pendentes: { [id: string]: string } = {};
  if (fs.existsSync(PAGAMENTOS_PENDENTES_FILE)) {
    pendentes = JSON.parse(fs.readFileSync(PAGAMENTOS_PENDENTES_FILE, 'utf-8'));
  }
  pendentes[id] = email;
  fs.writeFileSync(PAGAMENTOS_PENDENTES_FILE, JSON.stringify(pendentes, null, 2));
}

app.post('/create-pix-payment', async (req: any, res: any) => {
  try {
    const { email, amount } = req.body;
    if (!email || !amount) {
      return res.status(400).json({ error: 'email e amount são obrigatórios' });
    }

    const payment_data = {
      transaction_amount: amount / 100, // R$ 0,01 se amount=1 centavo
      description: 'Pagamento via Pix - Futebol ao Vivo',
      payment_method_id: 'pix',
      payer: {
        email,
      },
      installments: 1,
    };

    const payment = await mercadopago.payment.create(payment_data);

    if (!payment.body || !payment.body.point_of_interaction) {
      return res.status(500).json({ error: 'Erro ao criar pagamento Pix' });
    }

    const pixData = {
      qr_code_base64: payment.body.point_of_interaction.transaction_data.qr_code_base64,
      qr_code: payment.body.point_of_interaction.transaction_data.qr_code,
    };

    res.json(pixData);
  } catch (error) {
    console.error('Erro ao criar pagamento Pix:', error);
    res.status(500).json({ error: 'Erro interno ao criar pagamento Pix' });
  }
});

function obterEmailPorPagamento(id: string): string | null {
  if (!fs.existsSync(PAGAMENTOS_PENDENTES_FILE)) return null;
  const pendentes = JSON.parse(fs.readFileSync(PAGAMENTOS_PENDENTES_FILE, 'utf-8'));
  return pendentes[id] || null;
}

app.post('/webhook', express.json(), async (req: any, res: any) => {
  const paymentId = req.body?.data?.id;
  if (!paymentId) return res.sendStatus(400);

  const result = await mercadopago.payment.findById(paymentId);
  const payment = result.body;
  const status = payment.status;

  // ✅ Aqui recupera o email real
  const email = obterEmailPorPagamento(paymentId.toString());
  console.log(`🔍 Pagamento ${paymentId}: status = ${status}, email real = ${email}`);

  if (status === 'approved' && email) {
    salvarPagamento(email);
    console.log(`✅ Pagamento aprovado para o email real: ${email}`);
  }

  res.sendStatus(200);
});

const DB_FILE = 'pagamentos.json';

function salvarPagamento(email: string) {
  let db: { [key: string]: boolean } = {};

  if (fs.existsSync(DB_FILE)) {
    const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(fileContent);
  }
  db[email] = true;
  fs.writeFileSync(DB_FILE, JSON.stringify(db));
}

function consultarPagamento(email: string): boolean {
  if (!fs.existsSync(DB_FILE)) return false;
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  return db[email] === true;
}

app.get('/payment-status', (req: any, res: any) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

  const pago = consultarPagamento(email);
  res.json({ paid: pago });
});

app.post('/webhook', express.json(), async (req: any, res: any) => {
  const paymentId = req.body?.data?.id;
  if (!paymentId) return res.sendStatus(400);

  try {
    const result = await mercadopago.payment.findById(paymentId);
    const payment = result.body;
    const status = payment.status;
    const email = payment.payer?.email;

    if (status === 'approved' && email) {
      salvarPagamento(email);  // 👈 AQUI usa a função!
      console.log(`✅ Pagamento aprovado para: ${email}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.post('/create-checkout-session', async (req: any, res: any) => {
  const { email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: 'Acesso vitalício ao Futebol ao Vivo',
          },
          unit_amount: 2000, // R$20,00 em centavos
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: `https://app4.apinonshops.store/success?email=${email}`,
      cancel_url: `https://app4.apinonshops.store/`,
      metadata: {
        access_type: 'lifetime',
      }
    });

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('Erro ao criar sessão:', err);
    res.status(500).json({ error: 'Falha ao criar sessão de pagamento' });
  }
});

app.post('/create-payment-intent', async (req: any, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email é obrigatório' });
    }

    const customer = await stripe.customers.create({ email });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000, // R$20,00 fixo
      currency: 'brl',
      customer: customer.id,
      receipt_email: email,
      payment_method_types: ['pix'],
      payment_method_options: {
        pix: {
          expires_after_seconds: 3600,
        },
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      pix: paymentIntent.next_action?.pix_display_qr_code,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(4242, () => {
  console.log('🚀 Backend rodando em http://localhost:4242');
});
