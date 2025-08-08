const Web3 = require('web3');

const options = {
    
    // timeout: 30000,

    clientConfig: {
        // Useful if requests are large
        
        //maxReceivedFrameSize: 100000000,   // bytes - default: 1MiB
        //maxReceivedMessageSize: 100000000, // bytes - default: 8MiB
    
        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: -1 // ms
    },

    // Enable auto reconnection
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 10,
        onTimeout: false
    }
};

const endpoint = {
    mumbai: {
        HTTP_GETBLOCK: '',
        WSS_GETBLOCK: [
            '',
            ''
        ]
    },

    polygon: {
        HTTP_GETBLOCK: '',
        WSS_GETBLOCK: [
            '',
            ''
        ]
    }
}

let chain_info = {
    alpha:{

        
        polygon: {

            contracts: {
                TOWNHALL_ADDRESS: '0xF4d6cC8ecb64a9B0E7f241FcF6f93984333C7d71',
                LUMBERJACK_ADDRESS:'0xa709Dc0fdD151D1aDa29a6Ff51265f110faf5490',
                STONEMINE_ADDRESS: '0xAbb5E30F26f00321F14A0c2C1d86765bD47C4Fe2',
                FISHERMAN_ADDRESS: '0x464Fbd612a5918018837D2B994Eb49094187a9b1',
                MINER_ADDRESS: '0x3DB53749BFc5cA7d7fD049833db46920Ab38cc26',
                FARMER_ADDRESS: '0xbDcb0fAAC53D956E30113d86A8f6C039513e8743',

                BUNDLE_ADDRESS: '0xc8e7488753946a09883B7cC3b22B6da113C0Fe3E',

                STAKER_TOWNHALL_ADDRESS_OLD: '0x0400144CB3A81F8A7Db7A54694Bbf198617dFc06',
                STAKER_LUMBERJACK_ADDRESS_OLD: '0xDa0372fF3980461d9471f473Bd322a0d51F65876',
                STAKER_STONEMINE_ADDRESS_OLD: '0xDE7De7f4252423Aa66632Fd92E0c4c4C3c7Dd0e3',
                STAKER_FISHERMAN_ADDRESS_OLD: '0xFCeC0e93bc1761D32309f146253E2Ad9a2b20781',
                STAKER_MINER_ADDRESS_OLD: '0xA09575E5FB1A715cD01Daa2E8349FA8840Dda6A3',
                STAKER_FARMER_ADDRESS_OLD: '0xEA5406204DC12E49b732A84810efCBE0ca2cDA38',

                STAKER_TOWNHALL_ADDRESS: '0x8b2ae36C88Be4d791D92A255Aa65134799F61c6E',
                STAKER_LUMBERJACK_ADDRESS: '0xA0Cea268863294b62A9513cf8566cCC2abEE5EcB',
                STAKER_STONEMINE_ADDRESS: '0x70aD38C769807d6C69b441EaaCAB6D6BBB694F1a',
                STAKER_FISHERMAN_ADDRESS: '0xF06A0CDD18D17d5dcc580ff34A59c74D8445E83d',
                STAKER_MINER_ADDRESS: '0x1c35f5354AC0600d673Cc423dCcd0e7a5530A4dA',
                STAKER_FARMER_ADDRESS: '0xEA5406204DC12E49b732A84810efCBE0ca2cDA38',
                
                ANCIEN_ADDRESS_OLD: '0xDD1DB78a0Acf24e82e511454F8e00356AA2fDF0a',
                ANCIEN_ADDRESS: '0x691553E9275E2249A7a6E5C3d61571b4328988df',
                WOOD_ADDRESS: '0x415817AA4c301799A696FB79df2947865532bA89',
                STONE_ADDRESS: '0x8d7d040d87C392938318b1Abdc4CbEFA836FD1aa',

                VOUCHER_ANCIEN_ADDRESS_OLD: '0x788faDeEf2D3b18D52365cc2643441edBB9A8957',
                VOUCHER_ANCIEN_ADDRESS: '0x5cC0154e29DE26a46382f994cfb152480C0C7dEc',
                VOUCHER_WOOD_ADDRESS: '0x2037A4Dd713623A7534Eac9DD470CfdbcC7d5C55',
                VOUCHER_STONE_ADDRESS: '0x6e137049cF46D7780e3fC8EB9b470dF6982f5BEF',

                AIRDROP_ADDRESS: '0x242Ca2Df2EbbbfD5c637f6f69AD3846dDA53866E',

                LAND_ADDRESS: '0x1c8d2618455B3f2A4E5C2573C5c98Dc3Ee2602bb',
                STAKER_LAND_ADDRESS: '0x4235AAC514f27897A9f0Aa71D10396C03549011a',
                VOUCHER_LAND_aDDRESS: '0x57F2994222926B688c7eBc352fDF15D538a6D6a4',

                ANCIENT_ALPHA_MARKETPLACE: '0x77a97111E77a77b78EeF1d9C312471b8e9ce4C05',
                ANCIENT_ALPHA_MARKETPLACE_V1: '0xF9b2427254DccB2C70B75234d9fd16cd6D8A722f',
                ANCIENT_ALPHA_MARKETPLACE_V1_ETH: '0x70B35D851660256c4CBA2794DfED1CD220A36a55',

                ANCIENT_BUILDING_OMEGA: '0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006',
                ANCIENT_OMEGA_STAKER: '0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b',
                ANCIENT_OMEGA_MARKETPLACE: '0xD336af2de2832d0320C47C91C5F8bC46344941F5',
                ANCIENT_OMEGA_MARKETPLACE_ETH: '0x77C6DA1916F16488Ce1a22ef5FF3812a559BF3BA'
                
            },

            chainId: 137, // Polygon Mainnet: 137, Mumbai Testnet: 80001
            
            httpWeb3: new Web3(new Web3.providers.HttpProvider(endpoint.polygon.HTTP_GETBLOCK)),
            wssWeb3: new Web3(new Web3.providers.WebsocketProvider(endpoint.polygon.WSS_GETBLOCK[0], options))
        },

        mumbai: {

            contracts: {
                TOWNHALL_ADDRESS: '0xc18ed42a49a158df18aae27ebf39c5d40e8516f2',
                LUMBERJACK_ADDRESS:'0x2797ed8384A3e53ec60EB4aCB1af696421f6d73c',
                STONEMINE_ADDRESS: '0xC4862f674Bd3D05c965487A04912426D62f593dB',
                FISHERMAN_ADDRESS: '0x73734BF88466481A8fF83f416cBb8eccbb2eB258',
                MINER_ADDRESS: '0xBd26740a17fb750487739d9dba02D4702b6B6D0C',
                FARMER_ADDRESS: '0xf1e7D45DD134125AE4115a0477969d6A8c6294b9',

                STAKER_TOWNHALL_ADDRESS_OLD: '',

                STAKER_TOWNHALL_ADDRESS: '0x6a747877503b9f80f70F5FD5A0Cd39bAc68EbCC0',
                STAKER_LUMBERJACK_ADDRESS: '0x420a73618990c79925DEb2f383319732B8B90c32',
                STAKER_STONEMINE_ADDRESS: '0x870b981E6BE0C04eE976d4a7dd4D0Fb465bDcD37',
                STAKER_FISHERMAN_ADDRESS: '0x725dB8468aF66d7c90332Becf51817a0F18aB7fb',
                STAKER_MINER_ADDRESS: '0x8f39F0d2b10C6D5E78A6619760a04dd8E3A404ec',
                STAKER_FARMER_ADDRESS: '0xb871d5fe8F8781Cb639730bFbB6fcEA721E6557f',

                ANCIEN_ADDRESS: '0xe7a63D8274b7De62a3EeaC75267B083Bc29878f3',
               
                VOUCHER_ANCIEN_ADDRESS: '0xe7f0139d86bAa7e484385d2279f5A9b3C7705A59',
                
                LAND_ADDRESS: '0xcB7E987C992fdefE4A3989Cdce8f8BA948Af7266',
                STAKER_LAND_ADDRESS: '0x16D88Db49b997590718f76e67AD320298bB7BCDb',
                VOUCHER_LAND_aDDRESS: '0x663ac0dDa0AB8423104423930AC564b424BA985c',

                ANCIENT_MARKETPLACE_PROGETTO: '0x2946cC63fcd9bAe04564b00609800CC821b06292'
            },

            chainId: 80001, // Polygon Mainnet: 137, Mumbai Testnet: 80001
            
            httpWeb3: new Web3(new Web3.providers.HttpProvider(endpoint.mumbai.HTTP_GETBLOCK)),
            wssWeb3: new Web3(new Web3.providers.WebsocketProvider(endpoint.mumbai.WSS_GETBLOCK[0], options))
        }
    },

    omega:{

        
        polygon: {

            contracts: {
                TOWNHALL_ADDRESS: '0xF4d6cC8ecb64a9B0E7f241FcF6f93984333C7d71',
                LUMBERJACK_ADDRESS:'0xa709Dc0fdD151D1aDa29a6Ff51265f110faf5490',
                STONEMINE_ADDRESS: '0xAbb5E30F26f00321F14A0c2C1d86765bD47C4Fe2',
                FISHERMAN_ADDRESS: '0x464Fbd612a5918018837D2B994Eb49094187a9b1',

                BUNDLE_ADDRESS: '0xc8e7488753946a09883B7cC3b22B6da113C0Fe3E',

                STAKER_TOWNHALL_ADDRESS: '0x0400144CB3A81F8A7Db7A54694Bbf198617dFc06',
                STAKER_LUMBERJACK_ADDRESS: '0xDa0372fF3980461d9471f473Bd322a0d51F65876',
                STAKER_STONEMINE_ADDRESS: '0xDE7De7f4252423Aa66632Fd92E0c4c4C3c7Dd0e3',
                STAKER_FISHERMAN_ADDRESS: '0xFCeC0e93bc1761D32309f146253E2Ad9a2b20781',

                ANCIEN_ADDRESS: '0xDD1DB78a0Acf24e82e511454F8e00356AA2fDF0a',
                WOOD_ADDRESS: '0x415817AA4c301799A696FB79df2947865532bA89',
                STONE_ADDRESS: '0x8d7d040d87C392938318b1Abdc4CbEFA836FD1aa',

                VOUCHER_ANCIEN_ADDRESS: '0x788faDeEf2D3b18D52365cc2643441edBB9A8957',
                VOUCHER_WOOD_ADDRESS: '0x2037A4Dd713623A7534Eac9DD470CfdbcC7d5C55',
                VOUCHER_STONE_ADDRESS: '0x6e137049cF46D7780e3fC8EB9b470dF6982f5BEF',

                AIRDROP_ADDRESS: '0x242Ca2Df2EbbbfD5c637f6f69AD3846dDA53866E',

                LAND_ADDRESS: '0x1c8d2618455B3f2A4E5C2573C5c98Dc3Ee2602bb',
                STAKER_LAND_ADDRESS: '0x4235AAC514f27897A9f0Aa71D10396C03549011a',
                VOUCHER_LAND_aDDRESS: '0x57F2994222926B688c7eBc352fDF15D538a6D6a4',

                ANCIENT_ALPHA_MARKETPLACE: '0x77a97111E77a77b78EeF1d9C312471b8e9ce4C05',

                ANCIENT_BUILDING_OMEGA: '0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006',
                ANCIENT_OMEGA_STAKER: '0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b',
                ANCIENT_OMEGA_MARKETPLACE: '0xD336af2de2832d0320C47C91C5F8bC46344941F5',
                ANCIENT_OMEGA_MARKETPLACE_ETH: '0x77C6DA1916F16488Ce1a22ef5FF3812a559BF3BA'
                
            },

            chainId: 137, // Polygon Mainnet: 137, Mumbai Testnet: 80001
            
            httpWeb3: new Web3(new Web3.providers.HttpProvider(endpoint.polygon.HTTP_GETBLOCK)),
            wssWeb3: new Web3(new Web3.providers.WebsocketProvider(endpoint.polygon.WSS_GETBLOCK[0], options))
        },

        mumbai: {

            contracts: {
                ANCIENT_ALPHA_MARKETPLACE: '0xa52e2E18396A1F0C01D2AF9672b22eC8D375e653',
                LAND_ADDRESS: '0x95F8bF0fB163eFC0626647E236d4f250e1b229e1',
                STAKER_LAND_ADDRESS: '0x3ba1B4c6ECc2a49C94Ddd79d75E1d58C439634C1',
                VOUCHER_LAND_aDDRESS: '0xb28Df1A90bf1cEC828B43d3efA2F72De1D804F73',
                ANCIENT_BUILDING_OMEGA: '0xDcAa3A2eE0e6E5e78a585C4d3Ae39DcDab6d9C0A',
                ANCIENT_OMEGA_MARKETPLACE: '0x2a67143503373b82BCD3fEb8E91DD0154b7975E9',
                ANCIENT_ALPHA_MARKETPLACE: '0xa52e2E18396A1F0C01D2AF9672b22eC8D375e653' 
            },

            chainId: 80001, // Polygon Mainnet: 137, Mumbai Testnet: 80001
            
            httpWeb3: new Web3(new Web3.providers.HttpProvider(endpoint.mumbai.HTTP_GETBLOCK)),
            wssWeb3: new Web3(new Web3.providers.WebsocketProvider(endpoint.mumbai.WSS_GETBLOCK[0], options))
        }

        
    }
}

