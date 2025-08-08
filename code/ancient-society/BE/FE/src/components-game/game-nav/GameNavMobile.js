//STYLES
import './gamenavmobile.scss';

import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import iconLock from '../../assets-game/iconLock.svg';
import iconCity from '../../assets-ui/icons/ui-icon-city.webp';
import iconColonyCities from '../../assets-ui/icons/ui-icon-colony-cities.png';
import iconContract from '../../assets-ui/icons/ui-icon-contract.webp';
import iconLandOwner from '../../assets-ui/icons/ui-icon-crown.webp';
import iconDelegateCities
  from '../../assets-ui/icons/ui-icon-delegate-cities.png';
import iconFarmer from '../../assets-ui/icons/ui-icon-farmer.webp';
import iconFish from '../../assets-ui/icons/ui-icon-fish.png';
import iconCraftInventory from '../../assets-ui/icons/ui-icon-inventory.png';
import iconLand from '../../assets-ui/icons/ui-icon-land.webp';
import iconLandInfo from '../../assets-ui/icons/ui-icon-landinfo.webp';
import iconLeaderboard from '../../assets-ui/icons/ui-icon-leaderboard.png';
import iconLogout from '../../assets-ui/icons/ui-icon-logout.png';
import iconMarket from '../../assets-ui/icons/ui-icon-market.webp';
import iconGem from '../../assets-ui/icons/ui-icon-merchant.png';
import iconMiner from '../../assets-ui/icons/ui-icon-miner.webp';
import iconNPC from '../../assets-ui/icons/ui-icon-npc.webp';
import iconScholarship from '../../assets-ui/icons/ui-icon-scholarship.webp';
import iconSettings from '../../assets-ui/icons/ui-icon-settings.png';
import iconInventory from '../../assets-ui/icons/ui-icon-storage.webp';
import iconTicket from '../../assets-ui/icons/ui-icon-ticket.webp';
import iconTicketMarketplace
  from '../../assets-ui/icons/ui-icon-ticketmarket.webp';
import iconUniverse from '../../assets-ui/icons/ui-icon-universe.png';
import iconWorld from '../../assets-ui/icons/ui-icon-world.webp';
import iconClose from '../../assets/close_white_24dp.svg';
import { playSound } from '../../utils/sounds';
import Inventory from '../inventory/Inventory';

