# FHIR-Fitness-Physical-Activity-Tracker
# FHIR Fitness Tracker (健身運動處方與紀錄系統)

## 專案簡介 (Project Overview)
這是一個基於 HL7 FHIR 標準開發的「運動處方執行紀錄」網頁應用程式。
系統模擬物理治療師開立運動處方（如深蹲），並讓病患記錄每日執行的次數，數據將即時回傳至 FHIR Server 並以圖表呈現趨勢。

- **開發者**：[請填寫你的姓名]
- **學號**：[請填寫你的學號]
- **課程專題**：MIS PBL Project

## 系統功能 (Features)
1. **Data Provider (一鍵建立資料)**：自動在 FHIR Server 建立測試用的 Patient 與 ServiceRequest 資源。
2. **Read (調閱處方)**：讀取 FHIR `ServiceRequest`，顯示今日指派的運動項目。
3. **Create (上傳紀錄)**：使用者輸入運動次數後，轉換為 FHIR `Observation` JSON 並上傳。
4. **Visualization (視覺化)**：使用 Chart.js 將歷史 `Observation` 數據繪製成折線圖。

## 使用技術 (Tech Stack)
- **Frontend**: HTML5, Bootstrap 5, JavaScript (Vanilla ES6)
- **Visualization**: Chart.js
- **Backend**: Public HAPI FHIR Server (R4 endpoint)
- **Protocol**: HTTP RESTful API

## 如何執行 (How to Run)
### 方法 1：直接開啟
1. 下載本專案所有檔案 (`index.html`, `script.js`)。
2. 雙擊 `index.html` 用瀏覽器開啟。

### 方法 2：GitHub Pages (推薦)
1. 將檔案上傳至 GitHub Repository。
2. 到 Settings -> Pages -> Branch 選 `main` -> Save。
3. 獲得網址後即可分享。

## 操作步驟
1. 開啟網頁。
2. 點擊「**🛠️ 一鍵建立測試資料**」按鈕，系統會自動產生一組 ID。
3. 點擊「**🔍 調閱資料**」。
4. 在「新增執行紀錄」區塊輸入次數 (例如 15)，按「**上傳紀錄**」。
5. 下方圖表即會更新顯示最新數據。

## FHIR Resources 使用說明
- **Patient**: 用於識別使用者。
- **ServiceRequest**: 
    - Code: `LOINC 22656-1` (Squats)
    - Status: `active`
- **Observation**:
    - Code: `LOINC 22656-1`
    - ValueQuantity: 紀錄次數 (reps)
