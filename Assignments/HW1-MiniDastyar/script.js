// ===== Local Storage Helper Functions =====
const Storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    }
};

// ===== State Management =====
const AppState = {
    quickLinks: Storage.get('quickLinks', []),
    notes: Storage.get('notes', []),
    dateNotes: Storage.get('dateNotes', {}),
    currentDate: new Date(),
    selectedDate: null,
    editingNoteId: null,
    editingDateNoteId: null
};

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

// ===== Search Functionality =====
const Search = {
    init: function () {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                window.open(googleUrl, '_blank');
            }
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
};

// ===== Quick Access Management =====
const QuickAccess = {
    defaultLinks: [
        { title: 'گوگل', url: 'https://www.google.com' },
        { title: 'یوتیوب', url: 'https://www.youtube.com' },
        { title: 'گیت‌هاب', url: 'https://github.com' },
        { title: 'استک‌اورفلو', url: 'https://stackoverflow.com' }
    ],

    getFaviconUrl: function (url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch (error) {
            return `https://www.google.com/s2/favicons?domain=${url}&sz=64`;
        }
    },

    init: function () {
        if (AppState.quickLinks.length === 0) {
            AppState.quickLinks = [...this.defaultLinks];
            Storage.set('quickLinks', AppState.quickLinks);
        }

        this.render();
        this.attachEventListeners();
    },

    attachEventListeners: function () {
        document.getElementById('addQuickLinkBtn').addEventListener('click', () => {
            this.openAddLinkModal();
        });

        document.getElementById('saveLinkBtn').addEventListener('click', () => {
            this.saveLink();
        });

        document.getElementById('closeLinkModalBtn').addEventListener('click', () => {
            this.closeAddLinkModal();
        });

        // Close modal on outside click
        document.getElementById('addLinkModal').addEventListener('click', (e) => {
            if (e.target.id === 'addLinkModal') {
                this.closeAddLinkModal();
            }
        });
    },

    render: function () {
        const grid = document.getElementById('quickAccessGrid');
        grid.innerHTML = '';

        AppState.quickLinks.forEach((link, index) => {
            const linkElement = this.createLinkElement(link, index);
            grid.appendChild(linkElement);
        });
    },

    createLinkElement: function (link, index) {
        const linkDiv = document.createElement('a');
        linkDiv.href = link.url;
        linkDiv.target = '_blank';
        linkDiv.className = 'quick-access-item';

        const faviconUrl = this.getFaviconUrl(link.url);
        linkDiv.innerHTML = `
            <img src="${faviconUrl}" alt="${this.escapeHtml(link.title)}" class="favicon-icon" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27%3E%3Cpath fill=%27%23fff%27 d=%27M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5%27/%3E%3C/svg%3E'">
            <span class="title">${this.escapeHtml(link.title)}</span>
            <button class="remove-btn" data-index="${index}">×</button>
        `;

        const removeBtn = linkDiv.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeLink(index);
        });

        return linkDiv;
    },

    removeLink: function (index) {
        if (confirm('آیا مطمئن هستید که می‌خواهید این لینک را حذف کنید؟')) {
            AppState.quickLinks.splice(index, 1);
            Storage.set('quickLinks', AppState.quickLinks);
            this.render();
        }
    },

    openAddLinkModal: function () {
        const modal = document.getElementById('addLinkModal');
        document.getElementById('linkTitleInput').value = '';
        document.getElementById('linkUrlInput').value = '';
        modal.classList.add('active');
    },

    closeAddLinkModal: function () {
        const modal = document.getElementById('addLinkModal');
        modal.classList.remove('active');
    },

    saveLink: function () {
        const title = document.getElementById('linkTitleInput').value.trim();
        const url = document.getElementById('linkUrlInput').value.trim();

        if (!title || !url) {
            alert('لطفاً عنوان و آدرس را وارد کنید');
            return;
        }

        // Validate URL
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'https://' + url;
        }

        const newLink = {
            title,
            url: fullUrl
        };

        AppState.quickLinks.push(newLink);
        Storage.set('quickLinks', AppState.quickLinks);
        this.render();
        this.closeAddLinkModal();
    },

    escapeHtml: function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

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

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    Search.init();
    QuickAccess.init();
    Calendar.init();
    Notes.init();
    DateNotes.init();
});
