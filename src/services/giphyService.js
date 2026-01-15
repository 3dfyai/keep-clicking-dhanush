// Giphy API Service
// Get your free API key at: https://developers.giphy.com/

const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65'; // Demo key - replace with your own for production

// Regular motivational terms for dashboard
const MOTIVATIONAL_TERMS = [
    'keep going',
    'motivation',
    'push forward',
    'never give up',
    'you got this',
    'keep pushing',
    'hustle',
    'grind',
    'success',
    'lets go',
    'winning',
    'champion'
];

// AGGRESSIVE terms for landing screen - intense and hype
const AGGRESSIVE_TERMS = [
    'beast mode',
    'hype',
    'rage',
    'lets go',
    'fire',
    'explosion',
    'intense',
    'power up',
    'crazy',
    'insane',
    'pump up',
    'adrenaline',
    'go hard',
    'turnt up',
    'wild',
    'extreme',
    'fury',
    'unstoppable',
    'workout motivation',
    'gym beast',
    'epic',
    'victory',
    'screaming',
    'yelling yes'
];

let gifCache = [];
let aggressiveCache = [];
let currentTermIndex = 0;
let currentAggressiveIndex = 0;

// Fetch regular GIFs from Giphy API
export async function fetchGifs(limit = 25) {
    const term = MOTIVATIONAL_TERMS[currentTermIndex % MOTIVATIONAL_TERMS.length];
    currentTermIndex++;

    try {
        const response = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(term)}&limit=${limit}&rating=pg`
        );
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            gifCache = data.data.map(gif => ({
                id: gif.id,
                url: gif.images.fixed_height.url,
                smallUrl: gif.images.fixed_height_small.url,
                title: gif.title || term.toUpperCase()
            }));
        }

        return gifCache;
    } catch (error) {
        console.error('Giphy API error:', error);
        return gifCache;
    }
}

// Fetch AGGRESSIVE GIFs for landing screen
export async function fetchAggressiveGifs(limit = 50) {
    const term = AGGRESSIVE_TERMS[currentAggressiveIndex % AGGRESSIVE_TERMS.length];
    currentAggressiveIndex++;

    try {
        const response = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(term)}&limit=${limit}&rating=pg`
        );
        const data = await response.json();

        if (data.data && data.data.length > 0) {
            const newGifs = data.data.map(gif => ({
                id: gif.id,
                url: gif.images.fixed_height.url,
                smallUrl: gif.images.fixed_height_small.url,
                title: gif.title || term.toUpperCase()
            }));
            // Add to cache instead of replacing
            aggressiveCache = [...aggressiveCache, ...newGifs].slice(-100);
        }

        return aggressiveCache;
    } catch (error) {
        console.error('Giphy API error:', error);
        return aggressiveCache;
    }
}

// Get a random AGGRESSIVE GIF for landing screen
export async function getAggressiveGif() {
    if (aggressiveCache.length < 20) {
        await fetchAggressiveGifs();
    }

    if (aggressiveCache.length === 0) {
        // Fallback
        return {
            id: 'fallback',
            url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
            title: 'LETS GO!'
        };
    }

    const randomIndex = Math.floor(Math.random() * aggressiveCache.length);
    return aggressiveCache[randomIndex];
}

// Get a random regular GIF from cache or fetch new ones
export async function getRandomGif() {
    if (gifCache.length === 0) {
        await fetchGifs();
    }

    if (gifCache.length === 0) {
        return {
            id: 'fallback',
            url: 'https://media.giphy.com/media/3o7TKDt0Oy5k8z2zlC/giphy.gif',
            smallUrl: 'https://media.giphy.com/media/3o7TKDt0Oy5k8z2zlC/giphy.gif',
            title: 'KEEP GOING!'
        };
    }

    const randomIndex = Math.floor(Math.random() * gifCache.length);
    return gifCache[randomIndex];
}

// Get multiple unique GIFs for collage
export async function getCollageGifs(count = 12) {
    await fetchGifs(50);
    const shuffled = [...gifCache].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Prefetch regular GIFs on app load
export function prefetchGifs() {
    fetchGifs(50);
}

// Prefetch aggressive GIFs for landing screen
export function prefetchAggressiveGifs() {
    // Fetch from multiple terms for variety
    fetchAggressiveGifs(50);
    setTimeout(() => fetchAggressiveGifs(50), 500);
    setTimeout(() => fetchAggressiveGifs(50), 1000);
}
