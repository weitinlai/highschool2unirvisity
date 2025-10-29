import { db, doc, getDoc, setDoc } from './firebase-config.js';

// 時間軸管理類
class TimelineManager {
    constructor() {
        this.timelineData = null;
        this.timelineContainer = document.getElementById('timeline');
        this.lastUpdateElement = document.getElementById('lastUpdate');
        // 導航焦點日期：左右箭頭以此為基準尋找上一/下一事件
        this.navigationFocusDate = null;
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

    // 從 Firestore 載入資料
    async loadFromFirestore() {
        try {
            const docRef = doc(db, 'timeline', 'data');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                this.timelineData = docSnap.data();
                console.log('從 Firestore 載入資料成功');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Firestore 載入失敗:', error);
            return false;
        }
    }

    // 儲存到 Firestore
    async saveToFirestore() {
        try {
            const docRef = doc(db, 'timeline', 'data');
            await setDoc(docRef, this.timelineData);
            console.log('資料已同步至 Firestore');
        } catch (error) {
            console.error('Firestore 儲存失敗:', error);
            this.showSuccessMessage('⚠️ 資料同步失敗，請檢查網路');
        }
    }

    // 載入時程資料
    async loadTimelineData() {
        try {
            // 優先從 Firestore 載入
            const loaded = await this.loadFromFirestore();
            if (loaded) return;
            
            // Firestore 無資料，從 JSON 初始化
            const response = await fetch(`timeline-data.json?ts=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.timelineData = await response.json();
            
            // 上傳初始資料至 Firestore
            await this.saveToFirestore();
        } catch (error) {
            console.error('載入資料失敗:', error);
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

        // 添加現在時間指示器
        this.addNowIndicator(sortedTimeline);

        // 渲染每個時間點
        sortedTimeline.forEach((item, index) => {
            const timelineItem = this.createTimelineItem(item, index);
            this.timelineContainer.appendChild(timelineItem);
        });

        // 更新大學分類：圓形輪播（直接點圈內學校）
        this.renderUniversityCircles();
    }

    // 添加現在時間指示器
    addNowIndicator(sortedTimeline) {
        const now = new Date();
        const nowIndicator = document.createElement('div');
        nowIndicator.className = 'timeline-now';
        
        // 計算現在時間在時間軸上的位置
        const position = this.calculateEventPosition(now);
        
        nowIndicator.style.left = `${position}px`;
        
        const nowLabel = document.createElement('div');
        nowLabel.className = 'timeline-now-label';
        nowLabel.textContent = `現在 ${this.formatTime(now)}`;
        
        const nowLine = document.createElement('div');
        nowLine.className = 'timeline-now-line';
        
        nowIndicator.appendChild(nowLabel);
        nowIndicator.appendChild(nowLine);
        
        this.timelineContainer.appendChild(nowIndicator);
    }

    // 格式化時間
    formatTime(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}/${month}/${day}`;
    }

    // 取得狀態文字
    getStatusText(days) {
        if (days < 0) {
            return '已過期';
        } else if (days === 0) {
            return '今天';
        } else if (days === 1) {
            return '明天';
        } else if (days <= 7) {
            return `${days}天後`;
        } else if (days <= 30) {
            return `${days}天後`;
        } else {
            return `${days}天後`;
        }
    }

    // 創建時間軸項目
    createTimelineItem(item, index) {
        const timelineItem = document.createElement('div');
        timelineItem.className = `timeline-item ${this.getPathwayClass(item.pathway)}`;
        
        // 計算剩餘天數
        const daysUntil = this.calculateDaysUntil(item.date);
        const isPast = daysUntil < 0;
        const isUrgent = daysUntil <= 7 && daysUntil >= 0;
        
        // 檢查是否為緊急項目（7天內）
        if (isUrgent) {
            timelineItem.classList.add('urgent');
        }

        // 計算位置（基於當前時間範圍）
        const position = this.calculateEventPosition(item.date);
        
        timelineItem.style.left = `${position}px`;
        
        // 決定標籤位置（上下交替）
        const labelPosition = index % 2 === 0 ? 'top' : 'bottom';
        
        timelineItem.innerHTML = `
            <div class="timeline-dot"></div>
            <!-- 簡化標籤（預設顯示） -->
            <div class="timeline-label simple ${labelPosition}">
                <div class="timeline-date ${isPast ? 'past' : isUrgent ? 'urgent' : ''}">${this.formatDateShort(item.date)}</div>
                <div class="timeline-event">${item.item}</div>
            </div>
            <!-- 詳細標籤（懸停時顯示） -->
            <div class="timeline-label detailed ${labelPosition}">
                <div class="timeline-date ${isPast ? 'past' : isUrgent ? 'urgent' : ''}">${this.formatDateShort(item.date)}</div>
                <div class="timeline-event">${item.item}</div>
                <div class="timeline-pathway">${item.pathway}</div>
                <div class="timeline-status ${isPast ? 'past' : isUrgent ? 'urgent' : ''}">${this.getStatusText(daysUntil)}</div>
            </div>
        `;
        
        // 添加點擊事件
        timelineItem.addEventListener('click', (e) => {
            if (this.isEditMode) {
                // 編輯模式下點擊整個項目都可以編輯
                this.openEditModal(item);
            } else {
                // 一般模式下顯示詳情
                this.showModal(item);
            }
        });

        // 讓標籤本身點擊也觸發相同行為（與點圓點一致）
        const labels = timelineItem.querySelectorAll('.timeline-label');
        labels.forEach(label => {
            // 提升在 iOS Safari 上的可點擊性
            label.style.cursor = 'pointer';
            label.setAttribute('role', 'button');
            label.setAttribute('tabindex', '0');

            label.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isEditMode) {
                    this.openEditModal(item);
                } else {
                    this.showModal(item);
                }
            });

            // iOS 有時不觸發 click，補上 touchend
            label.addEventListener('touchend', (e) => {
                // 僅在非拖拽時觸發，避免與拖動衝突
                if (!this.isDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.isEditMode) {
                        this.openEditModal(item);
                    } else {
                        this.showModal(item);
                    }
                }
            }, { passive: false });

            // 鍵盤可存取（Enter/Space）
            label.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (this.isEditMode) {
                        this.openEditModal(item);
                    } else {
                        this.showModal(item);
                    }
                }
            });
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
        
        // 每分鐘更新現在時間指示器
        setInterval(() => {
            this.updateNowIndicator();
        }, 60000); // 每分鐘更新一次
        
        // 初始化滑動控制
        this.initTimelineScrolling();
        
        // 初始化大學區域
        this.initUniversitySection();
        
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
            
            // 顯示編輯模式提示
            this.showEditModeTip();
        } else {
            document.body.classList.remove('edit-mode');
            editBtn.textContent = '編輯模式';
            editBtn.classList.remove('btn-danger');
            editBtn.classList.add('btn-secondary');
        }
        
        this.renderTimeline();
    }

    // 顯示編輯模式提示
    showEditModeTip() {
        // 創建提示元素
        const tip = document.createElement('div');
        tip.id = 'editModeTip';
        tip.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #f39c12;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(243, 156, 18, 0.3);
            z-index: 1000;
            animation: slideDown 0.3s ease;
        `;
        tip.textContent = '編輯模式已開啟！點擊任何事件圓點來編輯或刪除';
        
        // 添加動畫樣式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(tip);
        
        // 3秒後自動隱藏
        setTimeout(() => {
            if (tip.parentNode) {
                tip.style.animation = 'slideDown 0.3s ease reverse';
                setTimeout(() => {
                    if (tip.parentNode) {
                        tip.remove();
                    }
                }, 300);
            }
        }, 3000);
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
            // 自動產生ID並填入表單
            const newId = this.generateEventId();
            document.getElementById('eventId').value = newId;
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
        // 自動產生新的ID
        const newId = this.generateEventId();
        document.getElementById('eventId').value = newId;
        document.getElementById('eventPathway').value = '特殊選才';
        document.getElementById('eventItem').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventPreparation').value = '';
        document.getElementById('eventSchools').value = '';
    }

    // 產生事件ID
    generateEventId() {
        const now = new Date();
        const timestamp = now.getTime();
        const random = Math.floor(Math.random() * 1000);
        return `event-${timestamp}-${random}`;
    }

    // 儲存事件
    async saveEvent() {
        const formData = new FormData(document.getElementById('eventForm'));
        
        // 如果是新增事件且ID為空，自動產生ID
        let eventId = formData.get('id');
        if (!this.currentEditingItem && (!eventId || eventId.trim() === '')) {
            eventId = this.generateEventId();
        }
        
        const eventData = {
            id: eventId,
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
        
        // 同步到 Firestore
        await this.saveToFirestore();
        
        // 重新渲染時間軸
        this.renderTimeline();
        this.updateLastUpdateTime();
        
        // 關閉編輯視窗
        this.closeEditModal();
        
        // 顯示成功訊息
        const action = this.currentEditingItem ? '更新' : '新增';
        this.showSuccessMessage(`✅ 事件已${action}並同步至雲端！`);
    }

    // 刪除事件
    async deleteEvent() {
        if (this.currentEditingItem) {
            const eventName = this.currentEditingItem.item;
            const eventDate = this.formatDateShort(this.currentEditingItem.date);
            
            if (confirm(`確定要刪除這個事件嗎？\n\n事件：${eventName}\n日期：${eventDate}\n\n刪除後無法復原！`)) {
                const index = this.timelineData.timeline.findIndex(item => item.id === this.currentEditingItem.id);
                if (index !== -1) {
                    this.timelineData.timeline.splice(index, 1);
                    
                    // 同步到 Firestore
                    await this.saveToFirestore();
                    
                    this.renderTimeline();
                    this.updateLastUpdateTime();
                    this.closeEditModal();
                    
                    // 顯示刪除成功提示
                    this.showSuccessMessage(`✅ 事件「${eventName}」已刪除並同步！`);
                }
            }
        }
    }

    // 顯示成功訊息
    showSuccessMessage(message) {
        const successTip = document.createElement('div');
        successTip.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #2ecc71;
            color: white;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 600;
            box-shadow: 0 4px 20px rgba(46, 204, 113, 0.3);
            z-index: 1000;
            animation: slideDown 0.3s ease;
        `;
        successTip.textContent = message;
        
        document.body.appendChild(successTip);
        
        // 2秒後自動隱藏
        setTimeout(() => {
            if (successTip.parentNode) {
                successTip.style.animation = 'slideDown 0.3s ease reverse';
                setTimeout(() => {
                    if (successTip.parentNode) {
                        successTip.remove();
                    }
                }, 300);
            }
        }, 2000);
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

    // 更新現在時間指示器
    updateNowIndicator() {
        const nowIndicator = document.querySelector('.timeline-now');
        if (nowIndicator) {
            const nowLabel = nowIndicator.querySelector('.timeline-now-label');
            if (nowLabel) {
                const now = new Date();
                nowLabel.textContent = `現在 ${this.formatTime(now)}`;
            }
        }
    }

    // 初始化時間軸滑動控制
    initTimelineScrolling() {
        // 初始化時間範圍（一個月）
        this.currentStartDate = new Date();
        this.currentStartDate.setDate(1); // 設為月初
        this.currentEndDate = new Date(this.currentStartDate);
        this.currentEndDate.setMonth(this.currentStartDate.getMonth() + 1);
        this.currentEndDate.setDate(0); // 設為上個月的最後一天
        // 初始化導航焦點為今天（不含時間）
        this.navigationFocusDate = this.getDateOnly(new Date());
        
        this.isDragging = false;
        this.dragStartX = 0;
        this.startOffset = 0;
        
        const wrapper = document.querySelector('.timeline-wrapper');
        const scrollLeftBtn = document.getElementById('scrollLeft');
        const scrollRightBtn = document.getElementById('scrollRight');
        const scrollToNowBtn = document.getElementById('scrollToNow');
        
        if (!wrapper) {
            return;
        }
        
        // 綁定拖拽事件
        this.bindDragEvents(wrapper);
        
        // 滑動控制按鈕
        if (scrollLeftBtn) {
            scrollLeftBtn.addEventListener('click', () => {
                this.scrollToPreviousEvent(); // 跳转到最近的上一个事件
            });
        }
        
        if (scrollRightBtn) {
            scrollRightBtn.addEventListener('click', () => {
                this.scrollToNextEvent(); // 跳转到最近的下一个事件
            });
        }
        
        if (scrollToNowBtn) {
            scrollToNowBtn.addEventListener('click', () => {
                this.scrollToNowTime();
            });
        }
        
        // 更新時間標籤
        this.updateTimeLabels();
    }

    // 解析日期（支援 YYYY-MM-DD 與 YYYY/MM/DD）
    parseDate(dateLike) {
        if (dateLike instanceof Date) return dateLike;
        if (typeof dateLike === 'string') {
            const m = dateLike.match(/^(\d{4})[-\/]?(\d{2}|\d{1})[-\/]?(\d{2}|\d{1})$/);
            if (m) {
                const year = parseInt(m[1], 10);
                const month = parseInt(m[2], 10) - 1;
                const day = parseInt(m[3], 10);
                return new Date(year, month, day);
            }
            return new Date(dateLike);
        }
        return new Date(dateLike);
    }

    // 取得只含日期（00:00:00）的 Date
    getDateOnly(dateLike) {
        const d = this.parseDate(dateLike);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }

    // 綁定拖拽事件
    bindDragEvents(wrapper) {
        // 滑鼠事件
        wrapper.addEventListener('mousedown', (e) => {
            this.startDrag(e.clientX);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e.clientX);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.endDrag();
        });
        
        // 觸控事件
        wrapper.addEventListener('touchstart', (e) => {
            // 在觸控開始時先不進入拖拽，避免阻止點擊
            this.touchStartX = e.touches[0].clientX;
            this.dragStartX = this.touchStartX;
            this.isDragging = false; // 先視為點擊，移動達門檻再進入拖拽
        }, { passive: false });
        
        wrapper.addEventListener('touchmove', (e) => {
            const currentX = e.touches[0].clientX;
            const threshold = 10; // 手指移動超過10px才視為拖拽
            if (!this.isDragging) {
                if (Math.abs(currentX - this.touchStartX) > threshold) {
                    this.isDragging = true;
                }
            }
            if (this.isDragging) {
                this.drag(currentX);
                e.preventDefault(); // 進入拖拽後阻止滾動與點擊
            }
        }, { passive: false });
        
        wrapper.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.endDrag();
            }
        }, { passive: true });
    }

    // 開始拖拽
    startDrag(clientX) {
        this.isDragging = true;
        this.dragStartX = clientX;
        this.startOffset = this.timelineOffset;
        document.body.style.cursor = 'grabbing';
    }

    // 拖拽中
    drag(clientX) {
        if (!this.isDragging) return;
        
        const deltaX = clientX - this.dragStartX;
        const timeline = document.querySelector('.timeline');
        const timelineWidth = timeline ? timeline.offsetWidth : 800;
        
        // 計算時間變化（基於拖拽距離）
        const timeRatio = deltaX / timelineWidth;
        const daysToMove = Math.round(timeRatio * 30); // 30天為一個月
        
        if (daysToMove !== 0) {
            this.moveTimeRange(daysToMove);
            this.dragStartX = clientX; // 重置起始點，避免累積誤差
        }
    }

    // 結束拖拽
    endDrag() {
        this.isDragging = false;
        document.body.style.cursor = '';
    }

    // 移動時間範圍
    moveTimeRange(days) {
        this.currentStartDate.setDate(this.currentStartDate.getDate() + days);
        this.currentEndDate.setDate(this.currentEndDate.getDate() + days);
        
        // 更新時間標籤
        this.updateTimeLabels();
        
        // 重新渲染時間軸
        this.renderTimeline();
    }

    // 更新時間標籤
    updateTimeLabels() {
        const startDateElement = document.getElementById('startDate');
        const endDateElement = document.getElementById('endDate');
        
        if (startDateElement && endDateElement) {
            startDateElement.textContent = this.formatTime(this.currentStartDate);
            endDateElement.textContent = this.formatTime(this.currentEndDate);
        }
    }

    // 計算事件在時間軸上的位置
    calculateEventPosition(eventDate) {
        const eventDateObj = new Date(eventDate);
        const startTime = this.currentStartDate.getTime();
        const endTime = this.currentEndDate.getTime();
        const eventTime = eventDateObj.getTime();
        
        // 計算事件在時間範圍內的位置比例
        const timeRatio = (eventTime - startTime) / (endTime - startTime);
        
        // 轉換為像素位置（時間軸寬度）
        const timeline = document.querySelector('.timeline');
        const timelineWidth = timeline ? timeline.offsetWidth : 800;
        
        return timeRatio * timelineWidth;
    }

    // 滑動到現在時間位置
    scrollToNowTime() {
        const now = new Date();
        
        // 計算現在時間應該在哪個月的範圍內
        const nowMonth = now.getMonth();
        const nowYear = now.getFullYear();
        
        // 設置當前時間範圍為現在時間所在的月份
        this.currentStartDate = new Date(nowYear, nowMonth, 1);
        this.currentEndDate = new Date(nowYear, nowMonth + 1, 0);
        // 將導航焦點重設為今天
        this.navigationFocusDate = this.getDateOnly(now);
        
        // 更新時間標籤和重新渲染
        this.updateTimeLabels();
        this.renderTimeline();
    }

    // 更新現在時間指示器位置
    updateNowIndicatorPosition() {
        const nowIndicator = document.querySelector('.timeline-now');
        if (nowIndicator) {
            // 現在時間指示器會自動跟隨滑動更新位置
            // 這裡可以添加額外的視覺效果
        }
    }

    // 初始化大學區域
    initUniversitySection() {
        // 確保時間軸資料已載入
        if (this.timelineData && this.timelineData.timeline) {
            this.renderUniversityCircles();
        }
        this.bindUniversityEvents();
    }

    // 渲染大學列表
    renderUniversityList() {
        // 已改為圓形輪播渲染
        this.renderUniversityCircles();
    }

    // 綁定大學事件
    bindUniversityEvents() {
        // 綁定大學項目點擊事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('university-item')) {
                const university = e.target.getAttribute('data-university');
                this.showUniversityPage(university);
            }
        });

        // 綁定返回按鈕事件 - 使用事件委託
        document.addEventListener('click', (e) => {
            if (e.target.id === 'backToHome') {
                console.log('返回按鈕被點擊');
                this.hideUniversityPage();
            }
        });
    }

    // 以圓形輪播呈現大學分類，填入數量與預覽
    renderUniversityCircles() {
        if (!this.timelineData || !this.timelineData.timeline) {
            console.warn('時間軸資料尚未載入，跳過大學圓形渲染');
            return;
        }

        const groups = {
            '特殊選才': new Set(),
            '申請入學': new Set(),
            '分發入學': new Set()
        };

        this.timelineData.timeline.forEach(it => {
            if (!it || !it.pathway) return;
            if (Array.isArray(it.schools)) {
                it.schools.forEach(s => {
                    const name = (s || '').trim();
                    if (name && groups[it.pathway]) groups[it.pathway].add(name);
                });
            }
        });

        const fill = (countId, previewId, set) => {
            const arr = Array.from(set);
            const countEl = document.getElementById(countId);
            const prevEl = document.getElementById(previewId);
            if (countEl) countEl.textContent = arr.length;
            if (prevEl) prevEl.innerHTML = arr.map(u => `<div class="university-item" data-university="${u}">${u}</div>`).join('');
        };

        fill('countSpecial', 'previewSpecial', groups['特殊選才']);
        fill('countApplication', 'previewApplication', groups['申請入學']);
        fill('countDistribution', 'previewDistribution', groups['分發入學']);

        const sp = document.querySelector('[data-category="特殊選才"]');
        const ap = document.querySelector('[data-category="申請入學"]');
        const dp = document.querySelector('[data-category="分發入學"]');
        if (sp) sp.classList.add('special-selection');
        if (ap) ap.classList.add('application');
        if (dp) {
            dp.classList.add('distribution');
            // 當分發入學沒有學校時先隱藏，有學校時顯示
            dp.style.display = groups['分發入學'].size === 0 ? 'none' : '';
        }
    }

    // 已移除展開邏輯：直接於圓內點擊學校項目

    // 以升學管道分類渲染大學列表（三個面板）
    renderUniversityCategories() {
        if (!this.timelineData || !this.timelineData.timeline) {
            console.warn('時間軸資料尚未載入，跳過大學分類渲染');
            return;
        }

        const groups = {
            '特殊選才': new Set(),
            '申請入學': new Set(),
            '分發入學': new Set()
        };

        this.timelineData.timeline.forEach(item => {
            if (!item || !item.pathway) return;
            if (Array.isArray(item.schools)) {
                item.schools.forEach(s => {
                    const name = (s || '').trim();
                    if (name && groups[item.pathway]) {
                        groups[item.pathway].add(name);
                    }
                });
            }
        });

        const fill = (id, set) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = Array.from(set).map(u => `
                <div class="university-item" data-university="${u}">${u}</div>
            `).join('');
        };

        fill('listSpecial', groups['特殊選才']);
        fill('listApplication', groups['申請入學']);
        fill('listDistribution', groups['分發入學']);
    }

    // 初始化大學分頁標籤與滾動同步
    initUniversityTabs() {
        const tabs = ['特殊選才', '申請入學', '分發入學'];
        const tabsEl = document.getElementById('universityTabs');
        const scroller = document.getElementById('universityCategories');

        if (!tabsEl || !scroller) return;

        tabsEl.innerHTML = tabs.map((t, i) => `
            <button class="university-tab" data-idx="${i}">${t}</button>
        `).join('');

        const updateActive = (i) => {
            const btns = tabsEl.querySelectorAll('.university-tab');
            btns.forEach((b, bi) => b.classList.toggle('active', bi === i));
        };

        tabsEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.university-tab');
            if (!btn) return;
            const i = Number(btn.dataset.idx) || 0;
            scroller.scrollTo({ left: i * scroller.clientWidth, behavior: 'smooth' });
            updateActive(i);
        });

        let ticking = false;
        scroller.addEventListener('scroll', () => {
            if (ticking) return;
            window.requestAnimationFrame(() => {
                const i = Math.round(scroller.scrollLeft / scroller.clientWidth);
                updateActive(i);
                ticking = false;
            });
            ticking = true;
        });

        updateActive(0);
    }

    // 顯示大學專頁
    showUniversityPage(universityName) {
        const universityPage = document.getElementById('universityPage');
        const universityNameElement = document.getElementById('universityName');
        
        if (!universityPage || !universityNameElement) {
            console.error('找不到大學專頁元素');
            return;
        }

        console.log('顯示大學專頁:', universityName);
        console.log('大學專頁元素:', universityPage);

        // 先顯示大學專頁 - 強制設置所有樣式
        universityPage.style.cssText = `
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1000 !important;
            background: #f8f9fa !important;
            overflow-y: auto !important;
            padding: 20px !important;
            visibility: visible !important;
            opacity: 1 !important;
        `;
        console.log('大學專頁顯示狀態:', universityPage.style.display);
        console.log('大學專頁位置:', universityPage.getBoundingClientRect());
        console.log('大學專頁完整樣式:', universityPage.style.cssText);

        // 設置大學名稱
        universityNameElement.textContent = universityName;

        // 填充大學專頁內容
        this.populateUniversityPage(universityName);
        
        // 不再隱藏整個主容器，避免同容器下的 universityPage 一起被隱藏
        // 僅顯示大學專頁本身即可覆蓋主畫面
    }

    // 隱藏大學專頁
    hideUniversityPage() {
        console.log('隱藏大學專頁');
        const universityPage = document.getElementById('universityPage');
        if (universityPage) {
            universityPage.style.display = 'none';
        }
        
        // 顯示主頁面
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'block';
        }
        console.log('已返回主頁面');
    }

    // 填充大學專頁內容
    populateUniversityPage(universityName) {
        console.log('填充大學專頁:', universityName);
        
        // 收集該大學的相關事件
        const universityEvents = this.timelineData.timeline.filter(item => 
            item.schools && item.schools.includes(universityName)
        );
        
        console.log('找到相關事件:', universityEvents.length, '個');
        console.log('相關事件:', universityEvents);

        // 填充簡章資訊
        this.populateUniversityInfo(universityName);

        // 填充相關事件
        this.populateUniversityEvents(universityEvents);

        // 填充準備資料
        this.populateUniversityPreparation(universityEvents);

        // 填充報名資訊
        this.populateUniversityRegistration(universityEvents);

        // 填充考試日期
        this.populateUniversityExamDates(universityEvents);
    }

    // 填充大學資訊
    populateUniversityInfo(universityName) {
        const infoSection = document.getElementById('universityInfo');
        if (!infoSection) return;

        infoSection.innerHTML = `
            <div class="info-item">
                <h4>${universityName}</h4>
                <p>相關升學管道：${this.getUniversityPathways(universityName).join('、')}</p>
                <p>相關事件數量：${this.getUniversityEventsCount(universityName)} 個</p>
            </div>
        `;
    }

    // 填充大學事件
    populateUniversityEvents(events) {
        console.log('填充大學事件:', events);
        const eventsSection = document.getElementById('universityEvents');
        if (!eventsSection) {
            console.error('找不到 universityEvents 元素');
            return;
        }

        if (events.length === 0) {
            console.log('沒有相關事件，顯示暫無相關事件');
            eventsSection.innerHTML = '<p>暫無相關事件</p>';
            return;
        }

        console.log('渲染', events.length, '個事件');
        const htmlContent = events.map(event => `
            <div class="event-item">
                <h4>${event.item}</h4>
                <p><strong>升學管道：</strong>${event.pathway}</p>
                <p><strong>日期：</strong>${this.formatTime(new Date(event.date))}</p>
                <p><strong>狀態：</strong>${this.getStatusText(this.calculateDaysUntil(event.date))}</p>
            </div>
        `).join('');
        
        console.log('HTML 內容:', htmlContent);
        eventsSection.innerHTML = htmlContent;
        console.log('DOM 元素更新後:', eventsSection.innerHTML);
    }

    // 填充準備資料
    populateUniversityPreparation(events) {
        const preparationSection = document.getElementById('universityPreparation');
        if (!preparationSection) return;

        const allPreparation = new Set();
        events.forEach(event => {
            if (event.preparation && Array.isArray(event.preparation)) {
                event.preparation.forEach(item => {
                    if (item.trim()) {
                        allPreparation.add(item.trim());
                    }
                });
            }
        });

        if (allPreparation.size === 0) {
            preparationSection.innerHTML = '<p>暫無準備資料</p>';
            return;
        }

        preparationSection.innerHTML = Array.from(allPreparation).map(item => `
            <div class="preparation-item">
                <p>${item}</p>
            </div>
        `).join('');
    }

    // 填充報名資訊
    populateUniversityRegistration(events) {
        const registrationSection = document.getElementById('universityRegistration');
        if (!registrationSection) return;

        const registrationEvents = events.filter(event => 
            event.item.includes('報名') || event.item.includes('申請')
        );

        if (registrationEvents.length === 0) {
            registrationSection.innerHTML = '<p>暫無報名資訊</p>';
            return;
        }

        registrationSection.innerHTML = registrationEvents.map(event => `
            <div class="registration-item">
                <h4>${event.item}</h4>
                <p><strong>日期：</strong>${this.formatTime(new Date(event.date))}</p>
                <p><strong>升學管道：</strong>${event.pathway}</p>
            </div>
        `).join('');
    }

    // 填充考試日期
    populateUniversityExamDates(events) {
        const examDatesSection = document.getElementById('universityExamDates');
        if (!examDatesSection) return;

        const examEvents = events.filter(event => 
            event.item.includes('考試') || event.item.includes('測驗') || event.item.includes('面試')
        );

        if (examEvents.length === 0) {
            examDatesSection.innerHTML = '<p>暫無考試日期</p>';
            return;
        }

        examDatesSection.innerHTML = examEvents.map(event => `
            <div class="exam-date-item">
                <h4>${event.item}</h4>
                <p><strong>日期：</strong>${this.formatTime(new Date(event.date))}</p>
                <p><strong>升學管道：</strong>${event.pathway}</p>
                <p><strong>狀態：</strong>${this.getStatusText(this.calculateDaysUntil(event.date))}</p>
            </div>
        `).join('');
    }

    // 獲取大學的升學管道
    getUniversityPathways(universityName) {
        const pathways = new Set();
        this.timelineData.timeline.forEach(item => {
            if (item.schools && item.schools.includes(universityName)) {
                pathways.add(item.pathway);
            }
        });
        return Array.from(pathways);
    }

    // 獲取大學事件數量
    getUniversityEventsCount(universityName) {
        return this.timelineData.timeline.filter(item => 
            item.schools && item.schools.includes(universityName)
        ).length;
    }

    // 跳转到最近的上一个事件（以導航焦點為基準）
    scrollToPreviousEvent() {
        console.log('scrollToPreviousEvent 被调用');
        
        if (!this.timelineData || !this.timelineData.timeline) {
            console.log('没有时间轴数据');
            return;
        }

        console.log('时间轴数据:', this.timelineData.timeline);

        // 按日期排序事件
        const sortedEvents = [...this.timelineData.timeline].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        console.log('排序后的事件:', sortedEvents);

        const focus = this.navigationFocusDate ? this.getDateOnly(this.navigationFocusDate) : this.getDateOnly(new Date());
        console.log('導航焦點日期:', focus);
        
        let previousEvent = null;

        // 找到最近的上一个事件（日期小於導航焦點）
        for (let i = sortedEvents.length - 1; i >= 0; i--) {
            const eventDate = this.getDateOnly(sortedEvents[i].date);
            console.log(`检查事件 ${i}: ${sortedEvents[i].item}, 日期: ${eventDate}, 比较: ${eventDate < focus}`);
            
            if (eventDate < focus) {
                previousEvent = sortedEvents[i];
                console.log('找到上一个事件:', previousEvent);
                break;
            }
        }

        if (previousEvent) {
            console.log('跳转到事件:', previousEvent);
            // 设置时间范围，让事件在时间轴中央显示
            const eventDate = this.getDateOnly(previousEvent.date);
            const startDate = new Date(eventDate);
            startDate.setDate(startDate.getDate() - 15); // 事件前15天
            const endDate = new Date(eventDate);
            endDate.setDate(endDate.getDate() + 15); // 事件后15天

            this.currentStartDate = startDate;
            this.currentEndDate = endDate;
            // 更新導航焦點
            this.navigationFocusDate = eventDate;

            // 更新时间标签和重新渲染
            this.updateTimeLabels();
            this.renderTimeline();
        } else {
            console.log('没有找到上一个事件');
            this.showSuccessMessage('⚠️ 已經是最早的事件');
        }
    }

    // 跳转到最近的下一个事件（以導航焦點為基準）
    scrollToNextEvent() {
        console.log('scrollToNextEvent 被调用');
        
        if (!this.timelineData || !this.timelineData.timeline) {
            console.log('没有时间轴数据');
            return;
        }

        console.log('时间轴数据:', this.timelineData.timeline);

        // 按日期排序事件
        const sortedEvents = [...this.timelineData.timeline].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });

        console.log('排序后的事件:', sortedEvents);

        // 以導航焦點作為基準（不含時間）
        const focus = this.navigationFocusDate ? this.getDateOnly(this.navigationFocusDate) : this.getDateOnly(new Date());
        
        console.log('導航焦點日期:', focus);
        
        let nextEvent = null;

        // 找到最近的下一个事件（日期大於導航焦點）
        for (let i = 0; i < sortedEvents.length; i++) {
            const eventDate = this.getDateOnly(sortedEvents[i].date);
            console.log(`检查事件 ${i}: ${sortedEvents[i].item}, 日期: ${eventDate}, 比较: ${eventDate > focus}`);
            
            if (eventDate > focus) {
                nextEvent = sortedEvents[i];
                console.log('找到下一个事件:', nextEvent);
                break;
            }
        }

        if (nextEvent) {
            console.log('跳转到事件:', nextEvent);
            // 设置时间范围，让事件在时间轴中央显示
            const eventDate = this.getDateOnly(nextEvent.date);
            const startDate = new Date(eventDate);
            startDate.setDate(startDate.getDate() - 15); // 事件前15天
            const endDate = new Date(eventDate);
            endDate.setDate(endDate.getDate() + 15); // 事件后15天

            this.currentStartDate = startDate;
            this.currentEndDate = endDate;
            // 更新導航焦點
            this.navigationFocusDate = eventDate;

            // 更新时间标签和重新渲染
            this.updateTimeLabels();
            this.renderTimeline();
        } else {
            console.log('没有找到下一个事件');
            this.showSuccessMessage('⚠️ 已經是最後一個事件');
        }
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
