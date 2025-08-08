import React, { Component } from 'react'
import axios from "axios";
import {ethers} from "ethers";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import WalletHandler from './WalletHandler';

import BuldingABI from '../../ABIs/newBuildingABI.json';
import BundleABI from '../../ABIs/BundleABI.json';
import ERC20ABI from '../../ABIs/ERC20ABI.json';

import imgLogo from '../../assets-mint/mintLogo.png';
import imgBack from '../../assets-mint/undo_white_24dp.svg';

import imgBundle from '../../assets-mint/bundle.webp';
import imgTownhall from '../../assets-mint/TH.webp';
import imgLumberjack from '../../assets-mint/LJ.webp';
import imgStonemine from '../../assets-mint/SM.webp';

import './mint.scss'

class Mint extends Component {
  constructor(props) {
    super(props);

    this.state = {
      //Metamask
      walletProvider: null,
      walletAccount: null,
      walletSigner: null,
      walletNetwork: null,
      isConnected: false,

      //Whitelist
      whitelist: null,
      whitelistError: null,
      merkleProof: null,

      //Whitelist: Already Minted
      thAvailable: null,
      ljAvailable: null,
      smAvailable: null,

      //Mint Select Single/Bundle, Qt, Currency
      selected: null,
      mintQuantity: null,
      mintPrice: null,
      mintCurrency: null,

      //Minted NFTs
      mintedTownhall: null,
      mintedLumberjack: null,
      mintedStonemine: null,
      mintedBundle: null,

      //isLoading
      onMinting: false,
      isLoading: false
    };

    //721 Contracts Address
    this.contractBundleAddress = '0x4A7Aa6Ea97d732486A663510C28131Aa35b000aA',  
    this.contractTownhallAddress = '0xc18ed42a49a158df18aae27ebf39c5d40e8516f2', 
    this.contractLumberjackAddress = '0x2797ed8384A3e53ec60EB4aCB1af696421f6d73c',  
    this.contractStonemineAddress = '0xC4862f674Bd3D05c965487A04912426D62f593dB',  

    //Contracts ABI
    this.contractBundleABI = BundleABI,  
    this.contractBuildingABI = BuldingABI,  

    //Mint Min-Max Quantities Bundle
    this.mintBundleQuantityMax = 3,
    this.mintBundleQuantityMin = 1,

    //Mint Prices Bundle
    this.mintPriceBundleEth = 0.02, //Public: 0.25
    this.mintPriceBundleWrld = 0.02,
    this.mintPriceBundleMatic = 0.03,

    //Mint Min-Max Quantities Single
    this.mintQuantityMax = 3, //WL2/Public: 3
    this.mintQuantityMin = 1,

    //Mint Prices Single Building
    this.mintPriceSingleEth = 0.01, //Public: 0.1
    this.mintPriceSingleWrld = 0.01,
    this.mintPriceSingleMatic = 0.01,

    //20 Contracts (ETH, WRLD) Address
    this.contractAddressETH = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB',  //NOW IS "LINK", "WETH": 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
    this.contractAddressWRLD = '0x326C977E6efc84E512bB9C30f76E30c160eD06FB', //NOW IS "LINK", "WRLD":'0xD5d86FC8d5C0Ea1aC1Ac5Dfab6E529c9967a45E9'

    //Functions Binding
    this.isConnected = this.isConnected.bind(this);
  }


  
  async isConnected(metamask){
    this.setState({
      //Reset Vars
      selected: null,
      mintQuantity: null,
      mintPrice: null,
      mintCurrency: null,

      //Metamask
      walletProvider: metamask.walletProvider,
      walletAccount: metamask.walletAccount,
      walletSigner: metamask.walletSigner,
      walletNetwork: metamask.walletNetwork,
      isConnected: metamask.isConnected,
      isLoading: true,
    },() => { 
      this.getSupply(); 
    })
  } //Callback Metamask



