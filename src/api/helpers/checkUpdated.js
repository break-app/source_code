module.exports = {
	checkUpdated(updateDBResponse, msg) {
		return new Promise(async (resolve, reject) => {
			if (
				!updateDBResponse.matchedCount ||
				!updateDBResponse.modifiedCount
			) {
				resolve(0);
			}
			resolve(1);
		});
	},
};
