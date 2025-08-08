import './game-prestige.scss';

import {
    useEffect,
    useState,
} from 'react';

import axios from 'axios';

import {
    Button,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';

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
import { playSound } from '../../utils/sounds';

const classNameForComponent = 'game-prestige' // ex: game-inventory
const componentTitle = 'Prestige' // ex: Inventory
const hasTab = false // true if this component has tabs
const tabNames = ['A', 'B', 'C', 'D', 'E'] // tab display names

function GamePrestige/* Component_Name_You_Want */(props) {
    const [nftInfo, setNftInfo] = useState(props.nftInfo)
    useEffect(() => {
        setNftInfo(props.nftInfo)
        console.log('nftInfo', nftInfo)
    }, [props.nftInfo])

    const [onLoading, setOnLoading] = useState(true)
    const [prestigeData, setPrestigeData] = useState({})
    useEffect(() => {
        setOnLoading(true)
        axios({
            method: 'post',
            url: '/api/m1/buildings/getPrestigeData',
            data: {
                address: props.metamask.walletAccount,
                buildingType: nftInfo.type,
                level: nftInfo.level,
                idColony: props.idColony
            }
        })
            .then(response => {
                try {
                    if (response.data.success) {
                        const res = response.data.data
                        console.log('getPrestigeData', res)
                        setPrestigeData(res)
                        setOnLoading(false)
                    } else {
                        props.callback_Logout() //Logout because the user forced the API
                    }
                } catch (err) {
                    console.error(err)
                }
            })
            .catch(error => {
                error.response.status == 500
                    && props.callback_Logout()

                error.response.status == 401
                    && props.callback_Logout()
            })
    }, [])

    const [currentTabIndex, setCurrentTabIndex] = useState(0)
    const tabChanged = (index) => {
        if (currentTabIndex === index) {
            return
        }
        setCurrentTabIndex(index)
    }

    // prestige count
    const [prestigeCounter, setprestigeCounter] = useState(0)

    // confirm and confirmed modals manage | api call
    const [doingAction, setDoingAction] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmActionType, setConfirmActionType] = useState('');
    const onDoAction = () => {
        setConfirmActionType('prestige')
        setConfirmModalOpen(true)
    }
    const onCloseConfirmModal = () => {
        setConfirmModalOpen(false);
    }
    const proceedAction = () => {
        onCloseConfirmModal();
        setDoingAction(true);
        axios({
            method: 'post',
            url: '/api/m1/buildings/doPrestige',
            data: {
                address: props.metamask.walletAccount,
                buildingType: nftInfo.type,
                level: nftInfo.level,
                idColony: props.idColony
            }
        })
            .then(response => {
                onDidAction(response)
            })
            .catch(error => {
                error.response.status == 500 && props.callback_Logout()
                error.response.status == 401 && props.callback_Logout()
            })
    }

    // response process
    const [actionResModalOpen, setActionResModalOpen] = useState(false)
    const [actionRes, setActionRes] = useState(null)
    const [resActionType, setResActionType] = useState('')
    const onDidAction = (response) => {
        console.log(response)
        playSound(confirmActionType)
        setActionRes(response)
        setResActionType(confirmActionType)
        setDoingAction(false)
        setActionResModalOpen(true)
    }
    const onCloseActionResModal = () => {
        setActionResModalOpen(false)
        setResActionType('')
        props.prestigeDone();
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
                            <span className={'loader ' + confirmActionType + '-loader'}></span>
                        </div>}
                    <div className='scroll-content'>
                        {!onLoading && <div className='page-content'>
                            <div className="prestige-left-panel">
                                <div className='nft-image'>
                                    <img src={nftInfo.imageSprite} />
                                    <div className='nft-level'>
                                        Lvl +<a className={nftInfo.levelMax ? 'max' : ''}>{nftInfo.levelMax ? `${nftInfo.level}(MAX)` : nftInfo.level}</a>
                                    </div>
                                </div>
                            </div>
                            <div className="prestige-right-panel">
                                <div className="prestige-description">
                                    There will be some drops if you reset NFT-level. <br />
                                    The NFT lvl will be 1.<br />
                                    <span className='prestige-number'>
                                        {(nftInfo.prestigeCounter || nftInfo.prestigeCounter == undefined) || nftInfo.prestigeCounter == 0 ? "You have no prestige of this building." : <>You have <span>{nftInfo.prestigeCounter}</span> {nftInfo.prestigeCounter == 1 ? 'prestige' : 'prestiges'} of this building.</>}
                                    </span>
                                </div>
                                <div className='action-panel'>
                                    {nftInfo.prestigeCounter > 0 ?
                                        <div className="alert">{nftInfo.prestigeCounter}</div>
                                        :
                                        ''
                                    }
                                    <Button variant="contained" className={prestigeData.length == 0 ? 'notAllowed' : ''} onClick={onDoAction}>
                                        Prestige
                                    </Button>
                                </div>
                                <div className="drops-view">
                                    {prestigeData.map((drop, index) => (
                                        <div key={index} className="drop">
                                            <div className='drop-desc'>
                                                <span className='drop-quantity'>x {drop.dropQuantity}</span>
                                                <span className='drop-name'>{drop.name}</span>
                                            </div>
                                            <img className='drop-img' src={drop.image} />
                                        </div>
                                    ))}
                                    <div className='noDropDescription'>There is no drop for prestige</div>
                                </div>
                            </div>
                        </div>}
                    </div>
                </div>
                <div className='footer'>
                    <div className='footer-container'>
                        <img className='gameComponentFooterBack' src={gameComponentFooterBack} alt='game-component-footer-back'></img>
                        <img className='gameComponentFooterMark' src={gameComponentFooterMark} alt='game-component-footer-mark'></img>
                    </div>
                </div>
            </div>
            <props.ConfirmContext.ConfirmationDialog
                open={confirmModalOpen}
                onClose={onCloseConfirmModal}
            >
                <DialogTitle>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to prestige?<br />The NFT will be LVL +1.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={proceedAction} autoFocus>
                        Sure
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmationDialog>
            <props.ConfirmContext.ConfirmedDialog
                open={actionResModalOpen}
                onClose={onCloseActionResModal}
            >
                <DialogTitle>
                    {actionRes?.data.success ? 'Success!' : 'Failed!'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {actionRes?.data.success ? 'Successfully done!' : actionRes?.data.error}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseActionResModal} autoFocus>
                        Ok!
                    </Button>
                </DialogActions>
            </props.ConfirmContext.ConfirmedDialog>
        </div>
        {/*  { onLoading ?
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
        : null } */}
    </>)
}

export default GamePrestige // Component_Name_You_Want