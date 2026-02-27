require('dotenv').config();
const supabase = require('./db');

async function testSignup() {
    console.log("Testing Supabase connection and signup flow...");
    try {
        const { data: existing, error: err1 } = await supabase.from('profiles').select('id').eq('email', 'test3@example.com');
        console.log("Existing check result:", { data: existing, error: err1 });

        if (err1) {
            console.error("Error checking existing user:", err1);
            return;
        }

        const email = 'test3@example.com';
        const passwordHash = 'dummyhash';
        const full_name = 'Test User 3';
        const role = 'user';

        console.log("Attempting insert...");
        const { data: user, error: err2 } = await supabase.from('profiles')
            .insert([{ email, password_hash: passwordHash, full_name, role }])
            .select('id, email, full_name, role');

        console.log("Insert result:", { data: user, error: err2 });

        // also test backend API directly with both name and full_name
        const axios = require('axios');
        try {
            const resp1 = await axios.post('http://localhost:5000/api/auth/signup', {
                name: 'ApiTest',
                email: 'apitest@example.com',
                password: '12345',
                role: 'user',
            });
            console.log('API signup with name succeeded', resp1.data);
        } catch (e) {
            console.error('API signup with name failed', e.response?.data || e.message);
        }
        try {
            const resp2 = await axios.post('http://localhost:5000/api/auth/signup', {
                full_name: 'ApiTest2',
                email: 'apitest2@example.com',
                password: '12345',
                role: 'user',
            });
            console.log('API signup with full_name succeeded', resp2.data);
        } catch (e) {
            console.error('API signup with full_name failed', e.response?.data || e.message);
        }

    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

testSignup();
