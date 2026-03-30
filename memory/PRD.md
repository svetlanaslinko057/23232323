# FOMO Arena - PRD

## Original Problem Statement
Клонировать и развернуть репозиторий FOMO Arena (https://github.com/svetlanaslinko057/676767) - Prediction Market Platform на BSC Testnet. Использовать архитектуру проекта: Next.js frontend, NestJS backend, FastAPI proxy, MongoDB, blockchain indexer. Не подменять Next.js на React.

## User Personas
1. **Трейдер/Предсказатель** - делает ставки на исходы рынков
2. **Создатель рынков** - создает prediction markets
3. **Администратор** - управляет рынками, резолвит их

## Architecture
```
Frontend (Next.js 14)  →  Proxy (FastAPI)  →  Backend (NestJS)
     :3000                   :8001               :4001
                                                   ↓
                                               MongoDB
                                                   ↑
Indexer (Node.js)  ←───────────────────────────────┘
     ↓
BSC Testnet (Smart Contract)
```

## Core Requirements (Static)
- Next.js 14 frontend with RainbowKit/Wagmi for Web3
- NestJS backend on port 4001
- FastAPI proxy on port 8001
- MongoDB database
- Blockchain indexer for BSC Testnet events
- Smart Contract: 0x7Fcaa9aF01ee4Ab2fa6C2fb670ff58c673AefC8e
- Stablecoin (USDT): 0x4EeF2A62E8A63b713C96CBADAc4C6622D1EAB948

## What's Been Implemented (2026-03-30)

### Deployment
- [x] Repository cloned from GitHub
- [x] Environment files configured (.env for frontend, backend, indexer)
- [x] Dependencies installed (npm/yarn)
- [x] Supervisor configuration for all services
- [x] Frontend SSR issues fixed (dynamic imports for wagmi/rainbowkit components)

### Services Running
- [x] Backend (NestJS + FastAPI proxy) - port 8001
- [x] Frontend (Next.js 14) - port 3000
- [x] Indexer - syncing BSC Testnet events
- [x] MongoDB - database

### API Endpoints Working
- GET /api/health - Service health check
- GET /api/onchain/indexer/status - Indexer sync status
- GET /api/onchain/config - Contract configuration
- GET /api/onchain/markets - Markets list
- GET /api/onchain/stats - Global statistics
- GET /api/ticker/items - Ticker data

### Frontend Features
- [x] Ticker bar with live statistics
- [x] Navigation (Arena, Duels, Analyst Leagues)
- [x] Connect Wallet button (RainbowKit)
- [x] Market search
- [x] Sort/Filter options
- [x] Create Market modal

## Prioritized Backlog

### P0 (Critical) - Done
- [x] Basic deployment and running

### P1 (High Priority)
- [ ] Create prediction market flow (on-chain)
- [ ] Place bet on market
- [ ] Resolve market
- [ ] Claim winnings

### P2 (Medium Priority)
- [ ] User profile with stats
- [ ] XP and badges system
- [ ] Notifications system
- [ ] Duels feature
- [ ] Analyst Leagues

### P3 (Low Priority)
- [ ] Telegram Mini App integration
- [ ] Advanced analytics
- [ ] Leaderboards

## Next Tasks
1. Test wallet connection flow
2. Test market creation on-chain
3. Integrate Telegram bot (token: 8539686854:AAHM6g76lGGVTog0yW-fQ0KYcDmsHjz0kRU)
4. Implement bet placement flow

## Configuration

### Environment Variables
- Frontend: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CHAIN_ID=97
- Backend: PORT=4001, MONGO_URL, TELEGRAM_BOT_TOKEN
- Indexer: RPC_URL, CONTRACT_ADDRESS, START_BLOCK

### Smart Contract
- Network: BSC Testnet (Chain ID: 97)
- Contract: 0x7Fcaa9aF01ee4Ab2fa6C2fb670ff58c673AefC8e
- Min Bet: 10 USDT
- Platform Fee: 2%
