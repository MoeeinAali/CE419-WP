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

