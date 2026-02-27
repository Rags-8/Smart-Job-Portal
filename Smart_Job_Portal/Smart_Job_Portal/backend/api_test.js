async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'john0.7371381972642527@test.com', // use the one just created
                password: 'password123'
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        console.log("SUCCESS:", data);
    } catch (err) {
        console.log("FAIL:", err.message);
    }
}
test();
