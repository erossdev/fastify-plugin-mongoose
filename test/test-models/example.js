module.exports = {
	alias: "Example",
	schema: {
		name: {
			type: String,
			required: true,
		},
		another: {
			type: 'objectid',
			ref: 'User',
		}
	},
	options: {
		timestamps: true,
	},
};
