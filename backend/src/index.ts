import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import mercadopago from 'mercadopago';
import fs from 'fs';
import nodemailer from 'nodemailer';
import "dotenv/config"

const app = express();

const stripe = new Stripe(`${process.env.STRIPE_SECRETE_KEY!}`, {});
//const stripe = new Stripe(`${process.env.STRIPE_SECRETE_KEY_PRODUCTION!}`, {});

mercadopago.configurations.setAccessToken(process.env.MERCADOPAGO_ACCESS_TOKEN || '');

// Configuração do Nodemailer (exemplo com Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,       // ou process.env.EMAIL_USER (use o que estiver configurado)
    pass: process.env.EMAIL_PASSWORD,
  },
});

/*(async () => {
  await enviarEmailConfirmacao('kalinoippc@gmail.com');
})();*/


// Função para enviar e-mail
async function enviarEmailConfirmacao(email: string) {
  console.log(`📨 Enviando email de confirmação para ${email}...`);

  const info = await transporter.sendMail({
    from: `"Futebol ao Vivo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Pagamento confirmado com sucesso!',
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <p style="color: white">Olá! 👋</p>
        <p style="color: white">Seu pagamento foi <strong>confirmado com sucesso</strong>.</p>
        <p>Obrigado por apoiar o <strong>Futebol ao Vivo</strong>! ⚽️</p>
        <hr />
        <p style="font-size: 14px; color: gray;">Este é um e-mail automático. Não responda.</p>
        <img src="https://thumbs.dreamstime.com/b/jogador-de-futebol-na-a%C3%A7%C3%A3o-51237258.jpg" alt="img"/>
        <h2>Acesso liberado abaixo</h2>
        <p>Lembre-se de baixa o app para você ter mais praticidade para assistir ao jogos.</p>
        <a href="https://apk.futemais.net/app2/" style="padding: 10px 20px; font-size: 18px; margin-top: 1rem; background-color: #0f62fe; color: #ffff; border: none; border-radius: 5px; cursor: pointer;">Assistir Jogos Agora</a>
      </div>
    `,
  });

  console.log(`📧 Email de confirmação enviado para ${email}:`, info.messageId);
}

// Função para enviar e-mail
async function enviarEmailConfirmacaoProdutionPix(email: string) {
  console.log(`📨 Enviando email de confirmação para ${email}...`);

  const info = await transporter.sendMail({
    from: `"Futebol ao Vivo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Pagamento confirmado com sucesso!',
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <p style="color: white">Olá administrador! 👋</p>
        <p style="color: white">Mais um pagamento no PIX foi <strong>confirmado com sucesso ✅</strong>.</p>
        <p>Faturamente de 20,00 do <strong>Futebol ao Vivo</strong>! ⚽️</p>
        <hr />
        <p style="font-size: 14px; color: gray;">Este é um e-mail automático. Não responda.</p>
        <img src="https://www.silbeck.com.br/wp-content/uploads/2021/06/Prancheta-2@300x-100-scaled.jpg" alt="img" style="display: flex; align-items: center; align-content: center;"/>
        
      </div>
    `,
  });

  console.log(`📧 Email de confirmação enviado para ${email}:`, info.messageId);
}

// Função para enviar e-mail
async function enviarEmailConfirmacaoProdutionCartoa(email: string) {
  console.log(`📨 Enviando email de confirmação para ${email}...`);

  const info = await transporter.sendMail({
    from: `"Futebol ao Vivo" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Pagamento confirmado com sucesso!',
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px;">
        <p style="color: white">Olá administrador! 👋</p>
        <p style="color: white">Mais um pagamento no CARÃO foi <strong>confirmado com sucesso ✅</strong>.</p>
        <p>Faturamente de 20,00 do <strong>Futebol ao Vivo</strong>! ⚽️</p>
        <hr />
        <p style="font-size: 14px; color: gray;">Este é um e-mail automático. Não responda.</p>
        <img src="https://www.silbeck.com.br/wp-content/uploads/2021/06/Prancheta-2@300x-100-scaled.jpg" alt="img" style="display: flex; align-items: center; align-content: center;"/>
        
      </div>
    `,
  });

  console.log(`📧 Email de confirmação enviado para ${email}:`, info.messageId);
}

