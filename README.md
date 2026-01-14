# CHDAY169 Scratch 教學平台

一個專注於 Scratch 程式設計教學的完整平台，包含 PDF 教材瀏覽器和 YouTube 教學影片播放器。

## 功能特色

### 🎨 Scratch 教材瀏覽器
- 完整的 Scratch 教學 PDF 教材
- 線上 PDF 閱讀器（使用 PDF.js）
- 分級難度學習系統
- 學習統計與進度追蹤
- 教材收藏與喜好標記

### 🎥 YouTube 影片播放器
- 精選 Scratch 教學影片
- 影片播放清單
- 分類篩選功能
- 自動播放控制
- 響應式設計

### 📚 學習資源
- 外部學習資源推薦
- 教學平台連結
- 程式設計工具介紹
- 完整聯絡資訊

## 檔案結構
## 快速開始

### 1. 部署到 GitHub Pages
1. 將所有檔案上傳到 GitHub 倉庫
2. 啟用 GitHub Pages 功能
3. 選擇 main 分支作為來源

### 2. 本地測試
1. 安裝 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) VS Code 擴展
2. 右鍵點擊 index.html 選擇 "Open with Live Server"
3. 或使用 Python 簡單伺服器：
   ```bash
   python -m http.server 8000
然後訪問 http://localhost:8000

技術特點
前端技術
純 HTML/CSS/JavaScript 實現

使用 PDF.js 進行 PDF 渲染

YouTube IFrame API 嵌入

LocalStorage 數據存儲

響應式設計，支援手機和平板

資料管理
使用 LocalStorage 存儲用戶偏好

學習進度追蹤

瀏覽次數統計

喜好標記功能

自定義設定
1. 更換 PDF 教材
將 PDF 檔案放入 data_scr/pdfs/ 目錄

更新 data_scr/manifest.json 中的檔案路徑

確保檔案名稱與路徑正確

2. 更換 YouTube 影片
修改 video-player.html 中的影片陣列

更新影片標題、說明和分類

使用 YouTube 嵌入 URL 格式

3. 修改樣式
編輯 assets/style.css 檔案

調整顏色、字體和佈局

每個頁面也有內聯樣式可進行細部調整

注意事項
PDF 檔案大小：建議 PDF 檔案大小不超過 10MB 以確保載入速度

YouTube 影片：確保影片設定為公開或未列出

瀏覽器相容性：建議使用 Chrome、Firefox、Edge 最新版本

本地測試：某些功能（如 PDF 載入）可能需要伺服器環境

聯絡資訊
作者：CHDAY169 (清河)

信箱：chday169@gmail.com

YouTube：https://www.youtube.com/@chday7919

授權
此專案僅供教育與個人使用，請勿用於商業用途。

text

## 測試建議

1. **立即測試 PDF 功能**：使用提供的測試 PDF URL，確認 PDF.js 能正常載入
2. **測試影片播放**：確認 YouTube 影片能正常播放
3. **測試響應式設計**：在不同尺寸的視窗中查看效果
4. **測試 LocalStorage**：關閉瀏覽器再重新開啟，確認統計數據還在

## 後續步驟

1. 將這些檔案上傳到 GitHub 倉庫
2. 將您的實際 PDF 檔案放入 `data_scr/pdfs/` 目錄
3. 更新 `manifest.json` 中的實際 PDF 路徑
4. 測試所有功能是否正常運作