const database = {
    alpha_dev_db: {
        USER_DB: 'developer',
        PASSWORD_DB: '',
        HOST_DB: '',
        PORT_DB: '25060',
        DATABASE: 'alpha_dev_db',
        CONNECTION_LIMIT: '1'
    },

    alpha_db: {
        USER_DB: 'alpha_user',
        PASSWORD_DB: '',
        HOST_DB: '',
        PORT_DB: '25060',
        DATABASE: 'alpha_db',
        CONNECTION_LIMIT: '1'
    },

    omega_dev_db: {
        USER_DB: 'developer',
        PASSWORD_DB: '',
        HOST_DB: '',
        PORT_DB: '25060',
        DATABASE: 'omega_dev_db',
        CONNECTION_LIMIT: '1'
    },


    omega_db: {
        USER_DB: 'developer',
        PASSWORD_DB: '',
        HOST_DB: '',
        PORT_DB: '25060',
        DATABASE: 'omega_db',
        CONNECTION_LIMIT: '1'
    },
    
}

const routes = {
    alpha: {
        delegation: true,
        bonusSystem: {
            available: true,
        },
        lands: {
            available: true,
            land_owner: true,
            lands: true,
            world: true,
        },
        storage: {
            voucher: true,
            transfer: true,
            withdraw: true,
            deposit: true
        },
        marketplace: true,
        fishing: true,
        miner: true,
        npc: true,
        gem: {
            available: false,
            maxPurchaseCount: 20,
        },
        inventory: true,
        leaderboard: {
            general: true,
            fishing: true
        },
        profile: true,
        prestige: false
    },

    omega: {
        delegation: true,
        bonusSystem: {
            available: false,
        },
        lands: {
            available: true,
            land_owner: true,
            lands: true,
            world: true,
        },
        storage: {
            voucher: true,
            transfer: true,
            withdraw: true,
            deposit: true
        },
        marketplace: true,
        fishing: true,
        miner: true,
        npc: true,
        gem: {
            available: false,
            maxPurchaseCount: 20,
        },
        inventory: true,
        leaderboard: {
            general: true,
            fishing: true
        },
        profile: true,
        prestige: false
    }
}

