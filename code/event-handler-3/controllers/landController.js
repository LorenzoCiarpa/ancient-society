//LIBRARIES

//ABIs
const landAbi = require('../ABI/land-abi.json');

//CONFIG
const {serverConfig} = require('../config/web3Config')
const {rotationEmitter} = require('../config/web3Rotation')

//SERVICES

//QUERIES

//HELPERS

//MODELS
const landModel = require('../models/lands/landModel');

//MODELS INITIALIZATION
let landService = new landModel.LandService();

//LISTENERS
let listOfListener = {
    land: {
        mint: undefined,
        transfer: undefined
    },
}
  
let web3 = serverConfig.chain.wssWeb3
const initListeners = () => {
    for(let listenerProp in listOfListener){
        let listener = listOfListener[listenerProp];

        for(let eventListenerProp in listener){
            let eventListener = listener[eventListenerProp];
            
            if(eventListener != undefined) eventListener.unsubscribe();
        }
    }
    
    console.log('Initializing listeners landController....')

    var myContractLand = new serverConfig.chain.wssWeb3.eth.Contract(landAbi, serverConfig.chain.contracts.LAND_ADDRESS);

    //<-----------------BUNDLE MINT-------------------->
    // myContractLand.events.LandMint()
    // .on('data', (event) => {
    //     console.log("event LandMint: ", event);
    // })
    // .on('change', (change) => {
    //     console.log("change in LandMint: ", change);
    // })
    // .on('error', (error) => {
    //     console.log("error in LandMint: ", error);
    // })

    //<-----------------DIRECT MINT-------------------->
    listOfListener.land.transfer = myContractLand.events.Transfer()  //Transfer({ filter: { from: '0x0000000000000000000000000000000000000000' } })
    .on('data', landService.transferLand)
    .on('change', (change) => {
        console.log("change in LandTransfer: ", change);
    })
    .on('error', (error) => {
        console.log("error in LandTransfer: ", error);
    })

    console.log('Initialized listeners landController....')

}

rotationEmitter.on('rotate', () => {
    initListeners();
});

initListeners();
