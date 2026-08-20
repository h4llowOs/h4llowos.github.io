import Home from './pages/Home.js';
import GdList from './pages/GdList.js';
import EtohList from './pages/EtohList.js';
import GdLeaderboard from './pages/GdLeaderboard.js';
import EtohLeaderboard from './pages/EtohLeaderboard.js';
import GdUpcoming from './pages/GdUpcoming.js';
import Changelog from './pages/Changelog.js';

export default [
    { path: '/', component: Home },
    { path: '/gdlist', component: GdList },
    { path: '/gdlist/:level', component: GdList },
    { path: '/etohlist', component: EtohList },
    { path: '/etohlist/:level', component: EtohList },
    { path: '/gdleaderboard', component: GdLeaderboard },
    { path: '/gdleaderboard/:username', component: GdLeaderboard },
    { path: '/etohleaderboard', component: EtohLeaderboard },
    { path: '/etohleaderboard/:username', component: EtohLeaderboard },
    { path: '/gdupcoming', component: GdUpcoming },
    { path: '/changelog', component: Changelog },
];

// i redid routes its waay more organized now and allows for some specialized routing - h4