const buildingLevel = {
    alpha: {
        1: 10, // Town Hall
        2: 12, // Lumberjack
        3: 12, // Stonemine
        4: 10, // Fisherman

        // prestige level
        'prestige': {
            1: 7, // Town Hall
            2: 8, // Lumberjack
            3: 8, // Stonemine
            4: 5, // Fisherman
        },

        // land max level
        'forest': 2,
        'mountain': 2,
    },

    omega: {
        1: 10, // Town Hall
        2: 10, // Lumberjack
        3: 10, // Stonemine
        4: 10, // Fisherman

        // prestige level
        'prestige': {
            1: 7, // Town Hall
            2: 8, // Lumberjack
            3: 8, // Stonemine
            4: 5, // Fisherman
        },

        // land max level
        'forest': 2,
        'mountain': 2,
    }
}

//SERVER CONFIG OBJECT
const serverConfig = {

    PORT: '5000',
    MAX_LEVEL: '10',

    MAX_NUMBER_VALUE: '1000000000',
    MAX_VOUCHER_VALUE: '150000',
    VOUCHER_ENABLED: true,
    FISHERMAN_SUPPLY: '10000',
    LAST_RESET_LEADERBOARD: '2022-08-13 10:30:00.000000',

    ANCIEN_IMAGE: 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/ancien.webp',
    WOOD_IMAGE: 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/wood.webp',
    STONE_IMAGE: 'https://ancient-society.s3.eu-central-1.amazonaws.com/resources/stone.webp',

    ENV_FILE: 'developmentFile',

    SECRET_KEY_TO_SIGN: 'ABC',
    SECRET_KEY_OLD_JWT: 'DEF',
    SECRET_KEY_NEW_JWT: 'GHI',

    RECAPTCHA_SECRET_KEY: '',

    PRIVATE_KEY_SIGNER: '',
    OWNER_KEY: '',

    AWS: {
        BUCKET_ACCESS_KEY: '',
        BUCKET_SECRET_KEY: '',

        AWS_IAM_USER_KEY: '',
        AWS_IAM_USER_SECRET: '',
        AWS_BUCKET_NAME: ''
    },

    

    marketplace:{
        MARKETPLACE_INVENTORY_TOOL_ADDRESS: '0xacbb7263607e2058B0843F782775D377f45362ce',
        MARKETPLACE_TICKET_ADDRESS: 'futuremarketplaceAddress'
    },

    
    MIN_REVOKE_SEC: '172800',

    bonus: {
        MAX_IMPLICIT_BONUS: '1',
        MAX_PREFIX_BONUS: '2',
        MAX_SUFFIX_BONUS: '2',

        MAX_IMPLICIT_TIER: '3',
        MAX_PREFIX_TIER: '5',
        MAX_SUFFIX_TIER: '5'  
    },
    
    TRANSFER_FUNCTION_ABI_NAME_ENCODED: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',

    staticChain: {
        chain: chain_info,
        endpoint: endpoint
    },
    chain: chain_info.alpha.polygon,
    endpoint: endpoint.polygon,
    database: database.alpha_db,
    routes: routes.alpha,
    options: options,

    indexEndpoint: 0,

    FMC_ADDRESS: '0x8ae0d617f1a6f6d3fdb2b398f4814bebd3939ddf',
    
}

