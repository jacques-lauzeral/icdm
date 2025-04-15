// Error handling middleware
module.exports = (err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${req.method} ${req.url} - ${err.message}`);
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
};