//ABIs
import ERC721ABI from '../ABIs/BuildingABI.json';
import ERC721OmegaABI from '../ABIs/OmegaBuildingABI.json';
import ERC20ABI from '../ABIs/ERC20ABI.json';
import ERC721StakingABI from '../ABIs/ERCStakingABI.json';
//IMAGEs
import logoAlpha from '../assets-game/auth/alpha.png';
import logoOmega from '../assets-game/auth/omega.png';

//VARs
export let serverConfig = {}
export let servers = [
    {
        name: 'Alpha',
        desc: `The Genesis Server, the original. <br/>OG Buildings drops ERC20 Tokens`,
        img: logoAlpha,
        url: `https://www.ancientsociety.io/game`,
        btnColor: "primary",
        btnText: "Play"
    },
    {
        name: 'Omega',
        img: logoOmega,
        desc: `Nearly free to play. <br/>Make your way to the Alpha Server by playing`,
        url: `https://www.omega.ancientsociety.io/game`,
        btnColor: "success",
        btnText: "Play"
    },
]

//SERVERs
if (process.env.REACT_APP_SERVER === 'dev') {
    serverConfig = {
        blockchain: {
            wallet: {
                metamask: true,
                coinbase: true,
                others: false,
            },
            network: {
                chainId: 137 // Polygon Mainnet: 137, Mumbai Testnet: 80001
            },
        },
        erc20: {
            available: true,
            abi: ERC20ABI,
            contractAncien: "",
            contractWood: "",
            contractStone: "",
            imageAncien: "",
            imageWood: "",
            imageStone: "",
        },
        erc721: {
            available: true,
            abi: ERC721ABI,
            contractTownhall: "0xF4d6cC8ecb64a9B0E7f241FcF6f93984333C7d71",
            contractLumberjack: "0xa709Dc0fdD151D1aDa29a6Ff51265f110faf5490",
            contractStonemine: "0xAbb5E30F26f00321F14A0c2C1d86765bD47C4Fe2",
            contractFisherman: "0x464Fbd612a5918018837D2B994Eb49094187a9b1",
            contractMiner: "0x3DB53749BFc5cA7d7fD049833db46920Ab38cc26",
            contractFarmer: "0xbDcb0fAAC53D956E30113d86A8f6C039513e8743",
            contractLand: "0x1c8d2618455B3f2A4E5C2573C5c98Dc3Ee2602bb",
            staking: {
                available: true,
                abi: ERC721StakingABI,

                contractTownhallOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractLumberjackOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractStonemineOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractFishermanOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractFarmerOld: "0xEA5406204DC12E49b732A84810efCBE0ca2cDA38",
                contractMinerOld: "0x7045f773F8A8271E3067CAB0205A73657356A7c7",

                contractTownhall: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractLumberjack: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractStonemine: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractFisherman: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractFarmer: "0xEA5406204DC12E49b732A84810efCBE0ca2cDA38",
                contractMiner: "0x7045f773F8A8271E3067CAB0205A73657356A7c7",
            }
        },
        contracts: {
            gemMarketplace: "0x77a97111E77a77b78EeF1d9C312471b8e9ce4C05",
            omegaMarketplace: "0xD336af2de2832d0320C47C91C5F8bC46344941F5",
            contractReward: "0xa1490A2EbB6a5bBD218a8ED31104fdDB59D215d8"
        },
        map: {
            image: 'map.jpg',
            temple: true,
            flag: true,
            birds: true,
            dolphin: true,
            announcement: true
        },
        features: {
            delegation: true,
            colony: {
                available: true,
                cityLimit: 10,
                multipleStake: {
                    1: false,   // TownHall
                    2: false,   // LumberJack
                    3: false,   // StoneMine
                    4: false,   // Fisherman
                    5: true,    // Miner
                    6: true,    // Farmer
                },
            },
            bonusSystem: {
                available: true,
                pvp: true
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
                deposit: true,
            },
            fee: {
                withdrawFeeValue: 0.258,
                marketplaceFeeValue: 0.162,
                productionFeeValue:  0.095,
                transferFeeValue: 0.162,
                feeValue: 0.05,
                withdrawFee: true,
                marketplaceFee: true,
                productionFee: true,
                transferFee: true
            },
            marketplace: true,
            fishing: true,
            miner: true,
            farmer: true,
            PVP: true,
            npc: true,
            gem: {
                available: true,
                maxPurchaseCount: 20,
            },
            inventory: true,
            leaderboard: {
                general: true,
                fishing: true,
                crafting: true,
                challenge: true,
            },
            profile: true,
            prestige: true,
        },
        pages: {
            omegaMint: true,
            multichainMint: true,
            pvp: true,
        }
    }
}

