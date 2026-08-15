import { round, score } from './etoh_score.js';

const dir = '/data/etoh';

function cleanString(value, fallback = '') {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
}

function cleanNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function cleanPercent(value, fallback = 100) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function normalizeRecord(record = {}, level = {}) {
    const percent = cleanPercent(record.percent, 100);
    return {
        ...record,
        user: cleanString(record.user, 'Unknown'),
        percent,
        link: cleanString(record.link, cleanString(level.verification, cleanString(level.showcase, '#'))),
        hz: cleanString(record.hz, 'N/A'),
        mobile: Boolean(record.mobile),
    };
}

function normalizeLevel(level = {}, path = '') {
    const records = Array.isArray(level.records) ? level.records : [];
    const name = cleanString(level.name, cleanString(level.level, path || 'Unknown'));
    const author = cleanString(level.author, cleanString(level.creator, 'Unknown'));
    const verifier = cleanString(level.verifier, cleanString(level.player, 'Unknown'));
    const percentToQualify = cleanNumber(level.percentToQualify, 100);
    return {
        ...level,
        path,
        name,
        author,
        creators: Array.isArray(level.creators) ? level.creators : [],
        verifier,
        percentToQualify,
        verification: cleanString(level.verification, cleanString(level.link, '')),
        showcase: cleanString(level.showcase, ''),
        records: records
            .map((record) => normalizeRecord(record, level))
            .sort((a, b) => b.percent - a.percent),
    };
}

function normalizeUpcomingLevel(level = {}, i = 0) {
    const name = cleanString(level.level, cleanString(level.name, `Upcoming #${i + 1}`));
    const creator = cleanString(level.creator, cleanString(level.author, 'Unknown'));
    const player = cleanString(level.player, cleanString(level.verifier, 'Unknown'));
    const verification = cleanString(level.verification, cleanString(level.link, ''));
    const showcase = cleanString(level.showcase, '');
    return {
        ...level,
        rank: level.rank || i + 1,
        level: name,
        name,
        creator,
        author: creator,
        player,
        verifier: player,
        creators: [],
        points: cleanNumber(level.points, 0),
        progress: level.progress ?? level.percentage ?? 100,
        placement: level.placement || level.id || 'N/A',
        verification,
        showcase,
        link: cleanString(level.link, cleanString(verification, cleanString(showcase, '#'))),
    };
}

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);
    try {
        const list = await listResult.json();
        return await Promise.all(
            list.map(async (path, rank) => {
                const levelResult = await fetch(`${dir}/${path}.json`);
                try {
                    const level = await levelResult.json();
                    return [normalizeLevel(level, path), null];
                } catch {
                    console.error(`Failed to load level #${rank + 1} ${path}.`);
                    return [null, path];
                }
            }),
        );
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`/data/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchUpcoming() {
    try {
        const res = await fetch(`${dir}/upcoming.json`);
        if (!res.ok) return null;
        const upcoming = await res.json();
        if (!Array.isArray(upcoming)) return null;
        return upcoming.map(normalizeUpcomingLevel);
    } catch (e) {
        console.error('Failed to load upcoming list.', e);
        return null;
    }
}

export async function fetchTowerList() {
    try {
        const res = await fetch(`${dir}/towerlist.json`);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error('Failed to load tower list.', e);
        return null;
    }
}

export async function fetchEtohLeaderboard() {
    const list = await fetchList();
    if (!Array.isArray(list)) {
        return [[], ['Failed to load list.']];
    }
    const scoreMap = {};
    const errs = [];
    list.forEach(([level, err], rank) => {
        if (err || !level) {
            errs.push(err || `#${rank + 1}`);
            return;
        }
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        scoreMap[verifier].verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification || level.showcase || '#',
        });
        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;
            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            if (record.percent === 100) {
                scoreMap[user].completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link || '#',
                });
                return;
            }
            scoreMap[user].progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(
                    rank + 1,
                    record.percent,
                    level.percentToQualify,
                ),
                link: record.link || '#',
            });
        });
    });
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);
        return {
            user,
            total: round(total),
            ...scores,
        };
    });
    return [res.sort((a, b) => b.total - a.total), errs];
}
