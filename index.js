const FastifyPlugin = require("fastify-plugin");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const DEFAULT_SETTINGS = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

function walkDir(dir, fileList = []) {
	const topLevelDir = fs.readdirSync(dir);
	topLevelDir.forEach((file) => {
		const joinedPath = path.join(dir, file);
		const stat = fs.statSync(joinedPath);
		if (stat.isDirectory()) fileList = walkDir(joinedPath, fileList);
		else fileList.push(joinedPath);
	});
	return fileList;
}

function fixReferences(schema) {
	Object.keys(schema).forEach((key) => {
		if (
			typeof schema[key].type === "string" &&
			schema[key].type.toLowerCase() === "objectid"
		) {
			schema[key].type = mongoose.Schema.Types.ObjectId;
		}
	});
}

function createModelNameFromFileName(filePath) {
	const separator = filePath.includes("\\") ? "\\" : "/";
	const nameWithEnding = filePath.slice(filePath.lastIndexOf(separator) + 1);
	return nameWithEnding.replace(".js", "");
}

function attachPreMiddleware(model, schema) {
	const keys = Object.keys(model.pre);

	keys.forEach((k) => {
		if (typeof model.pre[k] === "function") {
			schema.pre(k, model.pre[k]);
		}
	});
}

function attachPostMiddleware(model, schema) {
	const keys = Object.keys(model.post);

	keys.forEach((k) => {
		if (typeof model.post[k] === "function") {
			schema.post(k, model.post[k]);
		}
	});
}

// currently synchronous but we can refactor later if it becomes an issue
function loadModels(decorator, modelDirectoryPath, useModelAliases) {
	const files = walkDir(modelDirectoryPath);
	files.forEach((file) => {
		const model = require(file);
		fixReferences(model.schema);

		const schema = new mongoose.Schema(model.schama, model.options || {});

		if (model.class) schema.loadClass(model.class);
		if (model.virtualize) model.virtualize(schema);
		if (model.pre) attachPreMiddleware(model, schema);
		if (model.post) attachPostMiddleware(model, schema);

		if (useModelAliases) {
			if (!model.alias || typeof model.alias !== "string") {
				throw new Error(`No alias defined for ${file}`);
			}
			decorator.models[model.alias] = mongoose.model(model.alias, schema);
		} else {
			const name = createModelNameFromFileName(file);
			decorator.models[name] = mongoose.model(name, schema);
		}
	});
}

async function fastifyMongoose(
	fastify,
	{ uri, settings, modelDirectoryPath = undefined, useModelAliases = true }
) {
	// merge defaults and passed in settings
	if (!settings) settings = {};
	const mergedSettings = Object.assign({}, DEFAULT_SETTINGS, settings);

	// connect to the DB
	await mongoose.connect(uri, mergedSettings);

	const decorator = {
		connection: mongoose.connection,
		models: {},
	};

	// load models if they give us a directory to traverse
	if (modelDirectoryPath) {
		if (typeof modelDirectoryPath === "string") {
			loadModels(decorator, modelDirectoryPath, useModelAliases);
		} else {
			throw new Error(
				`fastify-plugin-mongoose: option 'modelDirectoryPath' must be a string`
			);
		}
	}

	// close connection when fastify app is closing
	fastify.addHook("onClose", (app, done) => {
		app.mongoose.connection.on("close", function () {
			done();
		});
		app.mongoose.connection.close();
	});

	fastify.decorate("mongoose", decorator);
}

module.exports = {
	plugin: FastifyPlugin(fastifyMongoose),
};
