import './rbattlefield.scss';

import * as React from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { toast } from 'react-toastify';
import useSound from 'use-sound';

import DoneIcon from '@mui/icons-material/Done';
import { Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import {
  animated,
  useSpring,
} from '@react-spring/web';

import { playSound } from '../../../../../utils/sounds';
import AffixIcon from '../../../assets/battle-panel/affix-svg.svg';
import SwordGif from '../../../assets/battle-panel/effect1.gif';
import TickIcon from '../../../assets/battle-panel/icons8-checkmark.svg';
import OFFImage from '../../../assets/battle-panel/imgOff.png';
import ONImage from '../../../assets/battle-panel/imgOn.png';
import TURN1 from '../../../assets/turn1.png';
import TURN2 from '../../../assets/turn2.png';
import TURN3 from '../../../assets/turn3.png';
import RButton from '../../basic/button/RButton';
import RModal from '../../basic/modal/RModal';
import RPaginationPanel from '../../basic/table/RPaginationPanel';
import RSlot from '../slot/RSlot';

function RBattleField(props) {
  const ASSETS_PATH = `${process.env.PUBLIC_URL}/assets-sounds`;
  const isMute = localStorage.getItem('isMute')
  const [play] = useSound(
    `${ASSETS_PATH}/common/touch.mp3`,
    { volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
  );
  const [playConfirm] = useSound(
    `${ASSETS_PATH}/common/confirm.mp3`,
    { volume: (isMute == 'true' ? 0 : parseFloat(localStorage.getItem('volumeSounds').toString()) / 100) }
  );
  // set card slots by battle datas
  const positivePosition = props.positivePosition


  // spring animation
  const [styles, api] = useSpring(
    () => ({
      x: 0,
      y: 0,
      rotateZ: 0,
      opacity: 0,
    }),
    []
  );

  const [showAnimation, setShowAnimation] = useState(true)
  const [swordAnimation, setSwordAnimation] = useState(true)

  useEffect(() => {
    setTimeout(() => setSwordAnimation(false), 600)
  }, [])

  useEffect(() => {
    showAnimation ?
      api.start({
        to: [{ opacity: 1 }]
      })
      :
      api.start({
        to: [{ opacity: 0 }]
      })
    if (!showAnimation) {
      setTimeout(() => { setShowAnimation(true) }, 500)
    }
  }, [showAnimation])

  // hook change turn number 
  const [currentTurnNumber, setCurrentTurnNumber] = useState(props.currentTurnNumber)
  useEffect(() => {
    setShowAnimation(false)
    setCurrentTurnNumber(props.currentTurnNumber)
  }, [props.currentTurnNumber])

  // basic attr className|style
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  // fetch props
  const cards = useMemo(() => props.cards, [props.cards])
  const battleReady = useMemo(() => props.battleReady, [props.battleReady])

  // Current Turn Data
  const [data, setData] = useState(props.data)
  useEffect(() => {
    setData(props.data)
  }, [props.data])

  // pagination init
  const [pageSize, setPageSize] = useState(8)
  const [page, setPage] = useState(1)
  const goToPrevPage = () => {
    playSound('button')
    if (page > 1) {
      setPage(page - 1)
    }
  }
  const goToNextPage = () => {
    playSound('button')
    var totalCount = 0
    for (var i = 0; i < affixes.length; ++i) {
      ++totalCount
    }
    if (page * pageSize < totalCount) {
      setPage(page + 1)
    }
  }

  // legendary card data
  const [legendarydata, setlegendarydata] = useState(props.legendarydata)
  useEffect(() => {
    setlegendarydata(props.legendarydata)
  }, [props.legendarydata])

  // affix tooltip init
  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} placement={props.placement} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#000000',
      color: 'gold',
      maxWidth: 150,
      display: 'flex',
      fontSize: theme.typography.pxToRem(15),
      border: '1px solid #2e2e2e',
      borderRadius: '1rem',
    },
  }));

  const affixes = useMemo(() => props.affixes, [props.affixes])
  const affixSlot = useMemo(() => props.turnAffixSlot, [props.turnAffixSlot])
  const allAffixSlot = useMemo(() => props.affixSlot, [props.affixSlot])

  // Checked and Ready
  const onReady = () => {
    setShowAnimation(false)
    let flag = false
    data.map(cardID => cardID != null ? flag = true : flag)
    if (!flag) {
      toast.warning("You should place at least a card into the field.")
      return
    }
    setSwordAnimation(true)
    setTimeout(() => setSwordAnimation(false), 600)
    props.onTurnReady(data, legendarydata)
  }

  // remove affix
  const removeAffix = useCallback((index) => {
    props.removeAffixSlot(index)
  }, [])

  // select affix modal
  const [activeItem, setActiveItem] = useState(-1)
  const [affixModalShow, setAffixModalShow] = useState(false)
  const [onDoing, setOnDoing] = useState(false)
  const activeSlot = useRef(-1)
  const showAffixModal = useCallback((index) => {
    setAffixModalShow(true)
    setFilterType('all')
    setActiveItem(-1)
  }, [activeItem])
  const onEquipAffix = useCallback(() => {
    props.setTurnAffixSlot(activeSlot.current, activeItem)
    setAffixModalShow(false)
  }, [activeItem])
  const clickEquipData = useCallback((item) => {
    setActiveItem(item?.idAffix)
  }, [])
  const onCancelAction = () => {
    setAffixModalShow(false)
    setOnDoing(false)
  }

  // filter affixes by type
  const [filterType, setFilterType] = useState('all')
  const filterAffixed = useCallback((type) => {
    if (filterType != type) {
      setFilterType(type)
      setPage(1)
    }
  }, [filterType])

  const tabFilter = useCallback((item) => {
    if (filterType == 'all')
      return true;
    else if (filterType == 'turn1')
      return allAffixSlot[0].find(ele => ele == item.idAffix) == undefined ? false : true
    else if (filterType == 'turn2')
      return allAffixSlot[1].find(ele => ele == item.idAffix) == undefined ? false : true
    else if (filterType == 'turn3')
      return allAffixSlot[2].find(ele => ele == item.idAffix) == undefined ? false : true
    else
      return true;
  }, [filterType])

  return (<>
    { }
    <div className={`battlefield ${className || ""}`} style={style || {}}>
      {/* Background Map */}
      <div className='map'>
        <img src={props.battleData?.image} className={'map-image'} draggable="false" onMouseDown={props.stopDraggable} />
        {props.currentTurnNumber == 1 ? <img src={TURN1} className={'turn-image'} draggable="false" /> : props.currentTurnNumber == 2 ? <img src={TURN2} className={'turn-image'} draggable="false" /> : <img src={TURN3} className={'turn-image'} draggable="false" />}
        <Tooltip title={'You can see all affixes in detail.'}>
          <img src={AffixIcon} onClick={() => [play(), showAffixModal(0)]} className={'affix-img'} />
        </Tooltip>
      </div>

      {/* Positive Unit slots */}
      {
        swordAnimation ?
          <div className='sword-gif-div'>
            <img src={SwordGif}></img>
          </div>
          :
          <>
            <div className='positive-section'>
              {positivePosition.map((pos, index) => (
                <div key={index}>
                  <animated.div
                    className="animation-slots"
                    onClick={() => { }}
                    style={{
                      ...styles,
                      backdropFilter: 'blur(2px)',
                      cursor: "pointer",
                    }}
                    key={index}
                  >
                    <RSlot
                      index={index}
                      firstItem={(index) % props.columns == 0 ? true : false}
                      lastItem={(index + 1) % props.columns == 0 ? true : false}
                      lineNumber={parseInt((index) / props.columns + 1)}
                      battleStatus={props.status}
                      style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
                      cards={cards}
                      data={data[index]}
                      draggable={true}
                    />
                  </animated.div>
                </div>
              ))}
              <animated.div
                className="animation-slots"
                onClick={() => { }}
                style={{
                  ...styles,
                  cursor: "pointer",
                }}
              >
                <RSlot
                  className={'legendary'}
                  key={999}
                  index={999}
                  battleStatus={props.status}
                  style={{ top: `35px`, left: `-250px` }}
                  cards={cards}
                  data={legendarydata}
                  draggable={true}
                />
                <div className='effect'>

                  <div className='affix-slot'>
                    {allAffixSlot[props.currentTurnNumber - 1].map((affix, index) => {
                      return affixes.find(ele => ele.idAffix == affix) == undefined ?
                        <></>
                        :
                        <HtmlTooltip
                          placement={'left'}
                          key={index}
                          title={
                            <React.Fragment>
                              <div className='tooltip-affix-property battle-panel'>
                                <a className='tooltip-affix-name'>{affixes.find(ele => ele.idAffix == affix)?.name ? affixes.find(ele => ele.idAffix == affix)?.name : ''}</a>
                                {affixes.find(ele => ele.idAffix == affix)?.effectOnCategory ? <a className='tooltip-affix-category'>{'Category: ' + affixes.find(ele => ele.idAffix == affix)?.effectOnCategory}</a> : <></>}
                                {affixes.find(ele => ele.idAffix == affix)?.effectOnAttribute ? <a className='tooltip-affix-rarity'>{'Attribute: ' + affixes.find(ele => ele.idAffix == affix)?.effectOnAttribute}</a> : <></>}
                                {affixes.find(ele => ele.idAffix == affix)?.percentage != null ? <a className='tooltip-affix-level'>{'Percentage: ' + affixes.find(ele => ele.idAffix == affix)?.percentage + '%'}</a> : <></>}
                                {affixes.find(ele => ele.idAffix == affix)?.flat != null ? <a className='tooltip-affix-flat'>Flat : {affixes.find(ele => ele.idAffix == affix)?.flat}</a> : <></>}
                                <a className='tooltip-affix-buff'>{affixes.find(ele => ele.idAffix == affix)?.buff ? <><Tooltip title="BUFF"><img src={ONImage} /></Tooltip></> : <><Tooltip title="DEBUFF"><img src={OFFImage} /></Tooltip></>}</a>
                              </div>
                            </React.Fragment>
                          }
                        >
                          <div className='affix'>
                            <div className='tooltip-affix-property battle-panel'>
                              <img className={'tick-img'} src={TickIcon}></img>
                              <a className='tooltip-affix-name1'>{affixes.find(ele => ele.idAffix == affix)?.name ? affixes.find(ele => ele.idAffix == affix)?.name : ''}</a>
                            </div>
                          </div>
                        </HtmlTooltip>
                    })}
                  </div>
                </div>
              </animated.div>
            </div>
            {/* Ready Button */}
            <RButton className={'readyBtn'} onClick={() => [playConfirm(), onReady()]} >
              <DoneIcon />{battleReady ? "Start" : "Ready"}
            </RButton>
          </>
      }

    </div>
    {/* select affix modal */}
    <RModal
      className={'affixSelectModal'}
      style={''}
      open={affixModalShow}
      title={"Affixes"}
      content={<>
        <div className='scroll-content equip-modal' style={{ 'height': '440px', 'position': 'relative' }}>
          {(onDoing) ? <div className='api-loading'>
            <span className='apiCallLoading'></span>
            <span className={'loader -loader'}></span>
          </div>
            :
            <>
              <div className='page-content'>
                {<div className='craft-items'>
                  {affixes.filter(tabFilter).map((affix, index) => (
                    index >= pageSize * (page - 1) && index < pageSize * page &&
                    <div key={index} className='craft-item-wrapper'>
                      <div
                        className={`craft-item equip-item` + (activeItem == affix.idAffix ? ' active' : '')} onClick={() => clickEquipData(affix)}>
                        <Fade in={true} style={{ 'transformOrigin': '0 0 0' }}>
                          {/* <img className='craft-item-background' src={inventory_item_back} /> */}
                          <div className={`modal-affix`}>
                            <fieldset>
                              <legend className='modal-affix-name'>{affix ? affix?.name : 'Affix_1'}</legend>
                              <div key={`affix` + index} className='modal-affix-property'>
                                {affix?.effectOnCategory ? <a className='modal-affix-category'>{'' + affix?.effectOnCategory}</a> : <></>}
                                {affix?.effectOnAttribute ? <a className='modal-affix-rarity'>{'' + affix?.effectOnAttribute}</a> : <></>}
                                {affix?.percentage != null ? <a className='modal-affix-level'>{'' + affix?.percentage}</a> : <></>}
                                {affix?.flat != null ? <a className='modal-affix-flat'>Flat : {affix?.flat}</a> : <></>}
                                <a className='modal-affix-buff'>{affix.buff ? <><Tooltip title="BUFF"><img src={ONImage} /></Tooltip></> : <><Tooltip title="DEBUFF"><img src={OFFImage} /></Tooltip></>}</a>
                                <div className='modal-affix-description'>{affix ? affix.description : ''}</div>
                              </div>
                              {filterType != 'all' ?
                                <img src={TickIcon} className='modal-tick-img' />
                                :
                                <></>
                              }
                            </fieldset>
                          </div>
                        </Fade>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>
              <RPaginationPanel canPreviousPage={page > 1} canNextPage={page < affixes.filter(tabFilter).length / pageSize} onNext={goToNextPage} onPrev={goToPrevPage} totalCount={affixes.filter(tabFilter).length} pageIndex={page - 1} pageSize={pageSize} />
            </>}
        </div>

      </>}
      actions={<>
        {/* <RButton className={`${(!onDoing && (activeItem != -1) ? '' : ' notAllowed')}`} onClick={onEquipAffix}>Equip</RButton> */}
        <RButton onClick={onCancelAction}>Cancel</RButton>
      </>}
      onClose={onCancelAction}
    />
  </>)
}

export default RBattleField