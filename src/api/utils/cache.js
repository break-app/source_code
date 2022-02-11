const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const client = redis.createClient(process.env.redisUrl);
// client.hGet = util.promisify(client.hGet);
client.connect();

const query_exec = mongoose.Query.prototype.exec;
const aggregation_exec = mongoose.Aggregate.prototype.exec;

mongoose.Query.prototype.cache = async function (options = {}) {
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || '');

	return this;
};

mongoose.Query.prototype.exec = async function () {
	if (!this.useCache) {
		console.log('FROM QUErY');
		return query_exec.apply(this, arguments);
	}

	// generate a key
	const key = JSON.stringify(
		Object.assign({}, this.getQuery(), {
			collection: this.mongooseCollection.name,
		})
	);

	// see if we have value for key in redis
	const cacheValue = await client.hGet(this.hashKey, key);

	if (cacheValue) {
		const doc = JSON.parse(cacheValue);
		console.log('FROM CACHE');
		return Array.isArray(doc)
			? doc.map((d) => new this.model(d))
			: new this.model(doc);
	}
	console.log('FROM QUErY');

	// if we don't have this key then applay the query and cache it
	const result = await query_exec.apply(this, arguments);

	client.hSet(this.hashKey, key, JSON.stringify(result), 'EX', 10 * 60);

	return result;
};

mongoose.Aggregate.prototype.cache = async function (options = {}) {
	this.useCache = true;
	this.hashKey = JSON.stringify(options.key || '');

	return this;
};

mongoose.Aggregate.prototype.exec = async function () {
	if (!this.useCache) {
		console.log('FROM QUErY');
		return aggregation_exec.apply(this, arguments);
	}

	// generate a key
	const key = JSON.stringify(
		Object.assign({}, this._pipeline, {
			collection: this._model,
		})
	);

	// see if we have value for key in redis
	const cacheValue = await client.hGet(this.hashKey, key);

	if (cacheValue) {
		const doc = JSON.parse(cacheValue);
		console.log('FROM CACHE');
		return Array.isArray(doc)
			? doc.map((d) => new this.model(d))
			: new this.model(doc);
	}
	console.log('FROM QUErY');

	// if we don't have this key then applay the query and cache it
	const result = await aggregation_exec.apply(this, arguments);

	client.hSet(this.hashKey, key, JSON.stringify(result), 'EX', 10 * 60);

	return result;
};

module.exports = {
	clearHash(multiple, key) {
		if (multiple) {
			client
				.keys('*')
				.then((res) =>
					res.map((r) => r.includes(key) && client.del(r))
				);
			return;
		}
		client.del(JSON.stringify(key));
	},
};
