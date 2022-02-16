const SearchDAO = require('../../dao/search.data');

class SearchCtrl {
	static async general_search(req, res, next) {
		let tag = req.body.tag;
		let keywords = req.body.keywords;
		try {
			const searchResult = await SearchDAO.Search({
				filters: {
					tag,
					keywords,
				},
				page: req.query.page,
			});
			res.json(searchResult);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = SearchCtrl;
