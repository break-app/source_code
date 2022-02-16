const NotificationDAO = require('../../dao/notifications.dao');
const idGenerator = require('../helpers/idGenerator');

class NotificationController {
    static async createNotifications(req, res, next) {
        try {
            const { userId } = req.user.id;
            const notifications = await NotificationDAO.createNotifications({
                ...req.body,
                to: userId,
                _id: idGenerator(),
            });

            res.status(201).json({
                success: true,
                notifications,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteNotifications(req, res, next) {
        try {
            const { notificationId } = req.params.id;
            await NotificationDAO.deleteNotifications(notificationId);

            res.status(201).json({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    }

    static async openNotifications(req, res, next) {
        try {
            const { userId } = req.user.id;
            await NotificationDAO.openNotifications(userId);

            res.status(201).json({
                success: true,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllNotifications(req, res, next) {
        try {
            const { userId } = req.user.id;
            const notifications = await NotificationDAO.getAllNotifications(
                userId
            );

            res.status(201).json({
                success: true,
                notifications,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserNotifications(req, res, next) {
        try {
            const { userId } = req.user.id;
            const notifications = await NotificationDAO.getUserNotifications(
                userId
            );

            res.status(201).json({
                success: true,
                notifications,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = NotificationController;
