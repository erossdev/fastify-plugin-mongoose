const tap = require("tap");

let fastify;

const FastifyPluginMongoose = require('../index.js');

tap.beforeEach((done) => {
	fastify = require('fastify')();
	done();
});

tap.afterEach(async () => {
	await fastify.close();
});

tap.test('connection', async (test) => {
	test.plan(1);

	await fastify.register(FastifyPluginMongoose, {
		uri: 'mongodb://localhost:27017/fastify-plugin-mongoose',
		settings: {
			config: {
				autoIndex: true,
			},
		},
	});

	try {
		await fastify.ready();
		test.strictEqual(fastify.mongoose.connection.readyState, 1);
		await fastify.close();
	} catch (e) {
		test.fail('error', e);
	}
	fastify.close();
});