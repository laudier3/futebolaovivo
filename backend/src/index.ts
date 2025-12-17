import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import fs from 'fs';
import nodemailer from 'nodemailer';
import "dotenv/config";

const app = express();

/* ===================== STRIPE ===================== */
const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY!, {
  apiVersion: "2025-06-30.basil",
});

/* ===================== MERCADO PAGO (SDK NOVO) ===================== */
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const paymentClient = new Payment(mpClient);

/* ===================== NODEMAILER ===================== */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/* ===================== EMAILS ===================== */
async function enviarEmailConfirmacao(email: string) {
  await transporter.sendMail({
    from: `"Futebol ao Vivo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Pagamento confirmado!',
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <h2>✅ Pagamento confirmado</h2>

        <p>Seu acesso foi liberado com sucesso.</p>

        <div style="display: flex; align-items: center; gap: 12px; margin-top: 20px;">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/53/53283.png"
            alt="Bola de futebol"
            width="50"
            height="50"
            style="display: block;"
          />

          <a 
            href="https://apk.futemais.app/app2/"
            target="_blank"
            style="
              font-size: 18px;
              color: #0f62fe;
              font-weight: bold;
              text-decoration: none;
            "
          >
            👉 Acessar Futebol ao Vivo
          </a>
        </div>

        <hr style="margin-top: 30px;" />

        <p style="font-size: 14px; color: #666;">
          Este é um e-mail automático. Não responda.
        </p>
      </div>
    `,
  });
}

async function enviarEmailConfirmacaoProdutionPix(email: string) {
  await transporter.sendMail({
    from: `"Futebol ao Vivo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '💰 PIX confirmado',
    html: `<h2>Pagamento PIX aprovado</h2>`,
  });
}

async function enviarEmailConfirmacaoProdutionCartoa(email: string) {
  await transporter.sendMail({
    from: `"Futebol ao Vivo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '💳 Cartão confirmado',
    html: `<h2>Pagamento Cartão aprovado</h2>`,
  });
}

/* ===================== MIDDLEWARES ===================== */
app.use(cors({ origin: 'http://localhost:4000' }));
app.use(express.json());

/* ===================== FILE DB ===================== */
const PENDENTES_FILE = 'pendentes.json';
const DB_FILE = 'pagamentos.json';

function salvarPendente(id: string, email: string) {
  const data = fs.existsSync(PENDENTES_FILE)
    ? JSON.parse(fs.readFileSync(PENDENTES_FILE, 'utf8'))
    : {};
  data[id] = email;
  fs.writeFileSync(PENDENTES_FILE, JSON.stringify(data));
}

function obterEmailPorPagamento(id: string): string | null {
  if (!fs.existsSync(PENDENTES_FILE)) return null;
  const data = JSON.parse(fs.readFileSync(PENDENTES_FILE, 'utf8'));
  return data[id] || null;
}

function salvarPagamento(email: string) {
  const db = fs.existsSync(DB_FILE)
    ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    : {};
  db[email] = true;
  fs.writeFileSync(DB_FILE, JSON.stringify(db));
}

function consultarPagamento(email: string): boolean {
  if (!fs.existsSync(DB_FILE)) return false;
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  return db[email] === true;
}

/* ===================== PIX - MERCADO PAGO ===================== */
app.post('/create-pix-payment', async (req, res) => {

  try {
    const { email, amount } = req.body;

    const payment = await paymentClient.create({
      body: {
        transaction_amount: amount / 100,
        description: 'Pagamento PIX - Futebol ao Vivo',
        payment_method_id: 'pix',
        payer: { email },
      },
    });

    const paymentId = String(payment.id);
    salvarPendente(paymentId, email);

    res.json({
      qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar PIX' });
  }
});

/* ===================== WEBHOOK MERCADO PAGO ===================== */
app.post('/webhook', async (req: any, res: any) => {
  try {
    const { type, data } = req.body;
    if (type !== 'payment') return res.sendStatus(200);

    const paymentId = data.id;
    const payment = await paymentClient.get({ id: paymentId });

    const email = obterEmailPorPagamento(String(paymentId));

    if (payment.status === 'approved' && email && !consultarPagamento(email)) {
      salvarPagamento(email);
      await enviarEmailConfirmacao(email);
      await enviarEmailConfirmacaoProdutionPix("laudiersantanamei@gmail.com");
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(200);
  }
});

/* ===================== STATUS ===================== */
app.get('/payment-status', (req, res) => {
  const email = req.query.email as string;
  res.json({ paid: consultarPagamento(email) });
});

/* ===================== STRIPE CHECKOUT ===================== */
app.post('/create-checkout-session', async (req, res) => {
  const { email } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'brl',
        product_data: { name: 'Acesso Futebol ao Vivo' },
        unit_amount: 2000,
      },
      quantity: 1,
    }],
    success_url: `https://futebolaovivooficial.vercel.app/success?email=${email}`,
    cancel_url: `https://futebolaovivooficial.vercel.app/`,
  });

  res.json({ checkoutUrl: session.url });
});

/* ===================== STRIPE WEBHOOK ===================== */
app.post('/webhook-stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']!;
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email!;
    salvarPagamento(email);
    await enviarEmailConfirmacao(email);
    await enviarEmailConfirmacaoProdutionCartoa("laudiersantanamei@gmail.com");
  }

  res.sendStatus(200);
});

/* ===================== START ===================== */
app.listen(4242, () => {
  console.log('🚀 Backend rodando na porta 4242');
});
