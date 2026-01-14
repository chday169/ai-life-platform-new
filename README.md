# AI生活分享平台

一個專注於AI工具應用教學的完整平台，包含PDF教材瀏覽器、YouTube教學影片播放器和豐富的AI資源推薦。

## 🌟 功能特色

### 🧠 AI內容瀏覽器
- 完整的AI教學PDF教材（內嵌4篇）
- 支援外部PDF連結（GitHub Release）
- PDF分頁瀏覽與縮放控制
- 學習統計與進度追蹤

### 🎥 AI教學影片
- 內嵌3個精選教學影片
- 個人YouTube頻道連結
- 外部推薦頻道
- 影片分類與播放清單

### 🔗 AI資源推薦
- 精選AI工具網站
- 學習平台推薦
- 實用資源連結
- 分類瀏覽與搜尋

## 📁 文件結構

## 🚀 快速開始

### 1. 準備PDF文件
將4個PDF文件放入 `data_ai/pdfs/` 文件夾：
- `chatgpt-guide.pdf`
- `midjourney-tutorial.pdf`
- `ai-productivity.pdf`
- `ai-business.pdf`

### 2. 更新影片ID
在 `video-player.html` 中更新您的YouTube影片ID：
```javascript
const embeddedVideos = [
  "aCZPHX13ZnE",  // 替換為您的影片ID
  "YOUR_VIDEO_ID_2",
  "YOUR_VIDEO_ID_3"
];
3. 部署到GitHub Pages
將所有檔案上傳到GitHub倉庫

啟用GitHub Pages功能

選擇main分支作為來源

訪問您的網站：https://username.github.io/repository

🔧 自訂設定
1. 更換PDF教材
將PDF檔案放入 data_ai/pdfs/ 目錄
更新 data_ai/manifest.json 中的檔案路徑

2. 更換YouTube影片
修改 video-player.html 中的影片陣列
使用YouTube嵌入URL格式

3. 修改樣式
編輯 assets/style.css 檔案
調整顏色、字體和佈局

📱 響應式設計
桌面版：完整功能界面

平板版：優化布局

手機版：單列顯示

📊 統計功能
頁面訪問計數

學習資源瀏覽統計

LocalStorage數據儲存

統計數據匯出功能

📞 聯絡資訊
作者：CHDAY169
信箱：chday169@gmail.com
YouTube：https://www.youtube.com/@chday7919

📄 授權
此專案僅供教育與個人使用，請勿用於商業用途。

text

## 📋 **部署步骤**

1. **创建项目文件夹结构**
mkdir AI-Life-Platform
cd AI-Life-Platform
mkdir -p assets data_ai/pdfs

text

2. **创建上述所有文件**
按照上面的代码创建每个文件

3. **添加PDF文件**
将您的4个PDF文件放入 `data_ai/pdfs/` 文件夹

4. **上传到GitHub**
```bash
git init
git add .
git commit -m "初始提交：AI生活分享平台"
git branch -M main
git remote add origin https://github.com/yourusername/ai-life-platform.git
git push -u origin main
启用GitHub Pages

进入仓库设置

选择Pages选项

选择main分支作为来源

保存设置

🎯 各页面功能
index.html - 主页面，展示平台特色和统计

about.html - 关于我们页面，介绍使命和团队

content-viewer.html - PDF内容浏览器，支持内嵌和外部PDF

video-player.html - 视频播放器，内嵌影片+频道链接

resources.html - 资源推荐，AI工具和网站

assets/style.css - 统一样式表

data_ai/manifest.json - 内容清单

README.md - 项目说明文档