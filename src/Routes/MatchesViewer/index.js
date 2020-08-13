/* eslint no-unused-vars: 0 */
import React from 'react';
import axios from 'axios';
import './index.css';
import utils from '../../utils';
import Moment from 'react-moment';
import { parseISO } from 'date-fns' 

try {
    require(`moment/locale/${window.hanayoConf.language}`);
} catch (e) {}

export default class MatchesViewer extends React.Component {
    constructor(props) {
        super();
        this.state = {
            match_id: +props.match.params.id,
            match_state: [],
            loaded: false,
            loadingState: "initing the load"
        }
        this.loadState()
    }

    loadState = async () => {
        try {
            let result = await axios.get("/multi/api/games", {
                params: {
                    match_id: this.state.match_id
                }
            })
            let usersInfo = {};
            let beatmapInfo = {};
            this.setState({
                loadingState: 'loading users/beatmaps info'
            })
            for (let game of result.data) {
                if (+game.BeatmapID === 0 || Object.entries(game.Scores).length < 2) continue;
                if (!(game.BeatmapID in beatmapInfo)) {
                    try {
                        let beatmap = await axios.get("https://storage.kurikku.pw/api/b/"+game.BeatmapID);
                        let set = await axios.get("https://storage.kurikku.pw/api/s/"+beatmap.data.ParentSetID);
                        beatmapInfo[game.BeatmapID] = {
                            diff: beatmap.data,
                            set: set.data
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }

                game.beatmap = beatmapInfo[game.BeatmapID]
                for (let [id, _] of Object.entries(game.Scores)) {
                    if (!(id in usersInfo)) {
                        try {
                            let userInfo = await axios.get("/api/v1/users", {
                                params: {
                                    'id': id
                                }
                            })
                            if (userInfo.data.code === 404) {
                                delete game.Scores[id] // user restricted or unknown
                                for (const game1 of result.data) {
                                    delete game1.Scores[id]
                                }
                                continue
                            }
                            usersInfo[id] = userInfo.data
                        } catch (e) {
                            console.log(e);
                        }
                    }

                    game.Scores[id].username = usersInfo[id].username
                    game.Scores[id].country = usersInfo[id].country
                }
                //https://kurikku.pw/api/v1/users/full?id=1000
                let sortable = [];
                for (let [score, _] of Object.entries(game.Scores)) {
                    sortable.push([score, game.Scores[score]]);
                }
                sortable.sort((a, b) => {
                    return parseInt(b[1].Score) - parseInt(a[1].Score);
                });

                game.Scores = []
                sortable.forEach(function(item){
                    item[1].userID = item[0]
                    game.Scores.push(item[1])
                })

            }

            this.setState({
                match_state: result.data,
                loaded: true,
                loadingState: 'loaded'
            })
        } catch (e) {
            this.setState({
                loaded: true
            })
            console.log(e);
        }
    }

    resolverTypes = (type, data) => {
        switch(type) {
            case 'gamemode':
                switch(data) {
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
            case 'gametype':
                switch(data) {
                    case 0:
                        return "Head-to-Head"
                    case 1:
                        return "Tag Coop"
                    case 2:
                        return "Team VS"
                    default:
                        return "Tag Team VS"
                }
            case 'gamecondition':
                switch(data) {
                    case 0:
                        return "Score V1"
                    case 1:
                        return "Accuracy"
                    case 2:
                        return "Combo"
                    default:
                        return 'Score V2'
                }
            case 'gamemodtype': 
                switch(data) {
                    case 0:
                        return 'Selected Mods'
                    default:
                        return 'Free Mods'
                }
            default:
                return null
        }
    }

    render() {
        let fEntry = this.state.match_state.length > 1 ? this.state.match_state[this.state.match_state.length-1] : {}
        return (
            (!this.state.loaded ? 
                <div className="ui active dimmer">
                        <div className="ui text loader">{this.state.loadingState}</div>
                </div> 
                :
                (this.state.match_state.length < 1) ?
                <div className="ui raised segment">
                    <h3 className="sixteen wide column">{window.T("We can't found this match!") }</h3> 
                </div>
                :
                <div className="ui raised segment MatchesViewer--wrapper">
                    <h2 className="sixteen wide column title">{fEntry.Name}</h2>
                    <h4 className="sixteen wide column subtitle">
                        <Moment fromNow={true}>{parseISO(fEntry.CreatedAt)}</Moment>
                    </h4>
                    {
                        this.state.match_state.map((row, idx)=>
                            (+row.BeatmapID === 0 || row.Scores.length < 2) ? null :
                            <div className="ui raised segment MatchesViewer--game" key={"match"+idx}>
                                <div className="MatchesViewer--game--header" style={{
                                    backgroundImage: `url(https://assets.ppy.sh/beatmaps/${row.beatmap.set.SetID}/covers/card@2x.jpg)`
                                }}>
                                    <div className="MatchesViewer--game--header--shadow">
                                        <div className="header--top">
                                            {/* <span>{this.resolverTypes("gamemode", row.GameMode)}</span> */}
                                            <div className={"faa fal fa-extra-mode-" + this.resolverTypes("gamemode", row.GameMode)}/>
                                            <span>{this.resolverTypes("gametype", row.GameType)}</span>
                                            <span>{this.resolverTypes("gamecondition", row.GameScoreCondition)}</span>
                                            <span>{this.resolverTypes("gamemodtype", row.GameModMode)}</span>
                                        </div>
                                        <div className="header--bottom">
                                            <a href={`/s/${row.beatmap.set.SetID}`} className="Beatmap--name">{row.beatmap.set.Artist} - {row.beatmap.set.Title}</a>
                                            <span className="Beatmap--diff">[{row.beatmap.diff.DiffName}]</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="MatchesViewer--game--scores">
                                    {
                                        row.Scores.map((item, idx) =>
                                            (row.GameType === 0) ?
                                            // Head-to-Head
                                            <div className={`MatchesViewer--game--scores-segment ui ${(idx === 0) ? "yellow" : (idx === 1) ? "grey" : (idx === 2) ? "orange" : ""} segment`} key={"score"+item+idx}>
                                                <div className="MatchesViewer--game--scores--left">
                                                    <div className="MatchesViewer--game--scores--container--row">
                                                        <img className="avatar" src={`https://a.kurikku.pw/${item.userID}`} alt="user avatar"/>
                                                        <div className="MatchesViewer--game--scores--container--column">
                                                            <a href={`/u/${item.userID}`} className="MatchViewer--info">{item.username} <span className="mods">{utils.stringlifyMods(item.Mods)}</span> 
                                                            {(item.Failed ? <span className="failed">Failed</span> : null)}</a>
                                                            <img className="MatchViewer--flag" src={`https://s.kurikku.pw/flags/${item.country}.png`} alt="country flag"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="MatchesViewer--game--scores--right">
                                                    <p>score <span className="big">{utils.formatNumber(item.Score)}</span></p>
                                                </div>
                                            </div>
                                            :
                                            (row.GameType === 1) ?
                                            // Tag coop
                                            <div className={`MatchesViewer--game--scores-segment ui grey segment`} key={"score"+item+idx}>
                                                <div className="MatchesViewer--game--scores--left">
                                                    <div className="MatchesViewer--game--scores--container--row">
                                                        <img className="avatar" src={`https://a.kurikku.pw/${item.userID}`} alt="user avatar"/>
                                                        <div className="MatchesViewer--game--scores--container--column">
                                                            <a href={`/u/${item.userID}`} className="MatchViewer--info">{item.username} <span className="mods">{utils.stringlifyMods(item.Mods)}</span> 
                                                            {(item.Failed ? <span className="failed">Failed</span> : null)}</a>
                                                            <img className="MatchViewer--flag" src={`https://s.kurikku.pw/flags/${item.country}.png`} alt="country flag"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="MatchesViewer--game--scores--right">
                                                    <p>score <span className="big">{utils.formatNumber(item.Score)}</span></p>
                                                </div>
                                            </div>
                                            :
                                            (row.GameType === 2 || row.GameType === 3) ?
                                            // Team VS
                                            <div className={`MatchesViewer--game--scores-segment ui ${(item.Team === 1) ? "blue" : (item.Team === 2) ? "red" : "grey"}  segment`} key={"score"+item+idx}>
                                                <div className="MatchesViewer--game--scores--left">
                                                    <div className="MatchesViewer--game--scores--container--row">
                                                        <img className="avatar" src={`https://a.kurikku.pw/${item.userID}`} alt="user avatar"/>
                                                        <div className="MatchesViewer--game--scores--container--column">
                                                            <a href={`/u/${item.userID}`} className="MatchViewer--info">{item.username} <span className="mods">{utils.stringlifyMods(item.Mods)}</span> 
                                                            {(item.Failed ? <span className="failed">Failed</span> : null)}</a>
                                                            <img className="MatchViewer--flag" src={`https://s.kurikku.pw/flags/${item.country}.png`} alt="country flag"/>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="MatchesViewer--game--scores--right">
                                                    <p>score <span className="big">{utils.formatNumber(item.Score)}</span></p>
                                                </div>
                                            </div>
                                            :
                                            null
                                        )
                                    }
                                </div>
                                <div class="ui divider"></div>
                            </div>
                        )
                    }
                </div>
            )
        )
    }
}