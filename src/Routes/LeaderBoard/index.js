import React from 'react';
import axios from 'axios';
import './index.css';
//import { useParams } from "react-router-dom";

export default class Leaderboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            country11: [],
            country500: [],
            users: [],
            page: 1,
            perPage: 50,
            maxPage: 1,
            mode: 0,
            currentCountry: ""
        }

        this.renderLeaderboard = this.renderLeaderboard.bind(this);
        this.renderPagination = this.renderPagination.bind(this);
    }

    formatNumber(number) {
        return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
    }

    showMessage(status, text) {
        let jQuery = (window.jQuery !== undefined) ? window.jQuery : window.$
        var n = jQuery('<div className="ui ' + status + ' message hidden"><i className="close icon"></i>' + text + "</div>");
        n.find(".close.icon").click(this.closeClosestMessage());
        jQuery("#messages-container").append(n);
        n.slideDown(300)
    }

    async componentDidMount() {
        try {
            let countries = await axios.get("/api/v2/leaderboardCountries");
            let users = await axios.get("/api/v1/leaderboard", {
                params: {
                    p: window.page,
                    l: this.state.perPage,
                    country: window.country,
                    mode: window.favouriteMode
                }
            })
            this.setState({
                country11: countries.data.country11,
                country500: countries.data.country500,
                maxPage: users.data.max_page,
                users: users.data.users,
                loaded: true,
                mode: +window.favouriteMode,
                page: +window.page,
                currentCountry: window.country
            })
        } catch (e) {
            console.log(e);
            this.showMessage("error", "Something happend when we tries to call server. Please, say to our developer that API is down.")
        }
        window.jQuery('.ui.modal').modal({ detachable: false });
    }

    async getNewLeaderboard(p, country, mode) {
        if (!this.state.loaded || p > this.state.maxPage || p <= 0) return;
        this.setState({
            loaded: false
        })
        try {
            let users = await axios.get("/api/v1/leaderboard", {
                params: {
                    p: p,
                    l: this.state.perPage,
                    country: country.toLowerCase(),
                    mode: mode
                }
            })
            this.setState({
                users: users.data.users,
                maxPage: users.data.max_page,
                page: +p,
                loaded: true,
                mode: +mode,
                currentCountry: country.toLowerCase()
            })

            var wl = window.location;
            window.history.replaceState(
                '', document.title,
                wl.pathname + "?mode=" + mode + "&p=" + p +
                (country.toLowerCase() !== "" ? "&country=" + encodeURI(country.toLowerCase()) : "") +
                wl.hash);
        } catch (e) {
            console.log(e);
            this.showMessage("error", "Something happend when we tries to call server. Please, say to our developer that API is down.")
        }
    }

    renderLeaderboard() {
        return (
            this.state.users.map((key, ind) =>
                <div className="user-position" key={ind}>
                    <div className="good">
                        <div className={`columb col-1 center highlight ${[1, 2, 3].indexOf(key.chosen_mode.global_leaderboard_rank) !== -1 ? 'rat-pos' : ''}`}><span>#{key.chosen_mode.global_leaderboard_rank} {(this.state.currentCountry.length > 1 ? <span className="only-epic-color">{`(#${key.chosen_mode.country_leaderboard_rank})`}</span> : null)}</span></div>
                        <div className="columb full-size flexer highlight">
                            <img src={`https://s.kurikku.pw/flags/${key.country}.png`} alt="" />
                            <a href={`/u/${key.id}`}>{key.username}</a>
                        </div>
                        <div className="columb col-2 center highlight peppy-give-me-good-api"><span>{this.formatNumber(key.chosen_mode.pp).replace(".", " ")}pp</span></div>
                    </div>
                    <div className="good2">
                        <div className="columb col-2 center highlight peppy-give-me-good-api"><span>{this.formatNumber(key.chosen_mode.pp).replace(".", " ")}pp</span></div>
                        <div className="columb col-3 center"><span>{key.chosen_mode.accuracy.toFixed(2)}%</span></div>
                        <div className="columb col-4 center"><span>{this.formatNumber(key.chosen_mode.playcount)}</span></div>
                    </div>
                </div>
            )
        )
    }

    renderPagination() {
        return (
            <div className="pagination-by-trash">
                <div className="pagination-prev" onClick={(e) => { this.getNewLeaderboard(this.state.page - 1, this.state.currentCountry, this.state.mode) }}><span></span></div>
                <div className="pagination-items">
                    {
                        [-2, -1, 0, 1, 2].map((key, ind) =>
                            (key === 0) ?
                                <div className="pagination-item active">{this.state.page}</div>
                                : (this.state.page + key < this.state.maxPage && (this.state.page + key) > 0) ?
                                    <div className="pagination-item" key={ind} onClick={(e) => { this.getNewLeaderboard(this.state.page + key, this.state.currentCountry, this.state.mode) }}>{this.state.page + key}</div> : null
                        )
                    }
                    <div className="pagination-item dots"><span></span></div>
                    <div className="pagination-item" onClick={(e) => { this.getNewLeaderboard(this.state.maxPage, this.state.currentCountry, this.state.mode) }}>{this.state.maxPage}</div>
                </div>
                <div className="pagination-next" onClick={(e) => { this.getNewLeaderboard(this.state.page + 1, this.state.currentCountry, this.state.mode) }}><span></span></div>
            </div>
        )
    }

    render() {
        /* eslint-disable */
        return (
            <div className="ui container">
                <div className="ui four item menu" id="mode-menu">
                    {["osu!standard", "Taiko", "Catch the Beat", "osu!mania"].map((key, ind) =>
                        <a className={`${(ind === +this.state.mode) ? 'active ' : ''}item`} onClick={(e) => { this.getNewLeaderboard(1, "", ind) }}>{key}</a>
                    )}
                </div>

                <div className='ui twelve item stackable menu'>
                    {
                        this.state.country11.map((key, ind) =>
                            <a className={`item${(key === this.state.currentCountry) ? ' active' : ''} lb-country`} key={ind} onClick={(e) => { this.getNewLeaderboard(1, key.toUpperCase(), this.state.mode) }}><img src={`https://s.kurikku.pw/flags/${key.toUpperCase()}.png`} className={key + " flag nopad"} /></a>
                        )
                    }
                    <a className="item" onClick={(e) => window.jQuery('.ui.modal').modal('show')}>...</a>
                </div>
                <div className="leader-table">
                    {
                        this.renderPagination()
                    }
                    <div className="table-leader">
                        <div className="table-head">
                            <div className="columb full-size"></div>
                            <div className="columb col-2 highlight">Peppy Points</div>
                            <div className="columb col-3">Accuracy</div>
                            <div className="columb col-4">Play Count</div>
                        </div>
                        <div className="table-body">
                            {(!this.state.loaded ? <div className="ui active dimmer">
                                <div className="ui text loader only-white-color">Loading</div>
                            </div> : this.renderLeaderboard())}
                        </div>
                    </div>
                    {
                        this.renderPagination()
                    }
                </div>
                <div class="ui modal">
                    <div class="content">
                        <div class="ui sixteen stackable column grid">
                            {
                                this.state.country500.map((key, ind) =>
                                    <div className="ui clickable column lb-country simple-flex" key={ind} onClick={(e) => { window.jQuery('.ui.modal').modal('hide'); this.getNewLeaderboard(1, key.toUpperCase(), this.state.mode) }}>
                                        <img className="ui mini image lb-country" src={`https://s.kurikku.pw/flags/${key.toUpperCase()}.png`} alt={`${key.toUpperCase()} flag`} />
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}