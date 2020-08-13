/* eslint-disable react/style-prop-object */
import React from 'react';
//import { useParams } from "react-router-dom";
import axios from 'axios';
import BottomScrollListener from 'react-bottom-scroll-listener';
import './index.css';

export default class MatchesListening extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            matches: [],
            p: 0,
        }
        this.loadMatches()
    }

    loadMatches = async () => {
        try {
            let result = await axios.get("/multi/api/matches", {
                params: {
                    p: this.state.p,
                    l: 20
                }
            })
            if (result.data.length > 1) {
                this.setState({
                    matches: [...this.state.matches, ...result.data],
                    loaded: true,
                    p: this.state.p+1
                })
            }
        } catch (e) {
            this.setState({
                loaded: true
            })
            console.log(e);
        }
    }

    onBottomReachead = () => {
        this.loadMatches()
    }

    render() {
        return (
            (!this.state.loaded ? 
                <div className="ui active dimmer">
                        <div className="ui text loader">Loading</div>
                </div> 
                :
                <div className="ui raised segment">
                    <div className="MatchesListening--wrapper">
                        {
                            (this.state.matches.length < 1) ? <h3 className="sixteen wide column">{window.T("Seems nobody want play multi(") }</h3> 
                            :
                             this.state.matches.map((row, idx) =>
                                <div key={idx} className="MatchesListening--match ui raised segment">
                                    <div className="MatchesListening--match-wrapper">
                                        <div style={{"marginRight": "6px"}}>
                                            <img src={`https://a.kurikku.pw/${row.HostID}`} alt="user avatar" className="avatar"/>
                                        </div>
                                        <div className="MatchesListening--match--title">
                                            <h3>{row.Name}</h3>
                                            <p>hosted by <a href={`/u/${row.HostID}`} className="subtitle">{row.HostUserName}</a></p>
                                        </div>
                                    </div>
                                    <div>
                                        <a href={`/matches/${row.ID}`} rel="noreferrer" className="ui icon button">
                                            <i className="eye icon"/>
                                        </a>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    <BottomScrollListener onBottom={this.onBottomReachead}/>
                </div>
            )
        )
    }
}