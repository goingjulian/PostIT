const webpush = require('web-push');
const dotenv = require('dotenv');
dotenv.config();

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || '',
    process.env.VAPID_PUBLIC_KEY || '',
    process.env.VAPID_PRIVATE_KEY || ''
);

module.exports.sendNotification = async (organisation, data) => {
    for(let i = organisation.notifications.length - 1; i >= 0; i--) {
        const notification = organisation.notifications[i];
        try {
            await webpush.sendNotification(notification, JSON.stringify(data))
        } catch(err) {
            if (err.statusCode === 404 || err.statusCode === 410) {
                organisation.notifications.splice(i, 1);
            } else {
                throw err;
            }
        }
    }
    await organisation.save();
};