  async getSupply(){
    let tokenInst;
    let supply;

    let mintedTownhall;
    let mintedLumberjack = 10;
    let mintedStonemine = 30;
    let mintedBundle;

    //Townhall
    tokenInst = new ethers.Contract(this.contractTownhallAddress, BuldingABI, this.state.walletSigner);
    supply = await tokenInst.totalSupply()
    mintedTownhall = parseInt(supply.toString())

    //Lumberjack
    tokenInst = new ethers.Contract(this.contractLumberjackAddress, BuldingABI, this.state.walletSigner);
    supply = await tokenInst.totalSupply()
    mintedLumberjack = parseInt(supply.toString())

    //Stonemine
    tokenInst = new ethers.Contract(this.contractStonemineAddress, BuldingABI, this.state.walletSigner);
    supply = await tokenInst.totalSupply()
    mintedStonemine = parseInt(supply.toString())

    //Bundle
    mintedBundle = Math.max(mintedTownhall, mintedLumberjack, mintedStonemine);

    //SetState
    this.setState({
        mintedTownhall: mintedTownhall,
        mintedLumberjack: mintedLumberjack,
        mintedStonemine: mintedStonemine,
        mintedBundle: mintedBundle
    },() => { 
      this.checkWL(); 
    }) 
  }


  
  checkSupply(){
    ((this.state.selected == 1 && parseInt(this.state.mintedTownhall) < 4000)
    || (this.state.selected == 2 && parseInt(this.state.mintedLumberjack) < 4000)
    || (this.state.selected == 3 && parseInt(this.state.mintedStonemine) < 4000)
    || (this.state.selected == 4 && parseInt(this.state.mintedBundle) < 4000))
      
      ? this.checkBalance()
      : this.notify('Sold out')
  }



  checkWL(){
    console.log('checkWL: ', this.state.walletAccount[0])

    // TEST Success TRUE
    // this.setState({
    //     whitelist: true,
    //     merkleProof: ['0xbe0fd74292b44f6558fb49ed7b1dff20cdd8f0e5b9d037b89ec525f3fb4122ed'],
    // },() => {  this.setState({isLoading: false})  })


    // TEST Success FALSE
    // const testError = 2;
    // this.setState({
    //     whitelist: false,
    //     merkleProof: ['0xbe0fd74292b44f6558fb49ed7b1dff20cdd8f0e5b9d037b89ec525f3fb4122ed'],
    //     whitelistError: testError,
    //     thAvailable: true, 
    //     ljAvailable: true, 
    //     smAvailable: false, 
    // },() => {  this.setState({isLoading: false})  })

    axios({
      method: 'post',
      url: '/api/c1/contract/isWhitelisted',
      data: {
        address: this.state.walletAccount[0]
      }
    })
    .then(response => {
      response.data.success 
      ? this.setState({
            whitelist: true,
            merkleProof: response.data.data.merkleProof, //ARRAY?
        },() => {  this.setState({isLoading: false})  })

        : this.setState({
              whitelist: false,
              whitelistError: response.data.error.errorCode,
              thAvailable: response.data.data.townhall, 
              ljAvailable: response.data.data.lumberjack, 
              smAvailable: response.data.data.stonemine, 
          },() => {  this.setState({isLoading: false})  })
    })
    .catch(error => {
      this.notify(error);
    })
  }



  setQuantity = (how) => {
    if (this.state.selected == 4){

      how
      ? this.state.mintQuantity < this.mintBundleQuantityMax

        ? this.setState((prevState, { mintQuantity }) => ({
          mintQuantity: prevState.mintQuantity +1
        }),() => { this.calculatePrice() })

        : this.notify('Max Bundle: ' + this.mintBundleQuantityMax)

      : this.state.mintQuantity > this.mintBundleQuantityMin

        ? this.setState((prevState, { mintQuantity }) => ({
          mintQuantity: prevState.mintQuantity -1
        }),() => { this.calculatePrice() })

        : this.notify('Min Bundle: ' + this.mintBundleQuantityMin)

    }else if (this.state.selected > 0 && this.state.selected < 4){

      how
      ? this.state.mintQuantity < this.mintQuantityMax

        ? this.setState((prevState, { mintQuantity }) => ({
          mintQuantity: prevState.mintQuantity +1
        }),() => { this.calculatePrice() })

        : this.notify('Max Building: ' + this.mintQuantityMax)

      : this.state.mintQuantity > this.mintQuantityMin

        ? this.setState((prevState, { mintQuantity }) => ({
        mintQuantity: prevState.mintQuantity -1
        }),() => { this.calculatePrice() })

        : this.notify('Min Building: ' + this.mintQuantityMin)

    }else{console.log('Error Selected')}
  }



  calculatePrice() {
    console.log('calculatePrice')

    if (this.state.selected > 0 && this.state.selected < 4){ //Single
      console.log('calculatePrice Single');

      this.state.mintCurrency == 'eth'

        ? this.setState({
            mintPrice: (this.state.mintQuantity*this.mintPriceSingleEth).toString().slice(0,4)  
          })
      
      : this.state.mintCurrency == 'matic'

        ? this.setState({
            mintPrice: (this.state.mintQuantity*this.mintPriceSingleMatic)  
          })

      : this.state.mintCurrency == 'wrld'

          ? this.setState({
              mintPrice: (this.state.mintQuantity*this.mintPriceSingleWrld)  
            })   

      : console.log('Currency undefined')

    }else if (this.state.selected == 4){ //Single
      console.log('calculatePrice Bundle');

      this.state.mintCurrency == 'eth'

        ? this.setState({
            mintPrice: (this.state.mintQuantity*this.mintPriceBundleEth).toString().slice(0,4)  
          })
      
      : this.state.mintCurrency == 'matic'

        ? this.setState({
            mintPrice: (this.state.mintQuantity*this.mintPriceBundleMatic)  
          })

      : this.state.mintCurrency == 'wrld'

          ? this.setState({
              mintPrice: (this.state.mintQuantity*this.mintPriceBundleWrld)  
            })   

      : console.log('Currency undefined')
    
    }

  }



