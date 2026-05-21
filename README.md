# Louvor 24/7

Plataforma moderna e profissional para o ministério de louvor da igreja, funcionando como landing page oficial, central de repertório, hub de playlists do YouTube e sistema administrativo.

## 🎯 Objetivo

O sistema permite que todos os membros da igreja tenham acesso rápido e organizado às músicas do repertório através de playlists do YouTube, além de centralizar informações da igreja em uma interface moderna, dinâmica e profissional.

## ✨ Funcionalidades

### Seções Principais

- **Hero Section**: Seção impactante com logo, frase bíblica dinâmica e CTAs
- **Sobre a Igreja**: Missão, visão, valores, horários de culto e estatísticas animadas
- **Playlist do Louvor**: Cards modernos com músicas, busca e filtros inteligentes
- **Repertório Completo**: Sistema CRUD para gerenciamento de músicas
- **Blog/Notícias**: Sistema de postagens para avisos, eventos e devocionais
- **Bíblia Offline**: Leitor bíblico moderno com livros, capítulos e versículos
- **Painel Administrativo**: Dashboard moderna com Supabase Auth
- **Integração WhatsApp**: Estrutura preparada para Z-API ou Twilio

## 🛠️ Tecnologias

### Frontend
- HTML5
- CSS3 (com variáveis CSS e Glassmorphism)
- JavaScript Vanilla (ES6+)

### Backend/Banco
- Supabase (banco de dados e autenticação)

### Hospedagem
- Vercel

### Integrações
- YouTube Playlist API
- WhatsApp API (Z-API ou Twilio)

## 📁 Estrutura do Projeto

```
louvor-24-7/
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── data/
│   └── biblia/
│       └── biblia.json
├── image/
│   └── Imagem1.png (logo oficial)
├── scripts/
│   ├── app.js (aplicação principal)
│   ├── api.js (integração Supabase)
│   ├── auth.js (autenticação)
│   ├── player.js (YouTube player)
│   └── whatsapp.js (integração WhatsApp)
├── styles/
│   ├── theme.css (variáveis de tema)
│   ├── global.css (estilos globais)
│   ├── animations.css (animações)
│   ├── sections.css (estilos de seções)
│   └── responsive.css (responsividade)
├── components/
│   ├── navbar/
│   ├── footer/
│   ├── cards/
│   ├── modals/
│   └── buttons/
├── pages/
│   ├── home/
│   ├── admin/
│   ├── blog/
│   └── biblia/
├── supabase/
│   └── schema.sql (schema do banco de dados)
├── index.html
├── vercel.json
├── .env.example
└── README.md
```

## 🚀 Instalação e Configuração

### 1. Clonar o Projeto

```bash
git clone <repository-url>
cd louvor-24-7
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie as credenciais (URL e Anon Key)
3. Execute o SQL do arquivo `supabase/schema.sql` no SQL Editor do Supabase
4. Adicione um usuário admin na tabela `admins`

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`
2. Preencha as variáveis com suas credenciais

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_YOUTUBE_PLAYLIST_ID=your_youtube_playlist_id
VITE_WHATSAPP_PROVIDER=zapi
VITE_WHATSAPP_API_KEY=your_whatsapp_api_key
VITE_WHATSAPP_GROUP_ID=your_whatsapp_group_id
```

### 4. Executar Localmente

```bash
# Usando um servidor local (ex: Live Server)
npx live-server
```

Ou abra o arquivo `index.html` diretamente no navegador.

### 5. Deploy na Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Ou conecte o repositório diretamente na [Vercel](https://vercel.com) e configure as variáveis de ambiente nas configurações do projeto.

## 🎨 Identidade Visual

A identidade visual é baseada automaticamente nas cores do logo da igreja localizado na pasta `image/`. O sistema utiliza:

- **Cores principais**: Extraídas do logo (dark blue, orange/gold, white)
- **Glassmorphism**: Efeitos de vidro fosco
- **Animações**: Scroll reveal, hover effects, transições suaves
- **Dark mode**: Design elegante em modo escuro
- **Responsividade**: Mobile-first approach

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- Celulares
- Tablets
- Desktops
- TVs

## 🔐 Autenticação

O painel administrativo utiliza Supabase Auth para autenticação. Para configurar:

1. Ative a autenticação por email no Supabase
2. Adicione o email do admin na tabela `admins`
3. Use o formulário de login na seção admin

## 📊 Banco de Dados

### Tabelas Principais

- **musicas**: Armazena o repertório de músicas
- **noticias**: Armazena notícias e eventos
- **admins**: Gerencia administradores do sistema
- **configuracoes**: Armazena configurações do sistema
- **acessos**: Registra acessos ao sistema

### Schema Completo

O schema SQL completo está disponível em `supabase/schema.sql`.

## 🎵 Integração YouTube

O sistema integra com YouTube para:
- Exibir playlists oficiais
- Reproduzir músicas diretamente
- Extrair thumbnails de vídeos

Configure o ID da playlist nas variáveis de ambiente.

## 💬 Integração WhatsApp

O sistema está preparado para integração com:
- **Z-API**: API brasileira para WhatsApp
- **Twilio**: API internacional para WhatsApp

Quando uma música é adicionada, uma notificação é enviada automaticamente para o grupo configurado.

### Configuração Z-API

```env
VITE_WHATSAPP_PROVIDER=zapi
VITE_WHATSAPP_API_KEY=your_api_key
VITE_WHATSAPP_GROUP_ID=your_group_id
VITE_WHATSAPP_INSTANCE_ID=your_instance_id
```

### Configuração Twilio

```env
VITE_WHATSAPP_PROVIDER=twilio
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_FROM_NUMBER=your_from_number
```

## 📖 Bíblia Offline

O leitor bíblico funciona offline após o carregamento inicial. Os dados são armazenados em JSON local (`data/biblia/biblia.json`).

Funcionalidades:
- Seleção de livros e capítulos
- Navegação entre versículos
- Ajuste de tamanho de fonte
- Modo claro/escuro
- Pesquisa de textos

## 🎯 Uso do Painel Administrativo

### Acessar o Painel

1. Role até a seção "Admin"
2. Insira email e senha
3. Clique em "Entrar"

### Funcionalidades

- **Dashboard**: Visualização de estatísticas
- **Músicas**: Adicionar, editar e remover músicas
- **Notícias**: Gerenciar postagens
- **Configurações**: Configurar links e integrações

## 🔧 Personalização

### Alterar Cores

Edite `styles/theme.css` para modificar a paleta de cores:

```css
:root {
    --color-primary: #0a0e27;
    --color-accent: #ff6b35;
    /* ... outras variáveis */
}
```

### Alterar Logo

Substitua o arquivo `image/Imagem1.png` pelo logo da sua igreja.

### Alterar Textos

Os textos bíblicos dinâmicos estão em `scripts/app.js` na função `initBibleVerse()`.

## 🚀 Performance

O sistema é otimizado para:
- Carregamento rápido
- Lazy loading de imagens
- CSS otimizado
- JavaScript modular
- Cache eficiente

## 📝 Desenvolvimento

### Adicionar Nova Funcionalidade

1. Crie o componente em `components/`
2. Adicione estilos em `styles/`
3. Implemente lógica em `scripts/`
4. Atualize `index.html`

### Estrutura de Código

- **Modular**: Cada funcionalidade em seu próprio módulo
- **Limpo**: Código comentado e organizado
- **Escalável**: Arquitetura preparada para crescimento

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Contato

Para suporte ou dúvidas, entre em contato através dos canais oficiais da igreja.

---

**Desenvolvido com ❤️ para o ministério de louvor**
