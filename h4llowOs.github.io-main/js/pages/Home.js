export default {
    name: 'Home',
    template: `
        <div class="home-container">
            <section class="hero-section">
                <h1 class="hero-title">The nchgng Demon List</h1>
                <div class="hero-actions">
                    <router-link to="/gdlist" class="home-btn">Explore List</router-link>
                    <router-link to="/etohlist" class="home-btn">Explore Towerlist</router-link>
                    <router-link to="/gdleaderboard" class="home-btn">View Leaderboards</router-link>
                </div>
            </section>

            <section class="features-grid">
                <div class="feature-item">
                    <h3>Demon Rankings</h3>
                    <p style="color: #888d96; font-size: 0.9rem; margin: 0; line-height: 1.4;">Level placements based on the AREDL and GDDL.</p>
                </div>
                <div class="feature-item">
                    <h3>Leaderboard</h3>
                    <p style="color: #888d96; font-size: 0.9rem; margin: 0; line-height: 1.4;">Ranking the most Nch players.</p>
                </div>
                <div class="feature-item">
                    <h3>Upcoming Progress</h3>
                    <p style="color: #888d96; font-size: 0.9rem; margin: 0; line-height: 1.4;">Upcoming top levels that are soon to be verified.</p>
                </div>
            </section>
        </div>
    `
};
