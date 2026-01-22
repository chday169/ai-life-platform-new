// pdf-loader.js - 智能PDF加載器（優先從GitHub Release加載）
class PDFLoader {
  constructor() {
    this.localCache = new Map(); // 本地快取
    this.maxRetries = 2; // 最大重試次數
    this.retryDelay = 1000; // 重試延遲(ms)
    this.timeout = 15000; // 加載超時時間(ms)
    this.useGitHubFirst = true; // 優先使用GitHub
  }
  
  /**
   * 智能加載PDF - 優先使用GitHub Release
   */
  async loadPDF(resource) {
    if (!resource) {
      throw new Error('未提供PDF資源對象');
    }
    
    console.group(`📄 加載PDF: ${resource.title}`);
    console.log(`資源ID: ${resource.id}`);
    
    // 策略1: 優先使用GitHub Release（如果可用且啟用）
    if (this.useGitHubFirst && resource.githubRelease) {
      console.log(`🎯 策略1: 嘗試GitHub Release`);
      try {
        const pdf = await this.loadWithTimeout(resource.githubRelease, 'github');
        console.log(`✅ GitHub Release 加載成功`);
        this.cacheResult(resource.id, 'github', resource.githubRelease);
        console.groupEnd();
        return pdf;
      } catch (githubError) {
        console.warn(`❌ GitHub Release 加載失敗: ${githubError.message}`);
      }
    }
    
    // 策略2: 使用本地路徑
    if (resource.url) {
      console.log(`🔄 策略2: 嘗試本地路徑`);
      try {
        const pdf = await this.loadWithTimeout(resource.url, 'local');
        console.log(`✅ 本地路徑加載成功`);
        this.cacheResult(resource.id, 'local', resource.url);
        console.groupEnd();
        return pdf;
      } catch (localError) {
        console.error(`❌ 本地路徑加載失敗: ${localError.message}`);
      }
    }
    
    console.groupEnd();
    throw new Error('所有PDF加載路徑都失敗');
  }
  
  /**
   * 帶超時的PDF加載
   */
  async loadWithTimeout(url, source) {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`${source}加載超時 (${this.timeout}ms)`));
      }, this.timeout);
      
      try {
        console.log(`⏳ 從 ${source} 加載: ${url}`);
        
        const loadingTask = pdfjsLib.getDocument({
          url: url,
          withCredentials: false,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/cmaps/',
          cMapPacked: true
        });
        
        const pdf = await loadingTask.promise;
        clearTimeout(timeoutId);
        resolve(pdf);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }
  
  /**
   * 快取加載結果
   */
  cacheResult(id, source, url) {
    this.localCache.set(id, {
      source: source,
      url: url,
      timestamp: Date.now(),
      success: true
    });
  }
  
  /**
   * 檢查GitHub Release是否可用
   */
  async checkGitHubAvailability(githubUrl) {
    try {
      console.log(`🔍 檢查GitHub Release可用性: ${githubUrl}`);
      
      // 使用HEAD請求檢查（減少數據傳輸）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(githubUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('GitHub可用性檢查失敗:', error);
      return false;
    }
  }
  
  /**
   * 手動設置加載來源
   */
  setLoadSource(useGitHubFirst) {
    this.useGitHubFirst = useGitHubFirst;
    console.log(`⚙️ 設置加載來源: ${useGitHubFirst ? '優先GitHub' : '優先本地'}`);
  }
  
  /**
   * 獲取加載統計
   */
  getStats() {
    const stats = {
      total: this.localCache.size,
      github: 0,
      local: 0,
      recent: []
    };
    
    this.localCache.forEach((value, key) => {
      if (value.source === 'github') stats.github++;
      if (value.source === 'local') stats.local++;
      
      if (value.success) {
        stats.recent.push({
          id: key,
          source: value.source,
          time: new Date(value.timestamp).toLocaleTimeString()
        });
      }
    });
    
    return stats;
  }
  
  /**
   * 清除快取
   */
  clearCache() {
    console.log('🧹 清除PDF加載快取');
    this.localCache.clear();
  }
  
  /**
   * 預熱加載（後台預加載常用PDF）
   */
  async preloadPDFs(pdfResources) {
    console.log('🔥 開始預熱加載常用PDF');
    
    // 只預加載前3個PDF（避免過度加載）
    const topPDFs = pdfResources
      .filter(res => res.type === 'pdf')
      .slice(0, 3);
    
    for (const resource of topPDFs) {
      try {
        // 後台加載但不阻塞主線程
        this.loadPDF(resource).then(() => {
          console.log(`✅ 預加載完成: ${resource.title}`);
        }).catch(err => {
          console.warn(`⚠️ 預加載失敗: ${resource.title}`, err.message);
        });
      } catch (err) {
        // 靜默處理預加載錯誤
      }
    }
  }
}

// 創建全局PDFLoader實例
window.pdfLoader = new PDFLoader();

// 輔助函數：顯示PDF加載信息
window.showPDFInfo = function(resource) {
  const infoDiv = document.createElement('div');
  infoDiv.className = 'pdf-loading-info';
  infoDiv.innerHTML = `
    <div style="padding: 10px; background: #f0f9ff; border-radius: 8px; margin: 10px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
        <span class="loading" style="width: 16px; height: 16px;"></span>
        <strong style="color: #1e40af;">正在加載PDF...</strong>
      </div>
      <div style="font-size: 0.85rem; color: #4b5563;">
        <div><strong>檔案：</strong>${resource.title}</div>
        ${resource.githubRelease ? `
          <div><strong>來源：</strong>GitHub Release</div>
          <div><strong>路徑：</strong><a href="${resource.githubRelease}" target="_blank" style="color: #3b82f6;">${resource.githubRelease}</a></div>
        ` : `
          <div><strong>來源：</strong>本地檔案</div>
        `}
      </div>
    </div>
  `;
  return infoDiv;
};