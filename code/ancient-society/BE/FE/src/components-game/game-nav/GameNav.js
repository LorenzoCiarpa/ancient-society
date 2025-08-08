//STYLES
import './gamenav.scss';

import React, { Component } from 'react';

import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

//ICONS Actions/Misc
import iconLock from '../../assets-game/iconLock.svg';
import iconCities from '../../assets-ui/icons/ui-icon-cities.webp';
import iconCity from '../../assets-ui/icons/ui-icon-city.webp';
import iconColonyCities from '../../assets-ui/icons/ui-icon-colony-cities.png';
import iconContract from '../../assets-ui/icons/ui-icon-contract.webp';
import iconLandOwner from '../../assets-ui/icons/ui-icon-crown.webp';
import iconDelegateCities
  from '../../assets-ui/icons/ui-icon-delegate-cities.png';
import iconFarmer from '../../assets-ui/icons/ui-icon-farmer.webp';
import iconFish from '../../assets-ui/icons/ui-icon-fish.png';
import iconHand from '../../assets-ui/icons/ui-icon-hand.webp';
import iconCraftInventory from '../../assets-ui/icons/ui-icon-inventory.png';
import iconLand from '../../assets-ui/icons/ui-icon-land.webp';
import iconLandInfo from '../../assets-ui/icons/ui-icon-landinfo.webp';
import iconLeaderboard from '../../assets-ui/icons/ui-icon-leaderboard.png';
import iconLogout from '../../assets-ui/icons/ui-icon-logout.png';
import iconMarket from '../../assets-ui/icons/ui-icon-market.webp';
import iconGem from '../../assets-ui/icons/ui-icon-merchant.png';
import iconRecipe from '../../assets-ui/icons/ui-icon-merchant.png';
import iconMiner from '../../assets-ui/icons/ui-icon-miner.webp';
import iconNPC from '../../assets-ui/icons/ui-icon-npc.webp';
import iconSettings from '../../assets-ui/icons/ui-icon-settings.png';
import iconInventory from '../../assets-ui/icons/ui-icon-storage.webp';
import iconTicket from '../../assets-ui/icons/ui-icon-ticket.webp';
//UI ICONS
import iconTicketMarketplace
  from '../../assets-ui/icons/ui-icon-ticketmarket.webp';
import iconUniverse from '../../assets-ui/icons/ui-icon-universe.png';
import iconWorld from '../../assets-ui/icons/ui-icon-world.webp';
import iconOpen from '../../assets/menu_white_24dp.svg';
import { playSound } from '../../utils/sounds';
import GameNavMobile from './GameNavMobile';

;

const linkDiscord = "https://discord.gg/ancientsociety";

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} placement="right-start" classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "transparent",
    width: "100%",
    margin: "0.5rem 0rem !important",
    padding: "0px",
  },
}));

class GameNav extends Component {
  constructor(props) {
    super(props);

    this.imageTag = React.createRef();

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
      hasFarmerNFTStake: props.hasFarmerNFTStake,

      settings: props.settings,

      idDelegate: null,
      delegationData: {},

      idColony: null,
      colonyData: {},
    };
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

    // If the user has Fisherman&Miner NFT
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

  onRegionMenuClick = (region) => {
    playSound("menuClick");
    this.setState(
      {
        selectedPage: region,
        selectedRegion: region,
      },
      () => this.props.navbarCallback_showComponent(region)
    );
  };

