import './runitlist.scss';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import RUnit from '../unit/RUnit';

function RUnitList(props) {
  // basic attr className|style
  const [className, setClassName] = useState(props.className)
  useEffect(() => {
    setClassName(props.className)
  }, [props.className])

  const [style, setStyle] = useState(props.style)
  useEffect(() => {
    setStyle(props.style)
  }, [props.style])

  // necessary props
  const cards = useMemo(() => props.data, [props.data])
  const draggable = useMemo(() => props.draggable, [props.draggable])

  return (<>
    <div className={`runitbattlelist ${className || ""}`} style={style || {}}>
      {cards.length == 0 ? <>
        <div className='empty-card'>
          You have no card.
        </div>
      </> : <>
        {cards.map((unit, index) => (
          <RUnit
            key={index}
            className={className}
            draggable={draggable}
            data={unit}
          />
        ))}
      </>
      }
    </div>
  </>)
}

export default RUnitList