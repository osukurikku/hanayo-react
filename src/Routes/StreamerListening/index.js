import React from 'react';
//import { useParams } from "react-router-dom";
import axios from 'axios';
import './index.css';

export default class StreamerListening extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            streamers: []
        }
        this.loadStreamers()
    }

    loadStreamers = async () => {
        try {
            let result = await axios.get("/api/v2/streamers.get")
            this.setState({
                streamers: result.data.data,
                loaded: true
            })
        } catch (e) {
            this.setState({
                loaded: true
            })
            console.log(e);
        }
    }

    render() {
        return (
            (!this.state.loaded ? 
                <div className="ui active dimmer">
                        <div className="ui text loader">Loading</div>
                </div> 
                :
                <div className="ui raised segment">
                    <div className="ui stackable grid">
                        {
                            (this.state.streamers.length < 1) ? <h3 className="sixteen wide column">{window.T("Seems nobody streaming, maybe you will be first?") }</h3> 
                            :
                            this.state.streamers.map((row, i) =>
                                <div className="four wide column">
                                    <div className="ui card">
                                        <div className="content">
                                            <img className="ui avatar image" src={`https://a.kurikku.pw/${row.user_id}`} alt="user avatar" /> <a href={`https://kurikku.pw/u/${row.user_id}`}>{row.streamer_name}</a>
                                        </div>
                                        <div className="image">
                                            <img src={`https://static-cdn.jtvnw.net/previews-ttv/live_user_${row.streamer_name}-480x270.jpg`} alt="twitch stream preview" />
                                         </div>
                                        <div className="content">
                                            <a href={`https://twitch.tv/${row.streamer_name}`}>
                                                <h3>{row.title}</h3>
                                            </a>
                                        </div>
                                        <div className="extra content">
                                            <span class="subtitle">{row.viewer_count}</span> {window.T("viewers")}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            )
        )
    }
}