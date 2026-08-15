import { store } from "../main.js";
import { embed } from "../util.js";
import { fetchEditors, fetchUpcoming } from "../gd_content.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

function getThumbnailUrl(level) {
    if (!level) return null;
    if (level.thumbnail && level.thumbnail.trim() !== "") {
        return level.thumbnail;
    }
    const videoUrl = level.verification || level.showcase;
    if (!videoUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
}

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <div class="list-cards" v-if="list && list.length > 0">
                    <div v-for="(level, i) in list" 
                         :key="i" 
                         class="level-card" 
                         :class="{ 'active': selected == i, 'error': !level }" 
                         @click="selected = i"
                    >
                        <div class="card-rank">
                            #{{ level.rank || i + 1 }}
                        </div>
                        <div class="card-body-wrapper">
                            <div class="card-main-content">
                                <div class="card-thumbnail">
                                    <img v-if="level && getThumb(level)" :src="getThumb(level)" alt="Thumbnail">
                                    <div v-else class="thumb-error">Error</div>
                                </div>
                                <div class="card-info">
                                    <h3 class="card-title">{{ level?.level || 'Error (Missing Name)' }}</h3>
                                    <p class="card-author" v-if="level">by {{ level.creator || 'Unknown' }}</p>
                                    <p class="card-verifier" v-if="level">Verifier: {{ level.player || 'Unknown' }}</p>
                                    <p class="card-points" v-if="level">{{ level.points || 0 }} pts</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-else style="padding: 1rem; text-align: center;">No upcoming levels listed.</p>
            </div>

            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.level }}</h1>
                    <LevelAuthors :author="level.creator || 'Unknown'" :creators="[]" :verifier="level.player || 'Unknown'"></LevelAuthors>
                    <iframe v-if="level.verification || level.showcase" class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ level.points || 0 }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID / Placement</div>
                            <p>{{ level.placement || level.id || 'N/A' }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Password</div>
                            <p>Free to Copy</p>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <p><strong>{{ level.progress || level.percentage || 100 }}%</strong> or better to qualify</p>
                    <table class="records">
                        <tr class="record">
                            <td class="percent">
                                <p>{{ level.progress || level.percentage || 100 }}%</p>
                            </td>
                            <td class="user">
                                <a v-if="level.link" :href="level.link" target="_blank" class="type-label-lg">{{ level.player }}</a>
                                <span v-else class="type-label-lg">{{ level.player }}</span>
                            </td>
                            <td class="mobile"></td>
                            <td class="hz">
                                <p>N/A</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="level" style="height: 100%; justify-content: center; align-items: center;" v-else>
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>

            <div class="meta-container" :class="{ 'meta-hidden': !showMeta }">
                <button class="meta-toggle-btn" @click="showMeta = !showMeta">
                    <span v-if="showMeta">▶</span>
                    <span v-else>◀</span>
                </button>
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <div class="og">
                        <p class="type-label-md">Website layout made by <a href="https://tsl.pages.dev/" target="_blank">TheShittyList</a></p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="'/assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <div class="rules-panel">
                        <h3>Submission Requirements</h3>
                        <div class="rules-content">
                            <p>Achieved the record without using hacks (however, FPS bypass is allowed, up to any fps)</p>
                            <p>Forward from the date of June 12th 2026, we will no longer be accepting records that have no recording and do not follow the requirements.</p>
                            <p>CBF may be utilized for records, but tps bypass is strictly prohibited.</p>
                            <p>If no progress is made on an upcoming level in over 2 weeks, it will be removed from the list (Only applies to levels without significant progress of 70% or more)</p>
                            <p>Unrated / Shitty levels may be added to the list, but only if their original version is not on the list. Submit levels to be added via the Discord.</p>
                            <p>Achieved the record on the level that is listed on the site - please check the level ID before you submit a record</p>
                            <p>Have either source audio or clicks/taps in the video. Edited audio only does not count</p>
                            <p>The recording must have a previous attempt and entire death animation shown before the completion, unless the completion is on the first attempt. Everyplay records are exempt from this</p>
                            <p>The recording must also show the player hit the endwall, or the completion will be invalidated.</p>
                            <p>Do not use secret routes or bug routes</p>
                            <p>Do not use easy modes, only a record of the unmodified level qualifies</p>
                            <p>Once a level falls onto the Legacy List, we accept records for it for 24 hours after it falls off, then afterwards we never accept records for said level</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: 0,
        errors: [],
        roleIconMap,
        store,
        showMeta: true
    }),
    computed: {
        level() {
            return this.list && this.list.length > 0 ? this.list[this.selected] : null;
        },
        video() {
            if (!this.level) return '';
            const videoUrl = this.level.verification || this.level.showcase || '';
            return embed(videoUrl);
        },
    },
    async mounted() {
        this.list = await fetchUpcoming();
        this.editors = await fetchEditors();
        if (!this.list) {
            this.errors = ["Failed to load upcoming list. Retry in a few minutes or notify list staff."];
        } else if (!Array.isArray(this.list)) {
            this.errors = ["Upcoming list data format is invalid."];
            this.list = [];
        } else {
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }
        this.loading = false;
    },
    methods: {
        embed,
        getThumb(level) {
            return getThumbnailUrl(level);
        }
    },
};
