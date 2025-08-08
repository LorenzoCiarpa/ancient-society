//LIBRARIES

//ABIs
const buildingAbi = require('../ABI/building-abi.json');
const fishermanAbi = require('../ABI/fisherman-abi.json');
const minerAbi = require('../ABI/miner-abi.json');
const farmerAbi = require('../ABI/farmer-abi.json');


//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES

//QUERIES

//HELPERS

//MODELS
const thModel = require('../models/buildings/thModel');
const ljModel = require('../models/buildings/ljModel');
const smModel = require('../models/buildings/smModel');
const fmModel = require('../models/buildings/fmModel');
const mnModel = require('../models/buildings/mnModel');
const frModel = require('../models/buildings/frModel');

//MODELS INITIALIZATION
let thMintService = new thModel.MintService();
let ljMintService = new ljModel.MintService();
let smMintService = new smModel.MintService();
let fmMintService = new fmModel.MintService();
let mnMintService = new mnModel.MintService();
let frMintService = new frModel.MintService();

//LISTENERS
let listOfListener = {
    townhall: {
        bundleMint: undefined,
        transfer: undefined
    },

    lumberjack: {
        bundleMint: undefined,
        transfer: undefined
    },

    stonemine: {
        bundleMint: undefined,
        transfer: undefined
    },

    fisherman: {
        bundleMint: undefined,
        transfer: undefined
    },

    miner: {
        bundleMint: undefined,
        transfer: undefined
    },

    farmer: {
        bundleMint: undefined,
        transfer: undefined
    },

}
  

const initListeners = () => {
    for(let listenerProp in listOfListener){
        let listener = listOfListener[listenerProp];

        for(let eventListenerProp in listener){
            let eventListener = listener[eventListenerProp];
            
            if(eventListener != undefined) eventListener.unsubscribe();
        }
    }
    

    console.log('Initializing listeners buildingController...')

    var myContractTh = new serverConfig.chain.wssWeb3.eth.Contract(buildingAbi, serverConfig.chain.contracts.TOWNHALL_ADDRESS);
    var myContractLj = new serverConfig.chain.wssWeb3.eth.Contract(buildingAbi, serverConfig.chain.contracts.LUMBERJACK_ADDRESS);
    var myContractSm = new serverConfig.chain.wssWeb3.eth.Contract(buildingAbi, serverConfig.chain.contracts.STONEMINE_ADDRESS);
    var myContractFm = new serverConfig.chain.wssWeb3.eth.Contract(fishermanAbi, serverConfig.chain.contracts.FISHERMAN_ADDRESS);
    var myContractMn = new serverConfig.chain.wssWeb3.eth.Contract(minerAbi, serverConfig.chain.contracts.MINER_ADDRESS);
    var myContractFr = new serverConfig.chain.wssWeb3.eth.Contract(farmerAbi, serverConfig.chain.contracts.FARMER_ADDRESS);

    //<-----------------BUNDLE MINT-------------------->
    // listOfListener.townhall.bundleMint = myContractTh.events.BundleMint()
    // .on('data', thMintService.mintBundleOnData)
    // .on('change', thMintService.mintBundleOnChange)
    // .on('error', thMintService.mintBundleOnError)

    // listOfListener.lumberjack.bundleMint = myContractLj.events.BundleMint()
    // .on('data', ljMintService.mintBundleOnData)
    // .on('change', ljMintService.mintBundleOnChange)
    // .on('error', ljMintService.mintBundleOnError)

    // listOfListener.stonemine.bundleMint = myContractSm.events.BundleMint()
    // .on('data', smMintService.mintBundleOnData)
    // .on('change', smMintService.mintBundleOnChange)
    // .on('error', smMintService.mintBundleOnError)

    // listOfListener.fisherman.bundleMint = myContractFm.events.BundleMint()
    // .on('data', fmMintService.mintBundleOnData)
    // .on('change', fmMintService.mintBundleOnChange)
    // .on('error', fmMintService.mintBundleOnError)

    listOfListener.miner.bundleMint = myContractMn.events.Mint()
    .on('data', mnMintService.mintBundleOnData)
    .on('change', mnMintService.mintBundleOnChange)
    .on('error', mnMintService.mintBundleOnError)

    listOfListener.farmer.bundleMint = myContractFr.events.Mint()
    .on('data', frMintService.mintBundleOnData)
    .on('change', frMintService.mintBundleOnChange)
    .on('error', frMintService.mintBundleOnError)

//<-----------------DIRECT MINT-------------------->

    listOfListener.townhall.transfer = myContractTh.events.Transfer()  
    .on('data', thMintService.mintOnData)
    .on('change', thMintService.mintOnChange)
    .on('error', thMintService.mintOnError)

    listOfListener.lumberjack.transfer = myContractLj.events.Transfer()
    .on('data', ljMintService.mintOnData)
    .on('change', ljMintService.mintOnChange)
    .on('error', ljMintService.mintOnError)

    listOfListener.stonemine.transfer = myContractSm.events.Transfer()
    .on('data', smMintService.mintOnData)
    .on('change', smMintService.mintOnChange)
    .on('error', smMintService.mintOnError)

    listOfListener.fisherman.transfer = myContractFm.events.Transfer()
    .on('data', fmMintService.mintOnData)
    .on('change', fmMintService.mintOnChange)
    .on('error', fmMintService.mintOnError)

    listOfListener.miner.transfer = myContractMn.events.Transfer()
    .on('data', mnMintService.mintOnData)
    .on('change', mnMintService.mintOnChange)
    .on('error', mnMintService.mintOnError)

    listOfListener.farmer.transfer = myContractFr.events.Transfer()
    .on('data', frMintService.mintOnData)
    .on('change', frMintService.mintOnChange)
    .on('error', frMintService.mintOnError)

    console.log('Initialized listeners buildingController...')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();