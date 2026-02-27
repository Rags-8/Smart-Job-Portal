// simple test of signup endpoint using node's fetch
(async () => {
    try {
        const res = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'EdgeCase', email: 'edge@example.com', password: '123456', role: 'admin' }),
        });
        const body = await res.json();
        console.log('status', res.status, body);
    } catch (err) {
        console.error('error caught', err);
    }
})();