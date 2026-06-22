# 🚲 Recife Ciclovias App

Aplicativo mobile desenvolvido com **React Native + Expo** que consome a API de Dados Abertos da Prefeitura do Recife, exibindo a malha cicloviária da cidade com geolocalização do usuário em tempo real.

---

## 📋 Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React Native | 0.73+ | Framework mobile |
| Expo | ~50.0 | Toolchain e build |
| React Navigation | 6.x | Navegação entre telas |
| Axios | 1.6+ | Consumo de API REST |
| expo-location | ~16.5 | Geolocalização |
| AsyncStorage | ~1.21 | Cache local |

---

## 📁 Estrutura de Pastas

```
src/
├── screens/          # Telas da aplicação
│   ├── SplashScreen.js
│   ├── HomeScreen.js
│   ├── ListaScreen.js
│   ├── DetalhesScreen.js
│   ├── MapaScreen.js
│   └── HistoricoScreen.js
├── components/       # Componentes reutilizáveis
│   ├── CicloviaCard.js
│   ├── LoadingSpinner.js
│   ├── ErrorMessage.js
│   └── LocationBadge.js
├── services/         # Camada de comunicação com APIs
│   ├── apiDadosRecife.js
│   └── apiBackend.js
├── navigation/       # Configuração de rotas
│   └── AppNavigator.js
├── hooks/            # Custom hooks
│   ├── useLocation.js
│   └── useCiclovias.js
├── context/          # Estado global
│   └── AppContext.js
├── utils/            # Funções utilitárias
│   └── helpers.js
└── assets/           # Imagens, ícones
```

---

## ⚙️ Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/recife-ciclovias-app.git
cd recife-ciclovias-app

# 2. Instale as dependências
npm install

# 3. Instale as dependências do Expo
npx expo install expo-location @react-native-async-storage/async-storage

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com o endereço do backend

# 5. Inicie o projeto
npx expo start
```

---

## 🔧 Configuração (.env)

```env
EXPO_PUBLIC_API_RECIFE=https://dados.recife.pe.gov.br
EXPO_PUBLIC_API_BACKEND=http://192.168.0.3


```

---

## 🚀 Execução

```bash
# Expo Go (QR Code)
npx expo start

# Android emulador
npx expo start --android

# iOS simulador
npx expo start --ios
```

---

## 📱 Telas

| Tela | Descrição |
|---|---|
| Splash | Carregamento inicial |
| Home | Dashboard principal |
| Lista | Ciclovias em lista |
| Detalhes | Informações de uma ciclovia |
| Mapa | Mapa com localização |
| Histórico | Registros salvos no backend |

---


