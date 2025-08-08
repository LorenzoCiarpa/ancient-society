import './rbutton.scss';

import {
  useEffect,
  useState,
} from 'react';

import Button from '@mui/material/Button';

function RButton(props) {
    // basic attr className
    const [className, setClassName] = useState(props.className)
    useEffect(() => {
        setClassName(props.className)
    }, [props.className])

    // true if disabled
    const [disabled, setDisabled] = useState(props.disabled)
    useEffect(() => {
        setDisabled(props.disabled)
    }, [props.disabled])

    return (<>
        <Button className={`rbutton ${className || ""}`} disabled={disabled} variant='contained' onClick={props.onClick}>
            {props.children}
        </Button>
    </>)
}

export default RButton