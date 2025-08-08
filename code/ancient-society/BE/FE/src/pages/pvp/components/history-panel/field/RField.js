import './rfield.scss';

import * as React from 'react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import useSound from 'use-sound';

import DoubleArrowLeft from '@mui/icons-material/KeyboardDoubleArrowLeft';
import DoubleArrowRight from '@mui/icons-material/KeyboardDoubleArrowRight';
import PrevButton from '@mui/icons-material/NavigateBefore';
import NextButton from '@mui/icons-material/NavigateNext';
import PauseButton from '@mui/icons-material/PauseCircle';
import PlayButton from '@mui/icons-material/PlayCircle';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import {
  animated,
  useSpring,
} from '@react-spring/web';

import TURN1 from '../../../assets/turn1.png';
import TURN2 from '../../../assets/turn2.png';
import TURN3 from '../../../assets/turn3.png';
import RSlot from '../slot/RSlot';

function RField(props) {
  const ASSETS_PATH = `${process.env.PUBLIC_URL}/assets-sounds`;

  const [play] = useSound(
    `${ASSETS_PATH}/common/touch.mp3`,
    { volume: parseFloat(localStorage.getItem('volumeSounds').toString()) / 100 }
  );
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  // auto play state
  const [step, setStep] = useState(1)
  const [playing, setPlaying] = useState(true)
  useEffect(() => {
    let tid
    if (playing) {
      if (step < maxStepPerTurn.current[props.currentTurnNumber - 1]) {
        tid = setTimeout(() => {
          setStep(step + 1)
        }, 3000)
      } else {
        setPlaying(false)
      }
    }
    return () => clearTimeout(tid)
  }, [playing, step])

  // affix tooltip init
  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} placement={props.placement} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#00000000',
      color: 'gold',
      maxWidth: 120,
      display: 'flex',
      fontSize: theme.typography.pxToRem(15),
    },
  }));

  // spring animation
  const [styles, api] = useSpring(
    () => ({
      x: 0,
      y: 0,
      opacity: 0,
    }),
    []
  );

  const affixSlot = useMemo(() => props.affixSlot, [props.affixSlot])
  const affixes = useMemo(() => props.affixes, [props.affixes])

  const [showAffix, setShowAffix] = useState(false)

  useEffect(() => {
    showAffix ?
      api.start({
        to: [{ opacity: 1 }]
      })
      :
      api.start({
        to: [{ opacity: 0.2 }]
      })
    if (!showAffix) {
      setTimeout(() => { setShowAffix(true) }, 800)
    }
  }, [showAffix])

  const handleClick = React.useCallback(() => {
    // setShowAffix(false)
  }, [])

  const togglePlay = (flag) => {
    setPlaying(flag)
  }

  const [currentTurnNumber, setCurrentTurnNumber] = useState(1)
  const turnClick = React.useCallback((turnNumber) => {
    setShowAffix(false)
    props.onTurnClick(turnNumber)
    setCurrentTurnNumber(turnNumber)
    setStep(1)
  }, [props.currentTurnNumber])

  // history data
  const [hdata, setHdata] = useState(props.data)
  const maxStepPerTurn = useRef([0, 0, 0])
  const initCardHP = useRef([[], [], []])

  useEffect(() => {
    setHdata(props.data)
    maxStepPerTurn.current = [props.data.turn1.length, props.data.turn2.length, props.data.turn3.length]
    initCardHP.current[0] = new Array(props.data.turn1.length).fill([])
    initCardHP.current[1] = new Array(props.data.turn2.length).fill([])
    initCardHP.current[2] = new Array(props.data.turn3.length).fill([])
    for (let s = 0; s < props.data.turn1.length; s++) {
      initCardHP.current[0][props.data.turn1[s]] = []
      let temp = []
      for (let i = 0; i < props.data.turn1[s].length; i++) {
        for (let j = 0; j < props.data.turn1[s][i].length; j++) {
          let index = props.data.turn1[s][i][j]?.index
          temp[index] = props.data.turn1[s][i][j]?.hp
          // temp.push(props.data.turn1[s][i][j]?.hp)
        }
      }
      initCardHP.current[0][s] = temp
    }
    for (let s = 0; s < props.data.turn2.length; s++) {
      initCardHP.current[1][s] = []
      let temp = []
      for (let i = 0; i < props.data.turn2[s].length; i++) {
        for (let j = 0; j < props.data.turn2[s][i].length; j++) {
          let index = props.data.turn2[s][i][j]?.index
          temp[index] = props.data.turn2[s][i][j]?.hp
          // temp.push(props.data.turn2[s][i][j]?.hp)
        }
      }
      initCardHP.current[1][s] = temp
    }
    for (let s = 0; s < props.data.turn3.length; s++) {
      initCardHP.current[2][s] = []
      let temp = []
      for (let i = 0; i < props.data.turn3[s].length; i++) {
        for (let j = 0; j < props.data.turn3[s][i].length; j++) {
          let index = props.data.turn3[s][i][j]?.index
          temp[index] = props.data.turn3[s][i][j]?.hp
          // temp.push(props.data.turn3[s][i][j]?.hp)
        }
      }
      initCardHP.current[2][s] = temp
    }
  }, [props.data])


  const rows = React.useRef(props.data?.fieldRows)
  const columns = React.useRef(props.data?.fieldColumns)
  const slotArr = new Array(rows.current).fill(new Array(columns.current).fill(0))
  // change the step of the each turn
  useEffect(() => {
    setShowAffix(false)
  }, [step])
  const goToNext = React.useCallback(() => {
    if (step <= maxStepPerTurn.current[currentTurnNumber - 1]) {
      setStep(step + 1)
    }
  }, [step])

  const goToPrev = React.useCallback(() => {
    if (step != 1) {
      setStep(step - 1)
    }
  }, [step])

  const goToEnd = React.useCallback(() => {
    setStep(maxStepPerTurn.current[currentTurnNumber - 1])
  }, [step, hdata, currentTurnNumber])

  const goToFirst = React.useCallback(() => {
    setStep(1)
  }, [step])
  return (<>
    <div className={`rfield ${className || ""}`} style={style || {}}>
      <div className='map'>
        <img src={hdata?.backImage} className={'map-image'} draggable="false" />
        {props.currentTurnNumber == 1 ? <img src={TURN1} className={'turn-image'} draggable="false" /> : props.currentTurnNumber == 2 ? <img src={TURN2} className={'turn-image'} draggable="false" /> : <img src={TURN3} draggable="false" className={'turn-image'} />}
      </div>

      <div className='turn-nav'>
        {[1, 2, 3].map((turnNumber, index) => (
          <div
            key={index}
            className={`turnMark ${turnNumber == props.currentTurnNumber ? 'current' : ''}`}
            onClick={() => [play(), turnClick(turnNumber)]}
          >
            {turnNumber}
          </div>
        ))}
      </div>

      <div className='slot-div'>
        <div className='divider'></div>
        {slotArr.map((row, rIndex) => (
          <div className='slot-column-div' key={rIndex}>
            {slotArr[rIndex].map((column, cIndex) => (
              <animated.div
                className="animation-slots"
                onClick={handleClick}
                style={{
                  ...styles,
                  cursor: "pointer",
                }}
                key={rIndex + '' + cIndex}
              >
                <RSlot
                  initCardHP={initCardHP.current[props.currentTurnNumber - 1]}
                  metamask={props.metamask}
                  currentTurnNumber={props.currentTurnNumber}
                  positive={
                    props.currentTurnNumber == 1 ?
                      hdata.turn1[step - 1][rIndex][cIndex] && hdata.turn1[step - 1][rIndex][cIndex]?.playerAddress && hdata.turn1[step - 1][rIndex][cIndex]?.playerAddress == props.metamask ? true : false
                      : props.currentTurnNumber == 2 ?
                        hdata.turn2[step - 1][rIndex][cIndex] && hdata.turn2[step - 1][rIndex][cIndex]?.playerAddress && hdata.turn2[step - 1][rIndex][cIndex]?.playerAddress == props.metamask ? true : false
                        : hdata.turn3[step - 1][rIndex][cIndex] && hdata.turn3[step - 1][rIndex][cIndex]?.playerAddress && hdata.turn3[step - 1][rIndex][cIndex]?.playerAddress == props.metamask ? true : false
                  }
                  step={step}
                  totalSlot={hdata?.fieldRows * hdata?.fieldColumns}
                  data={
                    props.currentTurnNumber == 1 ?
                      hdata.turn1[step - 1][rIndex][cIndex] :
                      props.currentTurnNumber == 2 ?
                        hdata.turn2[step - 1][rIndex][cIndex] : hdata.turn3[step - 1][rIndex][cIndex]
                  }
                  prev_data={
                    step > 1 ?
                      props.currentTurnNumber == 1 ?
                        hdata.turn1[step - 2][rIndex][cIndex] :
                        props.currentTurnNumber == 2 ?
                          hdata.turn2[step - 2][rIndex][cIndex] : hdata.turn3[step - 2][rIndex][cIndex]
                      : null
                  }
                  index={(rIndex) * (hdata.fieldColumns) + cIndex} />
              </animated.div>
            ))}
          </div>
        ))}
      </div>

      <div className='action-group'>
        <DoubleArrowLeft className={step == 1 ? ' notAllowed' : ''} onClick={goToFirst} />
        <PrevButton className={step == 1 ? ' notAllowed' : ''} onClick={() => [play(), goToPrev()]} />
        {playing ? <PauseButton onClick={() => togglePlay(false)} /> : <PlayButton onClick={() => togglePlay(true)} />}
        <NextButton className={maxStepPerTurn.current[props.currentTurnNumber - 1] == step ? ' notAllowed' : ''} onClick={() => [play(), goToNext()]} />
        <DoubleArrowRight className={maxStepPerTurn.current[props.currentTurnNumber - 1] == step ? ' notAllowed' : ''} onClick={goToEnd} />
      </div>
    </div>
  </>)
}

export default RField