//FILES
const { serverConfig } = require('../../config/serverConfig');
const { errorHandler } = require('../../errors/index');
const { ServerQueries } = require('../../queries/serverQueries');
const { decrypt } = require('../../utils/encryption');
const { Security } = require('../../utils/security');

async function startServer(app){
    let openServer = await ServerQueries.getKeyword('server_open');
    
    console.log("openServer array: ", openServer)

    let server;
    if(openServer?.length > 0 && openServer[0].value == 'true'){
        server = app.listen(process.env.PORT || 5000, () => {
            console.log("server started on port: ", process.env.PORT || 5000);
        });
    }

    return server;
}

async function initProcessHandlers(){
    // process.on("uncaughtException", error => {
    //     console.log('uncaughtException', error);
      
    //     // errorHandler.handleError(error);
    // });
    
    // Handle an unhandledRejection
    
    // process.on("unhandledRejection", (reason) => {
    //     console.log('unhandledRejection', reason);
        
    //     // errorHandler.handleError(reason);
    // });

    // process.on("exit", () => {
    //     console.log("Exiting...")
    // })


    //GRACEFULLY SHUT DOWN
    
    // process.on('SIGINT', Security.gracefulShutdown)
    // process.on('SIGTERM', Security.gracefulShutdown)
}

function decryptServerConfig(serverConfig){
    //RECAPTCHA
    serverConfig.RECAPTCHA_SECRET_KEY = decrypt(serverConfig.RECAPTCHA_SECRET_KEY);

    //SIGNER ANCIEN
    serverConfig.PRIVATE_KEY_SIGNER = decrypt(serverConfig.PRIVATE_KEY_SIGNER);

    //TELEGRAM BOT TOKEN
    serverConfig.TELEGRAM_BOT_TOKEN = decrypt(serverConfig.TELEGRAM_BOT_TOKEN);

    //AWS
    serverConfig.AWS.BUCKET_ACCESS_KEY = decrypt(serverConfig.AWS.BUCKET_ACCESS_KEY);
    serverConfig.AWS.BUCKET_SECRET_KEY = decrypt(serverConfig.AWS.BUCKET_SECRET_KEY);

    serverConfig.AWS.AWS_IAM_USER_KEY = decrypt(serverConfig.AWS.AWS_IAM_USER_KEY);
    serverConfig.AWS.AWS_IAM_USER_SECRET = decrypt(serverConfig.AWS.AWS_IAM_USER_SECRET);
    serverConfig.AWS.AWS_BUCKET_NAME = decrypt(serverConfig.AWS.AWS_BUCKET_NAME);

    //ENDPOINT
    serverConfig.endpoint.HTTP_CHAINSTACK = decrypt(serverConfig.endpoint.HTTP_CHAINSTACK);

    for(let i = 0; i < serverConfig.endpoint.WSS_CHAINSTACK.length; i++){
        serverConfig.endpoint.WSS_CHAINSTACK[i] = decrypt(serverConfig.endpoint.WSS_CHAINSTACK[i]);
    }

    if(process.env.CHAIN_ID?.trim() == 1){
        serverConfig.endpoint.HTTP_INFURA = decrypt(serverConfig.endpoint.HTTP_INFURA);
        
        for(let i = 0; i < serverConfig.endpoint.WSS_INFURA.length; i++){
            serverConfig.endpoint.WSS_INFURA[i] = decrypt(serverConfig.endpoint.WSS_INFURA[i]);
        }
    }

    if(process.env.CHAIN_ID?.trim() == 137){
        serverConfig.endpoint.HTTP_GETBLOCK = decrypt(serverConfig.endpoint.HTTP_GETBLOCK);
        
    }



    if(process.env.NODE_ENV == 'production'){
        serverConfig.RECAPTCHA_SECRET_KEY = decrypt(serverConfig.RECAPTCHA_SECRET_KEY);
        serverConfig.RECAPTCHA_SECRET_KEY = decrypt(serverConfig.RECAPTCHA_SECRET_KEY);

    }
}

async function getMatchmakingConstants(){
    let retrieved
    try {
      retrieved =await ServerQueries.getKeywordPVP("matchmaking");  
    } catch (error) {
        logger.error(`Could not retrieve keyword at getKeyWordPVP :${Utils.printErrorLog(error)}`)
    }
    retrieved=JSON.parse(retrieved);
    serverConfig.matchmaking=retrieved
    //console.log(JSON.stringify(serverConfig.matchmaking));
}

module.exports = {
    startServer,
    initProcessHandlers,
    decryptServerConfig,
    getMatchmakingConstants
}