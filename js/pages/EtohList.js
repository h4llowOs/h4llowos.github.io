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
                <div class="list-cards" v-if="list.length > 0">

                    <div
                        v-for="(level, i) in list"
                        :key="i"
                        class="level-card"
                        :class="{ active: selected == i }"
                        @click="selected = i"
                    >
                        <div class="card-rank">
                            #{{ i + 1 }}
                        </div>

                        <div class="card-body-wrapper">
                            <div class="card-main-content">

                                <div class="card-thumbnail">
                                    <img v-if="getThumb(level)" :src="getThumb(level)">
                                    <div v-else class="thumb-error">Error</div>
                                </div>

                                <div class="card-info">
                                    <h3 class="card-title">{{ level.name }}</h3>
                                    <p class="card-author">
                                        by {{ level.author }}
                                    </p>
                                    <p class="card-verifier">
                                        Verifier: {{ level.verifier }}
                                    </p>
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

        </main>
    `,

    data: () => ({
        list: [],
        selected: 0,
        loading: true,
    }),

    computed: {
        level() {
            return this.list[this.selected] || null;
        },

        video() {
            if (!this.level) return "";
            return embed(this.level.verification || this.level.showcase || "");
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
    },
};
