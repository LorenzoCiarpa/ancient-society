//LIBRARIES

//ABIs
let abiSwap = require('../ABI/swap-abi.json')

//CONFIG
const {serverConfig} = require('../config/web3Config')

//SERVICES

//QUERIES
const {LiquidityQueries} = require('../queries/liquidityQueries');

//CONSTANTS
const MIN_TICK = -887200
const MAX_TICK = 887200

//INIT
let swap = new serverConfig.chain.wssWeb3.eth.Contract(abiSwap, "0xc36442b4a4522e871399cd717abdd847ab11fe88");

class LiquidityService{

    static async increaseLiquidityHandler(event){
        let sender;
        let amount;
        let response;
        let found = false;
        let result;
        let resultFee;
        let resultAdd;
    
        console.log("Event increaseLiquidityHandler trigered: ", event)
    
        let liquidityTokenId = event.returnValues.tokenId;
    
        try{
            
            // result = await serverConfig.chain.httpWeb3.eth.getBlockNumber();
            result = await serverConfig.chain.wssWeb3.eth.getTransactionReceipt(event.transactionHash);
            // result = await web3Event.eth.getTransactionReceipt("0xdbd19d51acc3d04ae564b4491ba46e7689eb23a7f7ae6b851f3de8b0985bda03")
        }catch(error){
            console.log("getTransactionReceipt: ", error)
        }
        try{
            for(let log of result.logs){
                if(log.address == serverConfig.chain.contracts.ANCIEN_ADDRESS){
                    if(log.topics[0] != serverConfig.TRANSFER_FUNCTION_ABI_NAME_ENCODED){
                        console.log("Not a transfer function");
                        continue;
                    } 
                    sender = '0x' + log.topics[1].substring(26);
                    amount = await serverConfig.chain.httpWeb3.eth.abi.decodeParameter('uint256', log.data);
                    found = true;
                    break;
                }
            }
        }catch(error){
            console.log("Error in assignment log: ", error)
            return;
        }
        
    
        
        
        if(!found){
            console.log("Exiting for not ancien/matic")
            return
        }
    
        sender = sender.toLowerCase();
    
        try{
            
            resultFee = await swap.methods.positions(liquidityTokenId).call();
            // result = await web3Event.eth.getTransactionReceipt("0xdbd19d51acc3d04ae564b4491ba46e7689eb23a7f7ae6b851f3de8b0985bda03")
        }catch(error){
            console.log(error)
        }
        console.log("debugging fee: ", resultFee)
    
    
        if(resultFee.fee != 10000){
            console.log(`Exiting not the pool we re looking for, fee: ${resultFee.fee}`)
            return
        }
    
        if(resultFee.tickLower != MIN_TICK || resultFee.tickUpper != MAX_TICK){
            console.log(`Exiting not the max range, tickLower: ${resultFee.tickLower}, tickUpper: ${resultFee.tickUpper}`)
            return
        }
    
    
    
        try{
            
            resultAdd = await LiquidityQueries.addTransactionHash(event.transactionHash, "increase");
            // result = await web3Event.eth.getTransactionReceipt("0xdbd19d51acc3d04ae564b4491ba46e7689eb23a7f7ae6b851f3de8b0985bda03")
        }catch(error){
            console.log(error)
        }
    
        if(resultAdd.insertId == 0){
            console.log("Exiting for duplicate")
            return
        } 
    
        amount = serverConfig.chain.httpWeb3.utils.fromWei(amount, 'ether')
    
        console.log(`increasing address: ${sender}, amount: ${amount}`)
        try{
            response = await LiquidityQueries.increaseLiquidity(sender, amount)
        }catch(error){
            console.log(error)
        }
    
        console.log("Finish increase")
        return response;
    }
    
