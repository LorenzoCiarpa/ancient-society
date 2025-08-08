//ENV
const dotenv = require('dotenv');
if (process.env.NODE_LOCAL) {
  dotenv.config({ path: `.env.local` }); //Just to remember, fixed removing spaces in package.json
} else {
  dotenv.config({ path: `.env.${process.env.NODE_ENV.trim()}` }); //Just to remember, fixed removing spaces in package.json
}

const { serverConfig } = require('./config/serverConfig')
let { SERVER, serverMethods } = require('./www/bin/index');

console.log("ENV-FILE: ", process.env.ENV_FILE)


//REQUIRES
const express = require('express');
const enforce = require('express-sslify');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const random = require('random');
const logger = require('./logging/logger');
let { encrypt, decrypt } = require('./utils/encription')
const compression = require('compression')
const rTracer = require('cls-rtracer')


//REQUIRE ROUTERS
const authRouter = require('./routes/authRouter');
logger.info("authRouter ON")

const buildingsRouter = require('./routes/buildingsRouter');
logger.info("buildingsRouter ON")

const userRouter = require('./routes/userRouter');
logger.info("userRouter ON")

const marketRouter = require('./routes/marketRouter');
logger.info("marketRouter ON")

const shopRouter = require('./routes/shopRouter');
logger.info("shopRouter ON")

const ticketRouter = require('./routes/ticketRouter');
logger.info("ticketRouter ON")

const profileRouter = require('./routes/profileRouter');
logger.info("profileRouter ON")

const serverRouter = require('./routes/serverRouter');
logger.info("serverRouter ON")

const inventoryRouter = require('./routes/inventoryRouter');
logger.info("inventoryRouter ON")

const contractRouter = require('./routes/contractRouter');
logger.info("contractRouter ON")

const leaderboardRouter = require(`./routes/leaderboardRouter`);
logger.info("leaderboardRouter ON")

const fishermanRouter = require(`./routes/fishermanRouter`);
logger.info("fishermanRouter ON")

const minerRouter = require(`./routes/minerRouter`);
logger.info("minerRouter ON")

const farmerRouter = require(`./routes/farmerRouter`);
logger.info("farmerRouter ON")

const delegateRouter = require(`./routes/delegateRouter`);
logger.info("delegateRouter ON")

const colonyRouter = require(`./routes/colonyRouter`);
logger.info("colonyRouter ON")

const marketInventoryRouter = require(`./routes/marketInventoryRouter`);
logger.info("marketInventoryRouter ON")

const landRouter = require(`./routes/landRouter`);
logger.info("landRouter ON")

const bonusRouter = require(`./routes/bonusRouter`);
logger.info("bonusRouter ON")

const devRouter = require(`./routes/devRouter`);
logger.info("devRouter ON")

const pvpRouter = require(`./routes/pvpRouter`);
logger.info("pvpRouter ON")

//FILES
const { errorHandler } = require('./errors/index');
const { ServerQueries } = require('./queries/serverQueries');


//EXPRESS
SERVER.app = express();
if (process.env.NODE_ENV == "production") SERVER.app.use(enforce.HTTPS({ trustProtoHeader: true }));
SERVER.app.use(compression());
SERVER.app.use(express.json());
SERVER.app.use(express.urlencoded({ extended: true }));
SERVER.app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  credentials: true
}));
// SERVER.app.use(helmet());
SERVER.app.use(cookieParser());
SERVER.app.use(express.static(path.join(__dirname, './FE/build')));
SERVER.app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, './FE/build', 'index.html'));
});



