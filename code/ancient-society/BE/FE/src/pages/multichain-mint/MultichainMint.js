import './omegamint.scss';
import 'react-toastify/dist/ReactToastify.css';

import React, { Component } from 'react';

import { serverConfig } from '../../config/serverConfig';

import axios from 'axios';
import { ethers } from 'ethers';
import {
  toast,
  ToastContainer,
} from 'react-toastify';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import InfoIcon from '@mui/icons-material/Info';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';

import { toFixed } from '../../utils/utils';
import WalletHandler from './WalletHandler';

import {
  Button,
  CircularProgress,
} from '@mui/material';

//ABIs
import ERC20ABI from '../../ABIs/ERC20ABI.json';
import OracleABI from '../../ABIs/OmegaMint.json';

//IMAGEs UI
import gameComponentContentBorder
  from '../../assets-ui/game-component/content-border.png';
import gameComponentFooterBack
  from '../../assets-ui/game-component/footer-back.png';
import gameComponentFooterMark
  from '../../assets-ui/game-component/footer-mark.png';
import gameComponentHeaderBack
  from '../../assets-ui/game-component/header-back.png';
import gameComponentHeaderBorder1
  from '../../assets-ui/game-component/header-border-1.png';
import gameComponentHeaderBorder2
  from '../../assets-ui/game-component/header-border-2.png';

//IMAGEs
import imgLogo from '../../assets-omega/mintOmega.webp';
import imgBack from '../../assets-mint/undo_white_24dp.svg';
import imgMinteazy from '../../assets-omega/poweredMinteazy.png';

//ICONs
import iconPolygon from './icons/polygon.svg';
import iconEthereum from './icons/ethereum.svg';
import iconSolana from './icons/solana.png';
import iconCard from './icons/card.png';

//CONSTs
const POLYGON_NETWORK_ID = serverConfig?.blockchain?.network?.chainId;
const ORACLE_POLYGON_CONTRACT_ADDRESS = '0x2946cC63fcd9bAe04564b00609800CC821b06292';
const ORACLE_ETHEREUM_CONTRACT_ADDRESS = '0x70B35D851660256c4CBA2794DfED1CD220A36a55';
const MAX_QUANTITY = 20;

class MultichainMint extends Component {
  constructor(props) {
    super(props);

    this.state = {
      config:{
        referral: false
      },

      title: 'Ancient Society Mint',

      //Metamask
      walletProvider: null,
      walletAccount: null,
      walletSigner: null,
      walletNetwork: null,
      isConnected: false,

      //LISTINGS
      listings: null,
      listingsFetched: false,
      listingSelected: null,

      //Blockchain Actions
      networkID: 0,
      oracleAddress: null,
      currentNetworkID: null,

      //Mint Currency Value
      mintCurrency: null,
      mintPrice: null,
      mintContractAddress: null,
      mintIsNative: null,
      mintIsOracle: null,
      mintQuantity: 1,

      //Wallet Info
      balanceChecking: null,
      balanceCurrent: null,
      balanceApproved: null,

      //isLoading
      onApproval: false,
      onMinting: false,
      isLoading: false,

      //Pages
      page: 'mint',

      //Referral
      mintReferral: '',
      anchorEl: null,
    };

    //Functions Binding
    this.isConnected = this.isConnected.bind(this);
  }

  //DID MOUNT
  componentDidMount(){
    let ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) this.setState({ mintReferral: ref });

