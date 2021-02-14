module.exports = {
	schema: {
		name: {
			type: String,
			required: true,
		},
		another: {
			type: 'objectid',
			ref: 'User',
		},
	},
	options: {
		timestamps: true,
	},
};
