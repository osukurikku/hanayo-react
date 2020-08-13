import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import JavascriptTimeAgo from 'javascript-time-ago'

try {
    const strings = require(`javascript-time-ago/locale/${window.hanayoConf.language}`)
    JavascriptTimeAgo.locale(strings)
} catch(e) {
    JavascriptTimeAgo.locale(require(`javascript-time-ago/locale/en`))
    console.log(e)
}

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>, 
document.getElementById('app'));

