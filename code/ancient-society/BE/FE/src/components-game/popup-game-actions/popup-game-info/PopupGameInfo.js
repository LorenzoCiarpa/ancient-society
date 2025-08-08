// import {Button} from '../../../components';
import './popupgameinfo.scss';

import React, { Component } from 'react';

// import imgAncien from '../../../assets-game/ancien.webp';
// import imgWood from '../../../assets-game/wood.webp';
// import imgStone from '../../../assets-game/stone.webp';
import iconInfoNFT from '../../../assets-game/info-icon-nft.png';
import { serverConfig } from '../../../config/serverConfig';

// import imageBuilding from '../../../assets-game/townhall-view.jpg'
// import imageArrow from '../../../assets-game/arrow_forward_black_24dp.svg'

class PopupGameUpgrade extends Component {

    constructor(props) {
        super(props);

        this.state = {
            upgradeResources: {}
        };
    }
    componentDidUpdate() {
        if (JSON.stringify(this.state.upgradeResources) != JSON.stringify(this.props.upgradeResources)) {
            this.setState({ upgradeResources: this.props.upgradeResources })
        }
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.round(seconds % 60);
        return [
            h.toString() + 'h',
            m > 9 ? m.toString() + 'min' : (h ? '0' + m : m || '0').toString() + 'min'
        ].filter(Boolean).join(', ');
    }

    render() {

        return (
            <div className='info'>

                <img src={this.props.image} className='building' />

                <div className='container'>

                    <span className='c3-headline'>General Info:</span>

                    <div className='container-2'>

                        <div className='c2-row'>
                            <p>Drop per hour</p>
                            <span>
                                {this.props.dropQuantity}
                            </span>
                        </div>

                        <hr />

                        <div className='c2-row'>
                            <p>Drop per minute</p>
                            <span>
                                {(this.props.dropQuantity / 60).toString().slice(0, 6)}
                            </span>
                        </div>
                    </div>

                    {
                        !this.state.upgradeResources.upgradeAllowed && this.state.upgradeResources.requirementsArray == null && this.state.upgradeResources.requirements == null && !(this.state.upgradeResources.requirementsArray === undefined) ?
                            <></>
                            : <>
                                <span className='c3-headline'>Upgrade: </span>

                                {this.formatTime(this.props.upgradeTime)}
                                <div className='container-3'>
                                    {this.state.upgradeResources.requirementsArray?.map((inventory, index) => (
                                        <span key={index} /* className={inventory.isAllowed ? 'enough' : 'missing'} */>
                                            <img src={inventory.image} />
                                            <span>{inventory.quantity}</span>
                                        </span>
                                    ))}
                                </div>
                            </>
                    }
                    <div className='container-fee'>
                        {
                            !this.state.upgradeResources.upgradeAllowed && this.state.upgradeResources.requirementsArray == null && this.state.upgradeResources.requirements == null && !(this.state.upgradeResources.requirementsArray === undefined) ?
                                <><a style={{ color: 'gold' }}>The level max reached.</a></>
                                :
                                ""
                        }
                        {serverConfig?.features.fee.productionFee ?
                            <><p><img src={iconInfoNFT} />You will pay a <a>{serverConfig?.features.fee.productionFeeValue * 100 + '%'}</a> fee on your claim.</p></>
                            :
                            ""
                        }
                        <div>
                            {serverConfig?.features.fee.productionFee ? this.state.upgradeResources.requirementsArray?.map((inventory, index) => (inventory?.name == 'ancien' ?
                                <span key={index} /* className={inventory.isAllowed ? 'enough' : 'missing'} */>
                                    <img src={inventory.image} />
                                    <span>{inventory.quantity * serverConfig?.features.fee.productionFeeValue}</span>
                                </span>
                                :
                                ""
                            ))
                                :
                                ""
                            }
                        </div>
                    </div>

                </div>
            </div>
        );
    }
}

function format(x) {
    let newValue = x;

    newValue
        && (newValue = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))

    return newValue
}

export default PopupGameUpgrade;