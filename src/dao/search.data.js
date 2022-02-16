const { mongo } = require('mongoose');
const { Group, User } = require('../schemas/users.schema');

class SearchDAO {
	static SearchQuery(text) {
		const query = { $text: { $search: text } };
		const meta_score = { $meta: 'textScore' };
		const sort = [['score', meta_score]];

		return { query, sort };
	}

	static Search({ filters = null, page = 0, resultsPerPage = 20 }) {
		return new Promise(async (resolve, reject) => {
			console.log(page);
			try {
				let cursor;
				let queryParams = {};
				if (filters.tag === 'users') {
					queryParams = this.SearchQuery(filters.keywords);
					cursor = await User.find(queryParams.query, {
						name: { $concat: ['$name.first', ' ', '$name.last'] },
						_id: 1,
						avatar: 1,
						country: 1,
					})
						.limit(resultsPerPage)
						.skip((page - 1) * resultsPerPage);
				} else if (filters.tag === 'groups') {
					queryParams = this.SearchQuery(filters.keywords);
					cursor = await Group.find(queryParams.query, {
						name: 1,
						_id: 1,
						avatar: 1,
					})
						.limit(resultsPerPage)
						.skip((page - 1) * resultsPerPage);
				} else {
					reject('unknown search query');
				}
				resolve(cursor);
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = SearchDAO;
