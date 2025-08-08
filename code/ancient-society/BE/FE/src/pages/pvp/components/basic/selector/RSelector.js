import './rselector.scss';

import {
  useMemo,
  useState,
} from 'react';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

function RSelector(props) {
    // basic attr id|className|label
    const id = useMemo(() => props.id, [props.id])
    const className = useMemo(() => props.className, [props.className])
    const label = useMemo(() => props.label, [props.label])
    const menus = useMemo(() => props.menus, [props.menus])

    // current value
    const [value, setValue] = useState(props.value)

    const handleChange = (event) => {
        const val = event.target.value
        setValue(val)
        props.onChange(val)
    }

    return (<>
        <FormControl className={`rselector ${className || ""}`} sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id={id} className='rselector-label'>{label}</InputLabel>
            <Select
                labelId={id}
                id={id}
                className='rselector-select'
                value={value}
                label={label}
                onChange={handleChange}
            >
                {menus.map((menu, index) => (
                    <MenuItem key={index} value={menu.value} className='rselector-menu-item'>
                        {menu.name}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    </>)
}

export default RSelector