if (process.env.REACT_APP_SERVER === 'alpha') {
    serverConfig = {
        blockchain: {
            wallet: {
                metamask: true,
                coinbase: true,
                others: false,
            },
            network: {
                chainId: 80001 // Polygon Mainnet: 137, Mumbai Testnet: 80001
            },
        },
        erc20: {
            available: true,
            abi: ERC20ABI,
            contractAncienOld: "0xe7a63D8274b7De62a3EeaC75267B083Bc29878f3",
            contractAncien: "0xe7a63D8274b7De62a3EeaC75267B083Bc29878f3",
            contractWood: "0x415817AA4c301799A696FB79df2947865532bA89",
            contractStone: "0x8d7d040d87C392938318b1Abdc4CbEFA836FD1aa",
            imageAncien: "",
            imageWood: "",
            imageStone: "",
        },
        erc721: {
            available: true,
            abi: ERC721ABI,
            contractTownhall: "0xc18ed42a49a158df18aae27ebf39c5d40e8516f2",
            contractLumberjack: "0x2797ed8384A3e53ec60EB4aCB1af696421f6d73c",
            contractStonemine: "0xC4862f674Bd3D05c965487A04912426D62f593dB",
            contractFisherman: "0x73734BF88466481A8fF83f416cBb8eccbb2eB258",
            contractPVP: "0x464Fbd612a5918018837D2B994Eb49094187a9b1",
            contractMiner: "0xBd26740a17fb750487739d9dba02D4702b6B6D0C",
            contractFarmer: "0xf1e7D45DD134125AE4115a0477969d6A8c6294b9",
            contractLand: "0xcB7E987C992fdefE4A3989Cdce8f8BA948Af7266",
            staking: {
                available: true,
                abi: ERC721StakingABI,
                contractTownhallOld: "0x6a747877503b9f80f70F5FD5A0Cd39bAc68EbCC0",
                contractLumberjackOld: "0x420a73618990c79925DEb2f383319732B8B90c32",
                contractStonemineOld: "0x870b981E6BE0C04eE976d4a7dd4D0Fb465bDcD37",
                contractFishermanOld: "0x725dB8468aF66d7c90332Becf51817a0F18aB7fb",
                contractPVPOld: "0xFCeC0e93bc1761D32309f146253E2Ad9a2b20781",
                contractMinerOld: "0xA09575E5FB1A715cD01Daa2E8349FA8840Dda6A3",
                contractFarmerOld: "0xEA5406204DC12E49b732A84810efCBE0ca2cDA38",
                
                contractTownhall: "0x6a747877503b9f80f70F5FD5A0Cd39bAc68EbCC0",
                contractLumberjack: "0x420a73618990c79925DEb2f383319732B8B90c32",
                contractStonemine: "0x870b981E6BE0C04eE976d4a7dd4D0Fb465bDcD37",
                contractFisherman: "0x725dB8468aF66d7c90332Becf51817a0F18aB7fb",
                contractPVPman: "0xF06A0CDD18D17d5dcc580ff34A59c74D8445E83d",
                contractMiner: "0x8f39F0d2b10C6D5E78A6619760a04dd8E3A404ec",
                contractFarmer: "0xb871d5fe8F8781Cb639730bFbB6fcEA721E6557f",
                contractLand: "0x16D88Db49b997590718f76e67AD320298bB7BCDb",
            }
        },
        contracts: {
            gemMarketplace: "0x77a97111E77a77b78EeF1d9C312471b8e9ce4C05",
            contractReward: "0xa1490A2EbB6a5bBD218a8ED31104fdDB59D215d8"
        },
        map: {
            image: 'map_alpha.jpg',
            temple: true,
            flag: true,
            birds: true,
            dolphin: true,
            announcement: false,
        },
        features: {
            delegation: true,
            colony: {
                available: true,
                cityLimit: 10,
                multipleStake: {
                    1: true,   // TownHall
                    2: true,   // LumberJack
                    3: true,   // StoneMine
                    4: true,   // Fisherman
                    5: true,   // Miner
                    6: false,   // Farmer
                    7: false,   // PVP
                },
            },
            bonusSystem: {
                available: true,
                pvp: false
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
                deposit: true,
            },
            fee: {
                withdrawFeeValue: 0.05,
                marketplaceFeeValue: 0.05,
                feeValue: 0.05,
                withdrawFee: true,
                marketplaceFee: true,
            },
            marketplace: true,
            fishing: true,
            miner: true,
            farmer: true,
            PVP: false,
            npc: true,
            gem: {
                available: false,
                maxPurchaseCount: 20,
            },
            inventory: true,
            leaderboard: {
                general: true,
                fishing: true,
                crafting: true,
                challenge: true,
            },
            profile: true,
            prestige: true,
        },
        pages: {
            omegaMint: false,
            multichainMint: true,
            pvp: false,
        }
    }
}

