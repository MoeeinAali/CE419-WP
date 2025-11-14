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