//API OBSFUSCATOR
const encodeInterceptor = (req, res, next) => {
  try {
    //Vars
    let oldJson = res.json;
    let regexAddress;

    //Disabled for setProfile
    regexAddress = /setProfile[?]+/
    if (regexAddress.test(req.url)) {
      next();
      return
    }

    //Disabled for Leaderboards
    regexAddress = /getLeaderboard/
    if (regexAddress.test(req.url)) {
      next();
      return
    }

    //Disabled for getCheapestInventories
    regexAddress = /getCheapestInventories/
    if (regexAddress.test(req.url)) {
      next();
      return
    }

    //Decrypt REQ
    let decryptDone;
    try {
      decryptDone = decrypt(req.body.fdbiuhshn87123hbjds);
    } catch (err) {
      return res
        .status(401)
        .json({
          success: false,
          error: 'Error 0x50458991'
        })
    }

    req.body = decryptDone;

    //Encrypt RES
    res.json = function (data) {
      arguments[0] = { fdbiuhgdfs23hbjds: encrypt(arguments[0]) };
      oldJson.apply(res, arguments);
    }

    next();
    return

  } catch (error) {
    return res
      .status(404)
      .json({
        success: false,
        error: 'Error 0x342678991'
      })
  }
}
if (process.env.OBFUSCATE === 'true') SERVER.app.use(encodeInterceptor)

//CREATING UUID
SERVER.app.use(rTracer.expressMiddleware())

//ROUTERS
SERVER.app.use("/api/m1/auth", authRouter);
SERVER.app.use("/api/m1/buildings", buildingsRouter);
SERVER.app.use("/api/m1/user", userRouter);
SERVER.app.use("/api/m1/marketplace", marketRouter);
SERVER.app.use("/api/m1/shop", shopRouter);
SERVER.app.use("/api/m1/ticket", ticketRouter);
SERVER.app.use("/api/c1/contract", contractRouter);
SERVER.app.use("/api/m1/profile", profileRouter);
SERVER.app.use("/api/m1/leaderboard", leaderboardRouter);
SERVER.app.use("/api/m1/server", serverRouter);
SERVER.app.use("/api/m1/inventory", inventoryRouter);
SERVER.app.use("/api/m1/fisherman", fishermanRouter);
SERVER.app.use("/api/m1/miner", minerRouter);
SERVER.app.use("/api/m1/farmer", farmerRouter);
SERVER.app.use("/api/m1/delegation", delegateRouter);
SERVER.app.use("/api/m1/colony", colonyRouter);
SERVER.app.use("/api/m1/marketplaceInventory", marketInventoryRouter);
SERVER.app.use("/api/m1/land", landRouter);
SERVER.app.use("/api/m1/bonus", bonusRouter);
SERVER.app.use("/api/d1/dev", devRouter);
SERVER.app.use("/api/m1/pvp", pvpRouter);

//ERROR HANDLER
SERVER.app.use((err, req, res, next) => {
  // console.log("Arrivati in handlerError: ", err)
  // return res.status(401).json({
  //   success: false
  // })
  errorHandler.handleError(err, res, req);
})

//KEY TO SIGN
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}
serverConfig['SECRET_KEY_OLD_JWT'] = crypto.randomBytes(64).toString('hex');
serverConfig['SECRET_KEY_NEW_JWT'] = crypto.randomBytes(64).toString('hex');
serverConfig['SECRET_KEY_TO_SIGN'] = serverConfig.WELCOME_MESSAGE + " " + getRandomInt(1000000, 1000000000);



//SERVER LISTEN


serverMethods.getMatchmakingConstants();
SERVER.server = serverMethods.startServer(SERVER.app);

//console.log(`${JSON.stringify(serverConfig.matchmaking)}`)
// serverMethods.initProcessHandlers()
// serverMethods.decryptServerConfig()

//process.on handlers
//decrypt info from serverConfig

console.log("pid: ", process?.pid);


// let ar = []
// // let divs = document.querySelectorAll("div[at-attr='user_post']")
// let divs = document.querySelectorAll("div[at-attr='user_post'] button.b-post__tools__btn.set-favorite-btn")
// for(elem of divs){
//   if(!divs[0].classList.contains("m-active"))
//     elem.click()
// }


