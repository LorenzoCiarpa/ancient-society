import './game-leaderboard.scss';

import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import CircularProgress from '@mui/material/CircularProgress';

import bronzeCrownImg from '../../assets-game/bronze.png';
import goldCrownImg from '../../assets-game/gold.png';
import rankFirstImg from '../../assets-game/rankFirst.png';
import rankSecondImg from '../../assets-game/rankSecond.png';
import rankThirdtImg from '../../assets-game/rankThird.png';
import silverCrownImg from '../../assets-game/silver.png';
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
import TableLeaderboard from './TableLeaderboard';

const classNameForComponent = 'game-leaderboard' // ex: game-inventory
const componentTitle = 'Leaderboard' // ex: Inventory
const hasTab = true // true if this component has tabs
const tabs = []

const leaderboardGeneralEnabled = serverConfig?.features.leaderboard.general
const leaderboardFishingEnabled = serverConfig?.features.leaderboard.fishing
const leaderboardCraftingEnabled = serverConfig?.features.leaderboard.crafting
const leaderboardChallengeEnabled = serverConfig?.features.leaderboard.challenge
leaderboardGeneralEnabled ? tabs.push({ name: 'General', index: 0 }) : null
leaderboardFishingEnabled ? tabs.push({ name: 'Action', index: 1 }) : null
leaderboardCraftingEnabled ? tabs.push({ name: 'Crafting', index: 2 }) : null
leaderboardChallengeEnabled ? tabs.push({ name: 'Challenge', index: 3 }) : null

