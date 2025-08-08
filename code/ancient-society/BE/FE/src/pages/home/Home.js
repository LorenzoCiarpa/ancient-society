// import './home.scss';
import './sections.scss';

import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';
import { ethers } from 'ethers'

//UNISWAP
import IUniswapV3PoolABI from '../../ABIs/Uniswap.json'
const provider = new ethers.providers.JsonRpcProvider('https://nd-110-171-313.p2pify.com/e84dd341a72bccce7db8670e708b37ea')
const poolAddress = '0x75e7d2cfa340f4a166ffa9b6eb1789a50bd45c8b'
const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider)

//MORALIS
const MORALIS_KEY = 'orUShm1AK5EUbE3VIQsq0t4lBmwR0mxyWdg6fDW2BKTYWewYP6fpffvrSED1PTS3'
const maticAddress = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270';

import {
  Partners
} from '../../components';

import {toFixed} from './../../utils/utils'

import {
  Button,
  CircularProgress,
} from '@mui/material';

//Images
import imgAlpha from '../../assets-game/auth/alpha.png';
import imgOmega from '../../assets-game/auth/omega.png';
import uiSeparator from '../../assets-ui/ui-separator.webp';
import logoTransparent from '../../assets-game/LogoOnerow.png';
import imgFullGame from './assets/mockup.webp';
import imgAlphaLogin from './assets/alpha-login.webp';
import imgServers from './assets/servers.webp';
import imgViewTh from './assets/th-view.jpg';
import imgViewLj from './assets/lj-view.jpg';
import imgViewSm from './assets/sm-view.jpg';
import imgThProduction from './assets/th-production.png';
import imgAncien from '../../assets-game/ancien.webp';
import imgUniswap from './assets/uniswap.png';
import imgAncienDust from './assets/ancien-dust.png';
import imgIngameFm from './assets/ingame-fm.png';
import imgFmFishOpen from './assets/fm-open.png';
import imgTemple from './assets/temple.png';
import imgBldOpen from './assets/th1-open.png';
import imgInvMobile from './assets/inventory-mobile.png';
import imgMrktEnchCoralMobile from './assets/mrkt-ench-coral-mobile.png';
import imgTools from './assets/tools.webp';
import imgConsumables from './assets/consumables.png';
import imgBonus from './assets/bonus.webp';
import imgCraftHat from './assets/craft-hat.png';
import imgChestsAll from './assets/all-chests.webp';
import imgLandEmpty from './assets/land-empty.webp';
import imgLeaderboard from './assets/leaderboard.png';
import imgScholarPanel from './assets/scholarship-panel.png';
import imgOmegaMint from './assets/omega-mint-preview.webp';
import imgIngameMn from './assets/ingame-mn.webp';
import imgMnOpen from './assets/mn-open.webp';


//Videos
import videoThUpgrade from './assets/th-upgrade-video.mp4';
import videoStorage from './assets/storage-video.mp4';
import videoMarketplace from './assets/marketplace-video.mp4';
import videoFishing from './assets/fishing-video.mp4';
import videoTools from './assets/tools-video.mp4';
import videoChest from './assets/chest-video.mp4';
import videoScholarship from './assets/scholarship-video.mp4';
import videoReferral from './assets/referral-video.mp4';
import videoMiner from './assets/mining.mp4';


//Icons
import iconOpensea from '../../assets/iconOpensea.png';
import iconGameInfo from '../../assets-game/icon-info.png';
import iconUI_Discord from '../../assets-ui/icons/icon-discord.webp';
import iconUI_Twitter from '../../assets-ui/icons/icon-twitter.webp';
import iconUI_Wiki from '../../assets-ui/icons/icon-wiki.webp';

