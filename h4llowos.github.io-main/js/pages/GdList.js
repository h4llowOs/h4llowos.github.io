import { embed } from "../util.js";
import { fetchList } from "../gd_content.js";
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
                <input class="list-search" v-model="filter" placeholder="Search levels..." aria-label="Search levels">

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

                <p v-else style="padding: 1rem; text-align: center;">
                    No levels listed.
                </p>
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

                            <p>
                                #{{ selected + 1 }}
                            </p>
                        </li>


                        <li>
                            <div class="type-title-sm">
                                Records
                            </div>

                            <p>
                                {{ level.records.length }}
                            </p>
                        </li>


                        <li>
                            <div class="type-title-sm">
                                Qualify
                            </div>

                            <p>
                                {{ level.percentToQualify }}%
                            </p>
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


                <div
                    class="level"
                    style="height:100%;justify-content:center;align-items:center;"
                    v-else
                >
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>

            </div>

            <div class="meta-container">
                <div class="meta">
                    <div class="rules-panel">
                        <h3>Rules</h3>
                        <div class="rules-content" aria-hidden="true">
                            <strong>1. No hacks or cheats that affect the legitimacy of your record in any way.</strong> This includes but is not limited to noclip hacks, hitboxes, speedhack, macros, hitbox multiplier, and uncapped tps. Records using these hacks will be immediately denied and the user who submitted them will be suspended from the list indefinitely.<br><br>

                            <strong>2. Video proof is MANDATORY*.</strong> Video proof must include : Cheat indicator, Cps, Endscreen, Audio (Input and output) including clicks, and the attempt before. Videos must be uploaded to YouTube (they may be unlisted, just accessible.)<br><br>

                            <strong>*</strong> In the case of a completion being done without video proof, it will be accepted IF a list editor is in the call when completed and you can provide secondary proof (ie. completing a run on the level on stream.).<br><br>

                            <strong>3. Level must be completed on its original copy.</strong> “Startpos” copies or “LDM” copies will be considered illegitimate and denied. External copies can easily be nerfed (even by pixels) without people noticing, external copies do not show stats on the endscreen, and oftentimes “LDM copies” nerf levels with an emphasis on decoration based difficulty by simplifying the levels' decoration.<br><br>

                            <strong>4. Clicksound mods are not allowed under any circumstances.</strong> Clicksound mods such as “Click sounds full” or “ZCB Live” are not allowed, as they can be used to imitate real clicks while running a macro in the background or obscure. Use of them in a completion will be considered cheating.
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
            console.debug('[GdList] video selection', { verification: ver, showcase: show, chosen, embedded });
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
