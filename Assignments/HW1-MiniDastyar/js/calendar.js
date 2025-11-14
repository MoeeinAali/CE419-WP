// ===== Calendar Management =====
const Calendar = {
    months: [
        'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
        'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
    ],

    weekdays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],

    init: function () {
        this.render();
        this.attachEventListeners();
    },

    attachEventListeners: function () {
        document.getElementById('prevMonthBtn').addEventListener('click', () => {
            const newDate = new Date(AppState.currentDate);
            newDate.setMonth(newDate.getMonth() - 1);
            AppState.currentDate = newDate;
            this.render();
        });

        document.getElementById('nextMonthBtn').addEventListener('click', () => {
            const newDate = new Date(AppState.currentDate);
            newDate.setMonth(newDate.getMonth() + 1);
            AppState.currentDate = newDate;
            this.render();
        });

        document.getElementById('goToTodayBtn').addEventListener('click', () => {
            AppState.currentDate = new Date();
            this.render();
        });
    },

    render: function () {
        const month = AppState.currentDate.getMonth();
        const year = AppState.currentDate.getFullYear();

        // Update month/year display
        document.getElementById('calendarMonthYear').textContent =
            `${this.months[month]} ${year}`;

        // Get first day of month
        const firstDay = new Date(year, month, 1);
        const firstDayIndex = (firstDay.getDay() + 6) % 7; // Convert to RTL week (Saturday = 0)

        // Get last day of month
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Get previous month's last days
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        // Today's date
        const today = new Date();
        const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
        const todayDate = isCurrentMonth ? today.getDate() : null;

        // Clear calendar grid
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';

        // Previous month's days
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            const dateKey = this.getDateKey(new Date(year, month - 1, day));
            const hasNotes = this.hasDateNotes(dateKey);
            const dayElement = this.createDayElement(day, true, false, hasNotes, dateKey);
            calendarGrid.appendChild(dayElement);
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = todayDate === day;
            const dateKey = this.getDateKey(new Date(year, month, day));
            const hasNotes = this.hasDateNotes(dateKey);
            const dayElement = this.createDayElement(day, false, isToday, hasNotes, dateKey);
            calendarGrid.appendChild(dayElement);
        }

        // Next month's days (fill remaining cells)
        const totalCells = calendarGrid.children.length;
        const remainingCells = 42 - totalCells; // 6 weeks * 7 days
        for (let day = 1; day <= remainingCells && day <= 14; day++) {
            const dateKey = this.getDateKey(new Date(year, month + 1, day));
            const hasNotes = this.hasDateNotes(dateKey);
            const dayElement = this.createDayElement(day, true, false, hasNotes, dateKey);
            calendarGrid.appendChild(dayElement);
        }
    },

    createDayElement: function (day, isOtherMonth, isToday, hasNotes, dateKey) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        if (isToday) {
            dayElement.classList.add('today');
        }

        if (hasNotes) {
            dayElement.classList.add('has-notes');
        }

        dayElement.addEventListener('click', () => {
            if (!isOtherMonth) {
                this.openDateModal(dateKey);
            }
        });

        return dayElement;
    },

    getDateKey: function (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    hasDateNotes: function (dateKey) {
        return AppState.dateNotes[dateKey] && AppState.dateNotes[dateKey].length > 0;
    },

    openDateModal: function (dateKey) {
        AppState.selectedDate = dateKey;
        const modal = document.getElementById('dateNotesModal');
        const dateTitle = document.getElementById('dateNotesTitle');

        const date = new Date(dateKey + 'T00:00:00');
        const persianDate = this.formatDate(date);
        dateTitle.textContent = `یادداشت‌های ${persianDate}`;

        this.renderDateNotes();
        modal.classList.add('active');
    },

    formatDate: function (date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    },

    renderDateNotes: function () {
        const dateKey = AppState.selectedDate;
        const notesList = document.getElementById('dateNotesList');
        notesList.innerHTML = '';

        const notes = AppState.dateNotes[dateKey] || [];

        if (notes.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = 'var(--text-secondary)';
            emptyMessage.style.padding = '20px';
            emptyMessage.textContent = 'هیچ یادداشتی برای این تاریخ وجود ندارد';
            notesList.appendChild(emptyMessage);
            return;
        }

        notes.forEach((note, index) => {
            const noteElement = this.createDateNoteElement(note, index);
            notesList.appendChild(noteElement);
        });
    },

    createDateNoteElement: function (note, index) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note-item';

        const isEditing = AppState.editingDateNoteId === note.id;

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
            saveBtn.className = 'btn-primary save-date-note-btn';
            saveBtn.textContent = 'ذخیره';
            formDiv.appendChild(saveBtn);

            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-secondary cancel-date-note-btn';
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

                    Storage.set('dateNotes', AppState.dateNotes);
                    AppState.editingDateNoteId = null;
                    this.renderDateNotes();
                    this.render(); // Update calendar to show note indicators
                }
            });

            cancelBtn.addEventListener('click', () => {
                AppState.editingDateNoteId = null;
                this.renderDateNotes();
            });
        } else {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'note-item-header';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'note-item-title';
            titleDiv.textContent = note.title || 'بدون عنوان';
            headerDiv.appendChild(titleDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'note-item-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'note-item-btn btn-edit edit-date-note-btn';
            editBtn.textContent = 'ویرایش';
            actionsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'note-item-btn btn-delete delete-date-note-btn';
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
            dateDiv.textContent = `تاریخ: ${this.formatDate(new Date(note.createdAt))}`;
            noteDiv.appendChild(dateDiv);

            editBtn.addEventListener('click', () => {
                AppState.editingDateNoteId = note.id;
                this.renderDateNotes();
            });

            deleteBtn.addEventListener('click', () => {
                if (confirm('آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟')) {
                    const dateKey = AppState.selectedDate;
                    AppState.dateNotes[dateKey] = AppState.dateNotes[dateKey].filter(n => n.id !== note.id);
                    if (AppState.dateNotes[dateKey].length === 0) {
                        delete AppState.dateNotes[dateKey];
                    }
                    Storage.set('dateNotes', AppState.dateNotes);
                    this.renderDateNotes();
                    this.render(); // Update calendar
                }
            });
        }

        return noteDiv;
    },


    updateCalendar: function () {
        this.render();
    }
};

