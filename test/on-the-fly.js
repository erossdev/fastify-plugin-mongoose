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

tap.test('models should load on the fly', async (test) => {
	test.plan(1);

	await fastify.register(FastifyPluginMongoose, {
		uri: 'mongodb://localhost:27017/fastify-plugin-mongoose',
	});

	try {
		await fastify.ready();
		const user = require('./test-models/user');
		fastify.mongoose.registerModel(user);
		test.ok(fastify.mongoose.models.User);
	} catch (e) {
		console.error(`Error in test: 'models should load on the fly': ${e}`);
		test.fail('error', e);
	}
});

tap.test('models should load with modelDirectoryPath and on the fly', async (test) => {
	test.plan(2);

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

		fastify.mongoose.registerModel({
			alias: 'Another',
			schema: {
				name: {
					type: String,
					required: true,
				},
			},
			options: {
				timestamps: true,
			},
		});

		test.ok(fastify.mongoose.models.Another.schema.obj.name);
	} catch (e) {
		console.error(`Error in test: 'models should load with modelDirectoryPath and on the fly': ${e}`);
		test.fail('error', e);
	}
});