// ✅ Webhook do Stripe para confirmação de pagamento
app.post('/webhook-stripe', express.raw({ type: 'application/json' }), async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const error = err as Error;
    console.error('❌ Erro ao verificar assinatura do Stripe:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log('📦 Evento Stripe recebido:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email || session.customer_details?.email;

    console.log('📧 Email extraído da sessão:', email);

    if (email) {
      salvarPagamento(email);
      await enviarEmailConfirmacao(email);
      console.log(`✅ Pagamento confirmado via Stripe para: ${email}`);
      (async () => {
        await enviarEmailConfirmacao(email);
        await enviarEmailConfirmacaoProdutionCartoa("laudiersantanamei@gmail.com");
      })()
    } else {
      console.warn('⚠️ Sessão confirmada mas email está ausente:', session);
    }
  }

  res.status(200).send('OK');
});

app.use(cors({
  origin: `http://localhost:3000`,
  //origin: `https://futebolaovivooficial.vercel.app/`,
}));
app.use(express.json());

const PAGAMENTOS_PENDENTES_FILE = 'pendentes.json';
const DB_FILE = 'pagamentos.json';

// 🔒 Util: salvar e obter pendente
function salvarPendente(paymentId: string, email: string) {
  let pendentes: { [key: string]: string } = {};
  if (fs.existsSync(PAGAMENTOS_PENDENTES_FILE)) {
    pendentes = JSON.parse(fs.readFileSync(PAGAMENTOS_PENDENTES_FILE, 'utf-8'));
  }
  pendentes[paymentId] = email;
  fs.writeFileSync(PAGAMENTOS_PENDENTES_FILE, JSON.stringify(pendentes));
}

function obterEmailPorPagamento(id: string): string | null {
  if (!fs.existsSync(PAGAMENTOS_PENDENTES_FILE)) return null;
  const pendentes = JSON.parse(fs.readFileSync(PAGAMENTOS_PENDENTES_FILE, 'utf-8'));
  return pendentes[id] || null;
}

// 💾 Util: salvar e consultar pagamento aprovado
function salvarPagamento(email: string) {
  let db: { [key: string]: boolean } = {};
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
  db[email] = true;
  fs.writeFileSync(DB_FILE, JSON.stringify(db));
}

function consultarPagamento(email: string): boolean {
  if (!fs.existsSync(DB_FILE)) return false;
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  return db[email] === true;
}

// 🚀 Criar pagamento Pix
app.post('/create-pix-payment', async (req: any, res: any) => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ error: 'email e amount são obrigatórios' });
    }

    const payment_data = {
      transaction_amount: amount / 100,
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

    const paymentId = payment.body.id.toString();
    salvarPendente(paymentId, email); // ✅ salva para o webhook depois recuperar

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

// ✅ Webhook (único!)
app.post('/webhook', express.json(), async (req: any, res: any) => {
  const paymentId = req.body?.data?.id;
  if (!paymentId) return res.sendStatus(400);

  try {
    const result = await mercadopago.payment.findById(paymentId);
    const payment = result.body;
    const status = payment.status;

    const email = obterEmailPorPagamento(paymentId.toString()); // ✅ agora funciona!

    console.log(`🔍 Pagamento ${paymentId}: status = ${status}, email real = ${email}`);

    if (status === 'approved' && email) {
      salvarPagamento(email);
      console.log(`✅ Pagamento aprovado para o email: ${email}`);
      (async () => {
        await enviarEmailConfirmacao(email);
        await enviarEmailConfirmacaoProdutionPix("laudiersantanamei@gmail.com");
      })()
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// 📦 Consulta de status de pagamento
app.get('/payment-status', (req: any, res: any) => {
  const email = req.query.email as string;
  if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

  const pago = consultarPagamento(email);
  //console.log(pago, "teste")
  res.json({ paid: pago });
});

// ✅ Checkout com cartão (Stripe)
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
            images: ['https://http2.mlstatic.com/D_NQ_NP_2X_897079-MLU77244846123_062024-F.webp'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email, //Esse é o email laudiersantanamei@gmail.com
      success_url: `https://futebolaovivooficial.vercel.app/success?email=${email}`,
      cancel_url: `https://futebolaovivooficial.vercel.app/`,
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

// 🎯 Pagamento com Pix pelo Stripe (alternativo)
app.post('/create-payment-intent', async (req: any, res: any) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email é obrigatório' });
    }

    const customer = await stripe.customers.create({ email });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2000,
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

// 🚀 Inicia servidor
app.listen(4242, () => {
  console.log('🚀 Backend rodando em http://localhost:4242');
});