  validateMintWL() { //Check if Mint is available for the current settings

    if (this.state.whitelist){ return true
    } else if (this.state.whitelistError == 2 && this.state.selected > 0 && this.state.selected < 4) {

      if(this.state.selected == 1 && this.state.thAvailable){ return true
        } else if(this.state.selected == 2 && this.state.ljAvailable){ return true
        } else if(this.state.selected == 3 && this.state.smAvailable){ return true
        } else { return false
      }

    } else { return false }

  }


  async checkBalanceMATIC () {
    const balance = await this.state.walletProvider.getBalance(this.state.walletAccount[0]);

    console.log('checkBalanceMATIC: ', ethers.utils.formatEther(balance))
    return(ethers.utils.formatEther(balance))
  }



  async checkBalance(){

    if(this.state.mintCurrency == 'matic'){
    
      const balanceMATIC =  await this.checkBalanceMATIC() 
      
      parseFloat(balanceMATIC.toString()) >= parseFloat(this.state.mintPrice)
        ? this.mint()
        : this.notify('Not enough MATIC')

    }else if(this.state.mintCurrency == 'whitelist'){
    
    this.mint()
        

    }
    
  }


  async mint(){
    console.log('Mint... Initializing variables...')

    //Vars Declaration
    let contract = null;
    let mint = null;
    let receipt = null;
    let approved = null;
    let contractAddress = null;
    let ABI = null;

    //Get the Contract Address
    if (this.state.selected == 4) {contractAddress =  this.contractBundleAddress}
    else if (this.state.selected == 1) {contractAddress =  this.contractTownhallAddress}
    else if (this.state.selected == 2) {contractAddress =  this.contractLumberjackAddress}
    else if (this.state.selected == 3) {contractAddress =  this.contractStonemineAddress}
    else return false
    
    //Get the ABI
    if (this.state.selected == 4) {ABI =  this.contractBundleABI}
    else if (this.state.selected > 0 && this.state.selected < 4) {ABI =  this.contractBuildingABI}
    else return false

    // console.log('Mint... Contract: ', contractAddress, ' ABI: ', ABI)
    console.log('mintCurrency ', this.state.mintCurrency)
    console.log('merkleProof ', this.state.merkleProof)

    //Initialize the Contract Object
    contract = new ethers.Contract(contractAddress, ABI, this.state.walletSigner);

    //Mint per Currency
    if (this.state.mintCurrency == 'matic'){

      let ovverides = {
        value: ethers.utils.parseEther(this.state.mintPrice.toString())
      }; //Because it's MATIC

      try{
        this.setState({onMinting: true})

        mint = await contract.mint(
          this.state.walletAccount[0], 
          this.state.mintQuantity,
          ovverides);
        console.log('Mint ', mint)

        if(mint){
          let toastLoading = this.loading('Minting... Almost done!')

          receipt = await mint.wait();
          console.log('Receipt ', receipt)

          this.setState({onMinting: false})

          this.getSupply();

          toast.update(toastLoading, { 
            render: "Done!", 
            type: "success", 
            isLoading: false,
            autoClose: 5000  });
        }

      }catch(err){
        this.notify(err.message);
        this.setState({onMinting: false})
      }

    }else if (this.state.mintCurrency == 'whitelist'){

      try{
        this.setState({onMinting: true})

        mint = await contract.mintWhitelist(
          this.state.walletAccount[0], 
          this.state.mintQuantity, 
          this.state.merkleProof
          );
        console.log('Mint ', mint)

        if(mint){
          let toastLoading = this.loading('Minting... Almost done!')

          receipt = await mint.wait();
          console.log('Receipt ', receipt)

          this.setState({onMinting: false})

          this.getSupply();

          toast.update(toastLoading, { 
            render: "Done!", 
            type: "success", 
            isLoading: false,
            autoClose: 5000  });
        }

      }catch(err){
        this.notify(err.message);
        this.setState({onMinting: false})
      }

    }else{return false}
  }



  loading = (message) => toast.loading(message);

  notify = (error) => toast.error(error);

