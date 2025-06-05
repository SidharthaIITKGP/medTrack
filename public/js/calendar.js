let currentDate = new Date();
let medicineLogs = [];

// Check authentication
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }
        updateDateDisplay();
        loadMedicineLogs();
    } catch (error) {
        window.location.href = '/login';
    }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Date navigation
document.getElementById('prevDate').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadMedicineLogs();
});

document.getElementById('nextDate').addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadMedicineLogs();
});

// Update date display
function updateDateDisplay() {
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Load medicine logs for current date
async function loadMedicineLogs() {
    try {
        const dateStr = currentDate.toISOString().split('T')[0];
        const response = await fetch(`/api/logs/date/${dateStr}`);
        
        if (response.ok) {
            medicineLogs = await response.json();
            renderCalendar();
        } else {
            showMessage('Failed to load medicine logs.', 'error');
        }
    } catch (error) {
        showMessage('Failed to load medicine logs.', 'error');
    }
}

// Render calendar
function renderCalendar() {
    const calendarContent = document.getElementById('calendarContent');
    
    if (medicineLogs.length === 0) {
        calendarContent.innerHTML = '<div class="no-medicines">No medicines scheduled for this date.</div>';
        return;
    }

    calendarContent.innerHTML = medicineLogs.map(log => `
        <div class="medicine-schedule">
            <div class="medicine-schedule-header">
                <div class="medicine-schedule-icon icon-${log.medicineId.icon}"></div>
                <div class="medicine-schedule-name">${log.medicineId.name}</div>
            </div>
            <div class="dose-times">
                ${log.doseTimes.map((dose, index) => `
                    <div class="dose-time ${dose.taken ? 'taken' : ''}">
                        <input 
                            type="checkbox" 
                            class="dose-checkbox" 
                            ${dose.taken ? 'checked' : ''} 
                            onchange="toggleDose('${log._id}', ${index})"
                        >
                        <div class="dose-info">
                            <div class="dose-time-text">${dose.time}</div>
                            <div class="dose-dosage">${log.medicineId.dosage}</div>
                            ${dose.taken && dose.takenAt ? `<div class="dose-taken-at">Taken at ${new Date(dose.takenAt).toLocaleTimeString()}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Toggle dose taken status
async function toggleDose(logId, doseIndex) {
    try {
        const response = await fetch('/api/logs/take', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                logId: logId,
                doseIndex: doseIndex
            })
        });

        if (response.ok) {
            const updatedLog = await response.json();
            // Update the local log data
            const logIndex = medicineLogs.findIndex(log => log._id === logId);
            if (logIndex !== -1) {
                medicineLogs[logIndex] = updatedLog;
                renderCalendar();
            }
        } else {
            const data = await response.json();
            showMessage(data.message, 'error');
            // Reload to ensure consistency
            loadMedicineLogs();
        }
    } catch (error) {
        showMessage('Failed to update dose status.', 'error');
        // Reload to ensure consistency
        loadMedicineLogs();
    }
}

// Show message function
function showMessage(message, type) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}
