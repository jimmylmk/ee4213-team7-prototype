# CityU EE4213 Team 7: Unified Course Planning & Safe-Swap Rehearsal Sandbox (Prototype v2)

## 1. 專案簡介 (Project Overview)

本網站是香港城市大學 (CityU) **EE4213 人機互動 (Human-Computer Interaction, HCI)** 課程的 Team #7 核心原型成果：**「統一課程規劃與安全換課預演沙盒 (Unified Course Planning & Safe-Swap Rehearsal Sandbox)」**。

本系統專為解決 CityU 本科生及非本地留學生在進行選課 (Course Add/Drop) 時面臨的高風險、資訊破碎與介面認知負荷過重等問題而設計。透過直覺的**直接操縱 (Direct Manipulation)** 與**三態課表預演技術 (3-State Safe-Swap Rehearsal)**，讓學生在正式前往官方 AIMS 系統手動操作前，能夠 100% 離線、零風險且完整地模擬排課與換課決策。

---

## 2. 背景與解決的核心痛點 (Problem Statement & Background)

在現行香港城市大學的註冊環境中，學生面臨以下三大關鍵痛點：

1. **AIMS 系統「非原子性換課 (Non-Atomic Registration)」的掉座風險：**
   - 官方 AIMS 系統不支援「條件式換課 (If-and-only-if Swap)」。學生若想以新課替換已選舊課，必須「先在 AIMS 退選 (Drop) 舊課，釋出學分，才能加選 (Add) 新課」。
   - 一旦新課在加選瞬間名額被搶滿或發生排程衝突，學生舊課席位已失、新課未得，造成無可挽回的選課災難。
2. **全日制 12.0 學分簽證與修業下限 (Visa Floor) 警報：**
   - 留學生受學生簽證限制，本地生受全日制學額限制，每學期必須修讀至少 12.0 學分。
   - 在傳統換課流程中，退選一門 3.0 學分的課程會瞬間使學分由 12.0 降至 9.0，引發學生對違反簽證條例的強烈焦慮。
3. **選課資訊多方割裂與不透明：**
   - 課表在 AIMS、課程大綱在 Canvas/學系網站、作業壓力在學生論壇與博客、期末考試日期在學期初往往處於「未知 (Unknown)」狀態。

本原型提供**安全預演機制**：在沙盒內完成所有衝堂檢查、學分防線驗證、實習時間衝突排查與手動 CRN 換課清單產生，徹底消除真實選課時的盲目操作與焦慮。

---

## 3. 系統三大核心功能分頁 (Three Core Views)

原型包含三大完整聯動的視圖，透過左側導航欄或鍵盤快捷鍵隨時切換：

### View 1: 課表與安全換課預演沙盒 (Rehearsal & Safe-Swap Sandbox)
* **五天全週課表矩陣 (Mon-Fri 09:00–22:00)：**
  - **三態課卡視覺設計 (Academic Semantics)：**
    - `[Enrolled · Protected on AIMS]` (實線實色)：目前正式已註冊並受保護的課程。
    - `[Marked for Drop · Seat Protected]` (琥珀色虛線外框)：選為欲退選的目標課程，在未正式於 AIMS 操作前席位仍受保護。
    - `[Staged Preview · Not on AIMS]` (青色虛線幽靈卡)：從選課池預選上課表的替代課程，尚未在 AIMS 提交。
