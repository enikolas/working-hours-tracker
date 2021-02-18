const logger = require('./logger');

module.exports = (app, compiler) => {
	// dynamic
	app.get('/times', (req, res) => {
		const values = { a: 1 };
		res.json(values);
	});
	app.post('/times', (req, res) => {
		logger.info('server received:', req.body);
		res.json({ success: true });
	});
};
