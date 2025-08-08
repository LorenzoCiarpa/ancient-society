import './rhistorypanel.scss';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';
import { toast } from 'react-toastify';
import useSound from 'use-sound';

import { CircularProgress } from '@mui/material';

import { playSound } from '../../../../utils/sounds';
import SwordGif from '../../assets/battle-panel/gi3.gif';
import RBackdrop from '../basic/backdrop/RBackdrop';
import RPaginationPanel from '../basic/table/RPaginationPanel';
import RBattleField from './battle-field/RBattleField';
import RBattleHistory from './battle-history/RBattleHistory';
import RPlayerInfo from './player-info/RPlayerInfo';

function RHistoryPanel(props) {
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

  // init pagenation
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const goToPrevPage = () => {
    playSound('button')
    if (page > 1) {
      setPage(page - 1)
    }
  }
  const goToNextPage = () => {
    playSound('button')
    var historyCount = 0
    for (var i = 0; i < battleHistories.length; ++i) {
      ++historyCount
    }
    if (page * pageSize < historyCount) {
      setPage(page + 1)
    }
  }

  // userdata
  const [userData, setUserData] = useState(props.userdata)
  useEffect(() => {
    setUserData(props.userdata)
  }, [props.userdata])

  // history data
  const [loadingBar, setLoadingBar] = useState(false)
  const [battleHistories, setBattleHistories] = useState([])
  useEffect(() => {
    console.log('get all battlehistories')
    getBattleHistories()
    setPage(1)
  }, [])

  const historyWarID = useMemo(() => props.historyWarID, [props.historyWarID])

  useEffect(() => {
    if (historyWarID != null && historyWarID != undefined && battleHistories.length > 0) {
      if (battleHistories.filter(war => war.idWar == historyWarID).length > 0)
        onShowDetail(battleHistories.filter(war => war.idWar == historyWarID)[0])
    }
  }, [historyWarID, battleHistories])

  // currentTurnNumber
  const [currentTurnNumber, setCurrentTurnNumber] = useState(1)
  useEffect(() => {

  }, [currentTurnNumber])

  const onTurnClick = (turnNumber) => {
    setCurrentTurnNumber(turnNumber)
  }

  const getBattleHistories = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getWarHistory", {
        address: props.metamask,
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          let datas = JSON.parse(JSON.stringify(response.data.data.response))
          for (let i = 0; i < datas.length; i++) {
            let datetime = new Date(datas[i].endingTime)
            datas[i].endingTime = datetime.toLocaleString()
          }
          setBattleHistories(datas)
        }
        setLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
      });
  }


  const [selectedBattleData, setSelectedBattleData] = useState(null)
  const [hDetail, setHDetail] = useState({})
  const [rightLoadingBar, setRightLoadingBar] = useState(false)
  const onShowDetail = (battleData) => {
    setCurrentTurnNumber(1)
    setRightLoadingBar(true)
    axios
      .post("/api/m1/pvp/getWarInstanceHistory", {
        address: props.metamask,
        idWar: battleData.idWar
      })
      .then((response) => {
        if (response.data.success) {
          // set user inventories from server
          let datas = JSON.parse(JSON.stringify(response.data.data))
          setHDetail(datas)
          setSelectedBattleData(battleData)
        }
        setRightLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        toast.error("You can't replay this battle.")
        setSelectedBattleData(null)
        setRightLoadingBar(false)
      });
  }

  return (<>
    <div className={`rhistorypanel ${className || ""}`} style={style || {}}>
      <RBackdrop
        open={loadingBar}
        loadingBar={<>
          <CircularProgress color="inherit" />
        </>}
        textContent={<>
          Loading.. It will take a few seconds. :)
        </>}
      />
      <div className='history-list'>
        {battleHistories.length == 0 ? <><div className='error-inventory'>You have no battle history.</div></> : battleHistories.map((battle, index) => (
          index >= pageSize * (page - 1) && index < pageSize * page && <RBattleHistory key={index} data={battle} onClick={() => [play(), onShowDetail(battle)]} />
        ))}
        {battleHistories.length != 0 && <RPaginationPanel canPreviousPage={page > 1} canNextPage={page < battleHistories.length / pageSize} onNext={goToNextPage} onPrev={goToPrevPage} totalCount={battleHistories.length} pageIndex={page - 1} pageSize={pageSize} />}
      </div>
      <div className='history-container'>
        {
          rightLoadingBar ?
            <div className='sword-gif-div'>
              <img src={SwordGif}></img>
            </div> :
            selectedBattleData !== null ? <>
              <div className='battle-replay'>
                <div className='replay-header'>
                  <RPlayerInfo className='positive' player={'positive'} win={selectedBattleData?.win ? true : false} data={userData} />
                  <div className='battle-result-info'>
                    <div className='battle-result'>
                      <a>{userData?.warPoints}</a>:<a>{selectedBattleData?.enemyTrophies}</a>
                    </div>
                    <div className='vs-mark'>
                      Vs
                    </div>
                  </div>
                  <RPlayerInfo className='negative' win={selectedBattleData?.win ? false : true} player={'negative'} data={selectedBattleData} />
                </div>
                <div className='replay-content'>
                  {/* <div
                                className='positive-unit-list'>
                                <div className='unit-list'>
                                    <RUnitList
                                        className='positive'
                                        draggable={false}
                                    />
                                </div>
                            </div> */}
                  <div
                    className='battle-field'>
                    <RBattleField
                      metamask={props.metamask}
                      onTurnClick={onTurnClick}
                      user={userData}
                      negative={selectedBattleData}
                      currentTurnNumber={currentTurnNumber}
                      data={hDetail}
                      legendarydata={{}}
                      cards={{}}
                      battleData={{}}
                      draggable={false}
                    />
                  </div>
                </div>
                <div className='replay-footer'>
                  You {selectedBattleData?.win ?
                    <a className='won'>won</a>
                    :
                    <a className='lost'>lost</a>
                  } this battle.
                </div>
              </div>
            </> : <>
              <div className='notSelectedBattleDataText'>
                Select the battle you want to view a replay.
              </div>
            </>}
      </div>
    </div>
  </>)
}

export default RHistoryPanel