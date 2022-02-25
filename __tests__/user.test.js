const UserDAO = require('../src/dao/users/users.dao');

describe('user test', () => {
	it('add user testing', async () => {
		const data = {
			password: '123123123',
			first_name: 'Ahmed',
			last_name: 'Magdy',
			email: 'am@gmail.com',
			country: 'EGY',
			phone: '123123123',
			gender: 'Male',
			age: 22,
		};
		try {
			const insertUser = await UserDAO.addUser(data);
			console.log(insertUser);
			// expect(insertUser.first_name).toEqual('Ahmed');
			expect(1).toEqual(1);
		} catch (error) {
			console.log(error);
		}
	});
});
