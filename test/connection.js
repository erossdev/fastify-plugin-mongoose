const tap = require("tap");

const fastify = require("fastify")();

const FastifyPluginMongoose = require("../index.js");

async function runTest() {
	tap.plan(1);

	await fastify.register(FastifyPluginMongoose.plugin, {
		uri: "mongodb://localhost:27017/fastify-plugin-mongoose",
		settings: {
			config: {
				autoIndex: true,
			},
		},
	});

	try {
		await fastify.ready();
		tap.strictEqual(fastify.mongoose.connection.readyState, 1);
	} catch (e) {
		tap.fail("error", e);
	}
	fastify.close();
}

runTest();