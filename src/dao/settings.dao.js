const Settings = require('../schemas/settings.schema');
const { ObjectId } = require('mongoose');
class SettingsDAO {
	static async createSettings(data) {
		try {
			return await Settings.create(data);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @param {object} edit | object contains edit informations
	 **/
	static async EditOnSettings(edit) {
		try {
			const editResult = await Settings.findOneAndUpdate(
				{ _id: ObjectId(edit.settings_id) },
				req.body
			);
			return editResult;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @param {string} settings_id | the id of settings must get back
	 **/
	static async GetSettings() {
		try {
			const settings = await Settings.findone();
			return settings;
		} catch (error) {
			throw error;
		}
	}
}

module.exports = SettingsDAO;
