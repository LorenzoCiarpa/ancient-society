# AncientSociety 🏛️

A sophisticated blockchain-based browser game featuring NFT buildings, resource management, staking mechanisms, and a comprehensive marketplace ecosystem built on Web3 technology.

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Smart Contracts](#smart-contracts)
5. [Installation](#installation)
6. [Running the Application](#running-the-application)
7. [Development](#development)
8. [Configuration](#configuration)
9. [API Documentation](#api-documentation)
10. [Contributing](#contributing)

---

## Overview

AncientSociety is a comprehensive Web3 gaming platform that combines traditional browser game mechanics with cutting-edge blockchain technology. Players can:

- **Own and Trade NFT Buildings**: Unique tokenized structures with different functionalities
- **Manage Resources**: Mine, farm, and fish using specialized buildings
- **Stake Assets**: Earn rewards through various staking mechanisms
- **Trade on Marketplace**: Buy and sell assets using ANCIEN tokens (ERC-20)
- **Manage Land**: Acquire, stake, and lease virtual land parcels
- **Participate in Economy**: Engage with liquidity pools and DeFi mechanics

The game operates on the Polygon (MATIC) network, ensuring fast transactions and low fees for an optimal gaming experience.

---

## Architecture

The project follows a microservices architecture with distinct components handling different aspects of the game:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │  Smart Contracts│
│   (React)       │◄──►│   (Node.js)      │◄──►│   (Solidity)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Event Handlers       │
                    │  ┌─────────────────────┐│
                    │  │  Building Events    ││
                    │  │  Staking Events     ││
                    │  │  Token Events       ││
                    │  │  Marketplace Events ││
                    │  └─────────────────────┘│
                    └─────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Metadata Service      │
                    │   (NFT JSON Generation) │
                    └─────────────────────────┘
```

---

## Components

### 🎮 Ancient Society (Core Game)
- **Frontend**: React-based user interface for game interaction
- **Backend**: Node.js API server handling game logic, user authentication, and blockchain integration
- **Features**: User management, game state, transaction processing, marketplace integration

### 📡 Event Handler 1 - Building Staking
- **Purpose**: Monitors and processes all building staking events
- **Functionality**: 
  - Tracks staking rewards
  - Manages building yield calculations
  - Handles staking/unstaking transactions

### 📡 Event Handler 2 - Building Management  
- **Purpose**: Handles building minting and transfer operations
- **Functionality**:
  - Processes NFT minting events
  - Manages ownership transfers
  - Updates building metadata

### 📡 Event Handler 3 - Token & Land Management
- **Purpose**: Comprehensive handler for ANCIEN token and land operations
- **Functionality**:
  - ANCIEN token minting/burning
  - Land minting and staking
  - Land lease contract management
  - Marketplace purchase processing
  - Liquidity pool monitoring (MATIC/ANCIEN)

### 🏷️ Metadata Service
- **Purpose**: Dynamic NFT metadata generation and management
- **Functionality**:
  - Creates JSON metadata for buildings and lands
  - Handles trait generation and rarity calculations
  - Serves metadata endpoints for NFT platforms

### 📜 Smart Contracts
- **Buildings**: Modular NFT contracts for different building types (Townhall, Lumberjack, Mine, Farm, etc.)
- **Lands**: Land ownership and staking contracts
- **Marketplace**: Trading and auction mechanisms  
- **Resources**: Token contracts for in-game resources
- **Stakers**: Various staking mechanism implementations

---

## Smart Contracts

The game utilizes multiple smart contract categories:

- **🏗️ Building Contracts**: NFT contracts for different building types
- **🌍 Land Contracts**: Land ownership, staking, and leasing
- **🛒 Marketplace Contracts**: Alpha and Omega marketplace systems
- **💰 Token Contracts**: ANCIEN (ERC-20) and resource tokens
- **🔒 Staking Contracts**: Multiple staking mechanisms for different assets
- **🎫 Voucher System**: Special voucher mechanism for rewards
- **🔄 Swap Contracts**: Token swapping functionality

---

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL database
- Web3 wallet (MetaMask recommended)
- Access to Polygon network

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ancient-society
   ```

2. **Install dependencies for each component**
   ```bash
   # Main game backend
   cd ancient-society/BE
   npm install
   
   # Main game frontend  
   cd ../FE
   npm install
   
   # Event handlers
   cd ../../event-handler-1
   npm install
   
   cd ../event-handler-2
   npm install
   
   cd ../event-handler-3
   npm install
   
   # Metadata service
   cd ../metadata
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` in each component directory
   - Configure database connections
   - Add blockchain private keys and RPC endpoints
   - Set up API keys and service endpoints

---

## Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd ancient-society/BE
   npm run dev
   ```

2. **Start the frontend application**
   ```bash
   cd ancient-society/FE
   npm start
   ```

3. **Start event handlers**
   ```bash
   # In separate terminals for each handler
   cd event-handler-1
   npm start
   
   cd event-handler-2  
   npm start
   
   cd event-handler-3
   npm start
   ```

4. **Start metadata service**
   ```bash
   cd metadata
   npm start
   ```

### Production Mode

1. **Build frontend**
   ```bash
   cd ancient-society/FE
   npm run build
   ```

2. **Start production servers**
   ```bash
   cd ancient-society/BE
   npm start
   ```

---

## Development

### Available Scripts

#### Backend (ancient-society/BE)
- `npm run dev` - Development mode with hot reload
- `npm run dev-ubuntu` - Development mode for Ubuntu/Linux
- `npm run local` - Local development with specific flags
- `npm run mobile` - Mobile development environment
- `npm start` - Production mode

#### Frontend (ancient-society/FE)
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests

#### Event Handlers
- `npm start` - Start event listener
- `npm run dev` - Development mode with nodemon

---

## Configuration

### Required Environment Variables

Create `.env` files in each component directory with the following variables:

#### Backend Configuration
```env
NODE_ENV=development
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=ancient_society
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key
JWT_SECRET=your_jwt_secret
```

#### Smart Contract Addresses
Configure contract addresses in respective config files:
- Building contracts
- Land contracts  
- Token contracts
- Marketplace contracts
- Staking contracts

### Database Setup
1. Create MySQL database
2. Run migration scripts (if available)
3. Configure connection parameters in each service

---

## Security Considerations

⚠️ **Important Security Notes**:
- Never commit private keys or sensitive configuration
- Use environment variables for all secrets
- Regularly audit smart contracts
- Implement proper access controls
- Monitor event handlers for anomalous activity

---

**Note**: This project requires proper configuration of database connections and blockchain private keys in the respective config files before running. Ensure all environment variables are properly set up according to your deployment environment.

