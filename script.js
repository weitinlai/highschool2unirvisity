// 時間軸管理類
class TimelineManager {
    constructor() {
        this.timelineData = null;
        this.timelineContainer = document.getElementById('timeline');
        this.lastUpdateElement = document.getElementById('lastUpdate');
        this.init();
    }

    // 初始化
    async init() {
        try {
            await this.loadTimelineData();
            this.renderTimeline();
            this.updateLastUpdateTime();
        } catch (error) {
            console.error('初始化失敗:', error);
            // 嘗試使用預設資料
            this.timelineData = this.getDefaultData();
            this.renderTimeline();
            this.updateLastUpdateTime();
            console.log('使用預設資料作為備用方案');
        }
    }

    // 載入時程資料
    async loadTimelineData() {
        try {
            const response = await fetch('timeline-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.timelineData = await response.json();
        } catch (error) {
            console.error('載入資料失敗:', error);
            // 如果無法載入 JSON 檔案，使用內建的範例資料
            this.timelineData = this.getDefaultData();
            console.log('使用預設資料');
        }
    }

    // 取得預設資料
    getDefaultData() {
        return {
            "lastUpdate": "2024-01-15",
            "timeline": [
                {
                    "id": "special-1",
                    "pathway": "特殊選才",
                    "item": "報名截止",
                    "date": "2024-11-15",
                    "preparation": ["自傳、學習歷程檔案", "推薦函", "特殊表現證明"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                },
                {
                    "id": "special-2", 
                    "pathway": "特殊選才",
                    "item": "面試日",
                    "date": "2024-12-01",
                    "preparation": ["面試準備", "作品集", "口試練習"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                },
                {
                    "id": "special-3",
                    "pathway": "特殊選才", 
                    "item": "放榜日",
                    "date": "2024-12-15",
                    "preparation": ["確認錄取", "繳交保證金", "放棄其他管道"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                },
                {
                    "id": "gsat-1",
                    "pathway": "申請入學",
                    "item": "學測考試",
                    "date": "2025-01-18",
                    "preparation": ["學科能力複習", "模擬考試", "考試用品準備"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                },
                {
                    "id": "application-1",
                    "pathway": "申請入學",
                    "item": "報名截止",
                    "date": "2025-03-15",
                    "preparation": ["自傳、學習歷程", "備審資料", "推薦函"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                },
                {
                    "id": "application-2",
                    "pathway": "申請入學",
                    "item": "面試日",
                    "date": "2025-04-15",
                    "preparation": ["面試準備", "作品集", "口試練習"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                },
                {
                    "id": "application-3",
                    "pathway": "申請入學",
                    "item": "放榜日",
                    "date": "2025-05-15",
                    "preparation": ["確認錄取", "繳交保證金", "放棄其他管道"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                },
                {
                    "id": "subject-1",
                    "pathway": "分發入學",
                    "item": "分科測驗",
                    "date": "2025-07-12",
                    "preparation": ["分科能力複習", "模擬考試", "考試用品準備"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                },
                {
                    "id": "distribution-1",
                    "pathway": "分發入學",
                    "item": "志願選填",
                    "date": "2025-07-25",
                    "preparation": ["填寫志願", "科系研究", "分數落點分析"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                },
                {
                    "id": "distribution-2",
                    "pathway": "分發入學",
                    "item": "放榜日",
                    "date": "2025-08-07",
                    "preparation": ["確認錄取", "報到準備", "宿舍申請"],
                    "schools": ["台大", "清大", "交大", "成大", "政大", "中央"]
                }
            ]
        };
    }

    // 渲染時間軸
    renderTimeline() {
        if (!this.timelineData || !this.timelineData.timeline) {
            this.showError('時程資料格式錯誤');
            return;
        }

        // 按日期排序
        const sortedTimeline = [...this.timelineData.timeline].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        // 清空容器
        this.timelineContainer.innerHTML = '';

        // 渲染每個時間點
        sortedTimeline.forEach((item, index) => {
            const timelineItem = this.createTimelineItem(item, index);
            this.timelineContainer.appendChild(timelineItem);
        });
    }

    // 創建時間軸項目
    createTimelineItem(item, index) {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${this.getPathwayClass(item.pathway)}`;
        
        // 檢查是否為緊急項目（7天內）
        const daysUntil = this.calculateDaysUntil(item.date);
        if (daysUntil <= 7 && daysUntil >= 0) {
            timelineItem.classList.add('urgent');
        }

        // 計算位置（均勻分布在時間軸上）
        const totalItems = this.timelineData.timeline.length;
        const position = (index / (totalItems - 1)) * 100;
        
        timelineItem.style.left = `${position}%`;
        
        // 決定標籤位置（上下交替）
        const labelPosition = index % 2 === 0 ? 'top' : 'bottom';
        
        timelineItem.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-label ${labelPosition}">
                <div class="timeline-date">${this.formatDateShort(item.date)}</div>
                <div class="timeline-event">${item.item}</div>
                <div class="timeline-pathway">${item.pathway}</div>
            </div>
        `;
        
        // 添加點擊事件
        timelineItem.addEventListener('click', (e) => {
            if (this.isEditMode) {
                // 編輯模式下點擊編輯按鈕
                if (e.target.classList.contains('edit-icon')) {
                    this.openEditModal(item);
                }
            } else {
                // 一般模式下顯示詳情
                this.showModal(item);
            }
        });

        return timelineItem;
    }

    // 創建準備項目區塊
    createPreparationSection(preparation) {
        if (!preparation || preparation.length === 0) return '';
        
        return `
            <div class="timeline-preparation">
                <h4>準備項目</h4>
                <ul class="preparation-list">
                    ${preparation.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // 創建申請學校區塊
    createSchoolsSection(schools) {
        if (!schools || schools.length === 0) return '';
        
        return `
            <div class="timeline-schools">
                <h4>申請學校</h4>
                <div class="schools-list">
                    ${schools.map(school => `<span class="school-tag">${school}</span>`).join('')}
                </div>
            </div>
        `;
    }

    // 計算剩餘天數
    calculateDaysUntil(dateString) {
        const targetDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);
        
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    // 取得倒數文字
    getCountdownText(days) {
        if (days < 0) {
            return '已過期';
        } else if (days === 0) {
            return '今天';
        } else if (days === 1) {
            return '明天';
        } else if (days <= 7) {
            return `${days}天`;
        } else if (days <= 30) {
            return `${days}天`;
        } else {
            return `${days}天`;
        }
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    // 格式化日期（簡短格式）
    formatDateShort(dateString) {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}月${day}日`;
    }

    // 取得升學管道對應的CSS類別
    getPathwayClass(pathway) {
        switch (pathway) {
            case '特殊選才':
                return 'special-selection';
            case '申請入學':
                return 'application';
            case '分發入學':
                return 'distribution';
            default:
                return 'special-selection';
        }
    }

    // 更新最後更新時間
    updateLastUpdateTime() {
        if (this.timelineData && this.timelineData.lastUpdate) {
            this.lastUpdateElement.textContent = this.timelineData.lastUpdate;
        }
    }

    // 顯示彈出視窗
    showModal(item) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modalBody');
        
        const daysUntil = this.calculateDaysUntil(item.date);
        const countdownText = this.getCountdownText(daysUntil);
        
        const pathwayClass = this.getPathwayClass(item.pathway);
        const isUrgent = daysUntil <= 7 && daysUntil >= 0;
        
        modalBody.innerHTML = `
            <div class="modal-header">
                <h2>${item.item}</h2>
                <div class="modal-pathway ${pathwayClass}">${item.pathway}</div>
                <div class="modal-date">${this.formatDate(item.date)}</div>
                <div class="modal-countdown ${pathwayClass} ${isUrgent ? 'urgent' : ''}">${countdownText}</div>
            </div>
            
            ${this.createPreparationSection(item.preparation)}
            ${this.createSchoolsSection(item.schools)}
        `;
        
        modal.style.display = 'block';
        
        // 添加關閉事件
        const closeBtn = document.querySelector('.close');
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
        
        // 點擊背景關閉
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // 顯示錯誤訊息
    showError(message) {
        this.timelineContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <h3>載入失敗</h3>
                <p>${message}</p>
                <p>請檢查 timeline-data.json 檔案是否存在且格式正確</p>
            </div>
        `;
    }

    // 重新載入資料（供外部調用）
    async reload() {
        try {
            await this.loadTimelineData();
            this.renderTimeline();
            this.updateLastUpdateTime();
        } catch (error) {
            console.error('重新載入失敗:', error);
            this.showError('重新載入時程資料失敗');
        }
    }

    // 初始化管理功能
    initManagement() {
        this.isEditMode = false;
        this.currentEditingItem = null;
        
        // 綁定管理按鈕事件
        document.getElementById('addEventBtn').addEventListener('click', () => {
            this.openEditModal();
        });
        
        document.getElementById('editModeBtn').addEventListener('click', () => {
            this.toggleEditMode();
        });
        
        document.getElementById('exportDataBtn').addEventListener('click', () => {
            this.exportData();
        });
        
        // 綁定表單事件
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEvent();
        });
        
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeEditModal();
        });
        
        document.getElementById('deleteEventBtn').addEventListener('click', () => {
            this.deleteEvent();
        });
        
        // 綁定關閉按鈕事件
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });
    }

    // 切換編輯模式
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editBtn = document.getElementById('editModeBtn');
        
        if (this.isEditMode) {
            document.body.classList.add('edit-mode');
            editBtn.textContent = '退出編輯';
            editBtn.classList.remove('btn-secondary');
            editBtn.classList.add('btn-danger');
        } else {
            document.body.classList.remove('edit-mode');
            editBtn.textContent = '編輯模式';
            editBtn.classList.remove('btn-danger');
            editBtn.classList.add('btn-secondary');
        }
        
        this.renderTimeline();
    }

    // 開啟編輯視窗
    openEditModal(item = null) {
        const modal = document.getElementById('editModal');
        const title = document.getElementById('editModalTitle');
        const deleteBtn = document.getElementById('deleteEventBtn');
        
        if (item) {
            // 編輯現有項目
            title.textContent = '編輯事件';
            deleteBtn.style.display = 'inline-block';
            this.currentEditingItem = item;
            this.fillEditForm(item);
        } else {
            // 新增項目
            title.textContent = '新增事件';
            deleteBtn.style.display = 'none';
            this.currentEditingItem = null;
            this.clearEditForm();
        }
        
        modal.style.display = 'block';
    }

    // 關閉編輯視窗
    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditingItem = null;
    }

    // 填寫編輯表單
    fillEditForm(item) {
        document.getElementById('eventId').value = item.id;
        document.getElementById('eventPathway').value = item.pathway;
        document.getElementById('eventItem').value = item.item;
        document.getElementById('eventDate').value = item.date;
        document.getElementById('eventPreparation').value = item.preparation.join('\n');
        document.getElementById('eventSchools').value = item.schools.join('\n');
    }

    // 清空編輯表單
    clearEditForm() {
        document.getElementById('eventId').value = '';
        document.getElementById('eventPathway').value = '特殊選才';
        document.getElementById('eventItem').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventPreparation').value = '';
        document.getElementById('eventSchools').value = '';
    }

    // 儲存事件
    saveEvent() {
        const formData = new FormData(document.getElementById('eventForm'));
        const eventData = {
            id: formData.get('id'),
            pathway: formData.get('pathway'),
            item: formData.get('item'),
            date: formData.get('date'),
            preparation: formData.get('preparation').split('\n').filter(item => item.trim()),
            schools: formData.get('schools').split('\n').filter(item => item.trim())
        };
        
        if (this.currentEditingItem) {
            // 更新現有項目
            const index = this.timelineData.timeline.findIndex(item => item.id === this.currentEditingItem.id);
            if (index !== -1) {
                this.timelineData.timeline[index] = eventData;
            }
        } else {
            // 新增項目
            this.timelineData.timeline.push(eventData);
        }
        
        // 更新最後修改時間
        this.timelineData.lastUpdate = new Date().toISOString().split('T')[0];
        
        // 重新渲染時間軸
        this.renderTimeline();
        this.updateLastUpdateTime();
        
        // 關閉編輯視窗
        this.closeEditModal();
        
        // 顯示成功訊息
        alert('事件已儲存！');
    }

    // 刪除事件
    deleteEvent() {
        if (this.currentEditingItem && confirm('確定要刪除這個事件嗎？')) {
            const index = this.timelineData.timeline.findIndex(item => item.id === this.currentEditingItem.id);
            if (index !== -1) {
                this.timelineData.timeline.splice(index, 1);
                this.renderTimeline();
                this.updateLastUpdateTime();
                this.closeEditModal();
                alert('事件已刪除！');
            }
        }
    }

    // 匯出資料
    exportData() {
        const dataStr = JSON.stringify(this.timelineData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'timeline-data.json';
        link.click();
        URL.revokeObjectURL(url);
    }
}

// 工具函數
const Utils = {
    // 檢查日期格式
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    // 驗證JSON資料結構
    validateTimelineData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        if (!Array.isArray(data.timeline)) {
            return false;
        }
        
        for (const item of data.timeline) {
            if (!item.id || !item.pathway || !item.item || !item.date) {
                return false;
            }
            
            if (!this.isValidDate(item.date)) {
                return false;
            }
        }
        
        return true;
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    // 創建時間軸管理器
    window.timelineManager = new TimelineManager();
    
    // 初始化管理功能
    window.timelineManager.initManagement();
    
    // 添加鍵盤快捷鍵支援
    document.addEventListener('keydown', (e) => {
        // Ctrl+R 或 F5 重新載入資料
        if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
            e.preventDefault();
            window.timelineManager.reload();
        }
    });
    
    // 添加自動刷新功能（每5分鐘檢查一次）
    setInterval(() => {
        window.timelineManager.reload();
    }, 5 * 60 * 1000);
});

// 添加一些實用的全域函數
window.refreshTimeline = () => {
    if (window.timelineManager) {
        window.timelineManager.reload();
    }
};

window.exportTimeline = () => {
    if (window.timelineManager && window.timelineManager.timelineData) {
        const dataStr = JSON.stringify(window.timelineManager.timelineData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'timeline-backup.json';
        link.click();
        URL.revokeObjectURL(url);
    }
};