  render() {
    return (
      <>
        <img
          src={iconOpen}
          className="gamenav-icon-open"
          onClick={() => {
            playSound("mobileMenuOpen");
            this.setState({ showMenu: true });
          }}
          alt={'icon'}
        />

        <nav className="game-nav">
          {/* <img
                        src={menuBk}
                        className="nav-bk"
                        style={
                            this.state.idDelegate == null
                                ? (this.state.selectedRegion == "land" ? { filter: "hue-rotate(210deg)" } :
                                    this.state.selectedRegion == 'world' ? { opacity: "0.7", filter: "hue-rotate(210deg)" } : {})
                                : { filter: "hue-rotate(100deg)" }
                        }
                    /> */}

          {/* SERVER CONFIG -- LANDS AVAILABILITY */}
          {this.state.serverConfig?.features.lands.available && this.state.idDelegate == null
            // LANDS AVAILABLE 
            ? <>
              <div className="btn-nav">
                <img
                  src={iconUniverse}
                  className={"btn-nav" + (this.state.selectedPage == "universe" ? " active" : "")}
                  onClick={() => {
                    playSound("menuClick");
                    this.setState({ selectedPage: "universe" }, () =>
                      this.props.navbarCallback_showComponent("universe")
                    );
                  }}
                  alt={'icon'}
                  ref={this.imageTag}
                  onLoad={(e) => {
                    console.log('src changed')
                    console.log('load completed', this.imageTag.current.complete)
                    if (!this.imageTag.current.complete) {
                      return
                    }
                  }}
                />
              </div>
              {this.state.hasOwnLand && this.state.idColony == null && (
                <div className="btn-nav">
                  <img
                    src={iconLandOwner}
                    className={"btn-nav" + (this.state.selectedPage == "lands-owner" ? " active" : "")}
                    onClick={() => {
                      playSound("menuClick");
                      this.setState({ selectedPage: "lands-owner" }, () =>
                        this.props.navbarCallback_showComponent("lands-owner")
                      );
                    }}
                    alt={'icon'}
                  />
                </div>
              )}
              {this.state.hasHome ?
                <HtmlTooltip
                  id="regionNavMenu"
                  className={/* (!this.state.hasHome ? 'disabled' : '') +  */(this.state.selectedRegion == "world" || this.state.selectedRegion == "land" ? " land" : "")}
                  title={
                    <>
                      <MenuItem onClick={() => /* this.state.hasHome &&  */this.onRegionMenuClick("land")}>
                        <img
                          className={
                            "regionNavImg" +
                            ((this.state.selectedRegion == "land" && this.state.landData.info && this.state.landData.info.home) ? " selected" : "")
                          }
                          src={iconLand}
                          alt={'icon'}
                        ></img>
                        <span
                          className={
                            "regionNavLab" +
                            ((this.state.selectedRegion == "land" && this.state.landData.info && this.state.landData.info.home) ? " selected" : "")
                          }
                        >
                          Land
                        </span>
                      </MenuItem>
                      <MenuItem onClick={() => /* this.state.hasHome &&  */this.onRegionMenuClick("world")}>
                        <img
                          className={
                            "regionNavImg" +
                            ((this.state.selectedRegion == "world" && this.state.worldData.info && this.state.worldData.info.home) ? " selected" : "")
                          }
                          src={iconWorld}
                          alt={'icon'}
                        ></img>
                        <span
                          className={
                            "regionNavLab" +
                            ((this.state.selectedRegion == "world" && this.state.worldData.info && this.state.worldData.info.home) ? " selected" : "")
                          }
                        >
                          World
                        </span>
                      </MenuItem>
                    </>
                  }
                >
                  <div className="btn-nav">
                    <img
                      src={iconCity}
                      className="btn-nav" //{(this.state.selectedRegion == 'city' && this.state.cityData.home) ? 'btn-nav active' : 'btn-nav'}
                      onClick={() => {
                        this.onRegionMenuClick("city");
                      }}
                      alt={'icon'}
                    />
                  </div>
                </HtmlTooltip> :
                <div className="btn-nav">
                  <img
                    src={iconCity}
                    className="btn-nav"
                    onClick={() => {
                      this.onRegionMenuClick("city");
                    }}
                    alt={'icon'}
                  />
                </div>
              }
            </>

            // LANDS NOT AVAILABLE 
            : <div className="btn-nav">
              <img
                src={iconCity}
                className="btn-nav"
                onClick={() => {
                  this.onRegionMenuClick("city");
                }}
                alt={'icon'}
              />

            </div>
          }

          {/* HOME CITY MENU */}

          {this.state.selectedRegion == "city" && this.state.cityData.home ? (
            <>
              {/* Delegate | Colony Cities */}
              {((this.state.serverConfig?.features.delegation && this.state.cities != 0) || (this.state.serverConfig?.features.colony.available)) ? <HtmlTooltip
                id="cityMenu"
                className={this.state.idDelegate != null ? "delegate" : ""}
                title={
                  <>
                    <MenuItem
                      className={(this.state.serverConfig?.features.delegation && this.state.cities != 0 && this.state.idColony == null) ? '' : ' disabled'}
                      onClick={() => {
                        playSound("menuClick");
                        this.setState({ selectedPage: "cities" }, () =>
                          this.props.navbarCallback_showComponent("cities")
                        );
                      }}
                    >
                      <img
                        className={"regionNavImg" + (this.state.selectedPage == "cities" ? " selected" : "")}
                        src={iconDelegateCities}
                        alt={'icon'}
                      ></img>
                      <span
                        className={"regionNavLab" + (this.state.selectedPage == "cities" ? " selected" : "")}
                      >
                        Delegate
                      </span>
                    </MenuItem>
                    <MenuItem
                      className={(this.state.serverConfig?.features.colony.available && this.state.idDelegate == null) ? '' : ' disabled'}
                      onClick={() => {
                        playSound("menuClick");
                        this.setState({ selectedPage: "colonies" }, () =>
                          this.props.navbarCallback_showComponent("colonies")
                        );
                      }}
                    >
                      <img
                        className={"regionNavImg" + (this.state.selectedPage == "colonies" ? " selected" : "")}
                        src={iconColonyCities}
                        alt={'icon'}
                      ></img>
                      <span
                        className={"regionNavLab" + (this.state.selectedPage == "colonies" ? " selected" : "")}
                      >
                        Colony
                      </span>
                    </MenuItem>
                  </>
                }
              >
                <div className="btn-nav">
                  <img
                    src={iconCities}
                    alt={'icon'}
                    className={"btn-nav" + (this.state.idDelegate != null ? " delegate" : "")}
                  />
                </div>
              </HtmlTooltip> : null}

              {/* SERVER CONFIG -- DELEGATION AVAILABILITY */}
              {/* {this.state.serverConfig?.features.delegation
                ? this.state.cities != 0 && (
                  <div className="btn-nav">
                    <img
                      src={iconCities}
                      className={
                        "btn-nav" +
                        (this.state.selectedPage == "cities" ? " active" : "") +
                        (this.state.idDelegate != null ? " delegate" : "")
                      }
                      onClick={() => {
                        playSound("menuClick");
                        this.setState({ selectedPage: "cities" }, () =>
                          this.props.navbarCallback_showComponent("cities")
                        );
                      }}
                      alt={'icon'}
                    />
                  </div>
                ) : null} */}

              <div className="btn-nav">
                <img
                  src={iconInventory}
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
                    this.setState({ selectedPage: "inventory" }, () =>
                      this.props.navbarCallback_showComponent("inventory")
                    );
                  }}
                  alt={'icon'}
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
                    this.setState({ selectedPage: "marketplace" }, () =>
                      this.props.navbarCallback_showComponent("marketplace")
                    );
                    // this.marketplacebutton.current.click()
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

              {(this.state.serverConfig?.features.fishing || this.state.serverConfig?.features.miner || this.state.serverConfig?.features.farmer) ? <HtmlTooltip
                id="handMenu"
                className={this.state.idDelegate != null ? "delegate" : ""}
                title={
                  <>
                    <MenuItem
                      onClick={() => {
                        playSound("menuClick");
                        this.setState({ selectedPage: "fish" }, () =>
                          this.props.navbarCallback_showComponent("fish")
                        );
                      }}
                      className={(!this.state.serverConfig?.features.fishing || !this.state.hasFisherNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand)) ? "disabled" : ""}
                    >
                      <img
                        className={"regionNavImg" + (this.state.selectedPage == "fish" ? " selected" : "")/*  + (!this.state.hasFisherNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand) ? " disabled" : "") */}
                        src={iconFish}
                        alt={'icon'}
                      ></img>
                      <span
                        className={"regionNavLab" + (this.state.selectedPage == "fish" ? " selected" : "")/*  + (!this.state.hasFisherNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand) ? " disabled" : "") */}
                      >
                        Fish
                      </span>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        playSound("menuClick");
                        this.setState({ selectedPage: "miner" }, () =>
                          this.props.navbarCallback_showComponent("miner")
                        );
                      }}
                      className={(!this.state.serverConfig?.features.miner || !this.state.hasMinerNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand)) ? "disabled" : ""}
                    >
                      <img
                        className={"regionNavImg" + (this.state.selectedPage == "miner" ? " selected" : "")/*  + (!this.state.hasMinerNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand) ? " disabled" : "") */}
                        src={iconMiner}
                        alt={'icon'}
                      ></img>
                      <span
                        className={"regionNavLab" + (this.state.selectedPage == "miner" ? " selected" : "")/*  + (!this.state.hasMinerNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand) ? " disabled" : "") */}
                      >
                        Mine
                      </span>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        playSound("menuClick");
                        this.setState({ selectedPage: "farmer" }, () =>
                          this.props.navbarCallback_showComponent("farmer")
                        );
                      }}
                      className={(!this.state.serverConfig?.features.farmer || !this.state.hasFarmerNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand)) ? "disabled" : ""}
                    >
                      <img
                        className={"regionNavImg" + (this.state.selectedPage == "farmer" ? " selected" : "")/*  + (!this.state.hasFarmerNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand) ? " disabled" : "") */}
                        src={iconFarmer}
                        alt={'icon'}
                      ></img>
                      <span
                        className={"regionNavLab" + (this.state.selectedPage == "farmer" ? " selected" : "")/*  + (!this.state.hasFarmerNFTStake || (this.state.idDelegate != null && !this.state.delegationData.hand) ? " disabled" : "") */}
                      >
                        Farm
                      </span>
                    </MenuItem>
                  </>
                }
              >
                <div className="btn-nav">
                  <img
                    src={iconHand}
                    alt={'icon'}
                    className={
                      "btn-nav" +
                      ((this.state.idDelegate != null &&
                        !this.state.delegationData.hand)
                        ? " disabled"
                        : "") +
                      (this.state.idDelegate != null ? " delegate" : "")
                    }
                  />
                  {this.state.idDelegate != null &&
                    !this.state.delegationData.hand && (
                      <img
                        src={iconLock}
                        alt={'icon'}
                        className="nav-lock nav-lock-delegation"
                      ></img>
                    )}
                </div>
              </HtmlTooltip> : null}

              {(this.state.serverConfig?.features.npc || this.state.serverConfig?.features.gem.available) ? <HtmlTooltip
                id="inventoryMenu"
                className={this.state.idDelegate != null ? "delegate" : ""}
                title={
                  <>
                    <MenuItem
                      onClick={() => {
                        playSound("menuClick");
                        this.setState({ selectedPage: "npc" }, () =>
                          this.props.navbarCallback_showComponent("npc")
                        );
                      }}
                      className={!this.state.serverConfig?.features.npc ? "disabled" : ""}
                    >
                      <img
                        className={"regionNavImg" + (this.state.selectedPage == "npc" ? " selected" : "")}
                        src={iconNPC}
                        alt={'icon'}
                      ></img>
                      <span
                        className={"regionNavLab" + (this.state.selectedPage == "npc" ? " selected" : "")}
                      >
                        NPC
                      </span>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        playSound("menuClick");
                        this.setState({ selectedPage: "gem" }, () =>
                          this.props.navbarCallback_showComponent("gem")
                        );
                      }}
                      className={!this.state.serverConfig?.features.gem.available ? "disabled" : ""}
                    >
                      <img
                        className={"regionNavImg" + (this.state.selectedPage == "gem" ? " selected" : "") + (!this.state.serverConfig?.features.gem.available ? " disabled" : "")}
                        src={iconGem}
                        alt={'icon'}
                      ></img>
                      <span
                        className={"regionNavLab" + (this.state.selectedPage == "gem" ? " selected" : "") + (!this.state.serverConfig?.features.gem.available ? " disabled" : "")}
                      >
                        Gem
                      </span>
                    </MenuItem>
                  </>
                }
              >
                <div className="btn-nav">
                  <img
                    src={iconRecipe}
                    className={
                      "btn-nav" +
                      ((this.state.idDelegate != null &&
                        !this.state.delegationData.inventory)
                        ? " disabled"
                        : "") +
                      (this.state.idDelegate != null ? " delegate" : "")
                    }
                    alt={'icon'}
                  />
                  {this.state.idDelegate != null &&
                    !this.state.delegationData.inventory && (
                      <img
                        src={iconLock}
                        alt={'icon'}
                        className="nav-lock nav-lock-delegation"
                      ></img>
                    )}
                </div>
              </HtmlTooltip> : null}

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
                    this.setState({ selectedPage: "craft-inventory" }, () =>
                      this.props.navbarCallback_showComponent("craft-inventory")
                    );
                  }}
                />
              </div>
              {this.state.idDelegate == null && (
                <div className="btn-nav">
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
                      this.setState({ selectedPage: "leaderboard" }, () =>
                        this.props.navbarCallback_showComponent("leaderboard")
                      );
                    }}
                  />
                </div>
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
                    this.setState({ selectedPage: "settings" }, () =>
                      this.props.navbarCallback_showComponent("settings")
                    );
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
                  this.setState({ selectedPage: "land-npc" }, () =>
                    this.props.navbarCallback_showComponent("land-npc")
                  );
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
                  this.setState({ selectedPage: "ticket-marketplace" }, () =>
                    this.props.navbarCallback_showComponent("ticket-marketplace")
                  );
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
                  this.setState({ selectedPage: "contract" }, () =>
                    this.props.navbarCallback_showComponent("contract")
                  );
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
                  this.setState({ selectedPage: "ticket" }, () =>
                    this.props.navbarCallback_showComponent("ticket")
                  );
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
                  this.setState({ selectedPage: "land-info" }, () =>
                    this.props.navbarCallback_showComponent("land-info")
                  );
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
                  this.setState({ selectedPage: "all-ticket" }, () =>
                    this.props.navbarCallback_showComponent("all-ticket")
                  );
                }}
              />
            </>
          ) : null}

          {/* LOGOUT */}
          {this.state.idDelegate == null && this.state.idColony == null && this.state.selectedRegion == 'city' && (
            <img
              src={iconLogout}
              alt={'icon'}
              className={
                "btn-nav"
              }
              onClick={() => {
                playSound("menuLogout");
                this.props.callback_Logout();
              }}
            />
          )}
        </nav>

        <GameNavMobile
          serverConfig={this.state.serverConfig}
          hasFisherNFTStake={this.state.hasFisherNFTStake}
          hasMinerNFTStake={this.state.hasMinerNFTStake}
          hasFarmerNFTStake={this.state.hasFarmerNFTStake}
          selectedPage={this.state.selectedPage}
          selectedRegion={this.state.selectedRegion}
          cityData={this.state.cityData}
          cities={this.state.cities}
          landData={this.state.landData}
          worldData={this.state.worldData}
          showMenu={this.state.showMenu}
          inventory={this.state.inventory}
          alert={this.state.alert}
          hasHome={this.state.hasHome}
          hasOwnLand={this.state.hasOwnLand}
          settings={this.state.settings}
          navbarCallback_showComponent={this.props.navbarCallback_showComponent}
          callback_getAmountWithdrawable={this.props.callback_getAmountWithdrawable}
          callback_getVouchers={this.props.callback_getVouchers}
          callback_Logout={() => this.props.callback_Logout()}
          callback_Close={() => {
            playSound("mobileMenuClose");
            this.setState({ showMenu: false });
          }}
          idDelegate={this.state.idDelegate}
          delegationData={this.state.delegationData}

          idColony={this.state.idColony}
          colonyData={this.state.colonyData}
        />
      </>
    );
  }
}

export default GameNav;