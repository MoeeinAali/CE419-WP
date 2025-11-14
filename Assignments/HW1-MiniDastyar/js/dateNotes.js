// ===== Date Notes Management =====
const DateNotes = {
    init: function () {
        this.attachEventListeners();
    },

    attachEventListeners: function () {
        document.getElementById('addDateNoteBtn').addEventListener('click', () => {
            this.addDateNote();
        });

        document.getElementById('closeDateModalBtn').addEventListener('click', () => {
            this.closeDateModal();
        });

        // Close modal on outside click
        document.getElementById('dateNotesModal').addEventListener('click', (e) => {
            if (e.target.id === 'dateNotesModal') {
                this.closeDateModal();
            }
        });
    },

    addDateNote: function () {
        const dateKey = AppState.selectedDate;
        if (!dateKey) return;

        const titleInput = document.getElementById('dateNoteTitleInput');
        const contentInput = document.getElementById('dateNoteContentInput');

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title && !content) {
            alert('لطفاً عنوان یا محتوای یادداشت را وارد کنید');
            return;
        }

        if (!AppState.dateNotes[dateKey]) {
            AppState.dateNotes[dateKey] = [];
        }

        const newNote = {
            id: Date.now().toString(),
            title: title || 'بدون عنوان',
            content: content || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        AppState.dateNotes[dateKey].push(newNote);
        Storage.set('dateNotes', AppState.dateNotes);

        titleInput.value = '';
        contentInput.value = '';

        Calendar.renderDateNotes();
        Calendar.updateCalendar(); // Update calendar to show note indicator
    },

    closeDateModal: function () {
        const modal = document.getElementById('dateNotesModal');
        modal.classList.remove('active');
        AppState.selectedDate = null;
        AppState.editingDateNoteId = null;
    }
};

