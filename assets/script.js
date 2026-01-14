document.addEventListener('DOMContentLoaded', () => {
  const pageId = detectPageId();
  
  // 初始化统计功能
  autoCountView(pageId);
  recordDailyView(pageId);
  loadStats();
  
  // 设置管理员密码（建议从环境变量或配置文件中获取）
  window.ADMIN_PASSWORD = 'yourPassword123';
});

/**
 * 模拟点赞功能
 */
window.simulateLike = function (id) {
  try {
    const key = `likes_${id}`;
    let count = parseInt(localStorage.getItem(key) || '0');
    count++;
    localStorage.setItem(key, count.toString());
    
    const likeElement = document.getElementById(`likes_${id}`);
    if (likeElement) {
      likeElement.textContent = count;
      
      // 添加点赞动画效果
      likeElement.style.transform = 'scale(1.2)';
      setTimeout(() => {
        likeElement.style.transform = 'scale(1)';
      }, 200);
    }
    
    console.log(`👍 页面 ${id} 点赞数更新为: ${count}`);
  } catch (error) {
    console.error('点赞功能出错:', error);
  }
};

/**
 * 导出统计数据
 */
window.exportStats = function () {
  try {
    const stats = {
      exportTime: new Date().toISOString(),
      totalVisits: calculateTotalVisits(),
      pages: {}
    };

    // 收集所有统计数据
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('views_') || key.startsWith('likes_') || key.startsWith('daily_')) {
        const value = localStorage.getItem(key);
        const [type, page, ...rest] = key.split('_');
        
        if (type === 'daily') {
          const date = rest[0];
          if (!stats.daily) stats.daily = {};
          if (!stats.daily[page]) stats.daily[page] = {};
          stats.daily[page][date] = parseInt(value);
        } else {
          if (!stats.pages[page]) stats.pages[page] = {};
          stats.pages[page][type] = parseInt(value);
        }
      }
    });

    // 创建并下载JSON文件
    const blob = new Blob([JSON.stringify(stats, null, 2)], { 
      type: 'application/json;charset=utf-8' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    a.href = url;
    a.download = `site_stats_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📊 统计数据导出成功');
  } catch (error) {
    console.error('导出统计数据出错:', error);
    alert('❌ 导出失败，请检查控制台错误信息');
  }
};

/**
 * 管理员登录功能
 */
window.adminLogin = function () {
  try {
    const password = prompt('🔐 請輸入管理者密碼：');
    
    if (password === window.ADMIN_PASSWORD) {
      const action = prompt('請選擇操作：\n1. 查看統計數據\n2. 清除所有統計資料\n3. 重置特定頁面統計\n請輸入數字 (1-3):');
      
      switch (action) {
        case '1':
          showAdminStats();
          break;
        case '2':
          if (confirm('⚠️  確定要清除所有統計資料嗎？此操作無法復原！')) {
            clearAllStats();
            alert('✅ 已清除所有統計資料');
            location.reload();
          }
          break;
        case '3':
          resetSpecificPage();
          break;
        default:
          alert('❌ 無效的選擇');
      }
    } else {
      alert('❌ 密碼錯誤');
    }
  } catch (error) {
    console.error('管理员登录功能出错:', error);
  }
};

/**
 * 检测页面ID
 */
function detectPageId() {
  const path = location.pathname;
  const pageMap = {
    'index.html': 'v1a_home',
    'index': 'v1a_home',
    'about': 'about_me',
    'comments': 'comments',
    'stats': 'stats',
    'viewer_scr': 'scratch_viewer',
    'viewer_geo': 'geo_viewer',
    'viewer_video': 'video_viewer',
    'monthly': 'monthly_topics'
  };

  for (const [key, value] of Object.entries(pageMap)) {
    if (path.includes(key)) {
      return value;
    }
  }
  
  // 使用路径作为备用ID
  const fallbackId = path.split('/').pop().replace('.html', '') || 'home';
  return `page_${fallbackId}`;
}

/**
 * 自动计数访问量
 */
function autoCountView(id) {
  try {
    const key = `views_${id}`;
    let count = parseInt(localStorage.getItem(key) || '0');
    count++;
    localStorage.setItem(key, count.toString());
    
    const viewElement = document.getElementById(`views_${id}`);
    if (viewElement) {
      viewElement.textContent = count;
    }
    
    updateTotalVisits();
    console.log(`📈 页面 ${id} 访问量: ${count}`);
  } catch (error) {
    console.error('访问计数出错:', error);
  }
}

/**
 * 记录每日访问量
 */
function recordDailyView(id) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `daily_${today}_${id}`;
    let count = parseInt(localStorage.getItem(key) || '0');
    count++;
    localStorage.setItem(key, count.toString());
  } catch (error) {
    console.error('记录每日访问量出错:', error);
  }
}

/**
 * 更新总访问量
 */
function updateTotalVisits() {
  try {
    const total = calculateTotalVisits();
    const totalElement = document.getElementById('totalVisits');
    if (totalElement) {
      totalElement.textContent = total.toLocaleString();
    }
  } catch (error) {
    console.error('更新总访问量出错:', error);
  }
}

/**
 * 计算总访问量
 */
function calculateTotalVisits() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('views_'));
  return keys.reduce((sum, k) => sum + parseInt(localStorage.getItem(k) || '0'), 0);
}

/**
 * 加载统计数据
 */
function loadStats() {
  try {
    // 定义要显示统计数据的页面
    const pageIds = ['v1a_home', 'about_me', 'comments', 'scratch_viewer', 'geo_viewer', 'video_viewer', 'monthly_topics'];
    
    pageIds.forEach(id => {
      const views = localStorage.getItem(`views_${id}`) || '0';
      const likes = localStorage.getItem(`likes_${id}`) || '0';
      
      const viewElement = document.getElementById(`views_${id}`);
      const likeElement = document.getElementById(`likes_${id}`);
      
      if (viewElement) viewElement.textContent = parseInt(views).toLocaleString();
      if (likeElement) likeElement.textContent = parseInt(likes).toLocaleString();
    });
    
    updateTotalVisits();
  } catch (error) {
    console.error('加载统计数据出错:', error);
  }
}

/**
 * 显示管理员统计数据
 */
function showAdminStats() {
  const stats = {};
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('views_') || key.startsWith('likes_') || key.startsWith('daily_')) {
      stats[key] = localStorage.getItem(key);
    }
  });
  
  console.table(stats);
  alert('📊 统计数据已在控制台中显示，请打开开发者工具查看');
}

/**
 * 清除所有统计数据
 */
function clearAllStats() {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('views_') || key.startsWith('likes_') || key.startsWith('daily_')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * 重置特定页面统计
 */
function resetSpecificPage() {
  const pageId = prompt('请输入要重置的页面ID (例如: v1a_home):');
  if (pageId) {
    if (confirm(`确定要重置页面 "${pageId}" 的所有统计数据吗？`)) {
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith(`views_${pageId}`) || 
        key.startsWith(`likes_${pageId}`) || 
        key.startsWith(`daily_${pageId}`)
      );
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      alert(`✅ 页面 "${pageId}" 的统计数据已重置`);
      location.reload();
    }
  }
}

// 添加键盘快捷键
document.addEventListener('keydown', (event) => {
  // Ctrl+Shift+L - 管理员登录
  if (event.ctrlKey && event.shiftKey && event.key === 'L') {
    event.preventDefault();
    window.adminLogin();
  }
  
  // Ctrl+Shift+E - 导出统计数据
  if (event.ctrlKey && event.shiftKey && event.key === 'E') {
    event.preventDefault();
    window.exportStats();
  }
});