import './rleaderboardpanel.scss';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';
import useSound from 'use-sound';

import { CircularProgress } from '@mui/material';

import WarPoints from '../../assets/basic/WarPoints.png';
import rankFirst from '../../assets/leaderboard-panel/rankFirst.png';
import rankSecond from '../../assets/leaderboard-panel/rankSecond.png';
import rankThird from '../../assets/leaderboard-panel/rankThird.png';
import RBackdrop from '../basic/backdrop/RBackdrop';
import RTable from '../basic/table/RTable';

const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function RLeaderBoardPanel(props) {
  const ASSETS_PATH = `${process.env.PUBLIC_URL}/assets-sounds`;
  const isMute = localStorage.getItem('isMute')
  const [play] = useSound(
    `${ASSETS_PATH}/common/touch.mp3`,
    { volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
  );
  const [playTab] = useSound(
    `${ASSETS_PATH}/common/tab.mp3`,
    { volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
  );
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  // tabNames
  const [tabNames, setTabNames] = useState(['TOP', "GOLD", "SILVER", "BRONZE"])
  const leagueIDs = { "TOP": 4, "GOLD": 3, "SILVER": 2, "BRONZE": 1 }
  const [activeTab, setActiveTab] = useState('TOP')
  const setTab = (tabName) => {
    if (tabName != activeTab) {
      setActiveTab(tabName)
      setShowUserdata(false)
      setSelectedUserData(null)
      getLeagueData(tabName)
    }
  }

  // history data
  const [loadingBar, setLoadingBar] = useState(false)
  const [rightLoadingBar, setRightLoadingBar] = useState(false)
  const [userData, setUserData] = useState([])
  const [userLeague, setUserLeague] = useState('')
  useEffect(() => {
    console.log('get all getLeaderboard')
    getAllLeagueDatas()
  }, [])

  const getLeagueData = (tabName) => {
    setRightLoadingBar(true)
    axios
      .post("/api/m1/pvp/getLeaderboard", {
        address: props.metamask,
        idLeague: leagueIDs[tabName]
      })
      .then((response) => {
        if (response.data.success) {
          if (response.data.data.response?.players) {
            // set user inventories from server
            let datas = JSON.parse(JSON.stringify(response.data.data.response?.players))
            let day = new Date(response.data.data.response.endSeason);

            const str_op = month[day.getMonth()] + ', ' + day.getDate() + ' ' + day.getFullYear();
            response.data.data.response.endSeason = str_op
            setUserLeagueData(response.data.data.response)
            datas = [...datas.map((item, index) => { item.rank = index + 1; return item })]
            setUserData(datas)
          }
          else {
            setUserLeagueData(null)
            setUserData([])
          }
        }
        setRightLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setRightLoadingBar(false)
      });
  }

  const [userLeagueData, setUserLeagueData] = useState(null)
  const getAllLeagueDatas = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getLeaderboard", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          let datas = JSON.parse(JSON.stringify(response.data.data.response.players))
          // console.log(datas)
          // let tabs = []
          setUserLeague(response.data.data.response?.league?.name)
          setTab(response.data.data.response?.league?.name?.toUpperCase())
          // datas.map((item, index) => (tabs.indexOf(item?.name)) == -1 ? tabs.push(item?.name) : '')
          // setTabNames(tabs)
          datas = [...datas.map((item, index) => { item.rank = index + 1; return item })]
          setUserData(datas)
        }
        setLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
      });
  }

  const [selectedUserData, setSelectedUserData] = useState(null)
  const [showUserdata, setShowUserdata] = useState(false)
  const onSelectUser = (userData) => {
    play()
    setShowUserdata(true)
    setSelectedUserData(userData)
  }

  const RankCell = ({ row }) => {
    return <>
      <div className='rank-cell'>
        {row.values.rank}
      </div>
    </>
  }
  const NameCell = ({ row }) => {
    return <>
      <div className='name-cell'>
        {row.values.name}
      </div>
    </>
  }
  const AvatarCell = ({ row }) => {
    return <>
      <div className='avatar-cell'>
        <img src={row.values.image} alt='avatar' />
      </div>
    </>
  }
  const WPCell = ({ row }) => {
    return <>
      <div className='wp-cell'>
        <img className='leaderboard-warpoints-img' src={WarPoints}></img>
        {row.values.warPoints}
      </div>
    </>
  }
  const IsUserCell = ({ row }) => {
    return <div className='isUser-cell'>
      {
        row.values.rank == 1 ?
          <img className='rank-badge' src={rankFirst} alt={'avatar'} />
          :
          (
            (row.values.rank == 2) ?
              <img className='rank-badge' src={rankSecond} alt={'avatar'} />
              :
              (
                (row.values.rank == 3) ?
                  <img className='rank-badge' src={rankThird} alt={'avatar'} />
                  :
                  <></>
              )
          )
      }
    </div>;
  }
  const columns = useMemo(
    () => [
      {
        Header: '#',
        accessor: 'rank',
        Cell: RankCell,
        className: 'rank-col',
      },
      {
        Header: 'Name',
        accessor: 'name',
        Cell: NameCell,
        className: 'name-col',
      },
      {
        Header: '',
        accessor: 'image',
        Cell: AvatarCell,
        className: 'avatar-col',
      },
      {
        Header: 'War Points',
        accessor: 'warPoints',
        Cell: WPCell,
        className: 'wp-col',
      },
      {
        Header: '',
        accessor: 'isUser',
        Cell: IsUserCell,
        className: 'isUser-col',
      },
      {
        Header: '',
        accessor: 'matchCount',
        Cell: <></>,
        className: 'empty-col',
      },
      {
        Header: '',
        accessor: 'matchWon',
        Cell: <></>,
        className: 'empty-col',
      },
    ],
    []
  )

  return (
    <>
      <div className={`rleaderboardpanel ${className || ""}`} style={style || {}}>
        <div className='panel-tabs'>
          {tabNames.map((tabName, index) => (
            <div key={index} className={`panel-tab ` + (tabName == activeTab ? 'active' : '')} onClick={() => [playTab(), setTab(tabName)]}>
              {tabName}
            </div>
          ))}
        </div>
        <div className='panel-container'>
          <RBackdrop
            open={loadingBar}
            loadingBar={<>
              <CircularProgress color="inherit" />
            </>}
            textContent={<>
              Loading.. It will take a few seconds. :)
            </>}
          />
          <div className='left-panel'>
            <RTable
              className={'leaderboard-table'}
              columns={columns}
              data={userData}
              userLeague={userLeague}
              tabName={activeTab}
              RPageSize={10}
              setPage={
                userData.filter(user => user.address == props.metamask).length == 0 ?
                  0 :
                  Math.floor(userData.filter(user => user.address == props.metamask)[0].rank / 10)
              }
              onRowClick={onSelectUser}
              address={props.metamask} />
          </div>
          <div className='right-panel'>
            <div className='container'>
              <div className='current-league-text'>
                <a>{activeTab}</a>
              </div>
              <div className='current-league-info'>
                {rightLoadingBar ?
                  <div className='api-loading' style={{ 'position': 'relative', 'background': 'none', "border": 'none' }}>
                    {
                      <span className='apiCallLoading'></span>
                    }
                  </div>
                  :
                  userLeagueData ?
                    <>
                      <div className='league-avatar'>
                        <img src={userLeagueData?.league?.image} alt={'avatar'} />
                      </div>
                      <div className='league-attr'>
                        - Player Count in League: <a>{!userData || !userData.length == 0 ? userData.length : 'No player yet.'}</a>
                      </div>
                      <div className='league-attr'>
                        - Minium Trophies: <a>{userLeagueData?.league?.minTrophies}</a>
                      </div>
                      <div className='league-attr'>
                        - League End Date: <a>{userLeagueData?.endSeason}</a>
                      </div>
                      <div className='league-trophy-text'>
                        Rewards:
                      </div>
                      <div className='league-trophies'>
                        {
                          userLeagueData?.rewards.length == 0 ?
                            <span>There is no reward in this league.</span>
                            :
                            userLeagueData?.rewards.map((trophy, index) => (
                              <div key={index} className='league-trophy' title={trophy?.itemName || trophy?.recipeName || trophy?.cardName || trophy?.gearName || 'Drop'}>
                                <div className='league-trophy-img'>
                                  <img src={trophy?.itemImage || trophy?.recipeImage || trophy?.cardImage || trophy?.gearImage} alt={'img'} />
                                </div>
                                <div className='league-trophy-info'>
                                  <div className='league-trophy-name'>
                                    {trophy?.itemName || trophy?.recipeName || trophy?.cardName || trophy?.gearName || 'Drop'}
                                  </div>
                                  <div className='league-trophy-quantity'>
                                    x {trophy?.quantity || 1}
                                  </div>
                                </div>
                              </div>
                            ))
                        }
                      </div>
                    </>
                    :
                    <div>This league is not active yet.</div>
                }
              </div>
              <div className='current-user-text'>
                <a>Player</a> Info
              </div>
              {showUserdata ?
                <>
                  <div className='user-avatar'>
                    <img src={selectedUserData?.image} alt={'avatar'} />
                    {
                      selectedUserData?.rank == 1 ?
                        <img className='rank-badge' src={rankFirst} alt={'avatar'} />
                        :
                        (
                          (selectedUserData?.rank == 2) ?
                            <img className='rank-badge' src={rankSecond} alt={'avatar'} />
                            :
                            (
                              (selectedUserData?.rank == 3) ? <img className='rank-badge' src={rankThird} alt={'avatar'} /> : ''
                            )
                        )
                    }
                  </div>
                  <div className='current-user-info'>
                    <div className='user-attr'>
                      - Name: <a>{selectedUserData?.name}</a>
                    </div>
                    <div className='user-attr'>
                      - War Points: <a>{selectedUserData?.warPoints}</a>
                    </div>
                    <div className='user-attr'>
                      - Battle Win: <a>{selectedUserData?.matchWon}</a> / {selectedUserData?.matchCount}
                    </div>
                    <div className='user-attr'>
                      - League Rank: <a>{selectedUserData?.rank}</a>th of {userData.length}
                    </div>
                    {/* <div className='vs-history'>
                      - Win/Lose Against Me: <a>1</a> / <a>200</a>
                    </div> */}

                    {/* <div className='most-used-cards-text'>
                      Most Used Cards:
                    </div>
                    <div className='most-used-cards'>
                      {[0, 1, 2].map((trophy, index) => (
                        <div key={index} className='most-used-card'>
                          <div className='most-used-card-img'>
                            <img src={TestDropImg} alt={'trophy'} />
                          </div>
                          <div className='most-used-card-info'>
                            <div className='league-trophy-name'>
                              {trophy?.name || 'Card'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div> */}
                  </div>
                </>
                :
                <></>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RLeaderBoardPanel