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
            const emptyMessage = document.createElement('p');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = 'var(--text-secondary)';
            emptyMessage.style.padding = '20px';
            emptyMessage.textContent = 'هیچ یادداشتی وجود ندارد';
            notesList.appendChild(emptyMessage);
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
            const formDiv = document.createElement('div');
            formDiv.className = 'add-note-form';

            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.className = 'note-input edit-note-title';
            titleInput.value = note.title;
            titleInput.placeholder = 'عنوان یادداشت...';
            formDiv.appendChild(titleInput);

            const contentTextarea = document.createElement('textarea');
            contentTextarea.className = 'note-textarea edit-note-content';
            contentTextarea.placeholder = 'متن یادداشت...';
            contentTextarea.rows = 3;
            contentTextarea.value = note.content;
            formDiv.appendChild(contentTextarea);

            const saveBtn = document.createElement('button');
            saveBtn.className = 'btn-primary save-note-btn';
            saveBtn.textContent = 'ذخیره';
            formDiv.appendChild(saveBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-secondary cancel-note-btn';
            cancelBtn.textContent = 'انصراف';
            formDiv.appendChild(cancelBtn);

            noteDiv.appendChild(formDiv);

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

            const headerDiv = document.createElement('div');
            headerDiv.className = 'note-item-header';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'note-item-title';
            titleDiv.textContent = note.title;
            headerDiv.appendChild(titleDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'note-item-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'note-item-btn btn-edit edit-note-btn';
            editBtn.textContent = 'ویرایش';
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'note-item-btn btn-delete delete-note-btn';
            deleteBtn.textContent = 'حذف';
            actionsDiv.appendChild(deleteBtn);

            headerDiv.appendChild(actionsDiv);
            noteDiv.appendChild(headerDiv);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'note-item-content';
            contentDiv.textContent = note.content;
            noteDiv.appendChild(contentDiv);

            const dateDiv = document.createElement('div');
            dateDiv.className = 'note-item-date';
            dateDiv.textContent = `تاریخ ایجاد: ${dateStr}`;
            noteDiv.appendChild(dateDiv);

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

};

