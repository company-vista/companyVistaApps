const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let notifications = [
  {
    _id: '1',
    title: 'Welcome',
    message: 'Your account has been created successfully.',
    createdAt: new Date().toISOString(),
    icon: 'bell-o',
    isRead: false,
    companyId: 'comp1',
  },
  {
    _id: '2',
    title: 'Filing Reminder',
    message: 'Your annual filing is due in 30 days.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    icon: 'calendar',
    isRead: false,
    companyId: 'comp1',
  },
];

function authToken(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.split(' ')[1];
}

app.get('/api/notifications', (req, res) => {
  const token = authToken(req);
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  res.json({
    success: true,
    notifications,
  });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const token = authToken(req);
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const notification = notifications.find(n => n._id === req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

  notification.isRead = true;
  res.json({ isSuccess: true });
});

app.delete('/api/notifications/:id', (req, res) => {
  const token = authToken(req);
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const index = notifications.findIndex(n => n._id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Notification not found' });

  notifications.splice(index, 1);
  res.json({ isSuccess: true });
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Notification API running on http://0.0.0.0:${PORT}`);
});
