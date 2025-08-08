import './rslot.scss';

import * as React from 'react';
import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useDrop } from 'react-dnd';

import BoltIcon from '@mui/icons-material/Bolt';
import CancelIcon from '@mui/icons-material/Cancel';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import BLOCK from '../../../assets/battle-panel/block.png';
import { BattleContext } from '../RBattlePanel';

function RSlot(props) {
  // basic attr className | style
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  // necessary props
  const draggable = useMemo(() => props.draggable, [props.draggable])

  // placed unit data
  const [unitData, setUnitData] = useState(null)
  const cards = useMemo(() => props.cards, [props.cards])
  const cardId = useMemo(() => props.data, [props.data])
  useEffect(() => {
    let cardData = null
    cards.map(card => {
      card.id == cardId ? cardData = card : null
    })
    setUnitData(cardData)
  }, [cardId])

  const index = useMemo(() => props.index, [props.index])
  const firstItem = useMemo(() => props.firstItem, [props.firstItem])
  const lastItem = useMemo(() => props.lastItem, [props.lastItem])
  const lineNumber = useMemo(() => props.lineNumber, [props.lineNumber])
  // remove placed unit
  const removeUnit = () => {
    if (props.battleStatus) {
      onRemove(props.index)
      setUnitData(null)
    }
  }
  const { onDrop, onRemove } = useContext(BattleContext)
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'Card',
      drop: () => {
        onDrop(index)
      },
      canDrop: () => draggable && props.battleStatus,
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop()
      })
    }),
    [onDrop]
  )

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} placement={props.placement} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#00000090',
      color: 'rgba(255, 255, 255, 0.87)',
      maxWidth: 200,
      display: 'flex',
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #2e2e2e',
    },
  }));

  function Overlay({ color }) {
    return <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        zIndex: 1,
        opacity: 0.5,
        backgroundColor: color,
      }}
    />
  }

  return (<>
    {unitData ?
      <HtmlTooltip
        placement={'bottom'}
        title={
          unitData &&
          <React.Fragment>
            <div className='tooltip-card-img-div'>
              <img src={unitData?.image} className='tooltip-card-img' alt={'unit'} color="inherit" />
            </div>
            <div className='tooltip-card-property battle-panel'>
              <a className='tooltip-bcard-name'>{unitData?.name ? unitData?.name : 'Card Name'}</a>
              {unitData?.rarity.toLowerCase() == 'legendary' ?
                <>
                  <a className='tooltip-card-category'>{unitData?.buffCategory ? unitData?.buffCategory : 'RANGE'}</a>
                  <a className='tooltip-card-rarity'>{unitData?.buffAttribute ? unitData?.buffAttribute : 'rarity'}</a>
                  <a className='tooltip-card-rarity'>{unitData?.buffPercentage ? unitData?.buffPercentage + '%' : 'rarity'}</a>
                  <a className='tooltip-card-level'>{unitData?.level ? 'Level : ' + unitData?.level : 'level'}</a>
                </>
                :
                <>
                  <a className='tooltip-card-attr'><FavoriteIcon className='unit-small-img' style={{ 'color': '#ff0000b3' }} />{unitData?.hp ? unitData?.hp : 'rarity'}</a>
                  <a className='tooltip-card-attr'><CancelIcon className='unit-small-img' style={{ 'color': "#ffb13b" }} />{unitData?.attack ? unitData?.attack : 'RANGE'}</a>
                  <a className='tooltip-card-attr'><BoltIcon className='unit-small-img' style={{ 'color': '#00afff' }} />{unitData?.speed ? unitData?.speed: 'rarity'}</a>
                  <a className='tooltip-card-attr'><CrisisAlertIcon className='unit-small-img' style={{ 'color': '#00c800' }} />{unitData?.range ? unitData?.range : 'level'}</a>
                  <a className='tooltip-card-attr'>{unitData?.level ? 'Level: ' + unitData?.level : 'level'}</a>
                </>
              }
            </div>
          </React.Fragment>
        }
      >
        <div
          ref={drop}
          className={`rslot ${firstItem == true ? 'firstitem' : ''} ${lastItem ? 'lastitem' : ''} ${draggable ? 'draggable' : ''} ${unitData ? 'fill' : ''} ${className || ""}`}
          style={style || {}}
        >
          {firstItem == true ? <Tooltip title={`This line is faced ` + (lineNumber == 1 ? '1st' : (lineNumber == 2 ? '2nd' : lineNumber + 'th')) + ` with your enemy.`}><span className={'line' + lineNumber}>{lineNumber} °</span></Tooltip> : <></>}
          {lastItem == true && lineNumber == 1 ? <span className={'last' + lineNumber}>This will be the first line facing enemy.</span> : <></>}
          {isOver && canDrop && <Overlay color="green" />}
          {isOver && !canDrop && <Overlay color="red" />}
          {unitData && <>
            <img src={unitData.image} alt={'unit'} />
            <div className='clear-overlay' onClick={removeUnit}>
              <CancelIcon />
            </div>
          </>}
        </div>
      </HtmlTooltip>
      :
      <div
        ref={drop}
        className={`rslot ${firstItem == true ? 'firstitem' : ''} ${lastItem ? 'lastitem' : ''} ${draggable ? 'draggable' : ''} ${unitData ? 'fill' : ''} ${className || ""}`}
        style={style || {}}
      >
        {firstItem == true ? <Tooltip title={`This line is faced ` + (lineNumber == 1 ? '1st' : (lineNumber == 2 ? '2nd' : lineNumber + 'th')) + ` with your enemy.`}><span className={'line' + lineNumber}>{lineNumber} °</span></Tooltip> : <></>}
        {lastItem == true && lineNumber == 1 ? <span className={'last' + lineNumber}>This will be the first line facing enemy.</span> : <></>}
        <img src={BLOCK} alt={'unit'} />
        {isOver && canDrop && <Overlay color="green" />}
        {isOver && !canDrop && <Overlay color="red" />}
        {unitData && <>
          <div className='clear-overlay' onClick={removeUnit}>
            <CancelIcon />
          </div>
        </>}
      </div>
    }
  </>)
}

export default RSlot