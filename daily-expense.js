const https = require('https');
const http = require('http');

// Your Supabase credentials
const SUPABASE_URL = 'https://supabase.com/dashboard/project/vurtgjyhvnaarzfbmznh';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cnRnanlodm5hYXJ6ZmJtem5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODc3MTgsImV4cCI6MjA3MTk2MzcxOH0.LzxFQJ7lPtyICPcJstrUSoay7vf1uxsHP5vxx1EfwWI';

// Extract the actual API URL from the dashboard URL
const API_URL = 'https://vurtgjyhvnaarzfbmznh.supabase.co';

function triggerRecurringExpenses() {
    console.log(`[${new Date().toISOString()}] Starting recurring expenses processing...`);
    
    const postData = JSON.stringify({});
    
    const options = {
        hostname: 'vurtgjyhvnaarzfbmznh.supabase.co',
        port: 443,
        path: '/rest/v1/rpc/manual_trigger_recurring_expenses',
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, (res) => {
        console.log(`[${new Date().toISOString()}] Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`[${new Date().toISOString()}] Response:`, data);
            if (res.statusCode === 200) {
                console.log(`[${new Date().toISOString()}] ✅ Recurring expenses processed successfully!`);
            } else {
                console.log(`[${new Date().toISOString()}] ❌ Error processing recurring expenses`);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`[${new Date().toISOString()}] ❌ Request error:`, e.message);
    });

    req.write(postData);
    req.end();
}

// Function to check if it's time to run (6 AM UTC)
function shouldRunNow() {
    const now = new Date();
    const hour = now.getUTCHours(); // Use UTC for Render
    const minute = now.getUTCMinutes();
    
    // Run at 6:00 AM UTC
    return hour === 6 && minute === 0;
}

// Function to run every minute and check if it's time
function startScheduler() {
    console.log(`[${new Date().toISOString()}] �� Daily expense scheduler started on Render`);
    console.log(`[${new Date().toISOString()}] 📅 Will run daily at 6:00 AM UTC`);
    console.log(`[${new Date().toISOString()}] 🔄 Checking every minute...`);
    
    // Run immediately for testing
    console.log(`[${new Date().toISOString()}] 🧪 Running test execution...`);
    triggerRecurringExpenses();
    
    // Check every minute
    setInterval(() => {
        if (shouldRunNow()) {
            triggerRecurringExpenses();
        }
    }, 60000); // Check every minute
}

// Create a simple HTTP server for Render
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'expense-automation',
            timestamp: new Date().toISOString(),
            message: 'Daily expense automation is running',
            nextRun: '6:00 AM UTC daily'
        }));
    } else if (req.url === '/trigger') {
        // Manual trigger endpoint
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Manual trigger initiated',
            timestamp: new Date().toISOString()
        }));
        triggerRecurringExpenses();
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            error: 'Not found',
            availableEndpoints: ['/health', '/trigger']
        }));
    }
});

// Start the HTTP server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] 🌐 HTTP server started on port ${PORT}`);
    console.log(`[${new Date().toISOString()}] �� Health check: http://localhost:${PORT}/health`);
    console.log(`[${new Date().toISOString()}] 🔗 Manual trigger: http://localhost:${PORT}/trigger`);
});

// Start the scheduler
startScheduler();

// Keep the process running
process.on('SIGINT', () => {
    console.log(`[${new Date().toISOString()}] 👋 Shutting down scheduler...`);
    server.close(() => {
        process.exit(0);
    });
});

console.log(`[${new Date().toISOString()}] 💡 Expense automation is now running on Render!`);
