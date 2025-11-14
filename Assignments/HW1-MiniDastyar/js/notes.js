// ===== Notes Management =====
const Notes = {
    init: function () {
        this.render();
        this.attachEventListeners();
    },

    attachEventListeners: function () {
        document.getElementById('addNoteBtn').addEventListener('click', () => {
            this.addNote();
        });
    },

    addNote: function () {
        const titleInput = document.getElementById('noteTitleInput');
        const contentInput = document.getElementById('noteContentInput');

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title && !content) {
            alert('لطفاً عنوان یا محتوای یادداشت را وارد کنید');
            return;
        }

        const newNote = {
            id: Date.now().toString(),
            title: title || 'بدون عنوان',
            content: content || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        AppState.notes.push(newNote);
        Storage.set('notes', AppState.notes);

        titleInput.value = '';
        contentInput.value = '';

        this.render();
    },

    render: function () {
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';

        if (AppState.notes.length === 0) {
            notesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">هیچ یادداشتی وجود ندارد</p>';
            return;
        }

        // Sort notes by date (newest first)
        const sortedNotes = [...AppState.notes].sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        sortedNotes.forEach(note => {
            const noteElement = this.createNoteElement(note);
            notesList.appendChild(noteElement);
        });
    },

    createNoteElement: function (note) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-item';

        const isEditing = AppState.editingNoteId === note.id;

        if (isEditing) {
            noteDiv.innerHTML = `
                <div class="add-note-form">
                    <input type="text" class="note-input edit-note-title" value="${this.escapeHtml(note.title)}" placeholder="عنوان یادداشت...">
                    <textarea class="note-textarea edit-note-content" placeholder="متن یادداشت..." rows="3">${this.escapeHtml(note.content)}</textarea>
                    <button class="btn-primary save-note-btn">ذخیره</button>
                    <button class="btn-secondary cancel-note-btn">انصراف</button>
                </div>
            `;

            const saveBtn = noteDiv.querySelector('.save-note-btn');
            const cancelBtn = noteDiv.querySelector('.cancel-note-btn');

            saveBtn.addEventListener('click', () => {
                const title = noteDiv.querySelector('.edit-note-title').value.trim();
                const content = noteDiv.querySelector('.edit-note-content').value.trim();

                if (title || content) {
                    note.title = title || 'بدون عنوان';
                    note.content = content || '';
                    note.updatedAt = new Date().toISOString();

                    Storage.set('notes', AppState.notes);
                    AppState.editingNoteId = null;
                    this.render();
                }
            });

            cancelBtn.addEventListener('click', () => {
                AppState.editingNoteId = null;
                this.render();
            });
        } else {
            const createdDate = new Date(note.createdAt);
            const updatedDate = new Date(note.updatedAt);
            const dateStr = createdDate.toLocaleDateString('fa-IR');

            noteDiv.innerHTML = `
                <div class="note-item-header">
                    <div class="note-item-title">${this.escapeHtml(note.title)}</div>
                    <div class="note-item-actions">
                        <button class="note-item-btn btn-edit edit-note-btn">ویرایش</button>
                        <button class="note-item-btn btn-delete delete-note-btn">حذف</button>
                    </div>
                </div>
                <div class="note-item-content">${this.escapeHtml(note.content)}</div>
                <div class="note-item-date">تاریخ ایجاد: ${dateStr}</div>
            `;

            const editBtn = noteDiv.querySelector('.edit-note-btn');
            const deleteBtn = noteDiv.querySelector('.delete-note-btn');

            editBtn.addEventListener('click', () => {
                AppState.editingNoteId = note.id;
                this.render();
            });

            deleteBtn.addEventListener('click', () => {
                if (confirm('آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟')) {
                    AppState.notes = AppState.notes.filter(n => n.id !== note.id);
                    Storage.set('notes', AppState.notes);
                    this.render();
                }
            });
        }

        return noteDiv;
    },

    escapeHtml: function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

