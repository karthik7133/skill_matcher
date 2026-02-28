const Notification = require('../models/Notification');

// Get all notifications for current user
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check ownership
        if (notification.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Mark all for an internship as read
exports.markAllAsRead = async (req, res) => {
    try {
        const { internshipId } = req.body;
        const filter = { userId: req.user.id, isRead: false };
        if (internshipId) {
            filter.relatedInternshipId = internshipId;
        }

        await Notification.updateMany(filter, { $set: { isRead: true } });
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
