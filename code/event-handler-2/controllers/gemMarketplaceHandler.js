//LIBRARIES

//ABIs
const GemMarketAbi = require('../ABI/alpha-market-abi.json');

//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES
const {GemMarketService} = require('../services/gemMarketService');

//QUERIES

//HELPERS

//MODELS

//MODELS INITIALIZATION

//LISTENERS
let listOfListener = {
    market: {
        purchase: undefined
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
    

    console.log('Initializing listeners gemMarketplaceHandler...')

    var gemMarket = new serverConfig.chain.wssWeb3.eth.Contract(GemMarketAbi, serverConfig.chain.contracts.ANCIENT_ALPHA_MARKETPLACE);
   
    //<-----------------Purchase-------------------->
    
    listOfListener.market.purchase = gemMarket.events.Purchase()
    .on('data', GemMarketService.purchaseHandler)
    .on('change', (event) => { console.log(event) })
    .on('error', (event) => { console.log(event) })

    console.log('Initialized listeners gemMarketplaceHandler...')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();

