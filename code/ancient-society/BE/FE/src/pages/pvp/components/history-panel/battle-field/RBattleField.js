import './rbattlefield.scss';

import {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import RField from '../field/RField';

function RBattleField(props) {
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  const [hdata, setHdata] = useState(props.data)
  useEffect(() => {
    setHdata(props.data)
  }, [props.data])

  useEffect(() => {
    // getAllAffixes()
  }, [])

  // battle affix slots
  const [affixSlot, setAffixSlot] = useState([[3, 6, 9], [-1, -1, -1], [-1, -1, -1]])

  // get all affixes
  const [affixes, setAffixes] = useState([]);
  const [loadingBar, setLoadingBar] = useState(false)
  const getAllAffixes = () => {
    setLoadingBar(true)
    axios
      .post("/api/m1/pvp/getAllAffixes", {
        address: props.metamask.walletAccount,
      })
      .then((response) => {
        if (response.data.success) {
          // set the user cards from server
          let affixes = JSON.parse(JSON.stringify(response.data.data.affixes))
          setAffixes(affixes)
        }
        setLoadingBar(false)
      })
      .catch((error) => {
        console.log(error)
        setLoadingBar(false)
      });
  }

  const stopDraggable = () => {
    return false;
  }

  return (<>
    <div className={`rbattlefield ${className || ""}`} style={style || {}}>
      {/* <div className='positive-unit-list'>
        <div className='player-info'>
          <div className='player-avatar'>
            <img src={props.user?.userImage} alt={'avatar'} />
          </div>
          <div className='player-name'>
            {props.user?.userName}
          </div>
        </div>
        <RUnitList className='positive' draggable={false} data={[]} />
      </div> */}

      <RField
        stopDraggable={stopDraggable}
        metamask={props.metamask}
        affixSlot={affixSlot[props.currentTurnNumber - 1]}
        affixes={affixes}
        currentTurnNumber={props.currentTurnNumber}
        onTurnClick={props.onTurnClick}
        data={hdata}
      />

      {/* <div className='negative-unit-list'>
        <div className='player-info'>
          <div className='player-avatar'>
            <img src={props.negative?.enemyImage} alt={'avatar'} />
          </div>
          <div className='player-name'>
            {props.negative?.enemyName}
          </div>
        </div>
        <RUnitList className='negative' draggable={false} data={[]} />
      </div> */}
    </div>
  </>)
}

export default RBattleField