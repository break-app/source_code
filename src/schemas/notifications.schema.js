const mongoose = require('mongoose');
const IdRef = mongoose.Schema.Types.String;

const notificationSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.String,
        required: [true, 'document must have an id'],
    },
    title: {
        type: String,
        required: [true, 'notification must have a title'],
    },
    // from: {
    //     type: IdRef,
    //     ref: 'User',
    //     required: [true, 'notification must have a sender'],
    // },
    to: {
        type: IdRef,
        ref: 'User',
        required: [true, 'notification must have a reciever'],
    },
    message: {
        type: String,
        required: [true, 'notification must have a message'],
    },
    isRead: {
        type: Boolean,
        default: false,
    },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
