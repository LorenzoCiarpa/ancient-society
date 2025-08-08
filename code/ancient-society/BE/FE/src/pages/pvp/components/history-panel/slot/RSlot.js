import './rslot.scss';

import * as React from 'react';
import {
  useEffect,
  useState,
} from 'react';

import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import BLOCK from '../../../assets/battle-panel/block.png';
import TestDropImg from '../../../assets/inventory-panel/chest.png';

function RSlot(props) {
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  // hp progress bar
  const [hp, setHP] = useState(100)
  const initCardHP = React.useMemo(() => props.initCardHP, [props.initCardHP])


  const [unitData, setUnitData] = useState(props.data)
  const [step, setStep] = useState(props.step)
  useEffect(() => {
    setStep(props.step)
  }, [props.step])

  useEffect(() => {
    setUnitData(props.data)
    if (initCardHP[0] == undefined && initCardHP[0] == null)
      return
    step == 0 ? setHP(100) : setHP(props.data?.hp == undefined || props.data?.index == undefined ? 0 : parseInt(props.data?.hp / initCardHP[0][props.data?.index] * 100))
  }, [props.data, step])

  // console.log(props.data, props.positive, props.metamask)

  const onDragOver = (e) => {
    e.preventDefault()
  }
  const onDrop = (e) => {
    const data = JSON.parse(e.dataTransfer.getData('data'))
    setUnitData(data)
  }


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

  return (<>
    {unitData ?
      <HtmlTooltip
        placement={props.positive ? 'bottom' : 'top'}
        title={
          unitData &&
          <React.Fragment>
            <div className='tooltip-card-img-div'>
              <img src={unitData?.image ? unitData?.image : TestDropImg} className='tooltip-card-img' alt={'unit'} color="inherit" />
            </div>
            <div className='tooltip-card-property'>
              <a className='tooltip-card-name'>{unitData?.name ? unitData?.name : 'Card Name'}</a>
              <a className='tooltip-card-level'>{unitData?.level ? 'lv : ' + unitData?.level : 'level'}</a>
              <a className='tooltip-card-level'>{unitData?.hp != 0 ? 'hp : ' + unitData?.hp : 'dead'}</a>
              <a className='tooltip-card-level'>{unitData?.range ? 'range : ' + unitData?.range : 'dead'}</a>
              <a className='tooltip-card-level'>{unitData?.attack ? 'attack : ' + unitData?.attack : 'dead'}</a>
              <a className='tooltip-card-level'>{unitData?.speed ? 'speed : ' + unitData?.speed : 'dead'}</a>
              <a className='tooltip-card-level'>{unitData?.damageReceived != null && unitData?.damageReceived != undefined ? 'Damage : ' + unitData?.damageReceived : 'Damage'}</a>
            </div>
          </React.Fragment>
        }
      >
        <div className={`rslot-history fill ${unitData == null ? '' : unitData.playerAddress == props.metamask ? 'positive' : 'negative'}`} style={style || {}}>
          {unitData && <>
            <img src={unitData?.image || TestDropImg} alt={'unit'} />
          </>}
          <div className='fragment-status-progress-bar'>
            <div className='progress-bar-fill' style={{ width: hp + '%' }}></div>
          </div>
        </div>
      </HtmlTooltip>
      :
      <div className={`rslot-history ${unitData ? 'fill' : ''} ${unitData == null ? '' : unitData.playerAddress == props.metamask ? 'positive' : 'negative'}`} style={style || {}}>
        {/* {!props.data && (props.prev_data?.hp) ? <><Balabac style={{position: 'absolute'}} size="60" delay={0} repeatDelay={0} repeat={1} /><img style={{opacity: '0.5'}} src={BLOCK} alt={'unit'} /></>
        : <img src={BLOCK} alt={'unit'} />
        } */}
        <img src={BLOCK} alt={'unit'} />
        {unitData && <>
          <div className='fragment-status-progress-bar'>
            <div className='progress-bar-fill' style={{ width: '50%' }}></div>
          </div>
        </>}
      </div>
    }
  </>)
}

export default RSlot