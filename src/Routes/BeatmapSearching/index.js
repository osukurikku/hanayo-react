import React, {Component} from 'react';
import {DebounceInput} from 'react-debounce-input';
import axios from 'axios';

import './index.css';

import BottomScrollListener from 'react-bottom-scroll-listener';

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
        axios.get("/storage/api/search", {
            params: {
                offset: this.state.offset,
                amount: this.state.count,
                mode: this.state.mode,
                status: this.state.status,
                query: this.state.query
            }
        }).then((res)=> {
            this.setState({loading: false, beatmaps: res.data})
        })
    }

    reCallApi() {
        if (this.state.loading) return; 
        this.setState({loading: true})
        axios.get("/storage/api/search", {
            params: {
                offset: this.state.offset,
                amount: this.state.count,
                mode: this.state.mode,
                status: this.state.status,
                query: this.state.query
            }
        }).then((res)=> {
            this.setState({loading: false, beatmaps: res.data})
        })
    }

    getDiffColor(rating) {
        if (rating <= 1.5) {
            return "#8AAE17"
        } else if (rating > 1.5 && rating <= 2.25) {
            return "#9AD4DF"
        } else if (rating > 2.25 && rating <= 3.75) {
            return "#DEB32A"
        } else if (rating > 3.75 && rating <= 5.25) {
            return "#EB69A4"
        } else if (rating > 5.25 && rating <= 6.75) {
            return "#7264B5"
        } else {
            return "#050505"
        }
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

    getGameMode(mode) {
        switch (mode) {
            case 0:
                return "osu"
            case 1:
                return "taiko"
            case 2:
                return "fruits"
            case 3:
                return "mania"
            default:
                return "osu"
        }
    }

    scrollListener() {
        this.setState({
            offset: this.state.offset + 22
        })
        axios.get("/storage/api/search", {
            params: {
                offset: this.state.offset,
                amount: this.state.count,
                mode: this.state.mode,
                status: this.state.status,
                query: this.state.query
            }
        }).then((res)=> {
            var bms_new = this.state.beatmaps
            for (var x = 0; x < res.data.length; x++) {
                bms_new.push(res.data[x])
            }
            this.setState({beatmaps: bms_new})
        })
    };

    switchMode(event) {
        const mode = Number(event.target.dataset.modeosu);
        this.setState({
            mode: mode,
            offset: 0
        }, () => {
            this.reCallApi();
        });
    }

    switchRank(event) {
        const status = Number(event.target.dataset.rankstatus);
        this.setState({
            status: status,
            offset: 0
        }, () => {
            this.reCallApi();
        });
    }

    queryNew(event) {
        const query = event.target.value;
        this.setState({
            query: query,
            offset: 0
        }, () => {
            this.reCallApi();
        })
    }

    resolveUrl(row) {
        if (row.ChildrenBeatmaps === null) {
            return `https://kurikku.pw/s/${row.SetID}`
        }

        return `https://kurikku.pw/b/${row.ChildrenBeatmaps[row.ChildrenBeatmaps.length - 1].BeatmapID}`
    }

    renderDummyData() {
        let data = this.state.beatmaps.map((row, i) => {
            
            let diffs = (row.ChildrenBeatmaps !== null) ? row.ChildrenBeatmaps.map((row, i) => {
                return (
                    <div key={row.BeatmapID} className="diff2">
                        <div className={"faa fal fa-extra-mode-" + this.getGameMode(row.Mode)}
                             style={{color: this.getDiffColor(row.DifficultyRating)}}/>
                    </div>
                )
            }) : null
            return (
                <div className="eight wide column" key={row.SetID}>
                    <div className="map">
                        <div className="map-header">
                            <a href={this.resolveUrl(row)}><img
                                src={"https://assets.ppy.sh/beatmaps/" + row.SetID + "/covers/card.jpg"}
                                alt=""/></a>
                        </div>
                        <div className="status">{this.getRankStatus(row.RankedStatus)}</div>
                        <div className="name">{row.Title.substring(0, 35)}</div>
                        <div className="artist">{row.Artist.substring(0, 35)}</div>
                        <div className="creator">by {row.Creator}</div>
                        <a title="Download beatmap"
                           href={"https://storage.kurikku.pw/d/" + row.SetID}
                           className="download"><i
                            className="download disk icon"/></a>
                        <div id="alldiff">
                            {diffs}
                        </div>
                    </div>
                </div>
            )
        })
        return (
            <div className="ui stackable two grid" onScrollCapture={this.scrollListener}>
                {data}
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
                                    debounceTimeout={350}
                                    onChange={this.queryNew} />
                            </div>
                            <div className="ui segment wow-links">
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={this.switchMode.bind(this)} data-modeosu="-1"
                                   className={(this.state.mode === -1 ? "clicked" : "")} href="#">Any</a>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={this.switchMode.bind(this)} data-modeosu="0"
                                   className={(this.state.mode === 0 ? "clicked" : "")} href="#">osu!std</a>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={this.switchMode.bind(this)} data-modeosu="1"
                                   className={(this.state.mode === 1 ? "clicked" : "")} href="#">osu!taiko</a>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={this.switchMode.bind(this)} data-modeosu="2"
                                   className={(this.state.mode === 2 ? "clicked" : "")} href="#">osu!catch</a>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={this.switchMode.bind(this)} data-modeosu="3"
                                   className={(this.state.mode === 3 ? "clicked" : "")} href="#">osu!mania</a>
                            </div>
                            <div className="ui segment wow-links">
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={this.switchRank.bind(this)}
                                   className={(this.state.status === -3 ? "clicked" : "")} data-rankstatus="-3"
                                   href="#">Any</a>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={this.switchRank.bind(this)}
                                   className={(this.state.status === 1 ? "clicked" : "")} data-rankstatus="1"
                                   href="#">Ranked</a>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={this.switchRank.bind(this)}
                                   className={(this.state.status === 3 ? "clicked" : "")} data-rankstatus="3"
                                   href="#">Qualified</a>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={this.switchRank.bind(this)}
                                   className={(this.state.status === 4 ? "clicked" : "")} data-rankstatus="4"
                                   href="#">Loved</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bodySearching">
                    {(this.state.loading ? <div className="ui active dimmer">
                        <div className="ui text loader">Loading</div>
                    </div> : this.renderDummyData())}
                </div>
            </div>
        );
    }
}

export default BeatmapSearching;


