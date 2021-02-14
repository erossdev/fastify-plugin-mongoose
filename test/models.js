const tap = require('tap');
const path = require('path');

let fastify;

const FastifyPluginMongoose = require('../index.js');

tap.beforeEach((done) => {
	fastify = require('fastify')();
	done();
});

tap.afterEach(async () => {
	await fastify.close();
});

tap.test('models should load', async (test) => {
	test.plan(1);

	await fastify.register(FastifyPluginMongoose, {
		uri: 'mongodb://localhost:27017/fastify-plugin-mongoose',
		modelDirectoryPath: path.resolve(path.join(__dirname, 'test-models')),
		settings: {
			config: {
				autoIndex: false,
			},
		},
	});

	try {
		await fastify.ready();
		test.ok(fastify.mongoose.models.Example);
		await fastify.close();
	} catch (e) {
		test.fail('error', e);
	}
});

tap.test('should throw error if no alias is defined when useModelAliases is true', async (test) => {
	test.plan(2);

	try {
		await fastify.register(FastifyPluginMongoose, {
			uri: 'mongodb://localhost:27017/fastify-plugin-mongoose',
			modelDirectoryPath: path.resolve(path.join(__dirname, 'test-models-no-alias')),
			useModelAliases: true,
			settings: {
				config: {
					autoIndex: false,
				},
			},
		});

		await fastify.ready();
		await fastify.close();
	} catch (e) {
		test.ok(e);
		test.ok(e.message.indexOf('fastify-plugin-mongoose: No alias defined for') > -1);
	}
});

tap.test('models should load without alias', async (test) => {
	test.plan(1);

	await fastify.register(FastifyPluginMongoose, {
		uri: 'mongodb://localhost:27017/fastify-plugin-mongoose',
		modelDirectoryPath: path.resolve(path.join(__dirname, 'test-models')),
		useModelAliases: false,
		settings: {
			config: {
				autoIndex: false,
			},
		},
	});

	try {
		await fastify.ready();
		test.ok(fastify.mongoose.models.example);
		await fastify.close();
	} catch (e) {
		console.error(`Error in 'models should load without alias': ${e}`);
		test.fail('error', e);
	}
});
