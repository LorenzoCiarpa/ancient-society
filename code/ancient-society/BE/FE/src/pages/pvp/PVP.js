import './pvp.scss';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
//TOAST
import {
  toast,
  ToastContainer,
} from 'react-toastify';
import useSound from 'use-sound';

import { IconButton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { useWeb3React } from '@web3-react/core';

import { serverConfig } from '../../config/serverConfig';
import { playSound } from '../../utils/sounds';
import { walletConnector } from '../../utils/walletConnector';
import RBackdrop from './components/basic/backdrop/RBackdrop';
import RDashboard from './components/dashboard/RDashboard';
import RProfilePanel from './components/profile-panel/RProfilePanel';

function PVP() {
  const ASSETS_PATH = `${process.env.PUBLIC_URL}/assets-sounds`;
  const isMute = localStorage.getItem('isMute')
  if (localStorage.getItem('volumeSounds') == null) {
    localStorage.setItem('volumeSounds', 50)
  }
  const [backgroundPlay, { backgroundStop }] = useSound(
    `${ASSETS_PATH}/maps/city/nature.mp3`,
    { volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
  );

  const redirectButton = useRef(null)
  const redirectPVPButton = useRef(null)
  const [onLoading, setOnLoading] = useState(true)

  // integrate web3-react
  const {
    library,
    chainId,
    account,
    active,
    activate,
    deactivate,
    error,
  } = useWeb3React();

  useEffect(() => {
    error && console.log('Web3React Error', error);
    error && redirectButton.current.click();
  }, [error])

  // Check JWT for the wallet account
  const [onAuthenticate, setOnAuthenticate] = useState(false);
  useEffect(() => {
    console.log(`onAuthenticate: ${onAuthenticate}`);
  }, [onAuthenticate])
  const authenticate = () => {
    setOnAuthenticate(true);

    const JWT = getCookie(walletAccount); //Get JWT Cookie with the name(wallet account)

    JWT
      ? sendIsLogged() //If JWT Cookie is set
      : redirectButton.current.click() //If JWT Cookie is missing
  }
  const sendIsLogged = () => {
    axios({
      method: 'post',
      url: '/api/m1/auth/isLogged',
      data: {
        address: walletAccount
      }
    })
      .then(response => {
        response.data.success
          ? loginSuccess()
          : redirectButton.current.click();
      })
      .catch(error => {
        console.log('isLogged Error', error)
        if (error.response.status == 401) {
          redirectButton.current.click();
        }
      });
  };
  const loginSuccess = async () => {
    const signed = await isSigned();
    console.log('signed: ', signed);
    if (!signed) {
      redirectButton.current.click();
    }
    setIsLogged(true);
  };
  // check if the account is already signed
  const [existUserData, setExistUserData] = useState({})
  const isSigned = async () => {
    let signed = false;

    await axios.post('/api/m1/auth/isSigned', {
      address: account
    })
      .then(response => {
        const res = response.data
        signed = res.success
        setExistUserData(res.data.user)
      })
      .catch(error => {
        console.log('isSigned Error', error);
      });

    return signed;
  };

  const [walletMethod, setWalletMethod] = useState('')
  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    const getNetwork = async () => {
      const network = await provider.getNetwork();
      return network;
    }
    const { ethereum } = window;
    if (ethereum && ethereum.on && active) {
      console.log('provider', provider);
      setWalletProvider(provider);

      getNetwork().then((network) => {
        console.log('network', network);
        setWalletNetwork(network);
      })

      console.log('wallet method', walletMethod);
      if (walletMethod == 'injected') {
        const signer = provider.getSigner();
        console.log('signer', signer);
        setWalletSigner(signer);
      } else if (walletMethod == 'coinbaseWallet') {
        const signer = library.getSigner();
        console.log('signer', signer);
        setWalletSigner(signer);
      }

      console.log('account', account);
      setWalletAccount(account);

      if (chainId != serverConfig.blockchain.network.chainId) {
        redirectButton.current.click()
      }

      // handlers
      const handleConnect = () => {
        console.log("Handling 'connect' event")
      }
      const handleChainChanged = (newChainId) => {
        console.log("Chain changed", newChainId, walletMethod);
        if (newChainId != serverConfig.blockchain.network.chainId) {
          redirectButton.current.click()
        }
      }
      const handleAccountsChanged = (accounts) => {
        console.log("Handling 'accountsChanged' event with payload", accounts)
        redirectButton.current.click()
      }
      const handleNetworkChanged = (networkId) => {
        console.log("Handling 'networkChanged' event with payload", networkId)
        // this doesn't happen usually
        redirectButton.current.click()
      }

      ethereum.on('connect', handleConnect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }
  }, [active, chainId, account, walletMethod])

  const [isLogged, setIsLogged] = useState(false)
  // connected wallet account
  const [walletProvider, setWalletProvider] = useState(null);
  const [walletAccount, setWalletAccount] = useState(null);
  const [walletSigner, setWalletSigner] = useState(null);
  const [walletNetwork, setWalletNetwork] = useState(null);

  const walletInit = async () => {
    console.log('first of page load');
    const orgWallet = window.localStorage.getItem("wallet");
    console.log('wallet method: ', orgWallet);
    if (orgWallet && orgWallet != 'undefined') {
      console.log('activate start');
      setWalletMethod(orgWallet);
      if (orgWallet == 'injected') {
        activateInjectedProvider('MetaMask');
      } else if (orgWallet == 'coinbaseWallet') {
        activateInjectedProvider('CoinBase');
      }
      activate(walletConnector[orgWallet]);
      // wallet value : injected, walletConnect, coinbaseWallet
    } else {
      redirectButton.current.click()
    }
  }
  const activateInjectedProvider = (providerName) => {
    const { ethereum } = window;

    if (!ethereum?.providers) {
      return undefined;
    }

    let provider;
    switch (providerName) {
      case 'CoinBase':
        provider = ethereum.providers.find(({ isCoinbaseWallet }) => isCoinbaseWallet);
        break;
      case 'MetaMask':
        provider = ethereum.providers.find(({ isMetaMask }) => isMetaMask);
        break;
    }
    console.log('providers', ethereum.providers);
    console.log('selected provider', provider);
    if (provider) {
      ethereum.setSelectedProvider(provider);
    }
  }
  useEffect(() => {
    if (active && walletProvider && walletAccount && walletSigner && walletNetwork && chainId == serverConfig.blockchain.network.chainId && !onAuthenticate) {
      console.log('authenticate begin', walletNetwork);
      authenticate();
    }
  }, [active, walletProvider, walletAccount, walletSigner, walletNetwork, chainId, onAuthenticate])

  // Cookie CRUD
  const getCookie = (c_name) => {
    let c_start; let c_end;

    if (document.cookie.length > 0) {
      c_start = document.cookie.indexOf(c_name + "=");
      if (c_start != -1) {
        c_start = c_start + c_name.length + 1;
        c_end = document.cookie.indexOf(";", c_start);
        if (c_end == -1) {
          c_end = document.cookie.length;
        }
        return decodeURI(document.cookie.substring(c_start, c_end));
      }
    }
    return "";
  };

  useEffect(() => {
    setOnLoading(true)
    if (process.env.REACT_APP_ENV) {
      setWalletAccount(process.env.REACT_APP_MOBILE_WALLET)
      setIsLogged(true)
    } else {
      walletInit();
    }
  }, [])
  const [notifications, setNotifications] = useState([])
  const getAllNotifications = () => {
    axios({
      method: 'post',
      url: '/api/m1/pvp/getNotifications',
      data: {
        address: walletAccount
      }
    })
      .then(response => {
        if (response.data.success) {
          setNotifications(JSON.parse(JSON.stringify(response.data.data)))
        }
      })
      .catch(error => {
        console.log('Error', error)
      });
  }
  useEffect(() => {
    console.log('isLogged', isLogged)
    isLogged && userIsSigned()
  }, [isLogged])

  // init toast
  const loading = (message) => toast.loading(message);
  const notify = (error) => toast.error(error);
  const success = (error) => toast.success(error);
  const info = (error) => toast.info(error);

  const [pageLoading, setPageLoading] = useState(false)

  // Panel Component Handling
  const [openedComponent, setOpenedComponent] = useState(null)
  const openComponent = (componentName) => {
    setOpenedComponent(componentName)
  }
  const closeOpenedComponent = () => {
    setOpenedComponent(null)
  }

  // get active wars
  const [warListLoadingBar, setWarListLoadingBar] = useState(false)
  const [activeWar, setActiveWar] = useState([])
  const getAllActiveBattle = async () => {
    setWarListLoadingBar(true)
    axios
      .post("/api/m1/pvp/getActiveWar", {
        address: walletAccount,
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          setActiveWar(response.data.data)
        }
        setWarListLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setWarListLoadingBar(false)
      });
  }

  // get war histories
  const [warHistoryLoadingBar, setWarHistoryLoadingBar] = useState(false)
  const [warHistory, setWarHistory] = useState([])
  const getAllWarHistory = async () => {
    setWarHistoryLoadingBar(true)
    axios
      .post("/api/m1/pvp/getWarHistory", {
        address: walletAccount,
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          let datas = JSON.parse(JSON.stringify(response.data.data.response))
          for (let i = 0; i < datas.length; i++) {
            let datetime = new Date(datas[i].endingTime)
            datas[i].endingTime = datetime.toLocaleString()
          }
          setWarHistory(datas)
        }
        setWarHistoryLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setWarHistoryLoadingBar(false)
      });
  }

  // get pvp user info
  const [userData, setUserData] = useState({})
  useEffect(() => {
    if (userData?.leagueName != '' && userData?.leagueName != undefined) {
      getUserLeagueData(userData?.leagueName?.toUpperCase())
    }
  }, [userData])
  const [loadingBar, setLoadingBar] = useState(false)
  const getUserInfoPvp = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getUserInfoPvp", {
        address: walletAccount,
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          setUserData(response.data.data)
          if (response.data.data?.hideRank) {
            info("You have to play at least 10 PVP battles to get a rank.")
          }
        }
        setLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
      });
  }

  // get active leagues
  const [userLeague, setUserLeague] = useState(null)
  useEffect(() => {
    calculeUserLank(userLeague)
  }, [userLeague])
  const leagueIDs = { "TOP": 4, "GOLD": 3, "SILVER": 2, "BRONZE": 1 }
  const getUserLeagueData = (leagueName) => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getLeaderboard", {
        address: walletAccount,
        idLeague: leagueIDs[leagueName]
      })
      .then((response) => {
        if (response.data.success) {
          // set user league data from server
          setUserLeague(response.data.data.response)
        }
        setLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
      });
  }
  const [userRank, setUserRank] = useState(-1)
  const [totalLeaguePlayers, setTotalLeguePlayers] = useState(-1)

  // calculate the user's ranking by current league and war points.
  const calculeUserLank = (leagueData) => {
    if (leagueData?.players == undefined || leagueData?.players.length == 0) {
      return 1;
    }
    let players = leagueData?.players
    setTotalLeguePlayers(players.length)
    let rank = -1
    players.filter((player, index) => player.address == walletAccount ? rank = index + 1 : rank)
    setUserRank(rank)
  }

  const onSetUserData = (userdata, target, value) => {
    console.log(userdata)
    setUserData({ ...userData, [target]: value })
  }

  const [subListType, setSubListType] = useState('active')
  const [subListWarID, setSubListWarID] = useState(null)
  const showActiveDetail = useCallback((type, idWar) => {
    setSubListType(type)
    setSubListWarID(idWar)
    if (type == 'active') {
      openComponent('battle')
    }
    else {
      openComponent('history')
    }
  }, [])

  const loadInitialData = () => {
    getUserInfoPvp()
    getAllActiveBattle()
    getAllWarHistory()
    getAllNotifications()
    playSound('worldNature')
  }

  const userIsSigned = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/isSigned", {
        address: walletAccount,
      })
      .then((response) => {
        if (response.data.success) {
          // set user league data from server
          loadInitialData()
          setInterval(() => getAllNotifications(), 60000)
        }
        else {
          userSignUp()
        }
      })
      .catch((error) => {
        if (!error?.data?.success) {
          userSignUp()
        }
        setLoadingBar(false)
      });
  }

  const userSignUp = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/signUp", {
        address: walletAccount,
        user: existUserData
      })
      .then((response) => {
        if (response.data.success) {
          // set user league data from server
          userIsSigned()
        }
      })
      .catch((error) => {
        console.log(error)
        toast.error("You can't sign in to PVP.")
        setLoadingBar(false)
      });
  }

  return (<>
    <div style={{ display: "none" }}>
      <Link to="/game">
        <IconButton ref={redirectButton} />
      </Link>
    </div>
    <div style={{ display: "none" }}>
      <Link to="/pvp">
        <IconButton ref={redirectPVPButton} />
      </Link>
    </div>
    <div className={'pvp-page'}>
      <RBackdrop
        open={loadingBar}
        loadingBar={<>
          <CircularProgress color="inherit" />
        </>}
        textContent={<>
          Loading.. It will take a few seconds. :)
        </>}
      />
      {/* Profile Side Bar */}
      <RProfilePanel
        walletAccount={walletAccount}
        notifications={notifications}
        setNotifications={setNotifications}
        showActiveDetail={showActiveDetail}
        userRank={userRank}
        totalLeaguePlayers={totalLeaguePlayers}
        userData={userData}
        activeWar={activeWar}
        warListLoadingBar={warListLoadingBar}
        warHistory={warHistory}
        warHistoryLoadingBar={warHistoryLoadingBar}
        openComponent={openComponent}>

      </RProfilePanel>

      {/* Main Dashboard - Menus */}
      <RDashboard
        backgroundPlay={backgroundPlay}
        backgroundStop={backgroundStop}
        pageLoading={pageLoading}
        setNotifications={setNotifications}
        notifications={notifications}
        walletAccount={walletAccount}
        walletProvider={walletProvider}
        walletSigner={walletSigner}
        userLeague={userLeague}
        userData={userData}
        userRank={userRank}
        setPageLoading={setPageLoading}
        warHistory={warHistory}
        setUserData={onSetUserData}
        totalLeaguePlayers={totalLeaguePlayers}
        openedComponent={openedComponent}
        subListWarID={subListWarID}
        subListType={subListType}
        setSubListWarID={setSubListWarID}
        closeOpenedComponent={closeOpenedComponent}
      />
    </div>
    <ToastContainer
      position="top-right"
      autoClose={1500}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
    />
  </>)
}

export default PVP