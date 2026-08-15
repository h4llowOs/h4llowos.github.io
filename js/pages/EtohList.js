import { embed } from "../util.js";
import { fetchList } from "../etoh_content.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

function getThumbnailUrl(level) {
    if (!level) return null;
    if (level.thumbnail && level.thumbnail.trim() !== "") {
        return level.thumbnail;
    }

    const videoUrl = level.verification || level.showcase;
    if (!videoUrl) return null;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;

    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export default {
    components: {
        Spinner,
        LevelAuthors,
    },

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list full-right">
            <div class="list-container">
                <input class="list-search" v-model="filter" placeholder="Search towers..." aria-label="Search towers">

                <div class="list-cards" v-if="filteredList.length > 0">

                    <div
                        v-for="(level, i) in filteredList"
                        :key="level.path || i"
                        class="level-card"
                        :class="{ active: selected == getOriginalIndex(level) }"
                        @click="selected = getOriginalIndex(level)"
                    >
                        <div class="card-rank">
                            #{{ getRank(level) }}
                        </div>

                        <div class="card-body-wrapper">
                            <h3 class="card-title">{{ level.name }}</h3>

                            <div class="card-main-content">

                                <div class="card-thumbnail">
                                    <img v-if="getThumb(level)" :src="getThumb(level)">
                                    <div v-else class="thumb-error">Error</div>
                                </div>

                                <div class="card-info">
                                    <div class="card-tags" v-if="level.tags && level.tags.length">
                                        <span class="tag-badge" v-for="(tag, tagIndex) in level.tags" :key="tagIndex">
                                            {{ tag }}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div class="level-container">

                <div class="level" v-if="level">

                    <h1>{{ level.name }}</h1>

                    <LevelAuthors
                        :author="level.author"
                        :creators="level.creators"
                        :verifier="level.verifier"
                    ></LevelAuthors>

                    <iframe
                        v-if="level.verification || level.showcase"
                        class="video"
                        :src="video"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>

                    <ul class="stats">

                        <li>
                            <div class="type-title-sm">
                                Placement
                            </div>
                            <p>#{{ selected + 1 }}</p>
                        </li>

                        <li>
                            <div class="type-title-sm">
                                Records
                            </div>
                            <p>{{ level.records.length }}</p>
                        </li>

                        <li>
                            <div class="type-title-sm">
                                Qualify
                            </div>
                            <p>{{ level.percentToQualify }}%</p>
                        </li>

                    </ul>

                    <h2>Records</h2>

                    <table class="records">

                        <tr
                            class="record"
                            v-for="(record, i) in level.records"
                            :key="i"
                        >

                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>

                            <td class="user">
                                <a
                                    v-if="record.link"
                                    :href="record.link"
                                    target="_blank"
                                    class="type-label-lg"
                                >
                                    {{ record.user }}
                                </a>

                                <span v-else class="type-label-lg">
                                    {{ record.user }}
                                </span>
                            </td>

                            <td class="hz">
                                <p>{{ record.hz }}</p>
                            </td>

                        </tr>

                    </table>

                </div>

            </div>

            <div class="meta-container">
                <div class="meta">
                    <div class="rules-panel">
                        <h3>Rules</h3>
                        <div class="rules-content" aria-hidden="true">
                            <strong>1. You must have beaten the tower in its original location, not in a separate game or location.</strong> If the tower is in EToH originally, you must play it in EToH. The only exception is if it was originally in one game but you prefer to play it in another ACCEPTED game for . (Ie. beating an EToH tower in TEA).<br><br>

                            <strong>2. You must have a win message from that tower which can be verified via the discord of the game (Assuming it has a discord)</strong> If the webhook is broken and it doesn’t send the win message, just show the win message that is in the chat.<br><br>

                            <strong>3. Only records from the following games are allowed :</strong><br>
                            “Eternal Towers of Hell (EToH)”<br>
                            “The Eternal Abyss (TEA)”<br>
                            “Another Towers of Stupidity (AToS)”<br>
                            “Calebs Soul Crushing Domain (CSCD)”<br>
                            “Community Top Towers (CTT)”<br>
                            “Soul Crushing Containment Unit (SCCU)”<br>
                            “Azi’s House of Soul Crushing Towers (AHoSCT)”<br>
                            “EToH XL/XXL”<br><br>

                            <strong>4. You may not use any exploits or external programs that influence your game in a manner that would give you an advantage over other players or record holders in any way.</strong> This includes TAS, physics changing cheats, etc.<br><br>

                            <strong>5. Only completions considered to be in the “Soul Crushing” difficulty are allowed.</strong> Some exceptions will be made for towers that are extremely underrated (ie. CoWS).
                        </div>
                    </div>
                </div>
            </div>

        </main>
    `,

    data: () => ({
        list: [],
        selected: 0,
        loading: true,
        filter: '',
    }),

    computed: {
        level() {
            return this.list[this.selected] || null;
        },

        video() {
            if (!this.level) return "";
            const ver = this.level.verification || "";
            const show = this.level.showcase || "";
            const chosen = ver || show || "";
            const embedded = embed(chosen);
            console.debug('[EtohList] video selection', { verification: ver, showcase: show, chosen, embedded });
            return embedded;
        },

        filteredList() {
            const q = (this.filter || '').trim().toLowerCase();
            if (!q) return this.list;
            return this.list.filter((l) => (l.name || '').toLowerCase().startsWith(q));
        },
    },

    async mounted() {
        const result = await fetchList();

        if (Array.isArray(result)) {
            this.list = result
                .filter(([level]) => level)
                .map(([level]) => level);
        }

        this.loading = false;
    },

    methods: {
        getThumb(level) {
            return getThumbnailUrl(level);
        },
        getOriginalIndex(level) {
            return this.list.indexOf(level);
        },
        getRank(level) {
            const idx = this.list.indexOf(level);
            return idx >= 0 ? idx + 1 : '?';
        },
    },
};
