import './bonus-consumable.scss';

import {
  useEffect,
  useState,
} from 'react';

import { Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} placement='top' classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'transparent',
        width: 'calc(100% - 1rem)',
        margin: '0rem 0rem 0rem 0rem !important',
        padding: '0.5rem'
    },
}));

function BonusConsumable({ info, selectedTool, cb_onSelectConsumable }) {
    const [consumable, setConsumable] = useState({})
    useEffect(() => {
        setConsumable(info)
    }, [info])

    const [toolInfo, setToolInfo] = useState(selectedTool)
    useEffect(() => {
        setToolInfo(selectedTool)
    }, [selectedTool])

    const available = () => {
        if (!toolInfo.idToolInstance) {
            return -1;
        }
        const effects = info.effectOn.split(',');
        if (info.type == 'ENCHANTMENT') {
            for (const effect of effects) {
                if (toolInfo.isEnchantable[effect.toLowerCase()]) {
                    return true;
                }
            }
            return false;
        } else if (info.type == 'REROLL') {
            for (const effect of effects) {
                if (toolInfo.isRollable[effect.toLowerCase()]) {
                    return true;
                }
            }
        } else if (info.type == 'ELEVATE') {
            if (info.idItemConsumableBonus == 11 || info.idItemConsumableBonus == 12 || info.idItemConsumableBonus == 13) {
                for (const effect of effects) {
                    if (toolInfo.isElevatableII[effect.toLowerCase()]) {
                        return true;
                    }
                }
            } else {
                for (const effect of effects) {
                    if (toolInfo.isElevatable[effect.toLowerCase()]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    const message = () => {
        if (info.type == 'ENCHANTMENT') {
            return `There's no empty slot to add the "${info.effectOn.split(',').join(', ')}"`;
        } else if (info.type == 'REROLL') {
            return `You don't have any "${info.effectOn.split(',').join(', ')}" bonuses`;
        } else if (info.type == 'ELEVATE') {
            if (info.idItemConsumableBonus == 11 || info.idItemConsumableBonus == 12 || info.idItemConsumableBonus == 13) {
                if (info.effectOn == 'PREFIX' && (toolInfo.bonuses[0].type || toolInfo.bonuses[1].type)) {
                    return `The "PREFIX" bonuses are already at Max Tier`
                }
                if (info.effectOn == 'SUFFIX' && (toolInfo.bonuses[2].type || toolInfo.bonuses[3].type)) {
                    return `The "SUFFIX" bonuses are already at Max Tier`
                }
                if (info.effectOn == 'IMPLICIT' && toolInfo.bonuses[4].type) {
                    return `The "IMPLICIT" bonus is already at Max Tier`
                }
                return `You need to have at least 1 "${info.effectOn}" bonus to elevate II`;
            } else {
                if (info.effectOn == 'PREFIX' && toolInfo.bonuses[0].type && toolInfo.bonuses[1].type) {
                    return `The "PREFIX" bonuses are already at Max Tier`
                }
                if (info.effectOn == 'SUFFIX' && toolInfo.bonuses[2].type && toolInfo.bonuses[3].type) {
                    return `The "SUFFIX" bonuses are already at Max Tier`
                }
                return `You need to have 2 "${info.effectOn}" bonuses to elevate`;
            }
        }
    }

    return (<>
        <HtmlTooltip className='bonus-consumable-popup'
            title={<>
                <div className='bonus-consumable-detail'>
                    <div className='consumable-header'>
                        <div className='consumable-name'>
                            {info.name}
                        </div>
                        <div className='consumable-type'>
                            {info.type}
                        </div>
                    </div>
                    <div className='consumable-description'>
                        {info.description}
                    </div>
                    <div className='consumable-footer'>
                        <div className='consumable-effect'>
                            {info.effectOn}
                        </div>
                    </div>
                </div>
            </>}
        >
            <div
                className={'bonus-consumable' + (available() === true ? ' available' : '') + ` ${info.type}`}
                onClick={(e) => {
                    const avail = available();
                    console.log('avail', avail);
                    if (avail === true) {
                        cb_onSelectConsumable(info);
                    } else if (avail === false) {
                        cb_onSelectConsumable({ type: 'ERROR', message: message() });
                    }
                }}
            >
                <div className='consumable-type'>
                    {info.type.substr(0, 3)}
                </div>
                <div className='consumable-img'>
                    <img src={info.image} />
                </div>
                <div className='consumable-quantity'>
                    {info.quantity}
                </div>
            </div>
        </HtmlTooltip>
    </>)
}

export default BonusConsumable