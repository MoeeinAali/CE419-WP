// ===== Quick Access Management =====
const QuickAccess = {
    defaultLinks: [
        { title: 'گیت‌هاب', url: 'https://github.com' },
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
        
        // Create image element
        const img = document.createElement('img');
        img.src = faviconUrl;
        img.alt = link.title;
        img.className = 'favicon-icon';
        linkDiv.appendChild(img);

        // Create title span
        const titleSpan = document.createElement('span');
        titleSpan.className = 'title';
        titleSpan.textContent = link.title;
        linkDiv.appendChild(titleSpan);

        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.setAttribute('data-index', index);
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.removeLink(index);
        });
        linkDiv.appendChild(removeBtn);

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

};