function GameLeaderBoard(props) {
    //LOADING
    const [onLoading, setOnLoading] = useState(true)
    /* useEffect(() => {
        // call api to get data for this component
        setOnLoading(false)
    }, []) */

    //TABS
    const [currentTabIndex, setCurrentTabIndex] = useState(-1)

    useEffect(() => {
        if (currentTabIndex != -1) {
            setCurrentPageIndex(0)
            let data =
                currentTabIndex == 0
                    ? dataLeaderboardGeneral
                    : currentTabIndex == 1
                        ? dataLeaderboardFishing
                        : currentTabIndex == 2
                            ? dataLeaderboardCrafting
                            : currentTabIndex == 3
                                ? dataLeaderboardChallenge
                                : null
            if (!data) {
                return
            }
            let data_topthree = []
            data.map((row, index) => { index < 3 && data_topthree.push(row) })
            setDataTopThree(data_topthree)
        }
    }, [currentTabIndex])

    const tabChanged = (index) => {
        if (currentTabIndex === index || (leaderboardGeneralEnabled && !dataLeaderboardGeneral) || (leaderboardFishingEnabled && !dataLeaderboardFishing) || (leaderboardCraftingEnabled && !dataLeaderboardCrafting) || (leaderboardChallengeEnabled && !dataLeaderboardChallenge)) {
            return false
        }
        setCurrentTabIndex(index)
    }

    //TABLEPAGE
    const [currentPageIndex, setCurrentPageIndex] = useState(0)

    const setPageIndex = (page) => {
        setCurrentPageIndex(page)
    }

    //LEADERBOARD DATAS 
    const [dataTopThree, setDataTopThree] = useState(null)
    const [dataLeaderboardGeneral, setDataLeaderboardGeneral] = useState(null)
    const [dataLeaderboardFishing, setDataLeaderboardFishing] = useState(null)
    const [dataLeaderboardCrafting, setDataLeaderboardCrafting] = useState(null)
    const [dataLeaderboardChallenge, setDataLeaderboardChallenge] = useState(null)

    //GET DATAS
    useEffect(() => {
        const getLeaderboard = async function () {
            console.log('getLeaderboard')
            axios.post('/api/m1/leaderboard/getLeaderboard')
                .then(response => {
                    let data = response.data.data.leaderboard
                    setDataLeaderboardGeneral(data)

                    console.log(currentTabIndex, data)
                    if (currentTabIndex == 0) {
                        let data_topthree = []
                        data.map((row, index) => { index < 3 && data_topthree.push(row) })
                        setDataTopThree(data_topthree)
                    }
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
        const getLeaderboardFisherman = async function () {
            console.log('getLeaderboardFisherman')
            axios.post('/api/m1/leaderboard/getLeaderboardFisherman')
                .then(response => {
                    let data = response.data.data.leaderboard
                    setDataLeaderboardFishing(data)

                    if (currentTabIndex == 1) {
                        let data_topthree = []
                        data.map((row, index) => { index < 3 && data_topthree.push(row) })
                        setDataTopThree(data_topthree)
                    }
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
        const getLeaderboardCrafting = async function () {
            if (!leaderboardCraftingEnabled) return false;

            console.log('getLeaderboardCrafting')
            axios.post('/api/m1/leaderboard/getLeaderboardCrafting')
                .then(response => {
                    let data = response.data.data.leaderboard
                    setDataLeaderboardCrafting(data)

                    if (currentTabIndex == 2) {
                        let data_topthree = []
                        data.map((row, index) => { index < 3 && data_topthree.push(row) })
                        setDataTopThree(data_topthree)
                    }
                })
                .catch(error => {
                    error.response.status == 500 && props.callback_Logout()
                    error.response.status == 401 && props.callback_Logout()
                })
        }
        // const getLeaderboardChallenge = async function () {
        //     if (!leaderboardChallengeEnabled) return false;

        //     console.log('getLeaderboardChallenge')
        //     axios.post('/api/m1/leaderboard/getLeaderboardChallenge')
        //         .then(response => {
        //             let data = response.data.data.leaderboard
        //             setDataLeaderboardChallenge(data)

        //             if (currentTabIndex == 3) {
        //                 let data_topthree = []
        //                 data.map((row, index) => { index < 3 && data_topthree.push(row) })
        //                 setDataTopThree(data_topthree)
        //             }
        //         })
        //         .catch(error => {
        //             error.response.status == 500 && props.callback_Logout()
        //             error.response.status == 401 && props.callback_Logout()
        //         })
        // }

        if (currentTabIndex == -1) {
            leaderboardGeneralEnabled ? setCurrentTabIndex(0) :
                leaderboardFishingEnabled ? setCurrentTabIndex(1) :
                    leaderboardCraftingEnabled ? setCurrentTabIndex(2) :
                        leaderboardChallengeEnabled ? setCurrentTabIndex(3) : null
        } else if (onLoading) {
            setOnLoading(false)
            leaderboardGeneralEnabled ? getLeaderboard() : null
            leaderboardFishingEnabled ? getLeaderboardFisherman() : null
            leaderboardCraftingEnabled ? getLeaderboardCrafting() : null
            // leaderboardChallengeEnabled ? getLeaderboardChallenge() : null
        }
    }, [currentTabIndex, onLoading]);

    //PERSONAL RANKING
    const getPersonalRanking = (data) => {
        return data?.map((data, index) => (
            data.cityName == props.settings.cityName &&
            <div key={index}>
                <span className='myRanking'>
                    #{data.ranking}
                </span>
                <span className='myImage'>
                    <img src={data.image} />
                </span>
                <span className='myImage'>
                    <img src={data.imageEmblem} />
                </span>
                <span className='myName'>
                    {data.cityName}
                </span>
                <span className='myExp'>
                    {data.experience}
                </span>
            </div>
        ))
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
                    <div className='scroll-content'>
                        {hasTab &&
                            <div className='tab-navs'>
                                {tabs.map((tab, index) => (
                                    <div key={index} className={'tab-nav ' + (currentTabIndex === tab.index ? 'active' : '')} onClick={() => tabChanged(tab.index)}>{tab.name}</div>
                                ))}
                            </div>}
                        <div className='page-content'>
                            {hasTab &&
                                <div className='tab-content'>
                                    {dataTopThree != null && currentPageIndex == 0 &&
                                        <div className='specPanel'>
                                            {dataTopThree[1] != null &&
                                                <div className="specSection">
                                                    <div className="sectionTop">
                                                        <img src={silverCrownImg} className="specBack back-2nd"></img>
                                                        {dataTopThree[1].image
                                                            ? <img src={dataTopThree[1].image} className="specAvatar avatar-2nd"></img>
                                                            : null}
                                                        <img src={rankSecondImg} className="specRanking rank-2nd"></img>
                                                    </div>
                                                    <div className='sectionBottom'>
                                                        {dataTopThree[1].imageEmblem
                                                            ? <img src={dataTopThree[1].imageEmblem} className="specEmblem"></img>
                                                            : null}
                                                        <div className="specCity">{dataTopThree[1].cityName}</div>
                                                        <div className="specExp">{dataTopThree[1].experience}</div>
                                                    </div>
                                                </div>
                                            }
                                            {dataTopThree[0] != null &&
                                                <div className="specSection">
                                                    <div className="sectionTop">
                                                        <img src={goldCrownImg} className="specBack back-1st"></img>
                                                        {dataTopThree[0].image
                                                            ? <img src={dataTopThree[0].image} className="specAvatar avatar-1st"></img>
                                                            : null}
                                                        <img src={rankFirstImg} className="specRanking rank-1st"></img>
                                                    </div>
                                                    <div className='sectionBottom'>
                                                        {dataTopThree[0].imageEmblem
                                                            ? <img src={dataTopThree[0].imageEmblem} className="specEmblem"></img>
                                                            : null}
                                                        <div className="specCity">{dataTopThree[0].cityName}</div>
                                                        <div className="specExp">{dataTopThree[0].experience}</div>
                                                    </div>
                                                </div>
                                            }
                                            {dataTopThree[2] != null &&
                                                <div className="specSection">
                                                    <div className="sectionTop">
                                                        <img src={bronzeCrownImg} className="specBack back-3rd"></img>
                                                        {dataTopThree[2].image
                                                            ? <img src={dataTopThree[2].image} className="specAvatar avatar-3rd"></img>
                                                            : null}
                                                        <img src={rankThirdtImg} className="specRanking rank-3rd"></img>
                                                    </div>
                                                    <div className='sectionBottom'>
                                                        {dataTopThree[2].imageEmblem
                                                            ? <img src={dataTopThree[2].imageEmblem} className="specEmblem"></img>
                                                            : null}
                                                        <div className="specCity">{dataTopThree[2].cityName}</div>
                                                        <div className="specExp">{dataTopThree[2].experience}</div>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    }
                                    {currentTabIndex === 0 ?
                                        !dataLeaderboardGeneral ?
                                            <div className='lb-table-loader'><CircularProgress size={50} sx={{ color: "gold" }} /></div>
                                            : dataLeaderboardGeneral.length > 3 ?
                                                <TableLeaderboard data={dataLeaderboardGeneral} page={currentPageIndex} callback_pageNum={(page) => setPageIndex(page)} />
                                                : null
                                        : currentTabIndex === 1 ?
                                            !dataLeaderboardFishing ?
                                                <div className='lb-table-loader'><CircularProgress size={50} sx={{ color: "gold" }} /></div>
                                                : dataLeaderboardFishing.length > 3 ?
                                                    <TableLeaderboard data={dataLeaderboardFishing} page={currentPageIndex} callback_pageNum={(page) => setPageIndex(page)} />
                                                    : null
                                            : currentTabIndex === 2 ?
                                                !dataLeaderboardCrafting ?
                                                    <div className='lb-table-loader'><CircularProgress size={50} sx={{ color: "gold" }} /></div>
                                                    : dataLeaderboardCrafting.length > 3 ?
                                                        <TableLeaderboard data={dataLeaderboardCrafting} page={currentPageIndex} callback_pageNum={(page) => setPageIndex(page)} />
                                                        : null
                                                : currentTabIndex === 3 ?
                                                    !dataLeaderboardChallenge ?
                                                        <div className='lb-table-loader'><CircularProgress size={50} sx={{ color: "gold" }} /></div>
                                                        : dataLeaderboardChallenge.length > 3 ?
                                                            <TableLeaderboard data={dataLeaderboardChallenge} page={currentPageIndex} callback_pageNum={(page) => setPageIndex(page)} />
                                                            : null
                                                    : null
                                    }
                                </div>}

                            <div className='myRankingPanel'>
                                {currentTabIndex == 0 ?
                                    getPersonalRanking(dataLeaderboardGeneral)
                                    : currentTabIndex == 1 ?
                                        getPersonalRanking(dataLeaderboardFishing)
                                        : currentTabIndex == 2 ?
                                            getPersonalRanking(dataLeaderboardCrafting)
                                            : currentTabIndex == 3 ?
                                                getPersonalRanking(dataLeaderboardChallenge)
                                                : null}
                            </div>
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
        {/* {onLoading ?
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
            : null} */}
    </>)
}

export default GameLeaderBoard