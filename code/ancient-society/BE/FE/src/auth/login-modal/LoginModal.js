import './loginmodal.scss';

import React, {
  useEffect,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Button,
  capitalize,
  CircularProgress,
} from '@mui/material';

import { serverConfig, servers } from '../../config/serverConfig';

import cbwIcon from '../../assets-game/auth/cbw.png';
import mmIcon from '../../assets-game/auth/mm.png';
import wcIcon from '../../assets-game/auth/wc.png';
import imgWallet from '../../assets-game/ConnectWalletWords.webp';
import iconError from '../../assets-game/iconError.svg';
import iconVerified from '../../assets-game/iconVerified.svg';
import LogoTransparent from '../../assets-game/LogoOnerow.png';
import SocialIcon from '../../components/social-icon/SocialIcon';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const linkDiscord = "https://discord.gg/ancientsociety";
const linkTwitter = "https://twitter.com/_ancientsociety";
const linkWhitepaper = "https://ancientsociety.gitbook.io/";

function LoginModal(props) {
    let navigate = useNavigate();

    const [serverInfo, setServerInfo] = useState();
    const [serverImg, setServerImg] = useState();
    const [onLoading, setLoading] = useState(true);

    useEffect(() => {
        setServerImg(
            servers
            .filter(
                server => 
                server.name 
                == capitalize(process.env.REACT_APP_SERVER)
            )[0]?.img
        )
    }, []);

    useEffect(() => {
        setServerInfo(props.serverInfo)
    }, [props.serverInfo]);

    useEffect(() => {
        if(serverInfo?.playersTotal) setLoading(false)
    }, [serverInfo]);

    const getServerStatusImage = () => {
        if (serverInfo?.serverStatus){
            return <img src={iconVerified} className='serverOnline'/>
        } else{
            return <img src={iconError} className='serverOffline'/>
        } 
    }

    // modal handle
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    // original wallet method
    const [walletMethod, setWalletMethod] = useState(props.walletMethod);
    useEffect(() => {
        setWalletMethod(props.walletMethod)
    }, [props.walletMethod])

    const [onAuthenticate, setOnAuthenticate] = useState(props.onAuthenticate);
    useEffect(() => {
        setOnAuthenticate(props.onAuthenticate);
    }, [props.onAuthenticate])

    return (

        <>
        <div className='login-overlay'/>

        <div className='login-modal'>

            <div className='head'>
                <img src={LogoTransparent} />
            </div>

            <div className='body'>
                <>
                    <img src = {serverImg} className='serverLogo'/>

                    <div className='serverInfo'>
                        <p>
                            Server Status: {onLoading
                                ? <CircularProgress size={20}/> 
                                : getServerStatusImage()
                            }
                        </p>
                        <p>
                            Players Online: {onLoading
                                ? <CircularProgress size={20}/>
                                : serverInfo?.playersOnline
                            }
                        </p>
                        <p>
                            Founded Cities: {onLoading
                                ? <CircularProgress size={20}/>
                                : serverInfo?.playersTotal
                            }
                        </p>
                        
                    </div>

                    <div className='serverActions'>
                        <Button className='btnUI secondary' onClick={()=>navigate("/servers")}>Servers</Button>
                        <Button 
                            className='btnUI' 
                            onClick={()=>{
                                if ((walletMethod && walletMethod != 'undefined') || onAuthenticate) {
                                    return
                                }
                                serverInfo?.serverStatus
                                    ? handleOpen()
                                    : null
                            }}
                        >Play</Button>
                    </div>
                </>
            </div> 

            <div className='footer'>
                {/* Change Server */}
            </div>

            {/* <div className='socialIcons'>
                <SocialIcon 
                    type="gameInfo" 
                    onIconClick={()=>{window.open(linkWhitepaper)}}
                />
                <SocialIcon 
                    type="gameDiscord" 
                    onIconClick={()=>{window.open(linkDiscord)}}
                />
                <SocialIcon 
                    type="twitter" 
                    onIconClick={()=>{window.open(linkTwitter)}}
                />
            </div> */}
        </div> 
        
        {open && <>
            <div className='wallet-popup-overlay' onClick={handleClose}>
                <div className='wallet-popup-container' onClick={(e) => e.stopPropagation()}>
                    <div className='wallet-list'>
                        {props.serverConfig.blockchain.wallet.coinbase && <>
                            <div className='wallet-info' onClick={() => {
                                props.onWalletSelect('cbw');
                                handleClose();
                            }}>
                                <div className='wallet-icon'>
                                    <img src={cbwIcon} />
                                </div>
                                <div className='wallet-name'>
                                    Coinbase Wallet
                                </div>
                            </div>
                        </>}
                        {props.serverConfig.blockchain.wallet.metamask && <>
                            <div className='wallet-info' onClick={() => {
                                props.onWalletSelect('mm');
                                handleClose();
                            }}>
                                <div className='wallet-icon'>
                                    <img src={mmIcon} />
                                </div>
                                <div className='wallet-name'>
                                    Metamask
                                </div>
                            </div>
                        </>}
                        {props.serverConfig.blockchain.wallet.others && <>
                            <div className='wallet-info' onClick={() => {
                                props.onWalletSelect('wc');
                                handleClose();
                            }}>
                                <div className='wallet-icon'>
                                    <img src={wcIcon} />
                                </div>
                                <div className='wallet-name'>
                                    Wallet Connect
                                </div>
                            </div>
                        </>}
                    </div>
                </div>
            </div>
        </>}
     </>
    )
}

export default LoginModal