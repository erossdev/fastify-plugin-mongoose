# fastify-plugin-mongoose

[![NPM](https://nodei.co/npm/fastify-plugin-mongoose.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/fastify-plugin-mongoose/)

## Installation

```bash
npm install fastify-plugin-mongoose
```

## Usage

### Initialization

```javascript
const fastify = require("fastify")();
const fastifyPluginMongoose = require("fastify-plugin-mongoose");
const path = require("path");

fastify.register(fastifyPluginMongoose, {
	uri: "mongodb://localhost:27017/dbName",
	settings: {
		// https://mongoosejs.com/docs/connections.html#options
		// these are default
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
	modelDirectoryPath: path.resolve("PATH_TO_MODELS_DIRECTORY"),
	useModelAliases: true, // defaults to true
});
```

### Using in routes

This plugin decorates fastify with the connection and models

```javascript
const isDbConnected = fastify.mongoose.connection.readyState === 1;
```

By default, model aliases are enabled. We recommend using aliases.

```javascript
// models/seltzer-item.js
module.exports = {
	alias: "Seltzer",
	schema: {
		name: {
			type: "string",
		},
	},
};

// your routes
fastify.get("/seltzers", async (request, reply) => {
	const dbItems = await fastify.mongoose.models.Seltzer.find();
	reply.send(dbItems);
});

// if you disable model aliases by setting useModelAliases to false then you need to reference models by their file name
// NOTE: This means you cannot have duplicate file names even in different directories!
const itmes = await fastify.mongoose.models["seltzer-item"].find();
```

### Models

Define your models in separate files. If you pass in a modelDirectoryPath, the plugin will traverse all subdirectories for any models

```javascript
// models/seltzer.js
module.exports = {
	alias: "Seltzer",
	schema: {
		name: {
			type: "string",
		},
		slug: {
			type: String, // both 'string' and String work for type
		},
		company: {
			type: 'objectid', // ObjectId is special though so you HAVE to use a string, the plugin fixes the reference
			ref: 'Company',
		}
	},
	class: {
		// https://mongoosejs.com/docs/guide.html#es6-classes
	},
	// https://mongoosejs.com/docs/middleware.html#pre
	pre: {
		save: function (next) {
			if (this.name && this.name.length) {
				this.slug = this.name.toLowerCase());
			}

			next();
		},
	},
	// https://mongoosejs.com/docs/middleware.html#post
	post: {
		save: function (doc) {
			console.log(doc);
		},
	},
	options: {
		timestamps: true,
	}
};
```