    static async decreaseLiquidityHandler(event){
    
    
        let liquidityTokenId = event.returnValues.tokenId;
        let owner;
        let sender;
        let receiver;
        let amount;
        let response;
        let result;
        let resultFee;
        let resultAdd;
        let responseLiquidity
        let oldLiquidity
        let minLiquidity
        let found = false;
    
        console.log("Event decreaseLiquidityHandler triggered: ", event)
    
        //ADD CHECK DOUBLE EVENT TRIGGERED ON transactionHash
    
        try{
            // result = await web3Event.eth.getTransactionReceipt("0xc36442b4a4522e871399cd717abdd847ab11fe88")
            result = await serverConfig.chain.wssWeb3.eth.getTransactionReceipt(event.transactionHash)
            // result = await serverConfig.chain.httpWeb3.eth.getBlockNumber();

        }catch(error){
            console.log("error in getTransactionhash", error)
        }
        
        try{
            for(let log of result.logs){
                sender = '0x' + log.topics[1].substring(26);
                if(log.address == serverConfig.chain.contracts.ANCIEN_ADDRESS && sender == "0xc36442b4a4522e871399cd717abdd847ab11fe88"){
                    //"0xc36442b4a4522e871399cd717abdd847ab11fe88" is the address of uniswap positions nfts
                    receiver = '0x' + log.topics[2].substring(26);
                    amount = await serverConfig.chain.httpWeb3.eth.abi.decodeParameter('uint256', log.data);
                    found = true;
                    break;
                }
            }
        }catch(error){
            console.log("Error in assignment log: ", error)
            return;
        }
    
        if(!found){
            console.log("Exiting not ancien/matic decrease")
            return
        } 
    
        try{
            
            resultFee = await swap.methods.positions(liquidityTokenId).call();
            // result = await web3Event.eth.getTransactionReceipt("0xdbd19d51acc3d04ae564b4491ba46e7689eb23a7f7ae6b851f3de8b0985bda03")
        }catch(error){
            console.log(error)
        }
    
        if(resultFee.fee != 10000){
            console.log(`Exiting not the pool we re looking for, fee: ${resultFee.fee}`)
            return
        }
    
        if(resultFee.tickLower != MIN_TICK || resultFee.tickUpper != MAX_TICK){
            console.log(`Exiting not the max range, tickLower: ${resultFee.tickLower}, tickUpper: ${resultFee.tickUpper}`)
            return
        }
    
        console.log(`debugging fee: ${resultFee.fee}`)
    
        amount = serverConfig.chain.httpWeb3.utils.fromWei(amount, 'ether')
    
        try{
            responseLiquidity = await LiquidityQueries.getLiquidityAndActualMinByAddress(receiver)
        }catch(error){
            console.log("error in getLiquidityAndActualMinByAddress",error)
        }
    
        if(responseLiquidity?.length > 0) {
    
            try{
                owner = await swap.methods.ownerOf(liquidityTokenId).call();
            }catch(error){
                console.log("Error in ownerOf ", error)
            }
    
            if(owner.toLowerCase().trim() != receiver.toLowerCase().trim()){
                console.log(`Exiting not owner of the position, owner: ${owner}, receiver: ${receiver} `)
                return
            } 
    
            try{
            
                resultAdd = await LiquidityQueries.addTransactionHash(event.transactionHash, "decrease");
                // result = await web3Event.eth.getTransactionReceipt("0xdbd19d51acc3d04ae564b4491ba46e7689eb23a7f7ae6b851f3de8b0985bda03")
            }catch(error){
                console.log("errori in addTransacrionHash",error)
            }
        
            if(resultAdd.insertId == 0){
                console.log("Exiting for duplicate")
                return
            } 
    
            responseLiquidity = responseLiquidity[0]
            console.log("responseLiquidity: ", responseLiquidity)
    
            oldLiquidity = responseLiquidity.liquidity
            liquidityProvided = responseLiquidity.liquidityProvided
    
            console.log(`oldLiquidity: ${oldLiquidity}, minLiquidity: ${minLiquidity}, amount: ${amount}`)
            let newAmount = oldLiquidity - amount
            if(newAmount < liquidityProvided){
                try{   
                    response = await LiquidityQueries.changeBlessingStatus(responseLiquidity.idBlessings, 'deleted')
    
                }catch(error){
                    console.log(error)
                }
            }
        } 
    
        try{
            response = await LiquidityQueries.decreaseLiquidity(receiver, amount)
        }catch(error){
            console.log("Error in resetLiquidity, probably the user didn't exist, ", error)
            return
        }
        console.log("Finish decrease")
        return response;
    
    }
    
