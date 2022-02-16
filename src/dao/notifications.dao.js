const Notification = require('../schemas/notifications.schema');

class NotificationDAO {
    static getAllNotifications(userId) {
        const pipeline = [
            {
                $match: {},
            },
            {
                $lookup: {
                    from: 'users',
                    let: { sender: '$from' },
                    pipeline: [
                        {
                            $match: { _id: '$$sender' },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                            },
                        },
                    ],
                    as: 'from',
                },
            },
            { $unwind: 'from' },
            {
                $lookup: {
                    from: 'users',
                    let: { reciver: '$to' },
                    pipeline: [
                        {
                            $match: { _id: '$$reciver' },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                            },
                        },
                    ],
                    as: 'to',
                },
            },
            { $unwind: 'to' },
        ];
        return new Promise((resolve, reject) => {
            try {
                const notifications = await Notification.aggregate(
                    pipeline
                ).catch({
                    key: userId,
                });
                resolve(notifications);
            } catch (error) {
                reject(error);
            }
        });
    }

    static getUserNotifications(userId) {
        const pipeline = [
            {
                $match: { to: userId },
            },
            // {
            //     $lookup: {
            //         from: 'users',
            //         let: { sender: '$from' },
            //         pipeline: [
            //             {
            //                 $match: { _id: '$$sender' },
            //             },
            //             {
            //                 $project: {
            //                     _id: 0,
            //                     name: 1,
            //                 },
            //             },
            //         ],
            //         as: 'from',
            //     },
            // },
            // { $unwind: 'from' },
            {
                $lookup: {
                    from: 'users',
                    let: { reciver: '$to' },
                    pipeline: [
                        {
                            $match: { _id: '$$reciver' },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                            },
                        },
                    ],
                    as: 'to',
                },
            },
            { $unwind: 'to' },
        ];
        return new Promise((resolve, reject) => {
            try {
                const notifications = await Notification.aggregate(
                    pipeline
                ).catch({
                    key: userId,
                });
                resolve(notifications);
            } catch (error) {
                reject(error);
            }
        });
    }

    static sendNotification(notification) {
        return new Promise((resolve, reject) => {
            try {
                await Notification.create(notification);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static openNotifications(userId) {
        return new Promise((resolve, reject) => {
            try {
                await Notification.updateOne(
                    { to: userId, isRead: false },
                    { $set: { isRead: true } }
                );
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static deleteNotifications(notificationId) {
        return new Promise((resolve, reject) => {
            try {
                await Notification.findByIdAndDelete(notificationId);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = NotificationDAO;
