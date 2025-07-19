export async function onRequest(context) {
    // 간단한 더미 고득점
    return new Response(JSON.stringify({ highscore: 100 }), {
        headers: { 'Content-Type': 'application/json' },
    });
}