class NavbarMobile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      serverConfig: props.serverConfig,

      showMenu: false,
      selectedPage: "city",
      selectedRegion: "city",

      inventory: props.inventory,
      alert: props.alert,

      cityData: {},
      landData: {},
      worldData: {},

      hasHome: false,
      hasOwnLand: false,
      cities: 0,
      colonies: 0,
      hasFisherNFTStake: props.hasFisherNFTStake,
      hasMinerNFTStake: props.hasMinerNFTStake,

      settings: props.settings,

      idDelegate: null,
      delegationData: {},

      idColony: null,
      colonyData: {},

      popupText: false,
      popupHeadline: false,
    };
  }

  componentDidMount() {
    document.body.style.overflow = 'hidden'
  }
  componentWillUnmount() {
    document.body.style.overflow = 'unset'
  }
  componentDidUpdate() {
    // Server Config
    if (this.state.serverConfig != this.props.serverConfig) {
      this.setState({ serverConfig: this.props.serverConfig });
    }

    // current Region Data - city, land, world
    if (this.state.cityData != this.props.cityData) {
      this.setState({ cityData: this.props.cityData });
    }
    if (this.state.landData != this.props.landData) {
      this.setState({ landData: this.props.landData });
    }
    if (this.state.worldData != this.props.worldData) {
      this.setState({ worldData: this.props.worldData });
    }

    // selected Region and Page
    if (this.state.selectedPage != this.props.selectedPage) {
      this.setState({ selectedPage: this.props.selectedPage });
    }
    if (this.state.selectedRegion != this.props.selectedRegion) {
      this.setState({ selectedRegion: this.props.selectedRegion });
    }

    // delegation Data
    if (this.state.idDelegate != this.props.idDelegate) {
      this.setState({ idDelegate: this.props.idDelegate });
    }
    if (this.state.delegationData != this.props.delegationData) {
      this.setState({ delegationData: this.props.delegationData });
    }

    // colony Data
    if (this.state.idColony != this.props.idColony) {
      this.setState({ idColony: this.props.idColony });
    }
    if (this.state.colonyData != this.props.colonyData) {
      this.setState({ colonyData: this.props.colonyData });
    }

    // If the user has delegated cities
    if (this.state.cities != this.props.cities) {
      this.setState({ cities: this.props.cities });
    }

    // If the user has colony cities
    if (this.state.colonies != this.props.colonies) {
      this.setState({ colonies: this.props.colonies });
    }

    // If the User has Land NFTs (land owner!)
    if (this.state.hasOwnLand != this.props.hasOwnLand) {
      this.setState({ hasOwnLand: this.props.hasOwnLand });
    }

    // If the User has Land NFTs (land owner!)
    if (this.state.hasHome != this.props.hasHome) {
      this.setState({ hasHome: this.props.hasHome });
    }

    // If the user has NFTs
    if (this.state.hasFisherNFTStake != this.props.hasFisherNFTStake) {
      this.setState({ hasFisherNFTStake: this.props.hasFisherNFTStake });
    }
    if (this.state.hasMinerNFTStake != this.props.hasMinerNFTStake) {
      this.setState({ hasMinerNFTStake: this.props.hasMinerNFTStake });
    }
    if (this.state.hasFarmerNFTStake != this.props.hasFarmerNFTStake) {
      this.setState({ hasFarmerNFTStake: this.props.hasFarmerNFTStake });
    }

    // profile - inventory
    if (this.state.settings != this.props.settings) {
      this.setState({ settings: this.props.settings });
    }
    if (this.state.inventory != this.props.inventory) {
      this.setState({ inventory: this.props.inventory });
    }
    if (this.state.alert != this.props.alert) {
      this.setState({ alert: this.props.alert });
    }
  }
  setShowMenu_Close = () => {
    this.props.callback_Close(false);
  }

  render() {

    return (
      <div
        className={this.props.showMenu ? 'gamenavmobile' : 'gamenavmobile notVisible'}
      /* style={this.state.idDelegate == null ? {} : { backgroundColor: "rgb(0 40 0)" }} */
      >

        <div className='navbar-head'>
          <h2 className=''>{this.state.settings.cityName}</h2>
          <img src={iconClose} alt={'icon'} onClick={() => this.setShowMenu_Close()} className="menu-icon-close" />
        </div>

        <div className='navbar-inventory'>
          <Inventory inventory={this.props.inventory} settings={this.state.settings} />
        </div>

        <div className='navbar-body'>

          <div className='nav-main'>
            {/* SERVER CONFIG -- LANDS AVAILABILITY */}
            {this.state.serverConfig?.features.lands.available && this.state.idDelegate == null
              // LANDS AVAILABLE 
              ? <>
                <img
                  src={iconUniverse}
                  alt={'icon'}
                  className={"btn-nav" + (this.state.selectedPage == "universe" ? " active" : "")}
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('universe');
                    this.setShowMenu_Close();
                  }}
                />
                {this.state.hasOwnLand && this.state.idColony == null && (
                  <img
                    src={iconLandOwner}
                    alt={'icon'}
                    className={"btn-nav" + (this.state.selectedPage == "lands-owner" ? " active" : "")}
                    onClick={() => {
                      playSound("menuClick");
                      this.props.navbarCallback_showComponent('lands-owner');
                      this.setShowMenu_Close();
                    }}
                  />
                )}
                <img
                  src={iconCity}
                  alt={'icon'}
                  className={'btn-nav'/*  + (this.state.selectedPage == 'city' ? ' active' : '') *//*  + (this.state.idDelegate != null ? ' delegate' : '') */}
                  onClick={() => {
                    playSound('menuClick')
                    this.props.navbarCallback_showComponent('city');
                    this.setShowMenu_Close();
                  }}
                />
                {this.state.hasHome && <>
                  <img
                    src={iconLand}
                    alt={'icon'}
                    className={this.state.selectedPage == 'land' ? 'btn-nav active' : 'btn-nav'}
                    onClick={() => {
                      playSound('menuItemOnClick');
                      this.props.navbarCallback_showComponent('land');
                      this.setShowMenu_Close();
                    }}
                  />
                  <img
                    src={iconWorld}
                    alt={'icon'}
                    className={this.state.selectedPage == 'world' ? 'btn-nav active' : 'btn-nav'}
                    onClick={() => {
                      playSound('menuItemOnClick');
                      this.props.navbarCallback_showComponent('world');
                      this.setShowMenu_Close();
                    }}
                  />
                </>}
              </>

              // LANDS NOT AVAILABLE 
              :
              <img
                src={iconCity}
                alt={'icon'}
                className={'btn-nav'/*  + (this.state.selectedPage == 'city' ? ' active' : '') *//*  + (this.state.idDelegate != null ? ' delegate' : '') */}
                onClick={() => {
                  playSound('menuClick')
                  this.props.navbarCallback_showComponent('city');
                  this.setShowMenu_Close();
                }}
              />
            }
          </div>

          <div className='nav-more'>
            {this.state.selectedRegion == "city" && this.state.cityData.home ? (
              <>
                <div className="btn-nav">
                  <img
                    src={iconInventory}
                    alt={'icon'}
                    className={
                      "btn-nav" +
                      ((this.state.idDelegate != null &&
                        !this.state.delegationData.transfer && !this.state.delegationData.marketplace)
                        ? " disabled"
                        : this.state.selectedPage == "inventory"
                          ? " active"
                          : "") +
                      (this.state.idDelegate != null ? " delegate" : "")
                    }
                    onClick={() => {
                      playSound("menuClick");
                      this.props.callback_getVouchers();
                      this.props.callback_getAmountWithdrawable();
                      this.props.navbarCallback_showComponent('inventory')
                      this.setShowMenu_Close()
                    }}
                  />
                  {this.state.idDelegate != null &&
                    !this.state.delegationData.transfer && !this.state.delegationData.marketplace && (
                      <img
                        src={iconLock}
                        alt={'icon'}
                        className="nav-lock nav-lock-delegation"
                      ></img>
                    )}
                  {(this.state.alert != 0 && this.state.idDelegate == null) && <div className='alert'>{this.state.alert}</div>}
                </div>
                <div className="btn-nav">
                  <img
                    src={iconMarket}
                    alt={'icon'}
                    className={
                      "btn-nav" +
                      ((this.state.idDelegate != null &&
                        !this.state.delegationData.marketplace)
                        ? " disabled"
                        : this.state.selectedPage == "marketplace"
                          ? " active"
                          : "") +
                      (this.state.idDelegate != null ? " delegate" : "")
                    }
                    onClick={() => {
                      playSound("menuClick");
                      this.props.navbarCallback_showComponent('marketplace')
                      this.setShowMenu_Close()
                    }}
                  />
                  {this.state.idDelegate != null &&
                    !this.state.delegationData.marketplace && (
                      <img
                        src={iconLock}
                        alt={'icon'}
                        className="nav-lock nav-lock-delegation"
                      ></img>
                    )}
                </div>

                {this.state.serverConfig?.features.npc ?
                  <div className="btn-nav">
                    <img
                      src={iconNPC}
                      alt={'icon'}
                      className={
                        "btn-nav" +
                        ((this.state.idDelegate != null &&
                          !this.state.delegationData.inventory)
                          ? " disabled"
                          : this.state.selectedPage == "npc"
                            ? " active"
                            : "") +
                        (this.state.idDelegate != null ? " delegate" : "")
                      }
                      onClick={() => {
                        playSound("menuClick");
                        this.props.navbarCallback_showComponent('npc')
                        this.setShowMenu_Close()
                      }}
                    />
                    {this.state.idDelegate != null &&
                      !this.state.delegationData.inventory && (
                        <img
                          src={iconLock}
                          alt={'icon'}
                          className="nav-lock nav-lock-delegation"
                        ></img>
                      )}
                  </div> : null}

                {this.state.serverConfig?.features.gem.available ?
                  <div className="btn-nav">
                    <img
                      src={iconGem}
                      alt={'icon'}
                      className={
                        "btn-nav" +
                        ((this.state.idDelegate != null &&
                          !this.state.delegationData.inventory)
                          ? " disabled"
                          : this.state.selectedPage == "gem"
                            ? " active"
                            : "") +
                        (this.state.idDelegate != null ? " delegate" : "")
                      }
                      onClick={() => {
                        playSound("menuClick");
                        this.props.navbarCallback_showComponent('gem')
                        this.setShowMenu_Close()
                      }}
                    />
                    {this.state.idDelegate != null &&
                      !this.state.delegationData.inventory && (
                        <img
                          src={iconLock}
                          alt={'icon'}
                          className="nav-lock nav-lock-delegation"
                        ></img>
                      )}
                  </div> : null}

                <div className="btn-nav">
                  <img
                    src={iconCraftInventory}
                    alt={'icon'}
                    className={
                      "btn-nav" +
                      (this.state.selectedPage == "craft-inventory"
                        ? " active"
                        : "") +
                      (this.state.idDelegate != null ? " delegate" : "")
                    }
                    onClick={() => {
                      playSound("menuClick");
                      this.props.navbarCallback_showComponent('craft-inventory')
                      this.setShowMenu_Close()
                    }}
                  />
                </div>
              </>
            ) : null}

            {this.state.selectedRegion == "land" && this.state.landData.info && (this.state.landData.info.home == 1 || this.state.landData.info.owned == 1) ? (
              <>
                <img
                  src={iconNPC}
                  alt={'icon'}
                  className={
                    "btn-nav" + (this.state.selectedPage == 'land-npc' ? " active" : "")
                  }
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('land-npc')
                    this.setShowMenu_Close()
                  }}
                />
              </>
            ) : null}

            {/* OTHER-LAND MENU */}
            {this.state.selectedRegion == "land" && this.state.landData.info && !this.state.landData.info.owned ? (
              <>
                <img
                  src={iconTicketMarketplace}
                  alt={'icon'}
                  className={
                    "btn-nav" + (this.state.selectedPage == 'ticket-marketplace' ? " active" : "")
                  }
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('ticket-marketplace')
                    this.setShowMenu_Close()
                  }}
                />
              </>
            ) : null}
            {/* MY-LAND MENU */}
            {this.state.selectedRegion == "land" && this.state.landData.info && this.state.landData.info.owned ? (
              <>
                <img
                  src={iconContract}
                  alt={'icon'}
                  className={
                    "btn-nav" + (this.state.selectedPage == 'contract' ? " active" : "")
                  }
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('contract')
                    this.setShowMenu_Close()
                  }}
                />
                <img
                  src={iconTicket}
                  alt={'icon'}
                  className={
                    "btn-nav" + (this.state.selectedPage == 'ticket' ? " active" : "")
                  }
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('ticket')
                    this.setShowMenu_Close()
                  }}
                />
              </>
            ) : null}

            {this.state.selectedRegion == "land" ? (
              <>
                <img
                  src={iconLandInfo}
                  alt={'icon'}
                  className={
                    "btn-nav" + (this.state.selectedPage == 'land-info' ? " active" : "")
                  }
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('land-info')
                    this.setShowMenu_Close()
                  }}
                />
              </>
            ) : null}

            {/* HOME WORLD MENU */}
            {this.state.selectedRegion == "world" && this.state.worldData.info && this.state.worldData.info.home ? (
              <></>
            ) : null}

            {this.state.selectedRegion == "world" ? (
              <>
                <img
                  src={iconTicket}
                  alt={'icon'}
                  className={
                    "btn-nav" + (this.state.selectedPage == 'all-ticket' ? " active" : "")
                  }
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('all-ticket')
                    this.setShowMenu_Close()
                  }}
                />
              </>
            ) : null}
          </div>

          <div className='nav-hand'>
            {/* SERVER CONFIG -- FISHING AVAILABILITY */}
            {this.state.serverConfig?.features.fishing
              ? <div className="btn-nav">
                <img
                  src={iconFish}
                  alt={'icon'}
                  className={
                    "btn-nav" +
                    (!this.state.hasFisherNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand) ? " disabled" : this.state.selectedPage == "fish" ? " active" : "") +
                    (this.state.idDelegate != null ? " delegate" : "")
                  }
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('fish')
                    this.setShowMenu_Close()
                  }}
                />
                {((this.state.idDelegate != null && !this.state.delegationData.hand) || !this.state.hasFisherNFTStake) && (
                  <img
                    src={iconLock}
                    alt={'icon'}
                    className={"nav-lock" + ((this.state.idDelegate != null && !this.state.delegationData.hand) ? " nav-lock-delegation" : "")}
                  ></img>
                )}
              </div>
              : null}
            {this.state.serverConfig?.features.miner
              ? <div className="btn-nav">
                <img
                  src={iconMiner}
                  alt={'icon'}
                  className={
                    "btn-nav" +
                    (!this.state.hasMinerNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand) ? " disabled" : this.state.selectedPage == "miner" ? " active" : "") +
                    (this.state.idDelegate != null ? " delegate" : "")
                  }
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('miner')
                    this.setShowMenu_Close()
                  }}
                />
                {((this.state.idDelegate != null && !this.state.delegationData.hand) || !this.state.hasMinerNFTStake) && (
                  <img
                    src={iconLock}
                    alt={'icon'}
                    className={"nav-lock" + ((this.state.idDelegate != null && !this.state.delegationData.hand) ? " nav-lock-delegation" : "")}
                  ></img>
                )}
              </div>
              : null}
            {this.state.serverConfig?.features.farmer
              ? <div className="btn-nav">
                <img
                  src={iconFarmer}
                  alt={'icon'}
                  className={
                    "btn-nav" +
                    (!this.state.hasFarmerNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand) ? " disabled" : this.state.selectedPage == "farmer" ? " active" : "") +
                    (this.state.idDelegate != null ? " delegate" : "")
                  }
                  onClick={() => {
                    playSound("menuClick");
                    this.props.navbarCallback_showComponent('farmer')
                    this.setShowMenu_Close()
                  }}
                />
                {((this.state.idDelegate != null && !this.state.delegationData.hand) || !this.state.hasFarmerNFTStake) && (
                  <img
                    src={iconLock}
                    alt={'icon'}
                    className={"nav-lock" + ((this.state.idDelegate != null && !this.state.delegationData.hand) ? " nav-lock-delegation" : "")}
                  ></img>
                )}
              </div>
              : null}
          </div>

          <div className='nav-utils'>
            {this.state.selectedRegion == "city" && this.state.cityData.home ? (
              <>
                {/* SERVER CONFIG -- DELEGATION AVAILABILITY */}
                {this.state.serverConfig?.features.delegation
                  ? this.state.cities != 0 && this.state.idColony == null && (
                    <img
                      src={iconDelegateCities}
                      alt={'icon'}
                      className={
                        "btn-nav" +
                        (this.state.selectedPage == "cities" ? " active" : "") +
                        (this.state.idDelegate != null ? " delegate" : "")
                      }
                      onClick={() => {
                        playSound("menuClick");
                        this.props.navbarCallback_showComponent('cities')
                        this.setShowMenu_Close()
                      }}
                    />
                  ) : null}

                {/* SERVER CONFIG -- COLONY AVAILABILITY */}
                {this.state.serverConfig?.features.colony.available
                  ? this.state.idDelegate == null && (
                    <img
                      src={iconColonyCities}
                      alt={'icon'}
                      className={
                        "btn-nav" +
                        (this.state.selectedPage == "colonies" ? " active" : "") +
                        (this.state.idDelegate != null ? " delegate" : "")
                      }
                      onClick={() => {
                        playSound("menuClick");
                        this.props.navbarCallback_showComponent('colonies')
                        this.setShowMenu_Close()
                      }}
                    />
                  ) : null}

                {this.state.idDelegate == null && (
                  <img
                    src={iconLeaderboard}
                    alt={'icon'}
                    className={
                      "btn-nav" +
                      (this.state.selectedPage == "leaderboard"
                        ? " active"
                        : "")
                    }
                    onClick={() => {
                      playSound("menuClick");
                      this.props.navbarCallback_showComponent('leaderboard');
                      this.setShowMenu_Close();
                    }}
                  />
                )}
                <div className="btn-nav">
                  <img
                    src={iconSettings}
                    alt={'icon'}
                    className={
                      "btn-nav" +
                      ((this.state.idDelegate != null &&
                        !this.state.delegationData.profile)
                        ? " disabled"
                        : this.state.selectedPage == "settings"
                          ? " active"
                          : "") +
                      (this.state.idDelegate != null ? " delegate" : "")
                    }
                    onClick={() => {
                      playSound("menuClick");
                      this.props.navbarCallback_showComponent('settings');
                      this.setShowMenu_Close();
                    }}
                  />
                  {this.state.idDelegate != null &&
                    !this.state.delegationData.profile && (
                      <img
                        src={iconLock}
                        alt={'icon'}
                        className="nav-lock nav-lock-delegation"
                      ></img>
                    )}
                </div>
              </>
            ) : null}

            {/* LOGOUT */}
            {this.state.idDelegate == null && this.state.idColony == null && (
              <img
                src={iconLogout}
                alt={'icon'}
                className={
                  "btn-nav"
                }
                onClick={() => {
                  playSound("logout");
                  this.props.callback_Logout();
                }}
              />
            )}
          </div>

          <div className='nav-scholarship'>
            {/* Scholarship Button */}
            {this.state.idDelegate == null && this.state.idColony == null && <>
              <Link to="/scholarship" className='btn-nav-scholarship'>
                <img
                  src={iconScholarship}
                  alt={'icon'}
                  onClick={() => {
                    playSound("scholarship");
                  }}
                />
              </Link>
            </>}
          </div>
        </div>

      </div>
    )

  }
}

export default NavbarMobile