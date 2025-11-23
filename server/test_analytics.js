import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

const loginAndFetchAnalytics = async () => {
    try {
        console.log('Checking health...');
        try {
            const healthRes = await axios.get(`${API_URL}/health`);
            console.log('Health Check:', healthRes.data);
        } catch (e) {
            console.error('Health Check Failed:', e.message);
            return;
        }

        // Try to login with default admin credentials
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            email: 'admin@example.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('Logged in, token obtained.');

        const analyticsRes = await axios.get(`${API_URL}/admin/analytics?range=7days`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Analytics Data:', JSON.stringify(analyticsRes.data, null, 2));
    } catch (error) {
        console.error('Full Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
};

loginAndFetchAnalytics();
