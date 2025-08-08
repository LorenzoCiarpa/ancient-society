import './rinput.scss';

import {
  useEffect,
  useState,
} from 'react';

function RInput(props) {
    // basic props for input handling
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    const [style, setStyle] = useState(props.style)
    useEffect(() => {
        setStyle(props.style)
    }, [props.style])

    const [type, setType] = useState(props.type)
    useEffect(() => {
        setType(props.type)
    }, [props.type])

    const [placeholder, setPlaceholder] = useState(props.placeholder)
    useEffect(() => {
        setPlaceholder(props.placeholder)
    }, [props.placeholder])

    const [value, setValue] = useState(props.value)
    useEffect(() => {
        setValue(props.value)
    }, [props.value])

    return (<>
        <div className={`rinput ${className || ""}`} style={style || {}} onClick={props.onClick}>
            <input type={type} placeholder={placeholder || ''} value={value} onChange={(e) => props.onChange(e)} />
        </div>
    </>)
}

export default RInput