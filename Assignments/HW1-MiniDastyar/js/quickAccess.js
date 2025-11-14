// ===== Quick Access Management =====
const QuickAccess = {
    defaultLinks: [
        { title: 'گیت‌هاب', url: 'https://github.com' },
        { title: 'استک‌اورفلو', url: 'https://stackoverflow.com' },
        { title: 'جمنای', url: 'https://gemini.google.com/app' },
        { title: 'کوئرا', url: 'https://quera.ir' },
        { title: 'بایت', url: 'https://byte-mag.ir' },
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
            <img src="${faviconUrl}" alt="${this.escapeHtml(link.title)}" class="favicon-icon" onerror="this.src='assets/default-favicon.svg'">
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