function Home() {

  useEffect(() => {
    getAncienValue();
    getNFTsValue();
    getPlayersAlpha();
    getPlayersOmega();
  }, [])
 

  //NFTs VALUE
  const [nftsValue, setNftsValue] = useState([])

  const getNFTsValue = async () => {
    const collectionsName = [
      'ancienttownhall',
      'ancientlumberjack',
      'ancientstonemine',
      'ancientfisherman',
      'ancientland',
    ]

    let x = await Promise.all(
      collectionsName.map(async function (collection, index){
        let urlApiOpensea = `https://api.opensea.io/api/v1/collection/${collection}/stats`
        let response = {};
        await axios
          .get(urlApiOpensea)
          .then(res => {
            response.collection = collection
            response.price = `${res.data.stats.floor_price} ETH`
          })
        return response
      })
    ).then(res => {
      setNftsValue(res)
      console.log('nftsValue: ', nftsValue)
    })
  }
  //--NFTs VALUE


  //ANCIEN VALUE
  const [ancien, setAncien] = useState('...')
  const [maticPriceInUSD, setMaticPriceInUSD] = useState()
  const [ancienMaticRatio, setAncienMaticRatio] = useState()

  useEffect(() => {
    if(isNaN(maticPriceInUSD / ancienMaticRatio)) return
    setAncien(toFixed(maticPriceInUSD / ancienMaticRatio, 6))
  }, [maticPriceInUSD, ancienMaticRatio])

  const getAncienValue = async () => {
      let _ancienMaticRatio = await getAncienMaticRatio();
      let _maticPriceInUSD = await getMaticPriceInUSD();
      setMaticPriceInUSD(_maticPriceInUSD)
      setAncienMaticRatio(_ancienMaticRatio)
  }
  const getAncienMaticRatio = async () => {
    let result = await getPoolState(poolContract)
    let sqrtPriceX96 = result.sqrtPriceX96;
    let a = (sqrtPriceX96 ** 2) 
    let b = 2**192
    let c = a / b 
    console.log('getAncienMaticRatio: ', c)
    return c
  }
  const getMaticPriceInUSD = async () => {
    const options = {
      method: 'GET',
      url: `https://deep-index.moralis.io/api/v2/erc20/${maticAddress}/price?chain=polygon`,
      headers: {
        accept: 'application/json',
        'X-API-Key': MORALIS_KEY
      }
    };
    
    return await axios
      .request(options)
      .then(function (response) {
        console.log(response?.data?.usdPrice)
        return response?.data?.usdPrice;
      })
      .catch(function (error) {
        console.error(error);
      });
  }
  //--ANCIEN VALUE


  //PLAYERS ONLINE
  const [alphaServerInfo, setAlphaServerInfo] = useState({
    serverStatus: <CircularProgress size={15} sx={{color:"white"}}/>,
    playersOnline: <CircularProgress size={15} sx={{color:"white"}}/>,
    playersTotal: <CircularProgress size={15} sx={{color:"white"}}/>,
  })
  const [omegaServerInfo, setOmegaServerInfo] = useState({
    serverStatus: <CircularProgress size={15} sx={{color:"white"}}/>,
    playersOnline: <CircularProgress size={15} sx={{color:"white"}}/>,
    playersTotal: <CircularProgress size={15} sx={{color:"white"}}/>,
  })

  const getPlayersAlpha = async () => {
    axios
      .post("https://www.ancientsociety.io/api/m1/server/getInfo")
      .then((response) => {
          if (response.data.success) {
            setAlphaServerInfo(response.data.data.serverInfo);
          }
      })
  }  
  const getPlayersOmega = async () => {
    axios
      .post("https://www.omega.ancientsociety.io/api/m1/server/getInfo")
      .then((response) => {
          if (response.data.success) {
            setOmegaServerInfo(response.data.data.serverInfo);
          }
      })
  }  
  //--



  return (
      <div className="App">
          {/* <Navbar /> */}

          <div className='home-sections'>
            <div className='home-header'>
              <img src={logoTransparent} />
            </div>

            {/* SECTION 1 */}
            <div className='home-section bk-special-2'>
              <Separator/>

              <span className='icons'>
                <img 
                    className='mini img-link'
                    onClick={()=>window.location.href="https://discord.com/invite/ancientsociety"}
                    src={iconUI_Discord}
                  />
                  <img 
                    className='mini img-link'
                    onClick={()=>window.location.href="https://twitter.com/_ancientsociety"}
                    src={iconUI_Twitter}
                  />
                  <img 
                    className='mini img-link'
                    onClick={()=>window.location.href="https://ancientsociety.gitbook.io/ancient-society-whitepaper/"}
                    src={iconUI_Wiki}
                  />
              </span>
              
              <h2 className='home-headline'>
                Strategy P2E Browser-Game
              </h2>

              <p>
                Ancient Society is an RPG-strategy <b>Browser and Mobile Game</b> (think Age Of Empires & Civilization) created on the Polygon Blockchain.
              </p>

              <img 
                className='home-img'
                src={imgFullGame}
              />

              <p className='bk-soft'>
              Welcome to Ancient Society - a multi-platform P2E game where your opportunity to <b>create, build, and rule your very own empire</b> through the Ages of Civilization awaits. 
              </p>   

              <Separator/>
            </div>

            {/* POWERED BY */}
            <div className='home-section bk-special-1'>
              <h2 className='home-headline'>
                Powered By
              </h2>
              <Partners/>
            </div>

            {/* SECTION 2 - Player Online, Story, Etc */}
            <div className='home-section bk-special-2'>
              <Separator/>

              <h2 className='home-headline'>
                1,000+ Unique Players
              </h2>
              <p>
              We have 2 Servers, more than 5,000+ Founded Cities, and a <b>daily unique players</b> counter of 1,000+.
              </p>

              <span>
                <img 
                  className='home-img sx'
                  src={imgAlphaLogin}
                />
                <img 
                  className='home-img sx'
                  src={imgServers}
                />
              </span>


              <div className='server bk-soft mt-2'>
                <div className='server-elem'>
                  <img 
                    className='sx'
                    src={imgAlpha}
                  />
                </div> 
                <span className='server-elems'>
                  <div className='server-elem'>
                    Online: <b>{alphaServerInfo?.playersOnline}</b>
                  </div> 
                  <div className='server-elem'>
                    Founded: <b>{alphaServerInfo?.playersTotal}</b>
                  </div> 
                </span>
                <div className='server-elem'>
                  <Button 
                    onClick={()=>window.location.href="https://www.ancientsociety.io/game"}
                    className='btnUI'>
                    Play
                  </Button>
                </div>
              </div>
              <div className='server bk-soft'>
                <div className='server-elem'>
                  <img 
                    className='sx'
                    src={imgOmega}
                  />
                </div> 
                <span className='server-elems'>
                  <div className='server-elem'>
                    Online: <b>{omegaServerInfo?.playersOnline}</b>
                  </div> 
                  <div className='server-elem'>
                    Founded: <b>{omegaServerInfo?.playersTotal}</b>
                  </div> 
                </span>
                <div className='server-elem'>
                  <Button 
                    onClick={()=>window.location.href="https://www.omega.ancientsociety.io/game"}
                    className='btnUI secondary'>
                    Play
                  </Button>
                </div>
              </div>

              <p>
              We have been online since May 2022 and have made more than <b>40+ releases</b> in these months.
              </p>

              <Separator/>
            </div>

            {/* SECTION 3 - Buildings */}
            <div className='home-section bk-special-1'>
            <Separator/>

              <h2 className='home-headline'>
                OG Buildings & Core Mechanics
              </h2>
              <p>
              Buildings play a vital role in Ancient Society. They are the core of every player's Town. There are many types of buildings, each one important in its way for the <b>Town’s growth.</b>.  
              </p>
              
              <div className='og bk-soft'>
                <h3>
                  OG Town Hall
                  <span>
                    <img 
                      onClick={()=>window.open("https://opensea.io/collection/ancienttownhall", '_blank')}
                      src={iconOpensea}/>
                    <img 
                      onClick={()=>window.open("https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/buildings/town-hall", '_blank')}
                      src={iconGameInfo}/>
                  </span>
                </h3>
                <img 
                  className='home-img img-og'
                  src={imgViewTh}
                />
                <p className='og-desc'>
                  <b>Drop:</b> $ANCIEN
                </p>
                <p className='og-desc'>
                  <b>Daily Drop</b> 60-155
                </p>
                <p className='og-desc'>
                  <b>Max Level:</b> 10
                </p>
                <p className='og-desc'>
                  <b>Floor Price:</b> {nftsValue.filter(nft => nft?.collection == "ancienttownhall")[0]?.price}
                </p>
              </div>

              <span className='columns-aside'>
                <div className='og bk-soft'>
                  <h3>
                    OG Lumberjack
                    <span>
                      <img 
                        onClick={()=>window.open("https://opensea.io/collection/ancientlumberjack", '_blank')}
                        src={iconOpensea}/>
                      <img 
                        onClick={()=>window.open("https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/buildings/lumberjack", '_blank')}
                        src={iconGameInfo}/>
                    </span>
                  </h3>
                  <img 
                    className='home-img img-og'
                    src={imgViewLj}
                  />
                  <p className='og-desc'>
                    <b>Drop:</b> $ANCIENWOOD
                  </p>
                  <p className='og-desc'>
                    <b>Daily Drop</b> 273-612
                  </p>
                  <p className='og-desc'>
                    <b>Max Level:</b> 12
                  </p>
                  <p className='og-desc'>
                    <b>Floor Price:</b> {nftsValue.filter(nft => nft?.collection == "ancientlumberjack")[0]?.price}
                  </p>
                </div>

                <div className='og bk-soft'>
                  <h3>
                    OG Stone Mine
                    <span>
                      <img 
                        onClick={()=>window.open("https://opensea.io/collection/ancientstonemine", '_blank')}
                        src={iconOpensea}/>
                      <img 
                        onClick={()=>window.open("https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/buildings/stone-mine", '_blank')}
                        src={iconGameInfo}/>
                    </span>
                  </h3>
                  <img 
                    className='home-img img-og'
                    src={imgViewSm}
                  />
                  <p className='og-desc'>
                    <b>Drop:</b> $ANCIENSTONE
                  </p>
                  <p className='og-desc'>
                    <b>Daily Drop</b> 91-203
                  </p>
                  <p className='og-desc'>
                    <b>Max Level:</b> 12
                  </p>
                  <p className='og-desc'>
                    <b>Floor Price:</b> {nftsValue.filter(nft => nft?.collection == "ancientstonemine")[0]?.price}
                  </p>
                </div>
              </span>
              

              <p className='mt-4'>The Buildings <b>can be upgraded</b> using Resources and Items. The higher the level, the higher the daily passive drop. All the Buildings were minted at Level 1.</p>

              <span>
                {/* <img 
                  className='home-img sx'
                  src={imgThUpgradeGif}
                /> */}
                <video className='home-video sx' loop autoPlay={true} muted playsInline >
                  <source src={videoThUpgrade} type="video/mp4"/>
                </video>
                <img 
                  className='home-img sx'
                  src={imgThProduction}
                />
              </span>

              <p className='bk-soft format-stuff'>
                View the complete list of drop rates in the Wiki.
                <img 
                  onClick={()=>window.open("https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/buildings-stats/town-hall-stats", '_blank')}
                  className='mini img-link'
                  src={iconGameInfo} 
                />
              </p>

              <Separator/>
            </div>

            {/* SECTION 4 - $Ancien */}
            <div className='home-section bk-special-3'>
              <Separator/>

              <h2 className='home-headline'>
                $ANCIEN: The Ancient Token
              </h2>

              <p className='bk-soft format-stuff'>
                <img 
                  className='mini'
                  src={imgAncien}
                />
                x
                <b>${ancien}</b> on 
                <img 
                  onClick={()=>window.open("https://dex.guru/token/0xdd1db78a0acf24e82e511454f8e00356aa2fdf0a-polygon", '_blank')}
                  className='sx img-link'
                  src={imgUniswap}
                />
              </p>

              <p>
                $ANCIEN is an ERC-20 token built on the Polygon blockchain. It’s the core of <b>Ancient Society's game-economy</b> and progression. It’s the in-game currency used to trade, for upgrades, for crafting, and much more
              </p>

              <span>
                {/* <img 
                  className='home-img sx'
                  src={imgStorageGif}
                /> */}
                <video className='home-video sx' loop autoPlay={true} muted playsInline >
                  <source src={videoStorage} type="video/mp4"/>
                </video>
                <video className='home-video sx' loop autoPlay={true} muted playsInline >
                  <source src={videoMarketplace} type="video/mp4"/>
                </video>
                {/* <img 
                  className='home-img sx'
                  src={imgMrktGif}
                /> */}
              </span>

              

              <p className='mt-4'>
              Staking a Town Hall is the only way to <b>directly generate $ANCIEN</b>. The only other alternatives are selling items, tools or recipes to other players through the P2P marketplace.
              </p>

              <img 
                className='home-img mb-2'
                src={imgBldOpen}
              />
              
              <Separator/>
            </div>

            {/* SECTION 5 - LP */}
            <div className='home-section bk-special-1'>
              <Separator/>

              <h2 className='home-headline'>
                Burn-Rate & Liquidity
              </h2>

              <span className='columns-aside mt-2'>
                
                <span className='right-column'>
                  <h3 className='subtitle mt-4'>
                    8+ Burning Systems
                  </h3>
                  <p className='full-w'>
                  All the Economy in Ancient Society revolves around <b>$ANCIEN</b>.
                  </p>
                  <p className='bk-soft mt-2'>
                    100% of the $ANCIEN used by the players is <b>instantly BURNT</b>:
                    <ul>
                      <li>Buildings Upgrade</li>
                      <li>Item Crafting</li>
                      <li>Tool Upgrades</li>
                      <li>Emporium NPC</li>
                      <li>Land Upgrade</li>
                      <li>Mint with $ANCIEN</li>
                      <li>NFT Crafting</li>
                      <li>Lotteries</li>
                      <li>New Releases</li>
                    </ul>
                  </p>
                </span>
                <img 
                  className='home-img sx'
                  src={imgAncienDust}
                />
              </span>

              <h3 className='subtitle mt-4'>
                Liquidity Providers Rewards
              </h3>

              <p>
              Depending on how much $ANCIEN you are adding to the <b>Liquidity Pool</b>, you will receive different rewards every 3 days. The rewards change periodically.
              </p>

              <img 
                className='home-img'
                src={imgTemple}
              />
              
              <Separator/>
            </div>

            {/* SECTION 6 - Inventory */}
            <div className='home-section bk-special-2'>
              <Separator/>

              <h2 className='home-headline'>
                Inventory & Trading
              </h2>
              <p>
              A large part of the game’s challenge is balancing <b>spending and acquiring $ANCIEN</b>. Strategy will come into play for every decision within Ancient Society.</p>
              
              <span>
                <img 
                  className='home-img sx'
                  src={imgInvMobile}
                />
                <img 
                  className='home-img sx'
                  src={imgMrktEnchCoralMobile}
                />
              </span>

              <Separator/>
            </div>

            {/* SECTION 7 - Fishing */}
            <div className='home-section bk-special-1'>
              <Separator/>

              <h2 className='home-headline'>
                Fishing
              </h2>
              <p>
              The Fisherman’s Hut allows players to <b>fish manually every 30 minutes</b> and receive rewards.
              </p>

              <div className='og bk-soft'>
                  <h3>
                    Fisherman’s Hut
                    <span>
                      <img 
                        onClick={()=>window.open("https://opensea.io/collection/ancientfisherman", '_blank')}
                        src={iconOpensea}/>
                      <img 
                        onClick={()=>window.open("https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/buildings/fishermans-hut", '_blank')}
                        src={iconGameInfo}/>
                    </span>
                  </h3>
                  <img 
                    className='home-img img-og'
                    src={imgIngameFm}
                  />
                  <p className='og-desc'>
                    <b>Drop:</b> Depending on Seas and Rod
                  </p>
                  <p className='og-desc'>
                    <b>Max Level:</b> 10
                  </p>
              </div>

              <span className='columns-aside mt-2'>
                {/* <img 
                  className='home-img sx'
                  src={imgFishingGif}
                /> */}
                <video className='home-video sx' loop autoPlay={true} muted playsInline >
                  <source src={videoFishing} type="video/mp4"/>
                </video>
                <span className='right-column'>
                  <h3 className='subtitle pt-2'>
                    Seas & Ranks
                  </h3>
                  <p className='full-w'>
                  There are various Special Seas. Some just need a specific Rod. For others, a ticket is required. The Rods can be <b>upgraded and transformed</b> into special Rods, to unlock better Seas.
                  </p>
                  <p className='bk-soft mt-2'>
                    There are <b>different rewards</b> depending on progression and luck (RNG):
                    <ul>
                      <li>Common Manual Resource</li>
                      <li>Rare Manual Resource</li>
                      <li>Recipes</li>
                      <li>Fish (XP)</li>
                      <li>Schematics</li>
                      <li>Items</li>
                    </ul>
                  </p>
                  
                </span>
              </span>
              
              <p className='mt-4'>
                Like all the other Buildings, the Fisherman’s Hut can be upgraded. Once it reaches a certain level, it's possible to activate the <b>Passive Fishing Mode</b>.
              </p>

              <img 
                className='home-img'
                src={imgFmFishOpen}
              />

              <Separator/>
            </div>

            {/* SECTION 8 - Mining */}
            <div className='home-section bk-special-3'>
              <Separator/>

              <h2 className='home-headline'>
                Mining
              </h2>

              <p>
                The Miner allows players to mine manually every 24 hours and receive rewards
              </p>
              
              <div className='og bk-soft'>
                <h3>
                    Miner
                    <span>
                      <img 
                        onClick={()=>window.open("https://opensea.io/collection/ancientfisherman", '_blank')}
                        src={iconOpensea}/>
                      <img 
                        onClick={()=>window.open("https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/buildings/fishermans-hut", '_blank')}
                        src={iconGameInfo}/>
                    </span>
                  </h3>
                <img
                  className='home-img img-og'
                  src={imgIngameMn}
                />  
              
               <p className='og-desc'>
                    <b>Drop:</b> Depending on Caves and Axes
                </p>
                <p className='og-desc'>
                    <b>Max Level:</b> 10
                </p>
              </div>

              <span className='columns-aside mt-2'>
                <video className='home-video sx' loop autoPlay={true} muted playsInline >
                  <source src={videoMiner} type="video/mp4"/>
                </video>
                <span className='right-column'>
                  <h3 className='subtitle pt-2'>
                    Caves & Ranks
                  </h3>
                  <p className='full-w'>
                  There are various Special Caves. Some just need a specific Axes. For others, a ticket is required. The Axes can be <b>upgraded and transformed</b> into special Axes, to unlock better Caves.
                  </p>
                  <p className='bk-soft mt-2'>
                    There are <b>different rewards</b> depending on progression and luck (RNG):
                    <ul>
                      <li>Common Manual Resource</li>
                      <li>Rare Manual Resource</li>
                      <li>Recipes</li>
                      <li>Rock (XP)</li>
                      <li>Schematics</li>
                      <li>Items</li>
                    </ul>
                  </p>
                </span>

                

              </span>
              <p className='mt-4'>
                Like the Fisherman, the Miner can be upgraded, has an upgradable tool and different Caves it can be used in.
              </p>

                <img
                  className='home-img' 
                  src={imgMnOpen}
                />

              <Button 
                onClick={()=>window.open("https://www.mint.ancientsociety.io", '_blank')}
                className='btnUI'>
                  Mint your Miner
                </Button>

              <Separator/>

            </div>

            {/* SECTION 9 - Tools */}
            <div className='home-section bk-special-2'>
              <Separator/>

              <h2 className='home-headline'>
                Tools & Upgrades
              </h2>
              <p>
              The Fisherman’s Hut and the Miner need <b>special tools</b> to work correctly and find real treasures.
              </p>

              <img 
                className='home-img'
                src={imgTools}
              />

              <p className='bk-soft'>
                <b>Each tool has a rarity, a level, certain durability and a set of bonuses.</b>
              </p>

              <span className='columns-aside'>
                <h3 className='subtitle mt-2'>1.</h3>
                <p className='pl-2'>
                Each Building that requires a tool has a basic one inside. Its <b>rank</b> is 0. To craft higher rank tools, recipes and many items are needed
                </p>
              </span>

              <span className='columns-aside'>
                <h3 className='subtitle mt-2'>2.</h3>
                <p className='pl-2'>
                When a new tool is forged, its <b>level</b> is always 0. The level can be increased using items and resources. But luck won't always be to your side.
                </p>
              </span>

              <span className='columns-aside'>
                <h3 className='subtitle mt-2'>3.</h3>
                <p className='pl-2'>
                A tool can be used until the <b>durability</b> reaches 0. Then it needs to be repaired, using resources and specific items sometimes.
                </p>
              </span>
              
              <span className='columns-aside mt-2'>
                {/* <img 
                  className='home-img sx'
                  src={imgToolGif}
                /> */}
                <video className='home-video sx' loop autoPlay={true} muted playsInline >
                    <source src={videoTools} type="video/mp4"/>
                </video>
                <span className='right-column'>
                  <img 
                    className='home-img sx mt-2'
                    src={imgConsumables}
                  />
                  <h3 className='subtitle mt-05'>
                    Upgrade Consumables
                  </h3>
                  <p className='full-w'>
                    Since upgrading the level of a tool can be a daunting task, there are some special items around. 
                  </p>
                  <p className='bk-soft mt-2'>
                    Some of the <b>available consumables</b>:
                    <ul>
                      <li>Upgrade Stone (I, II, III)</li>
                      <li>Efficient Stone (I, II, III)</li>
                      <li>Lucky Missive</li>
                      <li>Fortuna's Pact</li>
                    </ul>
                  </p>
                </span>
              </span>
            
              <Separator/>
            </div>
            
            {/* SECTION 10 - Bonus System */}
            <div className='home-section bk-special-1'>
              <Separator/>

              <h2 className='home-headline'>
                Bonus System
              </h2>
              <p>
              An excellent tool to be defined as such should be <b>enchanted</b> - it should have great bonuses. Every bonus has different tiers, effects, and a chance to be triggered.
              </p>
              
              <span className='columns-aside'>
                <img 
                  className='home-img sx'
                  src={imgBonus}
                />
                <span className='right-column'>
                  <h3 className='subtitle mt-4'>
                    Bonus Types
                  </h3>

                  <span className='columns-aside mt-05'>
                    <h3 className='subtitle mt-2'>1.</h3>
                    <p className='pl-2'>
                    <b>Enchant Prefix</b>: These are the first two slots and focus on bonuses that affect the tool.
                    </p>
                  </span>

                  <span className='columns-aside'>
                    <h3 className='subtitle mt-2'>2.</h3>
                    <p className='pl-2'>
                    <b>Enchant Suffix</b>: These are the second two slots on your tool. These bonuses are mainly focused on what the tool does.
                    </p>
                  </span>

                  <span className='columns-aside'>
                    <h3 className='subtitle mt-2'>3.</h3>
                    <p className='pl-2'>
                    <b>Enchant Implicit</b>: This is the big bonus that makes your tool unique. You can only have one of these on your tool.
                    </p>
                  </span>

                </span>
              </span>

              <Separator/>
            </div>

            {/* SECTION 11 - Crafting & NPC */}
            <div className='home-section bk-special-2'>
              <Separator/>

              <h2 className='home-headline'>
                Crafting & Emporium
              </h2>
              <p>
                Crafting items, tools, and sometimes buildings, is possible through the <b>recipes collected</b> by fishing or mining - or thanks to the Merchant NPC, who sometimes stock up some exotic goods.   
              </p>

              <span className='columns-aside mt-2'>
                
                <span className='right-column'>
                  <h3 className='subtitle mt-4'>
                    50+ Available
                  </h3>
                  <p className='full-w'>
                  There are more than 50 possible craftings, and new ones are continuously released. 
                  </p>
                  <p className='bk-soft mt-2'>
                    Some of the available <b>craftings</b>:
                    <ul>
                      <li>Items</li>
                      <li>Chests</li>
                      <li>Tools</li>
                      <li>Bonus</li>
                      <li>Special Materials</li>
                      <li>Buildings</li>
                    </ul>
                  </p>
                </span>
                <img 
                  className='home-img sx'
                  src={imgCraftHat}
                />
              </span>

              <Separator/>
            </div>

            {/* SECTION 12 - Chest */}
            <div className='home-section bk-special-3'>
              <Separator/>

              <h2 className='home-headline'>
                Mysterious Chests
              </h2>
              <p>
                Hidden treasures can be found in every remote corner of the world. Sometimes they are empty, or almost - but finding the right one could make you the <b>richest conqueror</b> of all the reigns.
              </p>

              <span>
                <img 
                  className='home-img sx'
                  src={imgChestsAll}
                />  
                <video className='home-video sx' loop autoPlay={true} muted playsInline >
                  <source src={videoChest} type="video/mp4"/>
                </video>
                {/* <img 
                  className='home-img sx'
                  src={imgChestGif}
                />   */}
              </span>
              

              <Separator/>
            </div>

            {/* SECTION 13 - Lands */}
            <div className='home-section bk-special-1'>
              <Separator/>

              <h2 className='home-headline'>
                Ancient Lands
              </h2>
              <p>
                Ancient Lands are very limited and give status, bonuses, and privileges.
                Land owners will receive <b>royalties & fees</b> from towns residing on their land. 
              </p>
              
              <div className='og bk-soft'>
                <h3>
                  Ancient Land
                  <span>
                    <img 
                      onClick={()=>window.open("https://opensea.io/collection/ancientland", '_blank')}
                      src={iconOpensea}/>
                    <img 
                      onClick={()=>window.open("https://ancientsociety.gitbook.io/ancient-society-whitepaper/gameplay-in-ancient-society/lands", '_blank')}
                      src={iconGameInfo}/>
                  </span>
                </h3>
                <img 
                  className='home-img img-og'
                  src={imgLandEmpty}
                />
                <p className='og-desc'>
                  <b>Drop:</b> $ANCIENWOOD / $ANCIENSTONE
                </p>
                <p className='og-desc'>
                  <b>Boost:</b> 3%-10%
                </p>
                <p className='og-desc'>
                  <b>Max Level:</b> 3
                </p>
                <p className='og-desc'>
                  <b>Floor Price:</b> {nftsValue.filter(nft => nft?.collection == "ancientland")[0]?.price}
                </p>
              </div>

              <Separator/>
            </div>

            {/* SECTION 14 - Leaderboard */}
            <div className='home-section bk-special-2'>
              <Separator/>

              <h2 className='home-headline'>
                Leaderboard
              </h2>
              <p>
              Depending on the leaderboard, every 1 or 2 weeks, there is a reset of the experience accumulated and an <b>airdrop of rewards</b> depending on the Rankings.
              </p>
              
              <span className='columns-aside'>
                <span className='right-column'>
                  <h3 className='subtitle mt-4'>
                    Different Rankings
                  </h3>

                  <span className='columns-aside mt-05'>
                    <h3 className='subtitle mt-2'>1.</h3>
                    <p className='pl-2'>
                    <b>General</b>: All the experience from claiming resources, fishing fishes or particular events is counted.
                    </p>
                  </span>

                  <span className='columns-aside'>
                    <h3 className='subtitle mt-2'>2.</h3>
                    <p className='pl-2'>
                    <b>Fishing</b>:  There are specific rods luckier than others, but fishing an ancient fish can happen to anyone.
                    </p>
                  </span>

                  <span className='columns-aside'>
                    <h3 className='subtitle mt-2'>3.</h3>
                    <p className='pl-2'>
                    <b>Crafting</b>:  Every time $ANCIEN is burnt during crafting, it will give you points to reach the top of this particular leaderboard.
                    </p>
                  </span>

                </span>
                <img 
                  className='home-img sx ml-2'
                  src={imgLeaderboard}
                />
              </span>


              <Separator/>
            </div>

            {/* SECTION 15 - Scholar */}
            <div className='home-section bk-special-1'>
                <Separator/>

                <h2 className='home-headline'>
                  Scholarship
                </h2>

                <p>
                A special in-game panel allows you to <b>delegate access</b> to your city, totally off-chain. You can keep your NFTs in your wallet and let different wallets play with your city.
                </p>

                <img 
                  className='home-img'
                  src={imgScholarPanel}
                />

                <span className='columns-aside mt-2'>
                
                <span className='right-column'>
                  <h3 className='subtitle mt-4'>
                    7 Permissions
                  </h3>
                  <p className='full-w'>
                    There are 7 different permissions available for the Scholarship Program.
                  </p>
                  <p className='bk-soft mt-2'>
                    The available <b>permissions</b>:
                    <ul>
                      <li>Claim</li>
                      <li>Upgrade</li>
                      <li>Marketplace</li>
                      <li>Transfer</li>
                      <li>Profile</li>
                      <li>Inventory</li>
                      <li>Fisherman</li>
                    </ul>
                  </p>
                </span>
                <video className='home-video sx' loop autoPlay={true} muted playsInline >
                  <source src={videoScholarship} type="video/mp4"/>
                </video>
              </span>

                <Separator/>
              </div>

            {/* SECTION 16 - Omega */}
            <div className='home-section'>
                <Separator/>

                <h2 className='home-headline'>
                  Omega Server
                </h2>
              
                <p>
                  Omega is a low-entrance retroserver with <b>rewards and prizes</b>. Start here with $8 and win Alpha Buildings.
                </p>

                

                <img 
                  className='home-img'
                  src={imgOmegaMint}
                />


                <p className='text-sm'>
                  Available in <b>$ETH $MATIC $USDT $USDC $APE $BNB $LINK $UNI</b>
                </p>

                <Button 
                onClick={()=>window.open("https://www.omega.ancientsociety.io/mint", '_blank')}
                className='btnUI'>
                  Mint
                </Button>

                <p className='bk-soft mt-4'>
                  There are <b>3 different ways</b> to reach the Alpha Server as an Omega player.
                </p>
                

                <span className='columns-aside'>
                  <h3 className='subtitle mt-2'>1.</h3>
                  <p className='pl-2'>
                  Level up your Buildings and use the <b>Prestige</b> to receive special fragments, usable to craft Alpha buildings.
                  </p>
                </span>

                <span className='columns-aside'>
                  <h3 className='subtitle mt-2'>2.</h3>
                  <p className='pl-2'>
                  Reach the top of the <b>Leaderboards</b> and receive in-game items, recipes and rare chests.
                  </p>
                </span>

                <span className='columns-aside'>
                  <h3 className='subtitle mt-2'>3.</h3>
                  <p className='pl-2'>
                  Join the weekly challenges to <b>win $ANCIEN</b>. Each challenge has particular rules and goals.
                  </p>
                </span>
                
                <span className='columns-aside mt-2'>
                  <video className='home-video sx' loop autoPlay={true} muted playsInline >
                      <source src={videoReferral} type="video/mp4"/>
                  </video>
                  <span className='right-column'>
                    <h3 className='subtitle mt-4'>
                      Referral System
                    </h3>
                    <p className='full-w'>
                      Each time you refer a friend <b>you will get 0.3 $MATIC</b> each dollar spent by the new player. 
                    </p>
                    <p className='bk-soft mt-2'>
                      <b>Start earning $MATIC in 4 steps</b>:
                      <ul>
                        <li>Register your wallet</li>
                        <li>Acquire a building</li>
                        <li>Generate your link</li>
                        <li>Refer a friend</li>
                      </ul>
                    </p>
                  </span>
                </span>

                <Separator/>
            </div>

            {/* SECTION 17 - PVP */}
            <div className='home-section bk-special-3'>
              <Separator/>

              <h2 className='home-headline'>
                PVP - TBA
              </h2>
              <p>
                The PVP release is scheduled for <b>Q4 2022</b>. More info will be released soon.
              </p>
              <p>
                Keep an eye on Discord & Twitter.
              </p>
              
              <Separator/>
            </div>

            {/* SECTION LAST - Play Now */}
            <div className='home-section bk-special-2'>
              <Separator/>

              <h2 className='home-headline'>
                Join the Ancient Society
              </h2>

              <div className='server bk-soft mt-2'>
                <div className='server-elem'>
                  <img 
                    className='sx'
                    src={imgAlpha}
                  />
                </div> 
                <span className='server-elems'>
                  <div className='server-elem'>
                    Online: <b>{alphaServerInfo?.playersOnline}</b>
                  </div> 
                  <div className='server-elem'>
                    Founded: <b>{alphaServerInfo?.playersTotal}</b>
                  </div> 
                </span>
                <div className='server-elem'>
                  <Button 
                    onClick={()=>window.location.href="https://www.ancientsociety.io/game"}
                    className='btnUI'>
                    Play
                  </Button>
                </div>
              </div>
              <div className='server bk-soft'>
                <div className='server-elem'>
                  <img 
                    className='sx'
                    src={imgOmega}
                  />
                </div> 
                <span className='server-elems'>
                  <div className='server-elem'>
                    Online: <b>{omegaServerInfo?.playersOnline}</b>
                  </div> 
                  <div className='server-elem'>
                    Founded: <b>{omegaServerInfo?.playersTotal}</b>
                  </div> 
                </span>
                <div className='server-elem'>
                  <Button 
                    onClick={()=>window.location.href="https://www.omega.ancientsociety.io/game"}
                    className='btnUI secondary'>
                    Play
                  </Button>
                </div>
              </div>

              <Separator/>
            </div>

            <div className='home-footer'/>
          </div>

      </div>
  )
}

function Separator() {
  return (
    <img 
      className='home-separator'
      src={uiSeparator} 
    />
  )
}

async function getPoolState(poolContract) {
  const [liquidity, slot] = await Promise.all([poolContract.liquidity(), poolContract.slot0()])

  const PoolState = {
      liquidity,
      sqrtPriceX96: slot[0],
      tick: slot[1],
      observationIndex: slot[2],
      observationCardinality: slot[3],
      observationCardinalityNext: slot[4],
      feeProtocol: slot[5],
      unlocked: slot[6],
  }

  return PoolState
}

export default Home