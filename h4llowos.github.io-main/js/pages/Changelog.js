export default {
    name: 'Changelog',
    template: `
        <main class="page-changelog">
            <div class="changelog-header">
                <h1>Changelog</h1>
            </div>

            <section class="changelog-section">
                <div v-if="groupedEntries.length === 0" class="empty-state">
                    <div class="change-item neutral">
                        <span>No recent changes recorded.</span>
                    </div>
                </div>

                <div class="day-group" v-for="group in groupedEntries" :key="group.date">
                    <button
                        class="day-header collapsible"
                        @click="toggleDate(group.date)"
                        type="button"
                    >
                        <span class="day-label">{{ formatDate(group.date) }}</span>
                        <span class="day-meta">{{ group.entries.length }} change{{ group.entries.length === 1 ? '' : 's' }}</span>
                        <span class="day-toggle">
                            {{ collapsedDates[group.date] ? '+' : '−' }}
                        </span>
                    </button>

                    <ul class="change-list" v-show="!collapsedDates[group.date]">
                        <li
                            class="change-item"
                            :class="getStatusClass(entry.status)"
                            v-for="(entry, index) in group.entries"
                            :key="group.date + '-' + index"
                        >
                            <span v-html="entry.text"></span>
                        </li>
                    </ul>
                </div>
            </section>
        </main>
    `,

    data: () => ({
        changelogEntries: [],
        collapsedDates: {},
    }),

    created() {
        this.changelogEntries = [
            { date: '2026-07-13', text: 'Major Site Update', status: 'neutral' },
            { date: '2026-07-10', text: 'VIOLETWALL added to gd list', status: 'added' },
            { date: '2026-07-10', text: 'The <strong>Upcoming</strong> tab has been updated with the following changes :', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Videos added to all records</strong>', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Congregation</strong> was placed at #1', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Cataclysm</strong> was paused (Reason : Inactivity / Verifier confusion)', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Tuapeka</strong> was removed (Reason : Inactivity)', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Moment</strong> was removed (Reason : Player left)', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Bloodbath</strong> was removed (Reason : Level verified)', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Remlocked</strong> verifier was switched from @stupid fucking loser to @micuck', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Silentium Gradas</strong> was pushed to #2', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Remlocked</strong> was pushed to #3', status: 'neutral' },
            { date: '2026-07-10', text: '<strong>Future Funk II</strong> was pushed to #4', status: 'neutral' },
            { date: '2026-07-10', text: 'Violetwall placed at 2', status: 'neutral' },
            { date: '2026-06-19', text: 'Bloodbath placed at 1', status: 'added' },
        ];
        this.initCollapsedDates();
    },

    computed: {
        groupedEntries() {
            const groups = {};
            this.changelogEntries.forEach((entry) => {
                if (!groups[entry.date]) {
                    groups[entry.date] = [];
                }
                groups[entry.date].push(entry);
            });

            return Object.keys(groups)
                .sort((a, b) => b.localeCompare(a))
                .map((date) => ({ date, entries: groups[date] }));
        },
    },

    methods: {
        initCollapsedDates() {
            this.collapsedDates = {};
            this.groupedEntries.forEach((group) => {
                this.collapsedDates[group.date] = true;
            });
        },

        toggleDate(date) {
            const group = this.groupedEntries.find((entry) => entry.date === date);
            if (!group) {
                return;
            }

            this.collapsedDates[date] = !this.collapsedDates[date];
        },

        formatDate(date) {
            const parsed = new Date(date);
            if (Number.isNaN(parsed.getTime())) {
                return date;
            }
            const month = parsed.getMonth() + 1;
        const day = parsed.getDate();
        const year = parsed.getFullYear();
        return `${month}/${day}/${year}`;
        },

        getStatusClass(status) {
            if (status === 'added' || status === 'up') return 'added';
            if (status === 'removed' || status === 'down') return 'removed';
            return 'neutral';
        },
    },
};
