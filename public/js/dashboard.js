let medicines = [];
let editingMedicine = null;

// Check authentication
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
            window.location.href = '/login';
            return;
        }
        loadMedicines();
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

// Modal handlers
document.getElementById('addMedicineBtn').addEventListener('click', () => {
    editingMedicine = null;
    document.getElementById('modalTitle').textContent = 'Add Medicine';
    document.getElementById('medicineForm').reset();
    document.getElementById('medicineStartDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('medicineModal').style.display = 'block';
});

document.querySelector('.close').addEventListener('click', closeMedicineModal);

document.getElementById('medicineModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('medicineModal')) {
        closeMedicineModal();
    }
});

function closeMedicineModal() {
    document.getElementById('medicineModal').style.display = 'none';
    editingMedicine = null;
}

// Medicine form handler
document.getElementById('medicineForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const medicineData = {
        name: formData.get('name'),
        icon: formData.get('icon'),
        dosage: formData.get('dosage'),
        frequency: parseInt(formData.get('frequency')),
        duration: parseInt(formData.get('duration')),
        startDate: formData.get('startDate'),
        instructions: formData.get('instructions')
    };

    try {
        const url = editingMedicine ? `/api/medicines/${editingMedicine._id}` : '/api/medicines';
        const method = editingMedicine ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicineData)
        });

        if (response.ok) {
            closeMedicineModal();
            loadMedicines();
            showMessage(editingMedicine ? 'Medicine updated successfully!' : 'Medicine added successfully!', 'success');
        } else {
            const data = await response.json();
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to save medicine. Please try again.', 'error');
    }
});

// Load medicines
async function loadMedicines() {
    try {
        const response = await fetch('/api/medicines');
        if (response.ok) {
            medicines = await response.json();
            renderMedicines();
        }
    } catch (error) {
        showMessage('Failed to load medicines.', 'error');
    }
}

// Render medicines
function renderMedicines() {
    const grid = document.getElementById('medicinesGrid');
    
    if (medicines.length === 0) {
        grid.innerHTML = '<div class="no-medicines">No medicines added yet. Click "Add Medicine" to get started!</div>';
        return;
    }

    grid.innerHTML = medicines.map(medicine => `
        <div class="medicine-card">
            <div class="medicine-header">
                <div class="medicine-icon icon-${medicine.icon}"></div>
                <div class="medicine-name">${medicine.name}</div>
            </div>
            <div class="medicine-details">
                <div class="medicine-detail"><strong>Dosage:</strong> ${medicine.dosage}</div>
                <div class="medicine-detail"><strong>Frequency:</strong> ${medicine.frequency} times per day</div>
                <div class="medicine-detail"><strong>Duration:</strong> ${medicine.duration} days</div>
                <div class="medicine-detail"><strong>Start Date:</strong> ${new Date(medicine.startDate).toLocaleDateString()}</div>
                <div class="medicine-detail"><strong>End Date:</strong> ${new Date(medicine.endDate).toLocaleDateString()}</div>
                ${medicine.instructions ? `<div class="medicine-detail"><strong>Instructions:</strong> ${medicine.instructions}</div>` : ''}
            </div>
            <div class="medicine-actions">
                <button class="btn btn-primary btn-small" onclick="editMedicine('${medicine._id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteMedicine('${medicine._id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Edit medicine
function editMedicine(id) {
    editingMedicine = medicines.find(m => m._id === id);
    if (!editingMedicine) return;

    document.getElementById('modalTitle').textContent = 'Edit Medicine';
    document.getElementById('medicineName').value = editingMedicine.name;
    document.getElementById('medicineIcon').value = editingMedicine.icon;
    document.getElementById('medicineDosage').value = editingMedicine.dosage;
    document.getElementById('medicineFrequency').value = editingMedicine.frequency;
    document.getElementById('medicineDuration').value = editingMedicine.duration;
    document.getElementById('medicineStartDate').value = new Date(editingMedicine.startDate).toISOString().split('T')[0];
    document.getElementById('medicineInstructions').value = editingMedicine.instructions || '';
    
    document.getElementById('medicineModal').style.display = 'block';
}

// Delete medicine
async function deleteMedicine(id) {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
        const response = await fetch(`/api/medicines/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadMedicines();
            showMessage('Medicine deleted successfully!', 'success');
        } else {
            const data = await response.json();
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Failed to delete medicine.', 'error');
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