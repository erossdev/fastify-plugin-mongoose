const tap = require("tap");
const path = require("path");

let fastify = require("fastify")();

const FastifyPluginMongoose = require("../index.js");

tap.beforeEach((done) => {
	fastify = require("fastify")();
	done();
});

tap.afterEach(async (done) => {
	await fastify.close();
	done();
});

tap.test("models should load", async (test) => {
	test.plan(1);

	await fastify.register(FastifyPluginMongoose, {
		uri: "mongodb://localhost:27017/fastify-plugin-mongoose",
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
	} catch (e) {
		test.fail("error", e);
	}
});

tap.test("models should load without alias", async (test) => {
	test.plan(1);

	await fastify.register(FastifyPluginMongoose, {
		uri: "mongodb://localhost:27017/fastify-plugin-mongoose",
		modelDirectoryPath: path.resolve(path.join(__dirname, "test-models")),
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
	} catch (e) {
		test.fail("error", e);
	}
});