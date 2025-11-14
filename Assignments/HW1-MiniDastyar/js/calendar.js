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
            notesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">هیچ یادداشتی برای این تاریخ وجود ندارد</p>';
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
            noteDiv.innerHTML = `
                <div class="add-note-form">
                    <input type="text" class="note-input edit-note-title" value="${this.escapeHtml(note.title)}" placeholder="عنوان یادداشت...">
                    <textarea class="note-textarea edit-note-content" placeholder="متن یادداشت..." rows="3">${this.escapeHtml(note.content)}</textarea>
                    <button class="btn-primary save-date-note-btn">ذخیره</button>
                    <button class="btn-secondary cancel-date-note-btn">انصراف</button>
                </div>
            `;

            const saveBtn = noteDiv.querySelector('.save-date-note-btn');
            const cancelBtn = noteDiv.querySelector('.cancel-date-note-btn');

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
            noteDiv.innerHTML = `
                <div class="note-item-header">
                    <div class="note-item-title">${this.escapeHtml(note.title || 'بدون عنوان')}</div>
                    <div class="note-item-actions">
                        <button class="note-item-btn btn-edit edit-date-note-btn">ویرایش</button>
                        <button class="note-item-btn btn-delete delete-date-note-btn">حذف</button>
                    </div>
                </div>
                <div class="note-item-content">${this.escapeHtml(note.content)}</div>
                <div class="note-item-date">تاریخ: ${this.formatDate(new Date(note.createdAt))}</div>
            `;

            const editBtn = noteDiv.querySelector('.edit-date-note-btn');
            const deleteBtn = noteDiv.querySelector('.delete-date-note-btn');

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

    escapeHtml: function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    updateCalendar: function () {
        this.render();
    }
};

