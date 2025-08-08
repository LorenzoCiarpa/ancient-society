import './rmenu.scss';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Typed from "react-typed";
import Ticao from "../../basic/animation/Ticao";
import { playSound } from '../../../../../utils/sounds';
function RMenu(props) {
  // basic attrs className|style
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  // menu data
  const [data, setData] = useState(props.data)
  useEffect(() => {
    setData(props.data)
  }, [props.data])

  const [hover, setHover] = useState(false)
  const hoverEvent = (flag) => {
    setHover(flag)
  }

  const pageLoading = useMemo(() => props.pageLoading, [props.pageLoading])

  const [explode, setExplode] = useState(false)
  const menuClick = useCallback(() => {
    console.log('menuClick')
    
    // setExplode(true)
    props.onClick()
    // setTimeout(() => {
    //   setExplode(false)
    // }, 1000)
  }, [])

  return (<>
    <div className={`rmenu ${className || ""}`} style={style || {}}>
      {/* menu back image */}
      <img className='section-back-image' src={data?.backImg} alt={'section'} />

      {/* panel thumb */}

      <div>
        <img draggable="false" className='menu-back-image' style={{ background: data?.imgStyle, opacity: explode ? 0.3 : 1 }} src={data?.menuImg} alt={'menu'} onClick={menuClick} />
        {explode ? <Ticao style={{ top: '-190px', left: '-70px' }} size="250" delay={0} repeatDelay={0} repeat={1} /> : <></>}
      </div>

      {/* menu info */}
      <div className='info-panel'>
        <div className='section-title' onMouseEnter={() => hoverEvent(true)} onMouseLeave={() => hoverEvent(false)} onClick={menuClick}>
          {hover ? < Typed
            strings={[
              data?.title
            ]}
            typeSpeed={80}
            backSpeed={100}
            cursorChar={''}
          // loop
          />
            : data?.title}
        </div>
        <div className='section-description'>
          {props.children}
          {
            data?.description
          }
        </div>
      </div>
    </div>
  </>)
}

export default RMenu