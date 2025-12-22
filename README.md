# ⚽ Futebol Ao Vivo — Landing Page de Streaming Esportivo

Uma **landing page moderna, rápida e responsiva** desenvolvida para a **venda e divulgação de serviços de streaming de jogos de futebol ao vivo**.  
O projeto possui **frontend em React** e **backend em Node.js + Express**, integrados para gerenciamento de pagamentos, cartões e controle de solicitações.

---

## 📸 Preview

<img src="https://user-images.githubusercontent.com/674621/191327859-b1c95d59-609b-447e-82c1-60e8fdb79a40.png" alt="Preview da Landing Page Futebol Ao Vivo" width="100%" />

> *Imagem ilustrativa. Substitua por screenshots reais do projeto.*

---

## 🔗 Demo / Acesso ao Projeto

👉 **Acesse a landing page online:**  
🌐 https://futebolaovivooficial.vercel.app/

> O link permite visualizar o layout, a navegação e a proposta da página em tempo real.

---

## ✨ Funcionalidades

- ⚽ **Landing Page para Streaming de Futebol**  
  Divulgação de serviços, planos e benefícios.

- 🎯 **Foco em Conversão**  
  Estrutura pensada para capturar leads e direcionar o usuário para a contratação.

- 💳 **Gerenciamento de Pagamentos**  
  Controle de pagamentos, cartões e solicitações pendentes via backend.

- 🔐 **Backend Integrado**  
  API em Node.js + Express para comunicação com o frontend.

- 📱 **Design Responsivo**  
  Compatível com mobile, tablet e desktop.

- 🚀 **Alta Performance**  
  Frontend rápido utilizando Vite + React.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- ⚛️ [React.js](https://reactjs.org/)
- ⚡ [Vite](https://vitejs.dev/)
- 🟦 TypeScript
- 💨 CSS moderno / responsivo

### Backend
- 🟢 [Node.js](https://nodejs.org/)
- 🚂 [Express.js](https://expressjs.com/)
- 🔄 Nodemon
- 📁 Persistência em arquivos `.json`

---

## 📁 Estrutura do Projeto

```bash
futebolaovivo/
├── backend/
│   ├── src/                # Código fonte do backend
│   ├── node_modules/
│   ├── pagamentos.json     # Registros de pagamentos
│   ├── pendentes.json      # Solicitações pendentes
│   ├── nodemon.json
│   ├── package.json
│   ├── package-lock.json
│   └── tsconfig.json
│
├── src/                    # Código fonte do frontend (React)
├── public/                 # Arquivos públicos
├── img/                    # Imagens do projeto
├── cartoes/                # Dados relacionados a cartões
├── node_modules/
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite-env.d.ts
├── passwords.txt           # (uso local / NÃO recomendado versionar)
└── README.md