if(process.env.SERVER == 'alpha'){
    serverConfig.buildingLevel = buildingLevel.alpha; 
    serverConfig.routes = routes.alpha;

    //SWITCH chain_info if alpha server
    chain_info = chain_info.alpha;
}

if(process.env.SERVER == 'omega'){
    serverConfig.buildingLevel = buildingLevel.omega; 
    serverConfig.routes = routes.omega;
    
    //SWITCH chain_info if omega server
    chain_info = chain_info.omega;
}

if(process.env.CHAIN_ID == 1){
    serverConfig.chain = chain_info.ethereum; 
    serverConfig.endpoint = endpoint.ethereum; 
}

if(process.env.CHAIN_ID == 137){
    serverConfig.chain = chain_info.polygon; 
    serverConfig.endpoint = endpoint.polygon; 
}

if(process.env.CHAIN_ID == 80001){
    serverConfig.chain = chain_info.mumbai; 
    serverConfig.endpoint = endpoint.mumbai; 
}

if(process.env.DB == 'alpha_dev_db'){
    serverConfig.database = database.alpha_dev_db; 
}

if(process.env.DB == 'alpha_db'){
    serverConfig.database = database.alpha_db; 
}

if(process.env.DB == 'omega_dev_db'){
    serverConfig.database = database.omega_dev_db; 
}

if(process.env.DB == 'omega_db'){
    serverConfig.database = database.omega_db; 
}


//POLYGON
const wssMainnetWeb3 = new Web3(new Web3.providers.WebsocketProvider(process.env.CHAINSTACK_MAINNET_ENDPOINT_1, options));
const wssMumbaiWeb3 = new Web3(new Web3.providers.WebsocketProvider(process.env.CHAINSTACK_MAINNET_ENDPOINT_MUMBAI, options));
const httpMainnetWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTP_CHAINSTACK_MAINNET_ENDPOINT));
const httpMumbaiWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTP_CHAINSTACK_MUMBAI_ENDPOINT));

//ETHEREUM
const httpEthWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_ETH_ENDPOINT_HTTP));

module.exports = {
    serverConfig,
    wssMainnetWeb3,
    wssMumbaiWeb3,
    httpMainnetWeb3,
    httpMumbaiWeb3,
    httpEthWeb3
}