if (process.env.REACT_APP_SERVER === 'omega') {
    serverConfig = {
        blockchain: {
            wallet: {
                metamask: true,
                coinbase: true,
                others: false,
            },
            network: {
                chainId: 137 // Polygon Mainnet: 137, Mumbai Testnet: 80001
            },
        },
        erc20: {
            available: false,
            abi: ERC20ABI,
            contractAncien: "",
            contractWood: "",
            contractStone: "",
            imageAncien: "",
            imageWood: "",
            imageStone: "",
        },
        erc721: {
            available: true,
            abi: ERC721OmegaABI,
            contractTownhall: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            contractLumberjack: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            contractStonemine: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            contractFisherman: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            contractPVP: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            contractMiner: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            contractFarmer: "0x9d29Fe95e4Df53CC69D28Be209b9bA97E140A006",
            staking: {
                available: true,
                abi: ERC721StakingABI,
                contractTownhallOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractLumberjackOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractStonemineOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractFishermanOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractPVPOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractFarmerOld: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractMinerOld: "0x7045f773F8A8271E3067CAB0205A73657356A7c7",

                contractTownhall: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractLumberjack: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractStonemine: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractFisherman: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractPVP: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractMiner: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
                contractFarmer: "0x84ff4b3b66771aDf20a8016A0aF68B0cfC4a150b",
            }
        },
        contracts: {
            gemMarketplace: "0x77a97111E77a77b78EeF1d9C312471b8e9ce4C05",
            omegaMarketplace: "0xD336af2de2832d0320C47C91C5F8bC46344941F5",
            contractReward: "0xa1490A2EbB6a5bBD218a8ED31104fdDB59D215d8"
        },
        map: {
            image: 'map_omega.jpg',
            temple: false,
            flag: true,
            birds: true,
            dolphin: true,
            announcement: true
        },
        features: {
            delegation: true,
            colony: {
                available: false,
                cityLimit: 10,
                multipleStake: {
                    1: false,   // TownHall
                    2: false,   // LumberJack
                    3: false,   // StoneMine
                    4: false,   // Fisherman
                    5: false,   // Miner
                    6: false,   // Farmer
                    7: false,   // Farmer
                },
            },
            bonusSystem: {
                available: false,
                pvp: true
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
                withdraw: false,
                deposit: false,
            },
            fee: {
                withdrawFeeValue: 0.05,
                marketplaceFeeValue: 0.05,
                feeValue: 0.05,
                withdrawFee: true,
                marketplaceFee: true,
            },
            marketplace: true,
            fishing: true,
            miner: true,
            farmer: true,
            PVP: false,
            npc: true,
            gem: {
                available: false,
                maxPurchaseCount: 20,
            },
            inventory: true,
            leaderboard: {
                general: true,
                fishing: true,
                crafting: false,
                challenge: false,
            },
            profile: true,
            prestige: false,
        },
        pages: {
            omegaMint: true,
            pvp: false,
        }
    }
}