    static async transferPositionHandler(event){
    
    
        let liquidityTokenId = event.returnValues.tokenId;
        let from = event.returnValues.from.toLowerCase();
        let to = event.returnValues.to.toLowerCase();
        let owner;
        let sender;
        let receiver;
        let amount;
        let response;
        let result;
        let resultPosition;
        let resultAdd;
        let responseLiquidity
        let oldLiquidity
        let minLiquidity
        let found = false;
    
        // console.log("Event transferPositionHandler triggered: ", event)
    
        if(to == '0x0000000000000000000000000000000000000000'){
            console.log("Exiting for transfer to null address 0x00...")
            return
        }
    
        //ADD CHECK DOUBLE EVENT TRIGGERED ON transactionHash
    
        try{
            
            resultPosition = await swap.methods.positions(liquidityTokenId).call();
            // result = await web3Event.eth.getTransactionReceipt("0xdbd19d51acc3d04ae564b4491ba46e7689eb23a7f7ae6b851f3de8b0985bda03")
        }catch(error){
            console.log("error in positions, token id not valid")
            return
        }
    
        if(resultPosition.token0.toLowerCase() != "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270".toLowerCase() ||
        resultPosition.token1.toLowerCase() != "0xDD1DB78a0Acf24e82e511454F8e00356AA2fDF0a".toLowerCase()){
            console.log(`Exiting not the pair ancien/matic we re looking for`)
            return
        }
    
        if(resultPosition.fee != 10000){
            console.log(`Exiting not the pool we re looking for, fee: ${resultPosition.fee}`)
            return
        }
    
        if(resultPosition.tickLower != MIN_TICK || resultPosition.tickUpper != MAX_TICK){
            console.log(`Exiting not the max range, tickLower: ${resultPosition.tickLower}, tickUpper: ${resultPosition.tickUpper}`)
            return
        }
    
        
    
        try{
            
            resultAdd = await LiquidityQueries.addTransferHash(event.transactionHash, "transfer");
            // result = await web3Event.eth.getTransactionReceipt("0xdbd19d51acc3d04ae564b4491ba46e7689eb23a7f7ae6b851f3de8b0985bda03")
        }catch(error){
            console.log(error)
        }
    
        if(resultAdd.insertId == 0){
            console.log("Exiting for duplicate")
            return
        } 
        //USELESS
        // amount = resultPosition.liquidity;
        // amount = web3Event.utils.fromWei(amount, 'ether');
    
        //DISABLE ONGOING BLESSINGS
        try{
            responseLiquidity = await LiquidityQueries.getLiquidityAndActualMinByAddress(from)
        }catch(error){
            console.log("error in getLiquidityAndActualMinByAddress",error)
        }
    
        if(responseLiquidity?.length > 0) {
            responseLiquidity = responseLiquidity[0]
            console.log("responseLiquidity: ", responseLiquidity)
    
            try{   
                response = await LiquidityQueries.changeBlessingStatus(responseLiquidity.idBlessings, 'deleted')
    
            }catch(error){
                console.log(error)
            }
            
        }
        console.log("resetting: ", from)
        try{
            response = await LiquidityQueries.resetLiquidity(from)
        }catch(error){
            console.log("Error in resetLiquidity, probably the user didn't exist, ", error)
            returnM
        }
    
        //UNCOMPUTABLE
        // try{
        //     response = await increaseLiquidity(to, amount)
        // }catch(error){
        //     console.log(error)
        // }
        console.log("Finish Transfer")
        return response;
    
    }

    static async onChange(change){
        console.log("Change in liquidity: ", change);
    }

    static async onError(error){
        console.log("Error in liquidity: ", error);
    }

}

module.exports = {
    LiquidityService
}
