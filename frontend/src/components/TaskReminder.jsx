import React, { useState } from 'react';
import './TaskReminder.css';

const shouldShowReminderBanner = () => {
  const hour = new Date().getHours();
  const lastDismissed = localStorage.getItem('reminderBannerDismissed');
  const todayDate = new Date().toDateString();

  return hour >= 6 && hour < 11 && lastDismissed !== todayDate;
};

const TaskReminder = ({ studentName, pendingCount, backlogCount }) => {
  const [visible, setVisible] = useState(shouldShowReminderBanner);
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('reminderBannerDismissed', new Date().toDateString());
  };

  if (!visible || dismissed) return null;

  const total = (pendingCount || 0) + (backlogCount || 0);
  const name = studentName || 'Student';

  return (
    <div className="task-reminder-banner">
      <div className="reminder-icon">AM</div>
      <div className="reminder-content">
        <h4>Good Morning, {name}!</h4>
        {total === 0 ? (
          <p>You're all caught up! Have a productive day.</p>
        ) : (
          <p>
            You have{' '}
            {pendingCount > 0 && (
              <strong>{pendingCount} task{pendingCount > 1 ? 's' : ''} for today</strong>
            )}
            {pendingCount > 0 && backlogCount > 0 && ' and '}
            {backlogCount > 0 && (
              <strong>{backlogCount} pending backlog item{backlogCount > 1 ? 's' : ''}</strong>
            )}
            . Let's get started!
          </p>
        )}
      </div>
      <button className="reminder-close-btn" onClick={handleDismiss} title="Dismiss">
        x
      </button>
    </div>
  );
};

export default TaskReminder;
