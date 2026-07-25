import { fetchEtohLeaderboard } from '../etoh_content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        selected: 0,
        err: [],
        loading: true,
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="board-container">
                    <table class="board">
                        <tr v-for="(ientry, i) in leaderboard" :key="i">
                            <td class="rank">
                                <p class="type-label-lg">#{{ i + 1 }}</p>
                            </td>
                            <td class="total">
                                <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                            </td>
                            <td class="user" :class="{ 'active': selected == i }">
                                <button @click="selected = i">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="player-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }} <img v-if="getFlag(entry.user)" :src="getFlag(entry.user)" class="flag-icon" alt="flag"></h1>
                        <h3>{{ localize(entry.total) }}</h3>
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table class="table">
                            <tr v-for="(score, idx) in entry.verified" :key="'v-' + idx">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link || '#'">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="(score, idx) in entry.completed" :key="'c-' + idx">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link || '#'">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                        <h2 v-if="entry.progressed.length > 0">Progressed ({{entry.progressed.length}})</h2>
                        <table class="table">
                            <tr v-for="(score, idx) in entry.progressed" :key="'p-' + idx">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link || '#'">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="leaderboard-switcher">
                <router-link to="/leaderboard" class="switch-btn">GD Leaderboard</router-link>
                <button class="switch-btn" disabled>Etoh Leaderboard</button>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.leaderboard[this.selected] || {
                user: 'No players yet',
                total: 0,
                verified: [],
                completed: [],
                progressed: [],
            };
        },
    },
    async mounted() {
        try {
            const [leaderboard, err] = await fetchEtohLeaderboard();
            this.leaderboard = Array.isArray(leaderboard) ? leaderboard : [];
            this.err = Array.isArray(err) ? err : [];
            this.selected = 0;
        } catch (e) {
            console.error('Failed to load leaderboard.', e);
            this.leaderboard = [];
            this.err = ['Failed to load leaderboard.'];
            this.selected = 0;
        }
        this.loading = false;
    },
    methods: {
        localize,
        getFlag(name) {
            if (!name) return null;
            const n = String(name).toLowerCase();
            if (n.includes('lilbin') || n.includes('h4llow') || n.includes('malikoonium') || n.includes('goober') || n.includes('loafofbread') || n.includes('loafof') || n.includes('loaf')) {
                return 'https://flagcdn.com/w160/us.png';
            }
            if (n.includes('silly')) {
                return 'https://flagcdn.com/w160/de.png';
            }
            if (n.includes('burnfeh')) {
                return 'https://flagcdn.com/w160/ca.png';
            }
            return null;
        },
    },
};

