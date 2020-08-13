import React from 'react';
import { Switch, Route } from 'react-router-dom'

import BeatmapSearching from './Routes/BeatmapSearching';
import Leaderboard from './Routes/LeaderBoard';
//import BeatmapListening from './Routes/BeatmapListening'
import Shop from './Routes/Shop';
import StreamerListening from './Routes/StreamerListening';
import MatchesListening from './Routes/MatchesListening';
import MatchesViewer from './Routes/MatchesViewer';

export default class App extends React.Component {
    // eslint-disable-next-line no-useless-constructor
    constructor(props) {
        super(props);
    }

    render() {
        return (
            
            <Switch>
                {/* Beatmap Paths 
                    <Route path="/s/:sid" component={BeatmapListening}/>
                */ }

                <div className="ui container">
                    <Route path="/shop" component={Shop}/>
                    <Route path="/beatmaps" component={BeatmapSearching}/>
                    <Route path="/leaderboard" component={Leaderboard}/>
                    <Route path="/streamers" component={StreamerListening}/>
                    <Route exact path="/matches" component={MatchesListening}/>
                    <Route path="/matches/:id" component={MatchesViewer}/>
                </div>
            </Switch>
            
        )   
    }
}