    this.getListings()
    this.getNetworkID()
  }
  //DID MOUNT END



  //LISTINGS
  getListings(){
    axios.post('/api/m1/server/getBrokenMarketplace', {})
    .then(res => 
      this.setState({
        listings: res.data.data.brokenMarketplace,
        listingsFetched: true
      })
    )
  }
  showListing(listing){
    console.log(listing)
    this.setState({
      listingSelected: listing,
      title: listing.name
    })
  }

  //INFO Popup
  handlePopoverOpen = (event) => {
    this.setState({ anchorEl: event.currentTarget, open: Boolean(event.currentTarget), id: "simple-popover" });
  };

  handlePopoverClose = (event) => {
      this.setState({ anchorEl: event.currentTarget, open: false, id: undefined });
  };

  //LISTINGS END



  //HANDLERS: PRICEs & QUANTITY
  handlePriceChange(e){
    //Reset BalanceChecked Bool
    this.setState({balanceChecking: true}, () => {

      //Get the Currency Values
      let currencySelected = JSON.parse(e.target.value);
      console.log("currencySelected ", currencySelected);

      //Set the Currency Values
      this.setState({
        mintCurrency: currencySelected.name,
        mintPrice: currencySelected.value,
        mintContractAddress: currencySelected.contractAddress,
        mintIsNative: currencySelected.isNative,
        mintIsOracle: currencySelected.isOracle,
      }, () => {

        //Check Balance and if Need Approval
        if(currencySelected.isNative) this.checkNativeBalance()

        if(!currencySelected.isNative){
          this.checkCurrencyBalance(currencySelected.contractAddress);
          this.checkCurrencyAllowance(currencySelected.contractAddress);
        }

        //BalanceChecked Bool is true
        this.setState({balanceChecking: false})
      })

    })

    
  }
  setQuantity = (how) => { 
    if(how && this.state.mintQuantity==MAX_QUANTITY) return false
    if(!how && this.state.mintQuantity==1) return false

    how //[+] onClick
    ? this.setState((prevState, { mintQuantity }) => ({
        mintQuantity: prevState.mintQuantity +1
      }))

    //[-] onClick
    : this.setState((prevState, { mintQuantity }) => ({
        mintQuantity: prevState.mintQuantity -1
      }))
  }
  //HANDLERS: PRICEs & QUANTITY END



  //BLOCKCHAIN STUFF
  async isConnected(metamask){
    this.setState({
      //Metamask
      walletProvider: metamask.walletProvider,
      walletAccount: metamask.walletAccount[0],
      walletSigner: metamask.walletSigner,
      walletNetwork: metamask.walletNetwork,
      isConnected: metamask.isConnected,
    }, () => {
      if (this.state.walletNetwork.chainId == 137) 
          this.setState({oracleAddress: ORACLE_POLYGON_CONTRACT_ADDRESS})

      if (this.state.walletNetwork.chainId == 1) 
        this.setState({oracleAddress: ORACLE_ETHEREUM_CONTRACT_ADDRESS})
    })
  } 

  getNetworkID = async () => {
    let provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    let network = await provider.getNetwork()
    this.setState({currentNetworkID: network.chainId})
    provider.on("network", (newNetwork) => {
      if(this.state.isConnected)
        this.setState({isConnected: false})

      this.setState({currentNetworkID: newNetwork.chainId}, () => {

        if (newNetwork.chainId == 137) 
          this.setState({oracleAddress: ORACLE_POLYGON_CONTRACT_ADDRESS})

        if (newNetwork.chainId == 1) 
          this.setState({oracleAddress: ORACLE_ETHEREUM_CONTRACT_ADDRESS})
      })
    });
  }

  async checkNativeBalance () {
    console.log('checkNativeBalance...')

    const balance = await this.state.walletProvider.getBalance(this.state.walletAccount);
    this.setState({balanceCurrent: parseFloat(ethers.utils.formatEther(balance))})

    console.log(balance)
    console.log(ethers.utils.formatEther(balance))
    console.log(parseFloat(ethers.utils.formatEther(balance)))

    return(parseFloat(ethers.utils.formatEther(balance)))
  }

  async checkCurrencyBalance(contractAddress){ 
    console.log('checkCurrencyBalance... ', contractAddress) 
 
    const tokenInst = new ethers.Contract(contractAddress, ERC20ABI, this.state.walletSigner); 
    const balance = await tokenInst.balanceOf(this.state.walletAccount) 
    //IF IS USDT/USDC 
    if( 
      contractAddress == '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' 
      || contractAddress == '0xdAC17F958D2ee523a2206206994597C13D831ec7' 
      || contractAddress == '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' 
      || contractAddress == '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' 
    ){ 

      //IF IS USDT/USDC 
      this.setState({balanceCurrent: parseFloat(ethers.utils.formatUnits(balance, 6))}) 
      return(parseFloat(ethers.utils.formatUnits(balance, 6))) 
    }else{ 
      //IF IS NOT USDT/USDC 
      this.setState({balanceCurrent: parseFloat(ethers.utils.formatEther(balance))}) 
      return(parseFloat(ethers.utils.formatEther(balance))) 
    } 
     
  }

  async checkCurrencyAllowance(contractAddress){
    console.log('checkCurrencyAllowance...', contractAddress)

    //Vars Declaration
    let contract = null;
    let approve = null;
    let balanceApproved = null;
    let receipt = null;

    //Get the Oracle Address
    let approveWallet = this.state.oracleAddress;
 
    //Initialize the Contract Object
    contract = new ethers.Contract(contractAddress, ERC20ABI, this.state.walletSigner);
 
    //Check ETH usage
    try{
      balanceApproved = await contract.allowance(
        this.state.walletAccount,
        approveWallet)
    }catch(err){
      console.error('OmegaMint #00001: ', err);
      this.notify(err.message)
    }

    //Set the Balance Approved to transfer to the Contract
    console.log('balanceApproved: ', balanceApproved)
    this.setState({balanceApproved: parseFloat(ethers.utils.formatUnits(balanceApproved, 6))})
  }

  async approveCurrency(contractAddress){
    console.log('approveCurrency...')

    if(this.state.onApproval) return false

    //Vars Declaration
    let contract = null;
    let approve = null;
    let checkApprove = null;
    let receipt = null;

    //Get the Oracle Address
    let approveWallet = this.state.oracleAddress;
 
    //Initialize the Contract Object
    contract = new ethers.Contract(contractAddress, ERC20ABI, this.state.walletSigner);
 
    //Approve the Currency
    try{
      this.setState({onApproval: true})

      //Ask to Sign
      //IF IS USDT/USDC 
    if( 
      contractAddress == '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' 
      || contractAddress == '0xdAC17F958D2ee523a2206206994597C13D831ec7' 
      || contractAddress == '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' 
      || contractAddress == '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' 
    ){ 
      approve = await contract.approve(
        approveWallet, 
        ethers.utils.parseUnits(toFixed(this.state.mintPrice*this.state.mintQuantity, 5).toString(), 6))
        
    }else{ 
      approve = await contract.approve(
        approveWallet, 
        ethers.utils.parseEther(toFixed(this.state.mintPrice*this.state.mintQuantity, 5).toString()))
        
    } 
      
      //If the User has signed
      if(approve){
        let toastLoading = this.loading('Approving... Almost done!')
        receipt = await approve.wait();

        this.setState({
          onApproval: false,
          balanceApproved: this.state.mintPrice*this.state.mintQuantity,
        })

        toast.update(toastLoading, { 
          render: "Done, you can mint now!", 
          type: "success", 
          isLoading: false,
          autoClose: 3000 });
      }

    //Error during the Approval
    }catch(err){
      console.error('OmegaMint #00003');
      this.notify(err.message);
      this.setState({onApproval: false})
    }
  }

  async mint(){
    if(this.state.onMinting) return false

    if(this.state.mintReferral){
      this.setState({isLoading: true})

      await axios
        .post('/api/m1/server/setReferalInstance', {
          address: this.state.walletAccount,
          addressReferral: this.state.mintReferral,
          idBrokenMarketplace: this.state.listingSelected.idBrokenMarketplace
        })
        .then(res => {
          this.setState({isLoading: false})
        })  
    }

    //Vars Declaration
    let contract = null;
    let mint = null;
    let receipt = null;
    let approved = null;
    let contractAddress = null;
    let ABI = null;

    //Initialize the Contract Object
    contract = new ethers.Contract(this.state.oracleAddress, OracleABI, this.state.walletSigner);

    //Mint per Native Currency
    if (this.state.mintIsNative){
      console.log('Native for Minting: ', 
        ethers.utils.parseEther(
          toFixed(
            this.state.mintPrice*this.state.mintQuantity, 5
          ).toString()
        ).toString(),
        


      )

      let ovverides = {
        value: ethers.utils.parseEther(toFixed(this.state.mintPrice*this.state.mintQuantity, 5).toString())
      }; //Because it's NATIVE CURRENCY

      try{
        this.setState({onMinting: true})

        mint = await contract.purchase(
          this.state.listingSelected.idBrokenMarketplace,
          this.state.mintQuantity, 
          ovverides
        );

      }catch(err){
        console.error('OmegaMint #00004');
        this.notify(err.message);
        this.setState({onMinting: false})
      }
    }
    
    //Mint per Other Currencies
    if(!this.state.mintIsNative){
      try{
        this.setState({onMinting: true})

        mint = await contract.purchaseCurrency(
          this.state.mintContractAddress,
          this.state.listingSelected.idBrokenMarketplace,
          this.state.mintQuantity 
        );
      }catch(err){
        console.error('OmegaMint #00005');
        this.notify(err.message);
        this.setState({onMinting: false})
      }
    }

    if(mint){
      let toastLoading = this.loading('Minting... Almost done!')

      receipt = await mint.wait();

      this.setState({onMinting: false})

      toast.update(toastLoading, { 
        render: "Done!", 
        type: "success", 
        isLoading: false,
        autoClose: 5000  });
    }else{
      console.error('OmegaMint #00006');
      this.notify('Error, try again!');
    }
  }
  //BLOCKCHAIN STUFF END



  //HTML FUNCTIONS
  getMintButton(){

    //Balance Checking
    if(this.state.balanceChecking)
      return <Button
        variant='contained'> 
          <CircularProgress size={25} sx={{color:"white"}}/>
      </Button>
      

    //Balance Is Not Enough
    if(!this.state.balanceChecking  
      && this.state.balanceCurrent < this.state.mintPrice*this.state.mintQuantity)
      return <Button
        variant='contained'> 
          Balance Is Not Enough
      </Button>
      
    
    console.log("balanceChecking ", this.state.balanceChecking)
    console.log("balanceCurrent ", this.state.balanceCurrent)
    console.log("mintIsNative ", this.state.mintIsNative)
    console.log("balanceApproved ", this.state.balanceApproved)
    //Balance Is Enough, Currency is NOT Native And Need Approval
    if(
      !this.state.balanceChecking  
      && this.state.balanceCurrent >= this.state.mintPrice*this.state.mintQuantity
      && !this.state.mintIsNative
      && this.state.balanceApproved < this.state.mintPrice*this.state.mintQuantity
    )
      return <Button
        variant='contained'
        onClick={() => this.approveCurrency(this.state.mintContractAddress)}> 
          Approve {this.state.mintCurrency}
      </Button>

    //Balance Is Enough 
    //Currency is Native (NO Need Approval)
    //OR Currency is Not Native and it's Approved 
    if(
      !this.state.balanceChecking  
      && this.state.balanceCurrent >= this.state.mintPrice*this.state.mintQuantity
      && (this.state.mintIsNative || (this.state.balanceApproved >= this.state.mintPrice*this.state.mintQuantity))
    )
      return <Button
        variant='contained'
        onClick={() => this.mint()}> 
          Mint
      </Button>
  }

  getPricesSelect(){
    //POLYGON CURRENCIEs
    if(this.state.mintMethod == 'polygon')
    return <div className='mintPrice'>

            <select 
            name='Price' 
            defaultValue='Select' 
            onChange={(e) => this.handlePriceChange(e)}> 

              <option default hidden>Select Currency</option>

              {this.state.listingSelected?.prices_polygon?.map(currency => (
                <option value={JSON.stringify(currency)}>
                  {toFixed(currency.value * this.state.mintQuantity, 4)} {currency.name}
                </option>
              ))}

            </select>

          </div>

    //ETHEREUM CURRENCIEs
    if(this.state.mintMethod == 'eth')
    return <div className='mintPrice'>

            <select 
              name='Price' 
              defaultValue='Select' 
              onChange={(e) => this.handlePriceChange(e)}> 

              <option default hidden>Select Currency</option>
              
              {this.state.listingSelected?.prices_ethereum?.map(currency => (
                <option value={JSON.stringify(currency)}>
                  {toFixed(currency.value * this.state.mintQuantity, 5)} {currency.name}
                </option>
              ))}

            </select>
          
          </div>
  }

  generateReferralLink(){
    if(!this.state.myWallet) {
      this.setState({myReferralLink: 'Insert a valid address!'})
      return false
    }

    this.setState({myReferralLink: `https://www.omega.ancientsociety.io/mint?ref=${this.state.myWallet}`});
  }
  //HTML FUNCTIONS END



  //TOASTs
  loading = (message) => toast.loading(message);
  notify = (error) => toast.error(error);
  //TOASTs END



  render(){
    return (
      <div className='myGame mintSpecial'>

          <div className={'game-component'}>
            <div className='game-container'>
                <div className='header'>
                    <img className='gameComponentHeaderBack' src={gameComponentHeaderBack} alt='game-component-header-back'></img>
                    <img className='gameComponentHeaderBorder1' src={gameComponentHeaderBorder1} alt='game-component-header-border1'></img>
                    <img className='gameComponentHeaderBorder2' src={gameComponentHeaderBorder2} alt='game-component-header-border2'></img>
                    <span 
                    className = {this.state.listingSelected 
                      ? `title mintSpecial`
                      : 'title mintSpecial'}
                    onClick={()=>this.setState({
                      listingSelected: null, 
                      mintQuantity: 1,
                      title: 'Ancient Society Mint'
                    })}>
                      {this.state.title}
                    </span>
                </div>
                <div className='content'>
                    <img className='gameComponentContentBorder' src={gameComponentContentBorder} alt='game-component-content-border'></img>
                    
                    <div className='scroll-content mintSpecial'>
                      <div className='page-content mintContainer mintSpecial'>

                              {/* Back to listings */}
                              {this.state.listingSelected 
                                ? <div className='backToListings' 
                                  onClick={()=>this.setState({
                                    listingSelected: null, 
                                    mintQuantity: 1,
                                    title: 'Ancient Society Mint'
                                  })}>⬅</div>
                                : null
                              }
                          

                              {/* <div className='mintComponent omega'> */}

                                {/* <div className='mintContainer'>  */}

                                  {!this.state.listingsFetched && <CircularProgress size={100} sx={{color:"gold", margin:"50px"}}/>}     

                                  {/* DISPLAY LISTINGS */}
                                  {(this.state.listingsFetched && !this.state.listingSelected) &&
                                    <div className='mintListings'>
                                    {!this.state.listingSelected &&
                                      this.state.listings?.map((listing, i) => (
                                        <div className='mintListing' key={i} onClick={()=>this.showListing(listing)}>
                                          <h2 className='listingName'>{listing.name}</h2>
                                          <img className='listingImg' src={listing.image}></img>
                                          {/* <p className='listingDesc'>{listing.description}</p> */}
                                          <span className='listingInfo'>
                                            <Button 
                                            className='listingShowBtn'
                                            variant='contained' 
                                            onClick={()=>this.showListing(listing)}>
                                              Mint
                                            </Button>
                                            <p className='listingPrice'>
                                              {toFixed(listing.prices_polygon.filter(element => element.isNative == true)[0]?.value, 3)} MATIC
                                              / {toFixed(listing.prices_ethereum.filter(element => element.isNative == true)[0]?.value, 3)} ETH
                                            </p>
                                          </span>
                                        </div>
                                      ))}
                                    </div>}

                                  {/* LISTING SELECTED */}
                                  {this.state.listingSelected &&
                                    <>
                                    <div className='mintSelected'>

                                      {/* LISTING INFO */}
                                      <div className='mintSelectedContainer option_img'>
                                        <div className='mintSelectedHeader'>
                                          <div className='mintSelectedBack'
                                            onClick={()=>this.setState({
                                              listingSelected: null, 
                                              mintQuantity: 1,
                                              title: 'Ancient Society Mint'
                                            })}>
                                            <img src={imgBack}/>
                                          </div>
                                          <h2>{this.state.listingSelected.name}</h2>
                                        </div>
                                        <div className='mintSelectedHeadlineAndImg'>
                                          <img src={this.state.listingSelected.image}/>
                                        </div>  

                                        <div className='listingDesc bk-soft'>
                                          {this.state.listingSelected.description}
                                        </div>

                                      </div>

                                      {/* LISTING ACTIONS */}
                                      <div className='mintSelectedContainer'>



                                        {/* LISTING DESC & DROPs */}
                                        <p className='listingDrops'>
                                          {this.state.listingSelected.products?.map((element, i) => (
                                            <p className={element.nft ? 'isNFT listingDrop' : 'listingDrop'} key={i}>
                                              - x{element.quantity * this.state.mintQuantity} {element.nft ? 'NFT' : null} {element.name} {element.level >= 0 && `+${element.level}`} 
                                            </p>
                                          ))}
                                        </p>



                                          
                                        {/* MINT OPTION */}
                                        <div className='mintMethods'>

                                          {this.state.mintMethod 

                                            // {/* Back to all the methods */}
                                            ? <p className='backToMethods'
                                              onClick={()=>this.setState({
                                                mintMethod: null, 
                                                isConnected: false
                                              })}>
                                                ⬅ Back to the other mint options
                                              </p>
                                            
                                            // {/* Select mint method  */}
                                            : <div className='currentPrice'>
                                                <p className='textInfo'>Current Price</p>
                                                <p className='ethPrice'>
                                                  <img src={iconEthereum} className='icon icon-sm'/>
                                                  {toFixed(this.state.listingSelected.prices_ethereum.filter(element => element.isNative == true)[0]?.value, 3)} ETH
                                                </p>
                                              </div>
                                          }
                                          
                                          

                                          {/* MINT METHOD TO SELECT */}
                                          {!this.state.mintMethod
                                            ? <>
                                              <div className='mintMethod'
                                              onClick={()=>this.setState({mintMethod: 'eth'})}>
                                                <h3>
                                                  <img src={iconEthereum} className='icon'/>
                                                  Mint with Ethereum
                                                </h3>
                                                <div className='acceptedOptions'>
                                                  <p className='box-ethereum'>ETH</p>
                                                  <p className='box-harmony'>APE</p>
                                                  <p className='box-polygon'>MATIC</p>
                                                  <p className='box-bnb'>BNB</p>
                                                  <p className='box-harmony'>LINK</p>
                                                  <p className='box-avalanche'>UNI</p>
                                                  <p className='box-ethereum'>USDT</p>
                                                  <p className='box-ethereum'>USDC</p>
                                                </div>
                                              </div>
    
                                              <div className='mintMethod'
                                              onClick={()=>this.setState({mintMethod: 'polygon'})}>
                                                <h3>
                                                  <img src={iconPolygon} className='icon'/>
                                                  Mint with Polygon
                                                </h3>
                                                <div className='acceptedOptions'>
                                                  <p>MATIC</p>
                                                  <p>ETH</p>
                                                  <p>BNB</p>
                                                  <p>USDT</p>
                                                  <p>USDC</p>
                                                </div>
                                              </div>
    
                                              <div className='mintMethod'
                                              onClick={()=>this.setState({mintMethod: 'solana'})}>
                                                <h3>
                                                  <img src={iconSolana} className='icon'/>
                                                  Mint with Solana 
                                                  <p className='textInfo'>Powered by Crossmint</p>
                                                </h3>
                                                
                                                <div className='acceptedOptions'>
                                                  <p>SOL</p>
                                                </div>
                                              </div>
                                              
                                              <div className='mintMethod'
                                              onClick={()=>this.setState({mintMethod: 'card'})}>
                                                <h3>
                                                  <img src={iconCard} className='icon'/>
                                                  Use a Credit Card 
                                                  <p className='textInfo'>Powered by Crossmint</p>
                                                </h3>
                                                <div className='acceptedOptions'>
                                                  <p>Visa</p>
                                                  <p>Mastercard</p>
                                                  <p>GooglePay</p>
                                                  <p>ApplePay</p>
                                                </div>
                                              </div>
                                            </>
                                            : null
                                          }

                                          {/* ETHEREUM SELECTED  */}
                                          {this.state.mintMethod == 'eth'
                                            ? <>
                                                <div className='mintMethod methodSelected'>
                                                  <h3>
                                                    <img src={iconEthereum} className='icon'/>
                                                    Mint with Ethereum
                                                  </h3>
                                                  <div className='acceptedOptions'>
                                                    <p className='box-ethereum'>ETH</p>
                                                    <p className='box-harmony'>APE</p>
                                                    <p className='box-polygon'>MATIC</p>
                                                    <p className='box-bnb'>BNB</p>
                                                    <p className='box-harmony'>LINK</p>
                                                    <p className='box-avalanche'>UNI</p>
                                                    <p className='box-ethereum'>USDT</p>
                                                    <p className='box-ethereum'>USDC</p>
                                                  </div>
                                                </div>

                                                {(!this.state.isConnected) 

                                                  // Wallet Not Connected 
                                                  ? <>
                                                      <div className='useWallet'>
                                                        {/* <h3><span className='ancientGold'>[ETHEREUM]</span> Connect your Wallet</h3> */}
                                                        <WalletHandler 
                                                        currentNetworkID={this.state.currentNetworkID}
                                                        networkID={1} 
                                                        callback_isConnected={this.isConnected}/>
                                                      </div>
                                                    </>

                                                  // Wallet Connected
                                                  : this.getPricesSelect()
                                                }
                                              </>
                                            : null}

                                          {/* POLYGON SELECTED  */}
                                          {this.state.mintMethod == 'polygon'
                                            ? <>

                                                <div className='mintMethod methodSelected'>
                                                  <h3>
                                                    <img src={iconPolygon} className='icon'/>
                                                    Mint with Polygon
                                                  </h3>
                                                  <div className='acceptedOptions'>
                                                    <p>MATIC</p>
                                                    <p>ETH</p>
                                                    <p>BNB</p>
                                                    <p>USDT</p>
                                                    <p>USDC</p>
                                                  </div>
                                                </div>

                                                {(!this.state.isConnected)

                                                ? <>
                                                    <div className='useWallet'>
                                                      {/* <h3><span className='ancientGold'>[POLYGON]</span> Connect your Wallet</h3> */}
                                                      <WalletHandler 
                                                      currentNetworkID={this.state.currentNetworkID}
                                                      networkID={137} 
                                                      callback_isConnected={this.isConnected}/>
                                                    </div>
                                                  </>
                                                
                                                // Wallet Connected
                                                : this.getPricesSelect()
                                              }
                                              </>
                                            : null}

                                          {/* CURRENCY SELECTED */}
                                          {(this.state.isConnected 
                                          && this.state.mintCurrency) && 

                                          <div className='useWallet'>
                                            <div className='mintQuantity'>
                                              <button className='btnQuantity'
                                                onClick={()=>this.setQuantity(false)}>
                                                  -
                                              </button>
                                              <input type='quantity' value={this.state.mintQuantity} readOnly/>
                                              <button className='btnQuantity'
                                                onClick={()=>this.setQuantity(true)}>
                                                  +
                                              </button>
                                            </div>

                                            {this.getMintButton()}

                                          </div>}
                                          
                                        </div>



                                      </div>
                                      
                                    </div>
                                    
                                    
                                    </>
                                    }

                      </div>
                    </div>
                </div>
                <div className='footer'>
                    <div className='footer-container'>
                        <img className='gameComponentFooterBack' src={gameComponentFooterBack} alt='game-component-footer-back'></img>
                        <img className='gameComponentFooterMark' src={gameComponentFooterMark} alt='game-component-footer-mark'></img>
                    </div>
                </div>
            </div>
        </div>


      </div>
    )
  }
}

export default MultichainMint