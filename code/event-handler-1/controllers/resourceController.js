//LIBRARIES

//ABIs
const resourceAbi = require('../ABI/resources-abi.json');

//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES

//QUERIES

//HELPERS

//MODELS
const ResourceModel = require('../models/resources/resourceModel');
const AncienModel = require('../models/resources/ancienModel');
const WoodModel = require('../models/resources/woodModel');
const StoneModel = require('../models/resources/stoneModel');

//MODELS INITIALIZATION
var voucherService = new ResourceModel.VoucherService();
var ancienBurnService = new AncienModel.BurnService();
var woodBurnService = new WoodModel.BurnService();
var stoneBurnService = new StoneModel.BurnService();

//LISTENERS
let listOfListener = {
    ancien: {
        voucherMinted: undefined,
        tokenBurned: undefined
    },

    wood: {
        voucherMinted: undefined,
        tokenBurned: undefined
    },

    stone: {
        voucherMinted: undefined,
        tokenBurned: undefined
    }
}
  

const initListeners = () => {
    for(let listenerProp in listOfListener){
        let listener = listOfListener[listenerProp];

        for(let eventListenerProp in listener){
            let eventListener = listener[eventListenerProp];
            
            if(eventListener != undefined) eventListener.unsubscribe();
        }
    }
    
    console.log('Initializing listeners resourceController....')

    var myContractAncien = new serverConfig.chain.wssWeb3.eth.Contract(resourceAbi, serverConfig.chain.contracts.ANCIEN_ADDRESS);
    var myContractWood = new serverConfig.chain.wssWeb3.eth.Contract(resourceAbi, serverConfig.chain.contracts.WOOD_ADDRESS);
    var myContractStone = new serverConfig.chain.wssWeb3.eth.Contract(resourceAbi, serverConfig.chain.contracts.STONE_ADDRESS);

    //<--------------VOUCHER MINTED------------------>
    listOfListener.ancien.voucherMinted = myContractAncien.events.VoucherMinted()
    .on('data', voucherService.voucherMintedOnData)
    .on('change', voucherService.voucherMintedOnChange)
    .on('error', voucherService.voucherMintedOnError)

    // listOfListener.wood.voucherMinted = myContractWood.events.VoucherMinted()
    // .on('data', voucherService.voucherMintedOnData)
    // .on('change', voucherService.voucherMintedOnChange)
    // .on('error', voucherService.voucherMintedOnError)

    // listOfListener.stone.voucherMinted = myContractStone.events.VoucherMinted()
    // .on('data', voucherService.voucherMintedOnData)
    // .on('change', voucherService.voucherMintedOnChange)
    // .on('error', voucherService.voucherMintedOnError)

    //<--------------TOKEN BURNED------------------>
    listOfListener.ancien.tokenBurned = myContractAncien.events.TokenBurned()
    .on('data', ancienBurnService.burnOnData)
    .on('change', ancienBurnService.burnOnChange)
    .on('error', ancienBurnService.burnOnError)

    // listOfListener.wood.tokenBurned = myContractWood.events.TokenBurned()
    // .on('data', woodBurnService.burnOnData)
    // .on('change', woodBurnService.burnOnChange)
    // .on('error', woodBurnService.burnOnError)

    // listOfListener.stone.tokenBurned = myContractStone.events.TokenBurned()
    // .on('data', stoneBurnService.burnOnData)
    // .on('change', stoneBurnService.burnOnChange)
    // .on('error', stoneBurnService.burnOnError)

    console.log('Initialized listeners resourceController....')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();