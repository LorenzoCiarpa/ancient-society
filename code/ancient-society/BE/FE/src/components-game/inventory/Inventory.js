import './inventory.scss';

import React, { Component } from 'react';

import imageAncient from '../../assets-game/ancien.webp';
import imageStone from '../../assets-game/stone.webp';
import imageWood from '../../assets-game/wood.webp';
import {
  format,
  toFixed,
} from '../../utils/utils';

class Inventory extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
            settings: props.settings,
            inventory: props.inventory
        }

        this.random = Math.floor(Date.now())
    }

    componentDidUpdate() {
        if (this.state.settings != this.props.settings){
            this.setState({settings: this.props.settings}, () => {
                this.random = Math.floor(Date.now())
            })
        }
        if (this.state.inventory != this.props.inventory){
            this.setState({inventory: this.props.inventory})
        }
    }

    render(){

        return (

            <div className='inventory' onClick={this.props.onClick}>
                
                <div className='profile-img-container'>
                    <img src={`${this.state.settings.profileImage}?${this.random}`} alt={'img'} className='profile'/>
                </div>

                <div className='resources'>
                    <span className='resource ancien'>
                        <img src={imageAncient}/>
                        <p>{ format( toFixed(this.state.inventory.ancien, 0) ) }</p>
                    </span>
                    <span className='resource wood'>
                        <img src={imageWood}/>
                        <p>{ format( toFixed(this.state.inventory.wood, 0) ) }</p>
                    </span>
                    <span className='resource stone'>
                        <img src={imageStone}/>
                        <p>{ format( toFixed(this.state.inventory.stone, 0) ) }</p>
                    </span>
                </div>

            </div>

        )
    
    }

}

export default Inventory   