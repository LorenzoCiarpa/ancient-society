import './rimginput.scss';

import {
  useEffect,
  useState,
} from 'react';

import InputBackImg from '../../../assets/basic/input/input-back.png';

function RImgInput(props) {
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    const [placeholder, setPlaceholder] = useState(props.placeholder)
    useEffect(() => {
        setPlaceholder(props.placeholder)
    }, [props.placeholder])

    const [value, setValue] = useState(props.value)
    useEffect(() => {
        setValue(props.value)
    }, [props.value])

    return (<>
        <div className={`rimginput ${className || ""}`} style={style || {}} onClick={props.onClick}>
            <img className="rimginput-background" src={InputBackImg} alt={"button"} />
            <input placeholder={placeholder || ''} value={value} onChange={(e) => props.onChange(e)} />
        </div>
    </>)
}

export default RImgInput