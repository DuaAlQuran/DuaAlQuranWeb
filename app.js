let savedDuas = JSON.parse(localStorage.getItem('savedDuas')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {
    fontFamily: "'Scheherazade New', serif",
    fontSize: 18,
    reduceMotion: false,
    theme: 'light'
};

let lastScrollY = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    renderDuas();
    updateSavedCount();
    initSearch();
    initScrollBehavior();
});

function loadSettings() {
    applySettings();
    
    document.getElementById('fontFamily').value = settings.fontFamily;
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';
    document.getElementById('reduceMotion').checked = settings.reduceMotion;
    
    if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.getElementById('themeIcon').textContent = 'light_mode';
    } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('themeIcon').textContent = 'dark_mode';
    }
}

function applySettings() {
    if (settings.reduceMotion) {
        document.body.style.transition = 'none';
    } else {
        document.body.style.transition = '';
    }
}

function renderDuas(duasToRender = duasData) {
    const container = document.getElementById('duasContainer');
    container.innerHTML = '';
    
    duasToRender.forEach(dua => {
        const isSaved = savedDuas.some(saved => saved.id === dua.id);
        const duaElement = createDuaElement(dua, isSaved);
        container.appendChild(duaElement);
    });
    
    if (duasToRender.length === 0) {
        container.innerHTML = `
            <div class="text-center py-20">
                <span class="material-symbols-outlined text-6xl text-gray-400">search_off</span>
                <p class="text-lg text-gray-500 mt-4">لم يتم العثور على نتائج</p>
            </div>
        `;
    }
}

function createDuaElement(dua, isSaved) {
    const div = document.createElement('div');
    div.className = `flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 min-h-14 justify-between transition-all ${
        isSaved 
            ? 'bg-teal-highlight-light dark:bg-teal-highlight-dark' 
            : 'bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10'
    }`;
    
    div.innerHTML = `
        <div class="flex flex-1 items-center gap-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg ${
                isSaved 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-gray-200 dark:bg-white/10'
            }">
                <span class="material-symbols-outlined ${isSaved ? 'filled' : ''} text-2xl ${
                    isSaved ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }">star</span>
            </div>
            <p class="flex-1 text-base font-normal leading-normal font-arabic" style="font-family: ${settings.fontFamily}; font-size: ${settings.fontSize}px; line-height: 1.8;">${dua.text}</p>
        </div>
    `;
    
    div.onclick = () => toggleDuaSave(dua.id);
    
    return div;
}

function toggleDuaSave(duaId) {
    const dua = duasData.find(d => d.id === duaId);
    if (!dua) return;
    
    const index = savedDuas.findIndex(d => d.id === duaId);
    
    if (index !== -1) {
        savedDuas.splice(index, 1);
        showToast('تم إلغاء الحفظ');
    } else {
        savedDuas.push(dua);
        showToast('تم الحفظ بنجاح ✓');
    }
    
    localStorage.setItem('savedDuas', JSON.stringify(savedDuas));
    updateSavedCount();
    
    const searchValue = document.getElementById('searchInput').value;
    if (searchValue) {
        const filtered = duasData.filter(d => 
            d.text.toLowerCase().includes(searchValue.toLowerCase())
        );
        renderDuas(filtered);
    } else {
        renderDuas();
    }
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query === '') {
            renderDuas();
        } else {
            const filtered = duasData.filter(dua => 
                dua.text.toLowerCase().includes(query)
            );
            renderDuas(filtered);
        }
    });
}

function initScrollBehavior() {
    const topBar = document.getElementById('topBar');
    const searchBar = document.getElementById('searchBar');
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
            topBar.classList.add('header-hidden');
            searchBar.classList.add('header-hidden');
        } else if (currentScrollY < lastScrollY) {
            topBar.classList.remove('header-hidden');
            searchBar.classList.remove('header-hidden');
        }
        
        lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
    }, false);
}

function updateSavedCount() {
    document.getElementById('savedCountBadge').textContent = savedDuas.length;
}

function openJamiDua() {
    const modal = document.getElementById('jamiModal');
    const list = document.getElementById('jamiDuasList');
    
    list.innerHTML = '<div class="flex flex-col gap-2">';
    
    duasData.forEach(dua => {
        const isSaved = savedDuas.some(saved => saved.id === dua.id);
        const duaElement = createJamiDuaElement(dua, isSaved);
        list.innerHTML += duaElement;
    });
    
    list.innerHTML += '</div>';
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function createJamiDuaElement(dua, isSaved) {
    return `
        <div onclick="toggleDuaInJami(${dua.id})" class="flex cursor-pointer items-center gap-4 rounded-xl px-4 py-3 min-h-14 justify-between transition-all ${
            isSaved 
                ? 'bg-teal-highlight-light dark:bg-teal-highlight-dark' 
                : 'bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10'
        }">
            <div class="flex flex-1 items-center gap-4">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg ${
                    isSaved 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-gray-200 dark:bg-white/10'
                }">
                    <span class="material-symbols-outlined ${isSaved ? 'filled' : ''} text-2xl ${
                        isSaved ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                    }">star</span>
                </div>
                <p class="flex-1 text-base font-normal leading-normal font-arabic" style="font-family: ${settings.fontFamily}; font-size: ${settings.fontSize}px; line-height: 1.8;">${dua.text}</p>
            </div>
        </div>
    `;
}

function toggleDuaInJami(duaId) {
    const dua = duasData.find(d => d.id === duaId);
    if (!dua) return;
    
    const index = savedDuas.findIndex(d => d.id === duaId);
    
    if (index !== -1) {
        savedDuas.splice(index, 1);
        showToast('تم إلغاء الحفظ');
    } else {
        savedDuas.push(dua);
        showToast('تم الحفظ بنجاح ✓');
    }
    
    localStorage.setItem('savedDuas', JSON.stringify(savedDuas));
    updateSavedCount();
    renderDuas();
    openJamiDua();
}

function closeJamiModal() {
    const modal = document.getElementById('jamiModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function updateSettings() {
    settings.fontFamily = document.getElementById('fontFamily').value;
    settings.fontSize = parseInt(document.getElementById('fontSize').value);
    settings.reduceMotion = document.getElementById('reduceMotion').checked;
    
    document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';
    
    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings();
    renderDuas();
}

function toggleTheme() {
    const html = document.documentElement;
    const icon = document.getElementById('themeIcon');
    
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        settings.theme = 'light';
        icon.textContent = 'dark_mode';
        showToast('الوضع النهاري');
    } else {
        html.classList.add('dark');
        settings.theme = 'dark';
        icon.textContent = 'light_mode';
        showToast('الوضع الليلي');
    }
    
    localStorage.setItem('settings', JSON.stringify(settings));
}

function exportData() {
    const data = {
        savedDuas: savedDuas,
        settings: settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duas-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('تم تصدير البيانات ✓');
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-primary text-background-dark px-6 py-4 rounded-full shadow-lg';
    toast.innerHTML = `
        <span class="material-symbols-outlined">check_circle</span>
        <span class="font-bold">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'jamiModal') {
        closeJamiModal();
    }
    if (e.target.id === 'settingsModal') {
        closeSettings();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeJamiModal();
        closeSettings();
    }
});
