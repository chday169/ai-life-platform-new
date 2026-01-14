/**
 * AI生活分享平台 - 多功能瀏覽器核心功能
 * 支援PDF、YouTube、網頁、資料夾等多種內容類型
 */

class AIContentBrowser {
  constructor() {
    this.contentList = [];
    this.filteredList = [];
    this.currentIndex = -1;
    this.currentResource = null;
    this.currentPDF = null;
    this.currentPage = 1;
    this.totalPages = 1;
    this.scale = 1.5;
    this.manifestURL = './data_ai/manifest.json';
    
    this.init();
  }
  
  async init() {
    await this.loadContentList();
    this.setupEventListeners();
    this.updateStats();
  }
  
  async loadContentList() {
    try {
      this.showLoading('載入AI學習資源中...');
      
      // 嘗試載入本地清單
      const response = await fetch(this.manifestURL);
      if (response.ok) {
        this.contentList = await response.json();
      } else {
        // 載入失敗時使用預設資料
        this.contentList = this.getDefaultContent();
      }
      
      // 載入統計資料
      this.loadStats();
      
      // 初始化過濾列表
      this.filteredList = [...this.contentList];
      this.updateContentSelect();
      
      if (this.contentList.length > 0) {
        this.showContent(0);
      } else {
        this.showError('❌ 沒有可用的AI學習資源');
      }
    } catch (error) {
      console.error('載入錯誤：', error);
      this.showError('❌ 無法載入資源清單');
      this.contentList = this.getDefaultContent();
      this.filteredList = [...this.contentList];
      this.updateContentSelect();
      if (this.contentList.length > 0) {
        this.showContent(0);
      }
    }
  }
  
  getDefaultContent() {
    return [
      {
        id: "default-1",
        title: "ChatGPT 入門教學",
        type: "pdf",
        category: "beginner",
        url: "https://raw.githubusercontent.com/mozilla/pdf.js/gh-pages/web/compressed.tracemonkey-pldi-09.pdf",
        description: "ChatGPT基礎使用教學",
        views: 0,
        likes: 0
      }
    ];
  }
  
  loadStats() {
    const stats = JSON.parse(localStorage.getItem('ai_stats') || '{}');
    this.contentList.forEach(item => {
      if (stats[item.id]) {
        item.views = stats[item.id].views || 0;
        item.likes = stats[item.id].likes || 0;
      } else {
        item.views = 0;
        item.likes = 0;
      }
    });
  }
  
  saveStats() {
    const stats = {};
    this.contentList.forEach(item => {
      stats[item.id] = {
        views: item.views || 0,
        likes: item.likes || 0,
        lastViewed: new Date().toISOString()
      };
    });
    localStorage.setItem('ai_stats', JSON.stringify(stats));
  }
  
  filterCategory(category) {
    // 更新按鈕狀態
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    if (category === 'all') {
      this.filteredList = [...this.contentList];
    } else {
      this.filteredList = this.contentList.filter(item => item.category === category);
    }
    
    this.updateContentSelect();
    
    if (this.filteredList.length > 0) {
      this.showContent(0);
    } else {
      this.showError(`❌ 沒有相關資源`);
      this.clearContentDisplay();
    }
  }
  
