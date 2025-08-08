//LIBRARIES

//ABIs
const BrokenMarketAbi = require('../ABI/omega-marketplace-abi.json');

//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES
const {BrokenMarketService} = require('../services/brokenMarketService');

//MODELS

//MODELS INITIALIZATION

//LISTENERS
let listOfListener = {
    market: {
        purchase: undefined,
        purchaseEth: undefined
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
    

    console.log('Initializing listeners market....')

    var brokenMarket = new serverConfig.chain.wssWeb3.eth.Contract(BrokenMarketAbi, serverConfig.chain.contracts.ANCIENT_ALPHA_MARKETPLACE_V1);    
    var brokenMarketEth = new serverConfig.staticChain.chain.alpha.ethereum.wssWeb3.eth.Contract(BrokenMarketAbi, serverConfig.chain.contracts.ANCIENT_ALPHA_MARKETPLACE_V1_ETH);

    

    //<-----------------PURCHASE-------------------->
    listOfListener.market.purchaseEth = brokenMarketEth.events.Purchase()
    .on('data', BrokenMarketService.purchaseHandler)
    .on('change', (event) => { console.log(event) })
    .on('error', (event) => { console.log(event) })

    listOfListener.market.purchase = brokenMarket.events.Purchase()
    .on('data', BrokenMarketService.purchaseHandler)
    .on('change', (event) => { console.log(event) })
    .on('error', (event) => { console.log(event) })


    console.log('Initialized listeners market....')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();




