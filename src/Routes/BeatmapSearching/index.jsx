import React, {Component} from 'react';
import {DebounceInput} from 'react-debounce-input';
import axios from 'axios';

import './index.scss';

import BottomScrollListener from 'react-bottom-scroll-listener';
import DiffIcons from './DiffIcons';

class BeatmapSearching extends Component {
    constructor(props) {
        super(props);

        this.state = {
            offset: 100,
            count: 22,
            query: "",
            mode: 0,
            loading: true,
            status: 1,
        };

        this.renderDummyData.bind(this);
        this.scrollListener = this.scrollListener.bind(this);
        this.reCallApi = this.reCallApi.bind(this);
        this.queryNew = this.queryNew.bind(this);
        this.renderDummyData = this.renderDummyData.bind(this);
    }

    componentDidMount() {
        this.reCallApi();
    }

    async reCallApi() {
        this.setState({ loading: true })

        let { data: beatmaps } = await axios.get("/storage/api/search", {
            params: {
                offset: this.state.offset,
                amount: this.state.count,
                mode: this.state.mode,
                status: this.state.status,
                query: this.state.query
            }
        })

        this.setState({loading: false, beatmaps})
    }

    getRankStatus(rankst) {
        switch (rankst) {
            case 0:
                return "PENDING";
            case 1 || 2:
                return "RANKED";
            case 3:
                return "APPROVED";
            case 4:
                return "Loved";
            default:
                return "UNKNOWN"
        }
    }

    scrollListener() {
        this.setState({ offset: this.state.offset + 22 })
        
        let { offset, count: amount , mode, status, query } = this.state;

        axios.get("/storage/api/search", {
            params: {offset, amount, mode, status, query }
        }).then((res)=> {
            let bms_new = this.state.beatmaps;

            for (var x = 0; x < res.data.length; x++) {
                bms_new.push(res.data[x])
            }
            
            this.setState({beatmaps: bms_new})
        })
    };

    switchMode(mode) {
        this.setState({ mode, offset: 0 }, () => this.reCallApi());
    }

    switchRank(status) {
        this.setState({ status, offset: 0}, () => this.reCallApi());
    }

    queryNew(evt) {
        console.log(evt)
        const query = evt.target.value;
        this.setState({ query, offset: 0 }, () => this.reCallApi());
    }

    resolveUrl(row) {
        console.log('click')
        if (row.ChildrenBeatmaps === null) return `https://kurikku.pw/s/${row.SetID}`;
        window.location.href = `https://kurikku.pw/b/${row.ChildrenBeatmaps[row.ChildrenBeatmaps.length - 1].BeatmapID}`;
    }

    calcPlaycount(beatmaps) {
        return beatmaps.reduce((a, b) => a + b.Playcount, 0)
    }

    getBeatmapsData() {
        return this.state.beatmaps.map((row, i) => (
            <div className="eight wide column" key={row.SetID} onClick={() => this.resolveUrl(row)}>
                <div className="map">
                    <div className="map-header">
                        <img 
                            src={`https://assets.ppy.sh/beatmaps/${row.SetID}/covers/card.jpg`}
                            alt=""
                        />
                        <div className="map-header__shadow"></div>
                        <div className="map-header__status">{this.getRankStatus(row.RankedStatus)}</div>
                        <div className="map-header__name">{row.Title.substring(0, 35)}</div>
                        {/* <div className="map-additional-information">
                            <div className="map-additional-information__row">
                                <i class="map-additional-information__icon heart icon"/>
                                <span className="map-additional-information__value">{row.Favourites}</span>
                            </div>
                            <div className="map-additional-information__row">
                                <i class="map-additional-information__icon play circle icon"/>
                                <span className="map-additional-information__value">{this.calcPlaycount(row.ChildrenBeatmaps)}</span>
                            </div>
                        </div> */}
                        <div className="map-header__artist">{row.Artist.substring(0, 35)}</div>
                    </div>
                    
                    <div className="map__creator">by {row.Creator}</div>
                    <a 
                        title="Download beatmap"
                        href={"https://storage.kurikku.pw/d/" + row.SetID}
                        className="download"
                    >
                        <i className="download disk icon"/>
                    </a>
                    {<DiffIcons childrenBeatmaps={row.ChildrenBeatmaps} />}
                </div>
            </div>
        ))
    }

    renderDummyData() {
        return (
            <div className="ui stackable two grid" onScrollCapture={this.scrollListener}>
                {this.getBeatmapsData()}
                <BottomScrollListener onBottom={this.scrollListener}/>
            </div>
        )
    };

    render() {
        return (
            <div>
                <div className="ui segment">
                    <div className="ui one column stackable center aligned page grid">
                        <div className="column twelve wide">
                            <center><h1 className="header">
                                Beatmaps
                            </h1></center>
                            <br/>
                            <div class="ui input" style={{width: "100%"}}>
                                <DebounceInput
                                    minLength={0}
                                    className="search-input"
                                    placeholder="Search"
                                    debounceTimeout={350}
                                    onChange={this.queryNew} 
                                />
                            </div>
                            <div className="ui segment wow-links">
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <span 
                                    onClick={this.switchMode.bind(this, -1)}
                                    className={(this.state.mode === -1 ? "clicked" : "")}
                                >Any</span>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <span 
                                    onClick={this.switchMode.bind(this, 0)}
                                    className={(this.state.mode === 0 ? "clicked" : "")}
                                >osu!std</span>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <span 
                                    onClick={this.switchMode.bind(this, 1)}
                                    className={(this.state.mode === 1 ? "clicked" : "")}
                                >osu!taiko</span>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <span 
                                    onClick={this.switchMode.bind(this, 2)}
                                    className={(this.state.mode === 2 ? "clicked" : "")}
                                >osu!catch</span>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <span 
                                    onClick={this.switchMode.bind(this, 3)}
                                    className={(this.state.mode === 3 ? "clicked" : "")}
                                >osu!mania</span>
                            </div>
                            <div className="ui segment wow-links">
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <span 
                                    onClick={this.switchRank.bind(this, -3)}
                                    className={(this.state.status === -3 ? "clicked" : "")} 
                                >Any</span>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <span 
                                    onClick={this.switchRank.bind(this, -1)}
                                    className={(this.state.status === 1 ? "clicked" : "")} 
                                >Ranked</span>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <span 
                                    onClick={this.switchRank.bind(this, 3)}
                                    className={(this.state.status === 3 ? "clicked" : "")} 
                                >Qualified</span>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <span 
                                    onClick={this.switchRank.bind(this, 4)}
                                    className={(this.state.status === 4 ? "clicked" : "")} 
                                >Loved</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bodySearching">
                    {(this.state.loading 
                        ? (
                        <div className="ui active dimmer">
                            <div className="ui text loader">Loading</div>
                        </div> 
                        ) 
                        : this.renderDummyData())
                    }
                </div>
            </div>
        );
    }
}

export default BeatmapSearching;