  updateContentSelect() {
    const select = document.getElementById('contentSelect');
    if (!select) return;
    
    select.innerHTML = '';
    this.filteredList.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${index + 1}. ${item.title}`;
      select.appendChild(option);
    });
  }
  
  showContent(index) {
    if (index < 0 || index >= this.filteredList.length) return;
    
    this.currentIndex = index;
    this.currentPage = 1;
    this.currentResource = this.filteredList[index];
    
    const originalIndex = this.contentList.findIndex(item => item.id === this.currentResource.id);
    
    this.showLoading(`載入${this.currentResource.title}中...`);
    
    // 記錄訪問
    this.recordView();
    
    // 更新訪問次數
    if (originalIndex >= 0) {
      this.contentList[originalIndex].views = (this.contentList[originalIndex].views || 0) + 1;
      this.saveStats();
      this.updateStatsDisplay(originalIndex);
    }
    
    // 根據資源類型顯示內容
    this.displayContentByType(this.currentResource);
    
    // 更新選擇框
    const select = document.getElementById('contentSelect');
    if (select) {
      select.value = index;
    }
  }
  
  displayContentByType(resource) {
    const displayArea = document.getElementById('contentDisplay');
    if (!displayArea) return;
    
    displayArea.innerHTML = '';
    
    const pdfControls = document.getElementById('pdfControls');
    const externalLinksPanel = document.getElementById('externalLinksPanel');
    
    // 隱藏控制面板
    if (pdfControls) pdfControls.style.display = 'none';
    if (externalLinksPanel) externalLinksPanel.style.display = 'none';
    
    // 顯示資源描述
    const description = document.createElement('div');
    description.className = 'resource-description';
    description.innerHTML = `
      <h3 style="color: #6366f1; margin-bottom: 15px;">${resource.title}</h3>
      <p style="color: #6b7280; line-height: 1.6; margin-bottom: 20px;">${resource.description || '無描述'}</p>
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <span style="background: #e0e7ff; color: #6366f1; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem;">
          ${this.getContentTypeName(resource.type)}
        </span>
        <span style="background: #f3f4f6; color: #6b7280; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem;">
          ${this.getCategoryName(resource.category)}
        </span>
      </div>
    `;
    displayArea.appendChild(description);
    
    // 根據類型顯示內容
    switch(resource.type) {
      case 'pdf':
        this.displayPDF(resource);
        if (pdfControls) pdfControls.style.display = 'flex';
        break;
      case 'youtube':
        this.displayYouTube(resource);
        break;
      case 'webpage':
        this.displayWebPage(resource);
        break;
      case 'folder':
        this.displayFolder(resource);
        break;
      default:
        this.showError('❌ 不支援的資源類型');
    }
    
    // 顯示外部連結
    if (resource.externalLinks && resource.externalLinks.length > 0) {
      this.showExternalLinks(resource.externalLinks);
    }
    
    this.showStatus(`✅ 已載入: ${resource.title}`);
  }
  
  displayPDF(resource) {
    const displayArea = document.getElementById('contentDisplay');
    
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'pdf-canvas-container';
    canvasContainer.innerHTML = '<canvas id="pdfCanvas"></canvas>';
    displayArea.appendChild(canvasContainer);
    
    // 使用PDF.js載入PDF
    pdfjsLib.getDocument(resource.url).promise.then(pdf => {
      this.currentPDF = pdf;
      this.totalPages = pdf.numPages;
      this.renderPage(this.currentPage);
      
      this.showStatus(`✅ PDF載入完成: ${resource.title} (共 ${this.totalPages} 頁)`);
    }).catch(err => {
      console.error('PDF 載入失敗：', err);
      this.showError('❌ 無法載入PDF文件：' + err.message);
    });
  }
  
  renderPage(pageNum) {
    if (!this.currentPDF) return;
    
    this.currentPDF.getPage(pageNum).then(page => {
      const viewport = page.getViewport({ scale: this.scale });
      const canvas = document.getElementById('pdfCanvas');
      const context = canvas.getContext('2d');
      
      // 設置 canvas 尺寸
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      page.render(renderContext).promise.then(() => {
        const pageInfo = document.getElementById('pageInfo');
        const zoomLevel = document.getElementById('zoomLevel');
        
        if (pageInfo) {
          pageInfo.textContent = `第 ${pageNum} 頁 / 共 ${this.totalPages} 頁`;
        }
        
        if (zoomLevel) {
          zoomLevel.textContent = Math.round(this.scale * 100) + '%';
        }
      });
    }).catch(err => {
      console.error('頁面渲染失敗：', err);
      this.showError('❌ 頁面渲染失敗');
    });
  }
  
  displayYouTube(resource) {
    const displayArea = document.getElementById('contentDisplay');
    
    const videoContainer = document.createElement('div');
    videoContainer.innerHTML = `
      <div style="position: relative; width: 100%; padding-bottom: 56.25%; margin: 20px 0;">
        <iframe 
          src="${resource.url}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
    displayArea.appendChild(videoContainer);
  }
  
