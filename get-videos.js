async function get() {
    const queries = [
        'ted ron eglash african fractals',
        'm-pesa mobile money kenya',
        'zipline drone rwanda blood delivery',
        'seme city benin intelligence artificielle',
        'startup hub n\'djamena chad'
    ];
    for (const q of queries) {
        const res = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q));
        const text = await res.text();
        const match = text.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (match) {
            console.log(q, match[1]);
        } else {
            console.log(q, 'null');
        }
    }
}
get().catch(console.error);
