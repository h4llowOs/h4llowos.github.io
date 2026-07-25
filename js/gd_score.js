const scale = 3;

const LIST_SIZE = 23;

const MIN_FLOOR = 0.05;
const DIFFICULTY = 2.5; 

export function score(rank, percent, minPercent) {
    if (!LIST_SIZE || LIST_SIZE <= 1) return 0;

    rank = Math.max(1, Math.min(rank, LIST_SIZE));

    const t = (rank - 1) / (LIST_SIZE - 1);

    // curve
    let weight = Math.exp(-DIFFICULTY * t);

    // normalize so top = 1 exactly
    const maxWeight = 1;
    weight = weight / maxWeight;

    // apply floor WITHOUT flattening mid-ranks
    weight = weight * (1 - MIN_FLOOR) + MIN_FLOOR;

    let baseScore = 200 * weight;

    let progress =
        (percent - (minPercent - 1)) /
        (100 - (minPercent - 1));

    progress = Math.max(0, Math.min(progress, 1));

    let score = baseScore * progress;

    if (percent !== 100) {
        score *= 0.7;
    }

    return round(Math.max(score, 0));
}

export function round(num) {
    if (!isFinite(num)) return 0;

    return Math.round(num * 1000) / 1000;
}
