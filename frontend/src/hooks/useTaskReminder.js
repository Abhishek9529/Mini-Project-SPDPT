// ===== useTaskReminder.js =====
// Custom hook to register the service worker and schedule morning notifications

import { useEffect } from 'react';
import API from '../services/api';

const getLocalDateString = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const isLectureSubtask = (task) => task?.taskType === 'lecture-subtask';

const isSubjectTask = (task) => {
    return !!task?.subjectId || isLectureSubtask(task);
};

const useTaskReminder = (studentName) => {
    useEffect(() => {
        if (!studentName) return;

        // Check browser support
        if (!('Notification' in window)) {
            console.log('Browser does not support notifications');
            return;
        }

        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker not supported');
            return;
        }

        const setupReminder = async () => {
            try {
                // Step 1: Request notification permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Notification permission denied');
                    return;
                }

                // Step 2: Register service worker
                const registration = await navigator.serviceWorker.register('/sw.js');
                await navigator.serviceWorker.ready;

                // Step 3: Fetch current tasks to build notification message
                const student = JSON.parse(localStorage.getItem('student'));
                if (!student) return;

                let pendingCount = 0;
                let backlogCount = 0;
                const today = getLocalDateString();

                try {
                    const res = await API.get(`/tasks/${student._id}`);
                    const allTasks = res.data.tasks || [];

                    // Helper to check if date is today
                    const isTodayDate = (dateStr) => {
                        if (!dateStr) return false;
                        return dateStr.split('T')[0] === today;
                    };

                    // Helper to check if date is past
                    const isPastDate = (dateStr) => {
                        if (!dateStr) return false;
                        return dateStr.split('T')[0] < today;
                    };

                    pendingCount = allTasks.filter(
                        t => !t.isCompleted && (
                            (!isSubjectTask(t) && (!t.date || isTodayDate(t.date))) ||
                            (isLectureSubtask(t) && isTodayDate(t.date))
                        )
                    ).length;

                    backlogCount = allTasks.filter(
                        t => !t.isCompleted && !isSubjectTask(t) && t.date && isPastDate(t.date)
                    ).length;
                } catch (err) {
                    console.log('Error fetching tasks for reminder:', err);
                }

                // Step 4: Check if we should show a "morning greeting" RIGHT NOW
                // (user just opened the app in morning hours: 6 AM - 11 AM)
                const hour = new Date().getHours();
                const lastShown = localStorage.getItem('lastReminderDate');
                const todayDate = new Date().toDateString();

                if (hour >= 6 && hour < 11 && lastShown !== todayDate) {
                    // Show notification immediately since it's morning and not shown today yet
                    const sw = registration.active || registration.waiting || registration.installing;
                    if (sw) {
                        sw.postMessage({
                            type: 'SHOW_NOW',
                            payload: { studentName, pendingCount, backlogCount }
                        });
                    }
                    localStorage.setItem('lastReminderDate', todayDate);
                }

                // Step 5: Always schedule the next morning reminder
                const sw = registration.active || registration.waiting || registration.installing;
                if (sw) {
                    sw.postMessage({
                        type: 'SCHEDULE_MORNING_REMINDER',
                        payload: { studentName, pendingCount, backlogCount }
                    });
                }

            } catch (err) {
                console.error('Error setting up task reminder:', err);
            }
        };

        setupReminder();

    }, [studentName]);
};

export default useTaskReminder;
