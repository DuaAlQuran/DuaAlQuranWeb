let currentDua = null;
let savedDuas = JSON.parse(localStorage.getItem('savedDuas')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {
    fontFamily: "'Scheherazade New', serif",
    fontSize: 20,
    accentColor: '#ffd700',
    reduceMotion: false,
    theme: 'dark'
};

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    renderDuas();
    updateSavedCount();
    initSearch();
});

function loadSettings() {
    applySettings();
    
    document.getElementById('fontFamily').value = settings.fontFamily;
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';
    document.getElementById('reduceMotion').checked = settings.reduceMotion;
    
    if (settings.theme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        document.getElementById('theme-icon').className = 'fas fa-sun';
    }
}

function applySettings() {
    document.documentElement.style.setProperty('--font-family', settings.fontFamily);
    document.documentElement.style.setProperty('--font-size', settings.fontSize + 'px');
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    
    if (settings.reduceMotion) {
        document.body.classList.add('reduce-motion');
    } else {
        document.body.classList.remove('reduce-motion');
    }
}

function renderDuas(duasToRender = duasData) {
    const grid = document.getElementById('duaGrid');
    grid.innerHTML = '';
    
    duasToRender.forEach(dua => {
        const isSaved = savedDuas.some(saved => saved.id === dua.id);
        const card = document.createElement('div');
        card.className = `cosmic-dua-card ${isSaved ? 'saved' : ''}`;
        card.onclick = () => openDuaModal(dua);
        
        card.innerHTML = `
            <div class="dua-header">
                <i class="${isSaved ? 'fas' : 'far'} fa-bookmark bookmark-icon" 
                   onclick="event.stopPropagation(); quickToggleSave(${dua.id})"></i>
            </div>
            <div class="dua-text">${dua.text}</div>
        `;
        
        grid.appendChild(card);
    });
    
    if (duasToRender.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <p>لم يتم العثور على نتائج</p>
            </div>
        `;
    }
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query === '') {
            renderDuas();
        } else {
            searchDuas();
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchDuas();
        }
    });
}

function searchDuas() {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!query) {
        renderDuas();
        return;
    }
    
    const filtered = duasData.filter(dua => 
        dua.text.toLowerCase().includes(query)
    );
    
    renderDuas(filtered);
}

function openDuaModal(dua) {
    currentDua = dua;
    const modal = document.getElementById('duaModal');
    const isSaved = savedDuas.some(saved => saved.id === dua.id);
    
    document.getElementById('modalTitle').textContent = 'دعاء من القرآن الكريم';
    document.getElementById('modalText').textContent = dua.text;
    
    const saveBtn = document.getElementById('saveBtn');
    if (isSaved) {
        saveBtn.classList.add('saved');
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i><span>محفوظ</span>';
    } else {
        saveBtn.classList.remove('saved');
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i><span>حفظ</span>';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('duaModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentDua = null;
}

function copyDua() {
    if (!currentDua) return;
    
    const text = currentDua.text;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('تم النسخ بنجاح ✓', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('تم النسخ بنجاح ✓', 'success');
    });
}

function toggleSave() {
    if (!currentDua) return;
    
    const index = savedDuas.findIndex(dua => dua.id === currentDua.id);
    const saveBtn = document.getElementById('saveBtn');
    
    if (index !== -1) {
        savedDuas.splice(index, 1);
        saveBtn.classList.remove('saved');
        saveBtn.innerHTML = '<i class="far fa-bookmark"></i><span>حفظ</span>';
        showToast('تم إلغاء الحفظ', 'info');
    } else {
        savedDuas.push(currentDua);
        saveBtn.classList.add('saved');
        saveBtn.innerHTML = '<i class="fas fa-bookmark"></i><span>محفوظ</span>';
        showToast('تم الحفظ بنجاح ✓', 'success');
    }
    
    localStorage.setItem('savedDuas', JSON.stringify(savedDuas));
    updateSavedCount();
    renderDuas(document.getElementById('searchInput').value ? 
        duasData.filter(dua => 
            dua.text.toLowerCase().includes(document.getElementById('searchInput').value.toLowerCase())
        ) : duasData
    );
}

function quickToggleSave(duaId) {
    const dua = duasData.find(d => d.id === duaId);
    if (!dua) return;
    
    const index = savedDuas.findIndex(d => d.id === duaId);
    
    if (index !== -1) {
        savedDuas.splice(index, 1);
        showToast('تم إلغاء الحفظ', 'info');
    } else {
        savedDuas.push(dua);
        showToast('تم الحفظ بنجاح ✓', 'success');
    }
    
    localStorage.setItem('savedDuas', JSON.stringify(savedDuas));
    updateSavedCount();
    renderDuas(document.getElementById('searchInput').value ? 
        duasData.filter(d => 
            d.text.toLowerCase().includes(document.getElementById('searchInput').value.toLowerCase())
        ) : duasData
    );
}

function shareDua() {
    if (!currentDua) return;
    
    const text = currentDua.text;
    
    if (navigator.share) {
        navigator.share({
            title: 'دعاء من القرآن الكريم',
            text: text
        }).then(() => {
            showToast('تمت المشاركة بنجاح', 'success');
        }).catch(() => {
            copyDua();
        });
    } else {
        copyDua();
    }
}

function updateSavedCount() {
    document.getElementById('savedCount').textContent = savedDuas.length;
}

function openCollectivePrayer() {
    const modal = document.getElementById('collectiveModal');
    const list = document.getElementById('savedDuasList');
    
    if (savedDuas.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bookmark"></i>
                <p>لا توجد أدعية محفوظة بعد</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">اضغط على أيقونة الحفظ على أي دعاء لإضافته هنا</p>
            </div>
        `;
    } else {
        list.innerHTML = savedDuas.map(dua => `
            <div class="saved-dua-item">
                <div class="saved-dua-content" onclick="openDuaModal(${JSON.stringify(dua).replace(/"/g, '&quot;')})">
                    <div class="saved-dua-text">${dua.text}</div>
                </div>
                <div class="saved-dua-actions">
                    <button class="small-btn" onclick="copyDuaFromList(${dua.id})" title="نسخ">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="small-btn" onclick="removeSavedDua(${dua.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCollectiveModal() {
    const modal = document.getElementById('collectiveModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function copyDuaFromList(duaId) {
    const dua = savedDuas.find(d => d.id === duaId);
    if (!dua) return;
    
    const text = dua.text;
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('تم النسخ بنجاح ✓', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('تم النسخ بنجاح ✓', 'success');
    });
}

function removeSavedDua(duaId) {
    savedDuas = savedDuas.filter(d => d.id !== duaId);
    localStorage.setItem('savedDuas', JSON.stringify(savedDuas));
    updateSavedCount();
    openCollectivePrayer();
    renderDuas(document.getElementById('searchInput').value ? 
        duasData.filter(dua => 
            dua.text.toLowerCase().includes(document.getElementById('searchInput').value.toLowerCase())
        ) : duasData
    );
    showToast('تم الحذف', 'info');
}

function openSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function updateSettings() {
    settings.fontFamily = document.getElementById('fontFamily').value;
    settings.fontSize = parseInt(document.getElementById('fontSize').value);
    settings.reduceMotion = document.getElementById('reduceMotion').checked;
    
    document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';
    
    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings();
    renderDuas(document.getElementById('searchInput').value ? 
        duasData.filter(dua => 
            dua.text.toLowerCase().includes(document.getElementById('searchInput').value.toLowerCase())
        ) : duasData
    );
}

function setAccentColor(color) {
    settings.accentColor = color;
    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings();
    
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    showToast('تم تغيير اللون', 'success');
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    settings.theme = newTheme;
    localStorage.setItem('settings', JSON.stringify(settings));
    
    const icon = document.getElementById('theme-icon');
    icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    
    showToast(newTheme === 'light' ? 'الوضع النهاري' : 'الوضع الليلي', 'info');
}

function resetSettings() {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) return;
    
    settings = {
        fontFamily: "'Scheherazade New', serif",
        fontSize: 20,
        accentColor: '#ffd700',
        reduceMotion: false,
        theme: 'dark'
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    loadSettings();
    renderDuas();
    closeSettings();
    showToast('تم إعادة تعيين الإعدادات', 'success');
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
    
    showToast('تم تصدير البيانات ✓', 'success');
}

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'duaModal') closeModal();
        if (e.target.id === 'collectiveModal') closeCollectiveModal();
        if (e.target.id === 'settingsModal') closeSettings();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            if (activeModal.id === 'duaModal') closeModal();
            if (activeModal.id === 'collectiveModal') closeCollectiveModal();
            if (activeModal.id === 'settingsModal') closeSettings();
        }
    }
});