  displayWebPage(resource) {
    const displayArea = document.getElementById('contentDisplay');
    
    const webpageContainer = document.createElement('div');
    webpageContainer.innerHTML = `
      <div style="text-align: center; margin: 20px 0;">
        <p style="color: #6b7280; margin-bottom: 15px;">正在載入網頁內容...</p>
        <p style="color: #6b7280; font-size: 0.9rem;">
          如果網頁沒有自動載入，請
          <a href="${resource.url}" target="_blank" style="color: #6366f1; text-decoration: none; font-weight: 600;">
            點擊這裡在新視窗開啟
          </a>
        </p>
      </div>
      <iframe 
        src="${resource.url}" 
        style="width: 100%; height: 600px; border: none; border-radius: 12px; margin: 20px 0;"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        referrerpolicy="no-referrer">
      </iframe>
    `;
    displayArea.appendChild(webpageContainer);
  }
  
  displayFolder(resource) {
    const displayArea = document.getElementById('contentDisplay');
    
    const folderView = document.createElement('div');
    folderView.className = 'folder-view';
    
    if (resource.items && resource.items.length > 0) {
      resource.items.forEach((item, index) => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.onclick = () => this.openFolderItem(item);
        
        const icon = this.getContentTypeIcon(item.type);
        folderItem.innerHTML = `
          <div class="folder-icon">${icon}</div>
          <h4 style="margin: 0 0 10px 0; color: #374151;">${item.title}</h4>
          <p style="margin: 0; color: #6b7280; font-size: 0.9rem;">${this.getContentTypeName(item.type)}</p>
        `;
        
        folderView.appendChild(folderItem);
      });
    } else {
      folderView.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <div style="font-size: 3rem; margin-bottom: 20px;">📁</div>
          <p>此資料夾目前是空的</p>
        </div>
      `;
    }
    
    displayArea.appendChild(folderView);
  }
  
  openFolderItem(item) {
    // 臨時創建一個資源對象來顯示
    const tempResource = {
      id: 'folder-item-' + Date.now(),
      title: item.title,
      type: item.type,
      url: item.url,
      description: `來自資料夾的資源`
    };
    
    this.currentResource = tempResource;
    this.displayContentByType(tempResource);
  }
  
  showExternalLinks(links) {
    const panel = document.getElementById('externalLinksPanel');
    if (!panel) return;
    
    panel.style.display = 'flex';
    panel.innerHTML = '<h4 style="color: #6366f1; width: 100%; margin: 0 0 15px 0;">🔗 相關連結</h4>';
    
    links.forEach(link => {
      const linkBtn = document.createElement('a');
      linkBtn.href = link.url;
      linkBtn.target = '_blank';
      linkBtn.rel = 'noopener noreferrer';
      linkBtn.className = `link-btn link-${link.type}`;
      linkBtn.innerHTML = `
        <span class="link-icon">${this.getContentTypeIcon(link.type)}</span>
        <span class="link-text">${link.name}</span>
      `;
      panel.appendChild(linkBtn);
    });
  }
  
  getContentTypeName(type) {
    const types = {
      'pdf': '📄 PDF文件',
      'youtube': '🎬 教學影片',
      'webpage': '🌐 網站連結',
      'folder': '📁 資源夾'
    };
    return types[type] || type;
  }
  
  getContentTypeIcon(type) {
    const icons = {
      'pdf': '📄',
      'youtube': '🎬',
      'webpage': '🌐',
      'folder': '📁'
    };
    return icons[type] || '📄';
  }
  
  getCategoryName(category) {
    const categories = {
      'all': '全部資源',
      'beginner': '入門指南',
      'tools': '工具教學',
      'productivity': '工作效率',
      'design': '創意設計',
      'advanced': '進階技巧'
    };
    return categories[category] || category;
  }
  
  zoomIn() {
    this.scale += 0.25;
    if (this.currentPDF) this.renderPage(this.currentPage);
  }
  
  zoomOut() {
    this.scale = Math.max(0.5, this.scale - 0.25);
    if (this.currentPDF) this.renderPage(this.currentPage);
  }
  
  resetZoom() {
    this.scale = 1.5;
    if (this.currentPDF) this.renderPage(this.currentPage);
  }
  
  prevPage() {
    if (this.currentPDF && this.currentPage > 1) {
      this.currentPage--;
      this.renderPage(this.currentPage);
    }
  }
  
  nextPage() {
    if (this.currentPDF && this.currentPage < this.totalPages) {
      this.currentPage++;
      this.renderPage(this.currentPage);
    }
  }
  
  prevContent() {
    if (this.currentIndex > 0) {
      this.showContent(this.currentIndex - 1);
    }
  }
  
  nextContent() {
    if (this.currentIndex < this.filteredList.length - 1) {
      this.showContent(this.currentIndex + 1);
    }
  }
  
  clearContentDisplay() {
    const displayArea = document.getElementById('contentDisplay');
    if (displayArea) {
      displayArea.innerHTML = '';
    }
    
    const pdfControls = document.getElementById('pdfControls');
    const externalLinksPanel = document.getElementById('externalLinksPanel');
    
    if (pdfControls) pdfControls.style.display = 'none';
    if (externalLinksPanel) externalLinksPanel.style.display = 'none';
  }
  
  showLoading(message) {
    const statusElement = document.getElementById('statusText');
    if (statusElement) {
      statusElement.innerHTML = `<span class="loading"></span>${message}`;
    }
  }
  
  showStatus(message) {
    const statusElement = document.getElementById('statusText');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }
  
  showError(message) {
    const statusElement = document.getElementById('statusText');
    if (statusElement) {
      statusElement.textContent = message;
    }
  }
  
  updateStatsDisplay(index) {
    const item = this.contentList[index];
    if (item) {
      const viewCount = document.getElementById('viewCount');
      if (viewCount) {
        viewCount.textContent = item.views || 0;
      }
    }
  }
  
  updateStats() {
    // 更新頁面上的統計數據顯示
    const totalViews = this.contentList.reduce((sum, item) => sum + (item.views || 0), 0);
    const totalLikes = this.contentList.reduce((sum, item) => sum + (item.likes || 0), 0);
    
    console.log(`平台統計：${totalViews} 次瀏覽，${totalLikes} 次讚`);
  }
  
  recordView() {
    // 記錄頁面訪問統計
    const key = 'views_content_viewer';
    let count = parseInt(localStorage.getItem(key) || '0');
    count++;
    localStorage.setItem(key, count.toString());
  }
  
  shareToFacebook() {
    if (!this.currentResource) return;
    
    const text = encodeURIComponent(`我在AI生活分享社團發現這個資源：${this.currentResource.title}`);
    const url = encodeURIComponent(window.location.href);
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
    
    window.open(facebookShareUrl, '_blank', 'width=600,height=400');
  }
  
  copyResourceLink() {
    if (!this.currentResource) return;
    
    const link = window.location.origin + window.location.pathname + '?resource=' + this.currentResource.id;
    navigator.clipboard.writeText(link).then(() => {
      alert('已複製資源連結到剪貼簿！');
    }).catch(err => {
      console.error('複製失敗:', err);
    });
  }
  
  setupEventListeners() {
    // 內容選擇框
    const contentSelect = document.getElementById('contentSelect');
    if (contentSelect) {
      contentSelect.addEventListener('change', (e) => {
        const index = parseInt(e.target.value);
        if (!isNaN(index)) {
          this.showContent(index);
        }
      });
    }
    
    // 分類按鈕
    document.querySelectorAll('.category-btn').forEach(btn => {
      const onclick = btn.getAttribute('onclick');
      if (onclick && onclick.includes('filterCategory')) {
        const category = onclick.match(/'([^']+)'/)?.[1];
        if (category) {
          btn.addEventListener('click', () => this.filterCategory(category));
        }
      }
    });
    
    // 導航按鈕
    const prevBtn = document.getElementById('prevContentBtn');
    const nextBtn = document.getElementById('nextContentBtn');
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevContent());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextContent());
    }
    
    // 鍵盤快捷鍵
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        if (this.currentPDF) {
          this.prevPage();
        } else {
          this.prevContent();
        }
      } else if (e.key === 'ArrowRight') {
        if (this.currentPDF) {
          this.nextPage();
        } else {
          this.nextContent();
        }
      } else if (e.key === '+') {
        this.zoomIn();
      } else if (e.key === '-') {
        this.zoomOut();
      }
    });
  }
}

// 初始化瀏覽器
let aiContentBrowser;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('contentDisplay')) {
    aiContentBrowser = new AIContentBrowser();
  }
});

// 全域輔助函數
function shareToFacebook() {
  if (aiContentBrowser) {
    aiContentBrowser.shareToFacebook();
  }
}

function copyResourceLink() {
  if (aiContentBrowser) {
    aiContentBrowser.copyResourceLink();
  }
}