* **衝突優先級預警橫幅 (#timetableConflictBanner)：**
  - 當預選課程與現有課程衝突時，系統不會在課表上重疊堆疊混亂色塊，而是彈出引導橫幅，提示衝突時段，並讓使用者依優先級一鍵決定「保留原課」或「將衝突課標記為退選目標」。
* **校外承諾排程整合 (Outside Commitments Toggle)：**
  - 支援載入週一至週四的「校外科技實習 (Tech Placement: Mon/Thu 09:00–13:00)」，即時診斷實習與學術課程的重疊衝突。
* **雙向取消預選 (Bidirectional Un-staging)：**
  - 解決舊版介面死鎖問題。若未選取退選目標，按鈕不會無故反灰禁用，而是透過動態提示引導選取；已預選上課表的項目會變更為顯眼的紅色 `Unstage Preview` 按鈕，隨時一鍵復原。
* **鍵盤加速器 (Keyboard Accelerators)：**
  - 全域按下 `/` 鍵：自動聚焦並全選課程搜尋欄（具備輸入欄位防劫持保護）。
  - 按下 `Esc` 鍵依嚴格三級優先順序退回：
    1. 優先級 1：若確認彈窗開啟，則關閉彈窗。
    2. 優先級 2：若有預演幽靈課程，則取消幽靈課程並退回原課表。
    3. 優先級 3：清空搜尋輸入欄並取消聚焦。
* **極速篩選標籤 (Quick Filters)：**
  - 提供 `All`、`GE Electives`、`STEM Major`、`100% Coursework` (無期末考)、`Open Quota` (有名額)、`No Clash` (無衝堂) 等快捷過濾。

### View 2: 課程診斷與檢視器 (Course Inspector & Workload Diagnostics)
* **動態排課相容性診斷 (Live Schedule Fit Badge)：**
  - 即時針對當前「預計課表」動態評估：提示 `[STATUS: CURRENTLY ENROLLED]`、`[SCHEDULE FIT: NO CLASH]`、`[TIMETABLE CLASH: OVERLAPS WITH ...]` 或 `[SCHEDULE FIT: FITS CLASSES · OVERLAPS TECH PLACEMENT]`。
* **先修條件超連結引導 (Constructive Prerequisite Navigation)：**
  - 遇到先修條件未達成的課程（如 `CS3334` 需要 `CS2201`），提供直接點擊的 `[Inspect Prerequisite CS2201 ->]` 按鈕，瞬間跳轉至該先修課的檢視器頁面；右上角配備 `[<- Return to Weekly Timetable]` 麵包屑導航返回課表。
* **每週工作量條狀儀表板 (Workload Hour Distribution)：**
  - 依教學大綱將課堂、助教課、實驗室、專題報告、預習閱讀拆解為具體時數比例（例如 13.0 小時/週）。
* **認知誠實性邊界 (Epistemic Boundaries - What We Know vs Unknown)：**
  - 嚴格遵守人機互動認知邊界，對於大綱明確的評分標註來源，對於尚未發布的期末考日期、下學年開課狀況標示 `[EXAM DATE: UNKNOWN · NOT PUBLISHED]`，不以虛假預測誤導學生。
* **13 週學期里程碑壓力圖 (13-Week Timeline Strip)：**
  - 標記各週作業、期中考、專題截止日，並與實習時段對照檢視壓力重疊高峰。

### View 3: 城大學生評價網誌 (CityU Student Blogs)
* **同儕真實反饋與學習建議：**
  - 收錄高年級學生撰寫的 6 篇經驗網誌（包含非本地生適應、實習平衡、GE 課程選課避坑指南）。
  - 網誌內附帶 `#EE2000`、`#CS1302` 等課程標籤，點擊直接打開 Course Inspector 深入檢閱對應課程。

### 人類監督閘門與交接卡 (Control Gate & AIMS Quick-Entry Handoff)
* **安全確認彈窗 (#controlGateModal)：**
  - 在正式預選前展示清晰的時間、CRN、學分差額變化（Delta），明確警示 AIMS 系統的先退後加非原子特性。
* **3 步驟手動執行核對清單 (S4: Dialog Closure Checklist)：**
  - 預演完成後生成 AIMS Quick-Entry Handoff Card，提供一鍵複製 CRN 功能。
  - 設計三項手動核對項目：
    1. 已於 AIMS 確認加選課之實時名額。
    2. 已於 AIMS 使用 Drop CRN 完成舊課退選。
    3. 已於 AIMS 使用 Add CRN 完成新課加選。
  - 三者全部勾選後，介面轉變為綠色完成閉合狀態：`[REHEARSAL & AIMS HANDOFF COMPLETE · 12.0 CREDITS SECURED]`，並提供 `[Start New Rehearsal]` 展開下一門課的預演。

---

## 4. 人機互動理論實踐 (HCI Heuristics & Rules Mapping)

本系統的每一個設計決策皆嚴格對應 HCI 兩大經典架構：

| 人機互動原則 | 原型具體功能實現 | 對應模組與位置 |
| :--- | :--- | :--- |
| **N1 / S3: 系統狀態可見度與反饋** | 輕量浮動狀態通知引擎 (`showToast`)，操作即時提示，防止計時器碰撞；上方學分即時警報。 | 右下角 Toast；頂部 `#creditIndicator` |
| **N2 & N4 / S1: 真實世界對照與標準** | 捨棄內部工程術語，採用 CityU 官方真實術語 (`Protected on AIMS`, `Marked for Drop`)。 | 課表頂部圖例、課卡標籤 |
| **N3 / S6: 使用者控制自由與易撤銷** | 課卡與候選清單具備雙向 `Unstage Preview` 按鈕；具備一鍵 `Revert Schedule` 復原基準。 | 搜尋列表、Shortlist 托盤、頂部按鈕 |
| **N5 / S5: 防錯設計 (Error Prevention)** | 12.0 學分簽證下限鎖定、時間衝突橫幅選取優先級而非卡塊疊蓋混亂。 | `#timetableConflictBanner`、驗證引擎 |
| **N6 / S8: 辨識取代記憶** | 課程檢視器具備動態排課適配度診斷標籤；確認彈窗詳細列出時間與 CRN 對比。 | `#inspBadges`、`#controlGateModal` |
| **N7 / S2: 靈活性與加速器** | `/` 搜尋快捷鍵 (含欄位保護)、`Esc` 階層式退出、`100% Coursework` 一鍵篩選。 | 全域鍵盤監聽、`#filterPillsContainer` |
| **N9: 協助辨識與診斷錯誤** | 未滿足先修條件時提供 `[Inspect Prerequisite CS2201 ->]` 可點擊引導；主修限制給予具體申請表指示。 | 搜尋項目錯誤提示、先修條件樹 |
| **S4: 對話設計產生閉合感 (Closure)** | AIMS 交接卡提供 3 步互動勾選核對清單，全部勾選後進入綠色成就閉合狀態。 | `#liveAuditContainer`、`#startNewRehearsalBtn` |

---

## 5. 四大評分嚴格限制 (4 Non-Negotiable Grading Rules)

本專案完全遵守課程大綱與教授嚴格評分指引：

1. **Zero Auth (零登入)**：無登入/註冊門檻，啟動即進入主人物誌 Marcus Li 的真實排課工作區。
2. **100% Offline Simulation (完全離線)**：純前端單一檔案架構，無後端依賴，不發起任何對城大 AIMS 伺服器的非授權網路爬蟲或寫入。
3. **No GPA Predictors / Sliders (無虛假預測器)**：堅守認知誠實性，不提供任何偽科學的成績滑桿預測，僅呈現教學大綱靜態數據。
4. **Human-in-the-Loop Control Gate (人機協同控制閘門)**：確認彈窗與手動核對清單，確保最終權限與決策始終在學生手中。
5. **Strict Zero Emoji Policy (嚴格零 Emoji 原則)**：全站介面文字、樣式、回饋提示、測試腳本均使用乾淨排版與清晰符號，完全禁用任何彩色表情符號 (Emoji)。

---

## 6. 檔案架構與啟動方式 (File Structure & Quick Start)

### 檔案位置
* **主程式檔案：** [index.html](file:///Users/wat2002221/Desktop/Team%207%20group%20project/index.html)
* **團隊交付目錄鏡像：** [Master_Build_Code/index.html](file:///Users/wat2002221/Desktop/Team%207%20group%20project/google%20drive/01_Master_Prototype_&_Code_%5BJimmy%5D/Master_Build_Code/index.html)
* **規格與實作計畫：**
  - 規格文件：`docs/superpowers/specs/2026-11-12-nielsen-shneiderman-ux-improvements-design.md`
  - 實作計畫：`docs/superpowers/plans/2026-11-12-nielsen-shneiderman-ux-improvements-plan.md`
* **自動化測試套件：**
  - `tests/*.test.mjs` (包含 Tasks 1–8 共 23 個自動化測試單元)

### 如何啟動 (How to Run)
本專案支援兩種啟動方式（完全無需下載或安裝任何外部 npm 套件）：

1. **方法一：使用 npm 命令啟動（推薦）：**
   在終端機中執行以下任一指令即可自動啟動伺服器並彈出瀏覽器：
   ```bash
   npm start
   # 或
   npm run dev
   ```

2. **方法二：直接開啟單一靜態檔案：**
   - **滑鼠雙擊：** 使用任何瀏覽器（Chrome, Safari, Edge）直接雙擊開啟 [index.html](file:///Users/wat2002221/Desktop/Team%207%20group%20project/index.html)。
   - **macOS 命令列開啟：**
     ```bash
     open index.html
     ```

### 執行自動化測試與驗證
```bash
# 執行全部 38 個自動化測試單元
npm test
# 或
node --test tests/*.test.mjs

# 執行設計規範 Linter
node /Users/wat2002221/.gemini/config/skills/design-taste-frontend/scripts/lint.mjs index.html
```

---

## 7. 團隊角色分工 (Team #7 Roster)

* **Lam Kin (Jimmy) — 原型主工程師 (Lead Prototype Developer):** 負責核心原型架構開發、HCI 啟發式評估優化、自動化測試與代碼部署。
* **Aadib — 技術總監與系統架構師 (Technical Lead & Architect):** 負責敏捷 Backlog 維護、系統架構定義、報告章節 2/4/5。
* **Praneel — 影像製作與簡報主管 (Video Producer & Presentation Lead):** 負責展示投影片製作、演示影片剪輯與介面視覺錄製。
* **Hudaifa — 使用者研究主管 (Usability Testing Lead & Moderator):** 負責主持 3 場真人使用者測試實驗、人物誌建構、報告章節 1/3.1–3.2。
* **Louis — 數據分析師與主報告編撰 (Data Analyst & Master Report Lead):** 負責即時測試紀錄、SUS 易用性評分統計計算、報告章節 3.3–3.4/6。
