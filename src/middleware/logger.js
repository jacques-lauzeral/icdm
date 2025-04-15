// Logging middleware
module.exports = (req, res, next) => {
    const startTime = new Date();
    const requestId = Math.random().toString(36).substring(2, 10);
    
    console.log(`[${startTime.toISOString()}] ${requestId} REQUEST: ${req.method} ${req.url} started`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`[${startTime.toISOString()}] ${requestId} INPUT: ${JSON.stringify(req.body)}`);
    }
    
    // Capture and log the response
    const originalSend = res.send;
    res.send = function(body) {
        const endTime = new Date();
        const duration = endTime - startTime;
        
        // Log the response data if it's not too large
        let logBody = body;
        if (typeof body === 'string' && body.length > 500) {
            // Truncate large responses for logging
            logBody = body.substring(0, 500) + '... [truncated]';
        }
        
        console.log(`[${endTime.toISOString()}] ${requestId} RESPONSE: ${res.statusCode} (${duration}ms)`);
        if (res.statusCode !== 200 && res.statusCode !== 201) {
            console.log(`[${endTime.toISOString()}] ${requestId} OUTPUT: ${logBody}`);
        }
        
        console.log(`[${endTime.toISOString()}] ${requestId} ${req.method} ${req.url} completed (${duration}ms)`);
        return originalSend.call(this, body);
    };
    
    next();
};