import './gamecolony.scss';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';

import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import CityImg from '../../assets-game/city.png';
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
import { serverConfig } from '../../config/serverConfig';
import { playSound } from '../../utils/sounds';

const classNameForComponent = 'game-colony' // ex: game-inventory
const componentTitle = 'Colony' // ex: Inventory

//CAPTCHA
const CAPTCHA_KEY = '6Lfjo_4fAAAAAKBgNp6NnugqVjMZGXilQZ0hKHvZ'

function GameColony/* Component_Name_You_Want */(props) {
  // colony props
  const idColony = useMemo(() => props.idColony, [props.idColony])
  const colonyData = useMemo(() => props.colonyData, [props.colonyData])
  const nfts = useMemo(() => props.nfts, [props.nfts])
  // console.log(props.nfts)
  // loading flags
  const [onLoading, setOnLoading] = useState(false)
  const [doingAction, setDoingAction] = useState(false)

  // get colony cities
  const [colonyCities, setColonyCities] = useState([])
  useEffect(() => {
    props.callback_getColonyCities()
  }, [])
  useEffect(() => {
    setColonyCities(props.colonies)
  }, [props.colonies])
  useEffect(() => {
    setOnLoading(colonyCities.length == 1 && colonyCities[0].empty)
  }, [colonyCities])

  // visit colony city
  const onColony = (city) => {
    playSound('button')
    props.callback_onColony(city.idColony, city)
    setDoingAction(true)
  }

  // add colony modal handling
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const onAddColonyBtnClick = () => {
    setCaptchaValue(null)
    setConfirmModalOpen(true)
  }
  const onAddColony = (captcha) => {
    setDoingAction(true)
    setConfirmModalOpen(false)

    // call addColony API
    axios
      .post("/api/m1/colony/addColony", {
        address: props.metamask.walletAccount,
        captcha: captchaValue,
      })
      .then((response) => {
        console.log('addColony', response.data)
        if (response.data.success) {
          // push the added colony city to the state colonyCities
          let orgColonyCities = JSON.parse(JSON.stringify(colonyCities))
          let newColonyCity = response.data.data
          orgColonyCities.push(newColonyCity)
          setColonyCities(JSON.parse(JSON.stringify(orgColonyCities)))
        }
        setActionRes(response)
        setActionResModalOpen(true)
        setDoingAction(false)
      })
      .catch((error) => {
        console.log(error)
        // error.response.status == 500 && props.callback_Logout()
        // error.response.status == 401 && props.callback_Logout()
      });
  }
  const onCloseConfirmModal = () => {
    setConfirmModalOpen(false)
  }

  // nft transfer modal handling
  const [nftTransferModalOpen, setNftTransferModalOpen] = useState(false)
  const onNftTransferBtnClick = () => {
    setSelectedNft(null)
    setNftTransferModalOpen(true)
  }
  const onCloseNftTransferModal = () => {
    setNftTransferModalOpen(false)
  }
  const [selectedNft, setSelectedNft] = useState(null)
  const onSelectNft = (nft) => {
    console.log('onSelectNft', nft)
    setSelectedNft(nft)
  }
  const backToNftSelect = () => {
    setSelectedNft(null)
  }
  const transferNftToColony = (city) => {
    console.log('transferNftToColony', city)

    setDoingAction(true)
    onCloseNftTransferModal()

    // call transferNftToColony API
    axios
      .post("/api/m1/colony/transferNftToColony", {
        address: props.metamask.walletAccount,
        idBuilding: selectedNft.id,
        type: selectedNft.type,
        idColony: city.colonyIndex,
      })
      .then((response) => {
        console.log('transferNftToColony', response.data)
        setActionRes(response)
        setActionResModalOpen(true)
        if (response.data.success) {
          // callback and reload the main city
          props.callback_onTransferNft(idColony, colonyData)
        }
      })
      .catch((error) => {
        console.log(error)
        // error.response.status == 500 && props.callback_Logout()
        // error.response.status == 401 && props.callback_Logout()
      });
  }
  const transferNftToMain = () => {
    setDoingAction(true)
    onCloseNftTransferModal()

    // call transferNftToMain API
    axios
      .post("/api/m1/colony/transferNftToMain", {
        address: props.metamask.walletAccount,
        idColony: idColony,
        idBuilding: selectedNft.id,
        type: selectedNft.type,
      })
      .then((response) => {
        console.log('transferNftToMain', response.data)
        setActionRes(response)
        setActionResModalOpen(true)
        if (response.data.success) {
          // callback and reload the colony city
          props.callback_onTransferNft(idColony, colonyData)
        }
      })
      .catch((error) => {
        console.log(error)
        // error.response.status == 500 && props.callback_Logout()
        // error.response.status == 401 && props.callback_Logout()
      });
  }

  // api response modal handling
  const [actionRes, setActionRes] = useState(null)
  const [actionResModalOpen, setActionResModalOpen] = useState(false)
  const onCloseActionResModal = () => {
    setActionResModalOpen(false)
  }

  // captcha handling
  const [captchaValue, setCaptchaValue] = useState(null)
  const onCaptchaConfirmed = (captcha) => {
    console.log('captcha', captcha)
    setCaptchaValue(captcha)
  }

  return (<>
    <div className={'game-component ' + classNameForComponent}>
      <div className='game-container'>
        <div className='header'>
          <img className='gameComponentHeaderBack' src={gameComponentHeaderBack} alt='game-component-header-back'></img>
          <img className='gameComponentHeaderBorder1' src={gameComponentHeaderBorder1} alt='game-component-header-border1'></img>
          <img className='gameComponentHeaderBorder2' src={gameComponentHeaderBorder2} alt='game-component-header-border2'></img>
          <span className='title'>{componentTitle}</span>
        </div>
        <div className='content'>
          <img className='gameComponentContentBorder' src={gameComponentContentBorder} alt='game-component-content-border'></img>
          {(onLoading || doingAction) &&
            <div className='api-loading'>
              <span className='apiCallLoading'></span>
              <span className={'loader'}></span>
            </div>}
          <div className='scroll-content'>
            {!onLoading &&
              <>
                <div className='page-content flex-column'>
                  <div className='header'>
                    <div className='description'>
                      <div>You have</div> <a>{colonyCities.length}</a> / {serverConfig?.features.colony.cityLimit} colonies.
                    </div>
                    <div className='action-bar'>
                      <Button className={`colonyAddBtn ${idColony ? 'notAllowed' : ''}`} variant="contained" onClick={onAddColonyBtnClick}>
                        Add
                      </Button>
                      <Button className={`nftTransferBtn ${colonyCities.length == 0 ? 'notAllowed' : ''}`} variant="contained" onClick={onNftTransferBtnClick}>
                        Nft <AccountTreeOutlinedIcon />
                      </Button>
                    </div>
                  </div>
                  <div className='city-panel'>
                    {colonyCities.map((city, index) => (
                      <div key={index} className={`city ${idColony == city.colonyIndex ? 'currentCity' : ''}`} onClick={() => onColony(city)}>
                        <div className='city-img'>
                          <img src={CityImg} alt={'city'} />
                        </div>
                        <div className='city-index'>
                          #{city.colonyIndex || index}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            }
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

    <props.ConfirmContext.ConfirmationDialog
      className='colony-nft-transfer-modal'
      open={nftTransferModalOpen}
      onClose={onCloseNftTransferModal}
    >
      <DialogTitle className={`nft-transfer-modal-header`}>
        {selectedNft ? 'City' : 'NFT'}
      </DialogTitle>
      <DialogContent className={`nft-transfer-modal-content`}>
        <div className='nft-transfer-description'>
          {selectedNft ? 'Choose the target city' : 'Choose the NFT you want to transfer'}
        </div>
        <div className='nft-transfer-content'>
          {selectedNft ? <>
            {/* back btn */}
            <div className='backBtn' onClick={backToNftSelect}>
              <KeyboardBackspaceIcon />
            </div>
            {idColony ? <>
              <div className='city main-city' onClick={transferNftToMain}>
                <div className='city-mark'>
                  <HomeOutlinedIcon />
                </div>
                <div className='city-name'>
                  Main City
                </div>
              </div>
            </> : <>
              {colonyCities.map((city, index) => (
                <div key={index} className={`city colony-city`} onClick={() => transferNftToColony(city)}>
                  <div className='city-name'>
                    Colony <a>#{city.colonyIndex}</a>
                  </div>
                </div>
              ))}
            </>}
          </> : <>
            {nfts.map((nft, index) =>
              <div key={index} className={`nft ${nft.stake ? 'notAllowed' : ''}`} onClick={() => onSelectNft(nft)}>
                <div className='nft-mark'>
                  <img src={nft.imageSprite} alt={nft.name} />
                </div>
                <div className='nft-name'>
                  {nft.name} <a>Lvl +{nft.level}</a>
                </div>
                <div className='nft-status'>
                  {nft.stake ? 'staked' : null}
                </div>
              </div>
            )}
            {nfts.length == 0 && <div className='no-nft-text'>
              You have no building NFT in this city
            </div>}
          </>}
        </div>
      </DialogContent>
    </props.ConfirmContext.ConfirmationDialog>

    <props.ConfirmContext.ConfirmationDialog
      open={confirmModalOpen}
      onClose={onCloseConfirmModal}
    >
      <DialogTitle className={`add-colony-modal-header ${colonyCities.length == serverConfig?.features.colony.cityLimit ? 'warning-text' : 'info-text'}`}>
        {colonyCities.length == serverConfig?.features.colony.cityLimit ? 'Warning' : 'Add Colony'}
      </DialogTitle>
      <DialogContent className={`add-colony-modal-content ${colonyCities.length == serverConfig?.features.colony.cityLimit ? 'warning-text' : 'info-text'}`}>
        {colonyCities.length == serverConfig?.features.colony.cityLimit ? <>
          You already have <a>{serverConfig?.features.colony.cityLimit} (max)</a> colonies.
        </> : <>
          Are you sure you want to add colony (#{colonyCities.length + 1})?
        </>}

        {colonyCities.length != serverConfig?.features.colony.cityLimit && <ReCAPTCHA
          style={{ marginTop: "1rem" }}
          sitekey={CAPTCHA_KEY}
          onChange={onCaptchaConfirmed}
        />}
      </DialogContent>
      {colonyCities.length != serverConfig?.features.colony.cityLimit &&
        <DialogActions>
          <Button onClick={onAddColony} autoFocus className={captchaValue ? '' : 'notAllowed'}>
            Sure
          </Button>
        </DialogActions>}
    </props.ConfirmContext.ConfirmationDialog>

    <props.ConfirmContext.ConfirmedDialog
      open={actionResModalOpen}
      onClose={onCloseActionResModal}
    >
      <DialogTitle>
        {actionRes?.data.success ? 'Success!' : 'Failed!'}
      </DialogTitle>
      <DialogContent>
        <div className='colony-action-res-text'>
          {actionRes?.data.success ? 'Successfully done.' : actionRes?.data.error.errorMessage}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseActionResModal} autoFocus>
          Ok!
        </Button>
      </DialogActions>
    </props.ConfirmContext.ConfirmedDialog>
  </>)
}

export default GameColony // Component_Name_You_Want