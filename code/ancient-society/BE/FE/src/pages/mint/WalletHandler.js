import React, { Component } from 'react';
import { ethers, utils } from "ethers";
import axios from "axios";

import SocialIcon from '../../components/social-icon/SocialIcon'

import imgLogo from '../../assets-mint/mintLogo.png';

import './walletHandler.scss'

const linkOpensea = "";
const linkDiscord = "https://discord.gg/ancientsociety";
const linkTwitter = "https://twitter.com/_ancientsociety";

class WalletHandler extends Component {
    
    constructor(props) {
        super(props);
    
        this.state = {
            walletProvider: null,
            walletAccount: null,
            walletSigner: null,
            walletNetwork: null
        }
    }

    componentDidMount(){
        // this.walletInit()
    }

    walletInit = async () =>{
        console.log('walletInit... ')
        // Get Provider
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        console.log('provider: ', provider)
        
        // Event for Network Change (Page Reload)
        provider.on("network", (newNetwork, oldNetwork) => {
            if (oldNetwork) {
                // console.log('Network changed...')
                window.location.reload();
            }
        });

        //Get Network Info
        const network = await provider.getNetwork()

        //Set States (Provider, Network)
        this.setState({walletProvider: provider, walletNetwork: network});

        //Check User is on Polygon
        // console.log('chainId: ', network.chainId)
        network.chainId == 80001
        ?   // console.log('We are on Polygon network'),
            //Ask for Account Connection
            this.walletAccountConnection() 
        :   // console.log('We are on a different network'),
            this.chainSwitchToPolygon()
    }

    chainSwitchToPolygon = async() => {
        const networkMap = {
        POLYGON_MAINNET: {
            chainId: utils.hexValue(137), // '0x89'
            chainName: "Matic(Polygon) Mainnet", 
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            rpcUrls: ["https://polygon-rpc.com"],
            blockExplorerUrls: ["https://www.polygonscan.com/"],
        }
        };

        try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{chainId: utils.hexValue(137)}], 
        });
        } catch (error) {
        // This error code indicates that the chain has not been added to MetaMask
        // if it is not, then install it into the user MetaMask
        if (error.code === 4902) {
            try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [networkMap.POLYGON_MAINNET],
            });
            } catch (addError) {
            // console.error(addError);
            }
        }
        // console.error(error);
        }
    }

    walletAccountConnection = async() => {
        console.log('walletAccountConnection... ')

        const provider = this.state.walletProvider;

        //Request Accounts    
        try{
            const requestAccounts = await provider.send("eth_requestAccounts", []);
            this.setState({walletAccount: requestAccounts})

            // Set Event for Account Changed
            window.ethereum.on("accountsChanged", (accounts) => {
                this.accountChanged(accounts); 
            });

            //Get Signer
            const signer = provider.getSigner();

            signer && this.setState({
                walletSigner: signer
            }, () => { 
                this.props.callback_isConnected(
                    {
                        walletProvider: this.state.walletProvider,
                        walletAccount: this.state.walletAccount,
                        walletSigner: this.state.walletSigner,
                        walletNetwork: this.state.walletNetwork,
                        isConnected: true
                    }
                ) 
            })
        
        } catch(err) {
            err.code === 4001 
            ? console.log('User rejected the request')
            : console.log('Error.code: ', err.code)
        }
    }

    accountChanged(accounts){
        console.log('accountChanged')

        this.props.callback_isConnected(
            {
                walletProvider: this.state.walletProvider,
                walletAccount: this.state.walletAccount,
                walletSigner: this.state.walletSigner,
                walletNetwork: this.state.walletNetwork,
                isConnected: false
            }
        )
    }

  render(){ return (
    
        <div className='mintConnect'>

            <div className='mintConnectContainer'>

                <img src={imgLogo} className='mintConnectLogo' />

                <span>
                    <div className='mintConnectPrice'>
                        <h2>Whitelist</h2>
                        <p><b>Free</b></p>
                    </div>

                    <div className='mintConnectPrice'>
                        <h2>Public Sale</h2>
                        <p><b>0.01 MATIC</b> per <br/>Building</p>
                        
                    </div>
                </span>

                <button onClick={() => this.walletInit()}>
                    Connect
                </button>

                <hr/>

                <div className='mintConnectSupply'>
                    <h3>Total Supply</h3> 
                    <p>Town Hall <b>4,000</b></p>
                    <p>Lumberjack <b>4,000</b></p>
                    <p>Stone Mine <b>4,000</b></p>
                </div>

            </div>

            <div className='mintConnectLinks'>
                {/* <SocialIcon type="opensea" onIconClick={()=>{}}/> */}
                <SocialIcon type="discord" onIconClick={()=>{window.open(linkDiscord)}}/>
                <SocialIcon type="twitter" onIconClick={()=>{window.open(linkTwitter)}}/>
            </div>

        </div>

    )}

}

export default WalletHandler