  render(){return (<>

    <div className='mintContainer'>

      {!this.state.isConnected
        ? <WalletHandler callback_isConnected={this.isConnected}/>
        : null
      }

      {(this.state.isConnected && !this.state.selected) //mintContainerSelect
        ?

        <div className='mintContainerSelect'>

          <img src={imgLogo} className='mintContainerLogo' />

          <div className='selectMint'>
            
              

              <div className='mintType'
                onClick={()=>this.setState({
                  selected: 1,
                  mintQuantity: 1,
                  mintPrice: this.mintPriceSingleEth,
                  mintCurrency: 'eth'
                },() => { this.setState({selected: 1}) }) }>
                  <div className='mintTypeName'>
                    <p>Town Hall</p>
                    <p className='previewPrice'>0.01 MATIC</p>
                  </div>
                  <img src={imgTownhall}/>
              </div>
            
             
            
          </div>
        </div>

        : null
      }

      {(this.state.isConnected && this.state.selected) //mintSelected
        ?
        <div className='mintSelected'>

          <img src={imgLogo} className='mintSelectedLogo' />
          
          <div className='mintSelectedContainer'>

            <div className='mintSelectedBack'
              onClick={()=>
                !this.state.onMinting &&
                this.setState({
                  selected: null,
                  mintQuantity: null,
                  mintPrice: null,
                  mintCurrency: null
                }
              )}>
                <img src={imgBack} 
                  className={
                    this.state.onMinting
                    ? 'img-back disabled'
                    : 'img-back'
                  }
                />
            </div>

            <h2>
              {
                this.state.selected == 1
                  ? 'Town Hall'
                  : this.state.selected == 2
                    ? 'Lumberjack'
                    : this.state.selected == 3
                      ? 'Stone Mine'
                      : this.state.selected == 4
                        ? 'OG Bundle'
                        : ' Error'
              }
            </h2>
            <img src={
              this.state.selected == 1
              ? imgTownhall
              : this.state.selected == 2
                ? imgLumberjack
                : this.state.selected == 3
                  ? imgStonemine
                  : this.state.selected == 4
                    ? imgBundle
                    : ' Error'
            }/>

            <span className='mintSettings'>
            
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

              <div className='mintPrice'>

                <select 
                  name='Price' 
                  defaultValue='Select' 
                  onChange={(e) => 
                    this.setState({
                      mintPrice: e.target.selectedOptions[0].text.split(' ')[0],
                      mintCurrency: e.target.value,
                    })
                  }
                > 

                    <option value="whitelist">
                      WHITELIST
                    </option>
                    <option value="matic">
                      {
                        this.state.selected == 4
                        ? this.mintPriceBundleMatic * this.state.mintQuantity
                        : this.state.selected > 0 && this.state.selected < 4
                          ? this.mintPriceSingleMatic * this.state.mintQuantity
                          : 'Select'
                      } MATIC
                    </option>

                </select>
              </div>

            </span>

            <button
              className={
                ((this.state.selected == 1 && parseInt(this.state.mintedTownhall) < 4000)
                || (this.state.selected == 2 && parseInt(this.state.mintedLumberjack) < 4000)
                || (this.state.selected == 3 && parseInt(this.state.mintedStonemine) < 4000)
                || (this.state.selected == 4 && parseInt(this.state.mintedBundle) < 4000))
                    ? 'btnMint'
                    : 'btnMint soldout'
              }
              onClick={() => 
                !this.state.onMinting
                    ? this.checkSupply()
                    : this.notify('Not allowed')
              }>
                  
              Mint
            </button>
            
            <p className='supplyAvailable'>
              Available: {
                4000-
                (this.state.selected == 1
                  ? this.state.mintedTownhall
                  : this.state.selected == 2
                    ? this.state.mintedLumberjack
                    : this.state.selected == 3
                      ? this.state.mintedStonemine
                      : this.state.selected == 4
                        ? this.state.mintedBundle
                        : ' Error')
              }
              </p>

            <ToastContainer 
              position="top-right"
              autoClose={1500}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
            />
          </div>

        </div>
        : null
      }

      {(this.state.isLoading)
      ? 
        <div className='game-on-loading'>
            <div className="sk-cube-grid">
              <div className="sk-cube sk-cube1"></div>
              <div className="sk-cube sk-cube2"></div>
              <div className="sk-cube sk-cube3"></div>
              <div className="sk-cube sk-cube4"></div>
              <div className="sk-cube sk-cube5"></div>
              <div className="sk-cube sk-cube6"></div>
              <div className="sk-cube sk-cube7"></div>
              <div className="sk-cube sk-cube8"></div>
              <div className="sk-cube sk-cube9"></div>
            </div>
        </div>
      : null}

    </div>  

  </>)}

}

export default Mint