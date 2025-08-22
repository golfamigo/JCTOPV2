# 7\. 系統整合遵循原則 (System Integration Adherence)

對於**基礎設施與部署**、**編碼標準**、**測試策略**和**安全性**，核心原則是**完全遵循並整合至現有系統**。

  * **部署:** 不變更現有 CI/CD 流程。
  * **標準:** 新程式碼需通過現有 Linter 和 Formatter 檢查。
  * **測試:** 新元件的單元測試需使用現有測試框架。



從程式碼組織到部署架構：Zeabur 平台的全棧應用部署權威指南前言：從程式碼組織到部署架構開發者在專案初期提出的問題——「我現在是把 master 分支為 backend 與 frontend，如果依這個 story 去做，不需要對嗎？」——觸及了一個從本地程式碼組織過渡到正式部署策略的關鍵節點。這個問題不僅僅是關於 Git 的使用習慣，更是一項影響專案可擴展性、可維護性及部署效率的根本性架構決策。對此問題的直覺性質疑是完全正確的，並且是邁向現代化開發維運（DevOps）實踐的重要一步。現代化的平台即服務（PaaS），如 Zeabur，其核心設計理念是將 Git Repository 視為應用程式狀態的唯一真實來源（Single Source of Truth）1。平台的職責是解析這個 Repository，並自動化處理複雜的部署流程。這種模式極大地簡化了開發者的工作，讓他們能專注於編寫程式碼，而非基礎設施的管理 1。在此模式下，將所有相關服務的程式碼集中管理（co-located code）遠比分散在不同分支中更具優勢。本報告旨在提供一份權威性的技術指南，不僅直接回答關於分支策略的問題，更將從根本上重塑對現代化部署架構的理解。報告將依序深入探討以下核心主題：首先，分析並確立最佳的 Repository 組織策略；其次，介紹如何透過宣告式設定檔來進行多服務的精密編排；接著，比較不同的建置策略，以應對不同場景的需求；最後，提供一套完整的、可操作的部署與維運流程。第一節：重新思考 Repository 策略：Monorepo 的必要性本節將深入剖析為何「每個服務一個分支」的模式是一種反模式（anti-pattern），並闡述為何 Monorepo（單一程式碼庫）是 Zeabur 平台上的慣用且最佳的實踐方式。1.1 「每個服務一個分支」的反模式使用獨立的 Git 分支來區分前端和後端服務，雖然在概念上看似清晰，但在實際的開發與部署流程中會引發一系列技術與協作上的難題。協作與同步的開銷：當後端 API 發生變更時（例如，在 backend 分支中修改了一個端點），前端（在 frontend 分支中）必須進行相應的調整。這導致開發團隊需要手動協調兩個分支的合併與部署時間點，以避免線上版本出現前後端不匹配的錯誤。這種跨分支的依賴性大大增加了溝通成本與出錯風險。喪失原子性提交（Atomic Commits）：在一個功能開發中，往往需要同時修改後端 API 的合約與前端消費此 API 的客戶端程式碼。在分支隔離的模式下，無法透過一次性的、原子性的提交來記錄這個完整的變更。這使得程式碼的歷史紀錄變得支離破碎，難以追溯某個功能的完整演進過程，也讓版本回滾變得極其複雜與危險。成熟的 CI/CD 流程極度依賴原子性變更來確保部署的穩定性 4。與平台模型的根本性衝突：Zeabur 的部署模型是將一個特定的分支與一個環境（如 production、staging）進行綁定 1。若將分支用於區分服務，則從根本上誤解了此模型。這將迫使開發者在 Zeabur 的儀表板上手動為 frontend 分支和 backend 分支創建兩個完全獨立、互不關聯的服務，從而失去了在同一個專案中統一管理、監控和網路互聯的巨大優勢。與此相對，Monorepo 將所有相關專案（前端、後端、共用函式庫等）都放在同一個 Git Repository 的不同子目錄中，提供了顯著的優勢：統一的版本控制與原子性提交：任何跨服務的功能變更都可以透過一次 git push 完成，確保部署到線上的永遠是一套經過完整測試、版本一致的應用程式。簡化的依賴管理：共用的函式庫、TypeScript 類型定義、設定檔等可以輕鬆地在不同服務間共享與版本控制，避免了程式碼的重複與不一致。流線型的 CI/CD 流程：單一的 CI 管線可以被觸發，來測試和部署所有受影響的服務。Zeabur 平台「開箱即用」的 CI/CD 功能正是為了充分利用這種模式而設計的 3。1.2 Monorepo 的控制面板：使用 zbpack.json 設定服務當採用 Monorepo 架構後，下一個問題便是：如何告知 Zeabur 在這個龐大的 Repository 中，哪個子目錄對應哪個服務？答案是透過 zbpack.json 這個設定檔。zbpack 是 Zeabur 內部的建置工具，它能自動分析程式碼並產生建置計畫 8。而 zbpack.json 檔案則像是指揮 zbpack 的控制面板，為其提供處理 Monorepo 中特定服務的必要指令。app_dir 指令：這是處理 Monorepo 最核心的屬性，它明確告知 Zeabur 某個服務的原始碼位於哪個子目錄。Zeabur 的官方文件為 Node.js 專案提供了非常清晰的範例 9。語法與應用：假設 Repository 結構為 apps/backend 和 apps/frontend，為了分別部署這兩個服務，需要在 Repository 的根目錄下創建對應的設定檔。檔案名稱可以使用 zbpack.[service-name].json 的格式，其中 service-name 對應您在 Zeabur 上創建的服務名稱。JSON// 檔案路徑: /zbpack.backend.json
// 此設定檔用於名為 "backend" 的服務
{
  "app_dir": "apps/backend"
}
JSON// 檔案路徑: /zbpack.frontend.json
// 此設定檔用於名為 "frontend" 的服務
{
  "app_dir": "apps/frontend"
}
這種方法不僅適用於 Node.js。Zeabur 對其他語言也提供了一致的解決方案，例如.NET 使用 dotnet.submodule_dir 10，Go 語言則使用 go.entry 11，這體現了平台設計上的一致性。自訂建置與啟動指令：在 Monorepo 中，通常會使用 npm workspaces 或 pnpm workspaces 等工具，並在根目錄的 package.json 中定義指令來建置或啟動特定的子專案。zbpack.json 允許覆寫 Zeabur 的預設行為，以適應這種工作流程 9。語法與範例：使用 build_command 和 start_command 屬性。JSON// 檔案路徑: /zbpack.frontend.json
{
  "app_dir": "apps/frontend",
  "build_command": "npm run build",
  "start_command": "npm run start:prod"
}
值得強調的是，zbpack.json 的職責範疇有其明確的界線。它是一個針對單一 Git 來源服務的建置期設定檔。其目的是指導 zbpack 建置系統如何從 Monorepo 的特定子目錄中建置出可執行的產物。它本身不具備定義多個服務（例如，一個後端服務和一個資料庫服務）或聲明服務之間依賴關係（例如，後端必須在資料庫啟動後才能啟動）的能力。這個看似微小的區別，實際上是理解 Zeabur 平台分層設定理念的關鍵。要解決整個應用程式堆疊的編排問題，我們需要一個更強大的工具。第二節：使用 Zeabur 範本進行進階編排 (zeabur.yaml)zeabur.yaml 是 Zeabur 提供的「基礎設施即程式碼」（Infrastructure as Code, IaC）解決方案，它允許開發者透過一個 YAML 檔案，以宣告式的方式定義整個專案的架構。這正是解決 zbpack.json 局限性的關鍵。2.1 從隱性設定到宣告式基礎設施雖然可以直接在 Zeabur 的儀表板上透過點擊介面來逐一創建服務，這種方式對於快速原型開發非常方便 12。然而，當專案變得複雜時，這種手動操作的弊端便會顯現：它不可重現、無法進行版本控制，且難以與團隊成員共享。zeabur.yaml 檔案，也被稱為 Zeabur 範本，其概念類似於 docker-compose.yml 13。它允許將整個專案——包含所有服務（無論是來自 Git 還是預建置的 Docker 映像檔）、環境變數、儲存空間以及服務間的依賴關係——全部定義在一個與應用程式碼共同存放的檔案中。這種做法帶來了巨大的好處：可重現性（一鍵複製整個專案）、版本控制（基礎設施的變更與程式碼變更同步記錄），以及透過命令列工具實現的自動化部署 15。2.2 zeabur.yaml 範本的結構解析一個標準的 zeabur.yaml 檔案由幾個主要部分構成，其完整的 Schema 可以在 Zeabur 的官方 Repository 中找到 14。apiVersion 與 kind：標準的元資料欄位，用於標識資源的版本與類型。metadata：描述範本本身的資訊，如 name（名稱）、description（描述）和 tags（標籤），這些資訊會顯示在 Zeabur 的範本市場中 14。spec.services：這是範本的核心，一個包含了所有服務定義的陣列。每個服務都是一個獨立的物件，其關鍵屬性如下：name：服務的唯一名稱，例如 backend、frontend、database。這個名稱在後續的依賴管理和變數引用中至關重要。template.type：定義服務來源的關鍵欄位。GIT：表示服務從 Git Repository 部署 14。需要額外提供 repoType（目前僅支援 GITHUB）和 repoID（格式為 owner/repo）。PREBUILT：表示服務從一個預建置的 Docker 映像檔部署 14。需要額外提供 image（例如 postgres:16）。dependencies：一個字串陣列，列出此服務啟動前必須處於運行狀態的其他服務的 name。這是確保應用程式啟動順序正確的關鍵，例如，後端服務必須等待資料庫服務準備就緒。variables：一個鍵值對（map），用於設定該服務的環境變數。volumes：定義服務的持久性儲存路徑，確保資料在服務重啟或重新部署後依然存在 14。configs：允許將設定檔的內容掛載到服務的指定路徑中，方便管理如 Nginx 設定等檔案 14。2.3 實踐應用：一個完整的全棧 zeabur.yaml假設一個典型的全棧應用場景：一個 Monorepo，其中包含位於 /apps/api 的 Node.js 後端，和位於 /apps/web 的 React 靜態前端。後端服務需要連接到一個 PostgreSQL 資料庫。以下是一個完整且帶有詳盡註解的 zeabur.yaml 範例，可以直接應用於此場景：YAML# 檔案路徑: /zeabur.yaml
apiVersion: v1
kind: Template
metadata:
  name: full-stack-monorepo-app
  description: 一個包含前後端與資料庫的全棧應用範本

spec:
  services:
    # 後端服務 (從 Monorepo 子目錄建置)
    - name: backend
      template:
        type: GIT
        # 注意：repoID 必須是 GitHub 上的完整 '擁有者/倉庫名稱' 字串
        repoID: "your-github-username/your-repo-name"
        # 指定要部署的分支
        branch: "main"
      # Zeabur 會使用 zbpack 來建置此服務。
      # 因此，需要在 Repository 根目錄下創建一個 zbpack.backend.json 檔案，
      # 內容為：{ "app_dir": "apps/api" }，以指向正確的子目錄。
      dependencies:
        - database # 確保在後端啟動前，資料庫服務已準備就緒
      variables:
        # 引用由 database 服務暴露的連接字串
        DATABASE_URL: "${POSTGRES_CONNECTION_STRING}"
        # Zeabur 會自動將 PORT 環境變數注入容器
        PORT: "8080"

    # 前端服務 (從 Monorepo 子目錄建置)
    - name: frontend
      template:
        type: GIT
        repoID: "your-github-username/your-repo-name"
        branch: "main"
      # 同樣，需要一個 zbpack.frontend.json 檔案來指定子目錄與靜態檔案輸出目錄。
      # 內容範例：{ "app_dir": "apps/web", "output_dir": "build" }
      variables:
        # 範例：前端應用需要知道後端服務的公開 URL
        # Zeabur 提供了 ${ZEABUR___URL} 格式的特殊變數
        REACT_APP_API_URL: "${ZEABUR_backend_URL}"

    # 資料庫服務 (從預建置的 Docker 映像檔部署)
    - name: database
      template:
        type: PREBUILT
        # 使用 Docker Hub 上的官方 postgres 映像檔
        image: "postgres:16"
      variables:
        # 遵循官方 PostgreSQL 映像檔的標準環境變數 [17]
        POSTGRES_USER:
          default: "user"
        POSTGRES_PASSWORD:
          default: "password" # 在生產環境中，應使用 Zeabur 的秘密管理功能
        POSTGRES_DB:
          default: "mydatabase"
        # Zeabur 會自動為資料庫服務創建並暴露連接變數 [18, 19]
        POSTGRES_CONNECTION_STRING:
          expose: true # 將此變數暴露給專案中的其他服務使用
      volumes:
        # 將 PostgreSQL 的資料目錄持久化，以防資料遺失
        - dir: /var/lib/postgresql/data
從這個範例中，可以清楚地看到 zeabur.yaml 和 zbpack.json 之間並非互斥，而是一種共生關係。zeabur.yaml 負責宏觀的服務編排，定義了專案中有哪些服務（What）；而對於 GIT 類型的服務，zbpack.json 則負責微觀的建置設定，定義了如何建置這些服務（How）。當 Zeabur 解析 zeabur.yaml 並開始部署 backend 服務時，它知道這是一個 GIT 類型的服務，需要從指定的 repoID 和 branch 中拉取程式碼。然而，zeabur.yaml 的 Schema 本身並沒有提供如 app_dir 這樣的欄位來指定子目錄 14。因此，Zeabur 會將建置任務交給其內部的 zbpack 系統。zbpack 接著會在 Repository 的根目錄中尋找 zbpack.backend.json 檔案，並根據其中的 app_dir 指令，進入到 apps/api 目錄來執行後續的語言偵測與建置流程 9。這是一個關鍵的、環環相扣的過程，理解這一點對於成功使用 zeabur.yaml 部署 Monorepo 至關重要。為了更清晰地對比這兩種設定方式，下表總結了它們各自的職責與適用場景。表 1：Zeabur 上的 Monorepo 設定方法對比特性zbpack.jsonzeabur.yaml主要目的單一 Git 服務的建置期設定整個專案中多個服務的編排作用範圍單一服務整個專案定義 Git 服務否（隱式，透過檔案存在於 Repo 中）是（顯式，透過 repoID 等欄位）定義預建置服務否是（例如資料庫、Redis 等）管理服務依賴否是（透過 dependencies 關鍵字）部署方式git push 自動觸發透過 Zeabur CLI 手動執行典型用例「我需要從 Monorepo 的子目錄部署單一服務」「我需要用一個檔案定義並部署整個全棧應用」第三節：掌握建置策略：Buildpacks vs. DockerfilesZeabur 提供了兩種核心方式將程式碼轉換為可運行的服務：使用平台內建的 Buildpacks（透過 zbpack 實現）或使用開發者自訂的 Dockerfile。理解這兩者之間的權衡，是做出正確架構決策的基礎。表 2：建置策略比較 (zbpack vs. Dockerfile)評估標準zbpack (Buildpacks)Dockerfile設定方式零設定或透過 zbpack.json 進行少量設定逐行編寫的明確指令易用性極高（自動偵測語言與框架）中等（需要 Docker 相關知識）環境控制力有限（由平台管理基礎映像檔與依賴）絕對（完全控制基礎映像檔、系統套件等）建置速度可能更快（受益於平台層級的快取）依賴於映像檔分層快取的優化程度安全性由平台負責基礎映像檔的維護與漏洞修補由使用者自行負責基礎映像檔的安全性最佳適用場景標準框架（Node.js, Python, Go）、快速原型開發複雜的系統依賴、舊有應用程式、高度優化的映像檔3.1 zbpack 的「魔法」：約定優於設定zbpack 是 Zeabur 實現「無需 Dockerfile」承諾的核心工具 1。其工作原理是：當一個 GIT 服務被部署時，zbpack 會自動掃描其程式碼，根據專案結構（例如 package.json、pom.xml、go.mod 等檔案）來識別其語言和框架，然後在背後為使用者動態生成一個最佳化的 Dockerfile 並執行建置 8。這種方法背後的哲學與雲原生 Buildpacks (Cloud Native Buildpacks) 的理念一致 20，其目標是將應用程式碼與底層的作業系統和執行環境的關注點分離。開發者只需專注於業務邏輯，而平台則負責處理打包、安全性和效能優化等繁瑣事務。對於絕大多數使用標準框架的應用程式而言，zbpack 是預設且強烈推薦的起點，它完美契合了 Zeabur 所提倡的「Vibe Coder」理念——專注於程式碼，而非基礎設施 3。3.2 使用自訂 Dockerfile 實現完全控制儘管 zbpack 功能強大，但在某些特定場景下，其自動化能力可能不足以滿足需求。此時，就需要使用自訂的 Dockerfile 來獲得完全的控制權。何時需要 Dockerfile：當應用程式需要特定的系統函式庫，而這些函式庫並未包含在 Zeabur 的預設 Buildpack 映像檔中時（例如，圖像處理需要 imagemagick，或影片處理需要 ffmpeg）。當需要特定版本的作業系統或一個完全自訂的基礎映像檔時。當需要實施一個比 zbpack 自動生成的更複雜的多階段建置（multi-stage build），以極度優化最終映像檔的大小時 24。Zeabur 如何使用 Dockerfile：Zeabur 的建置系統會自動偵測服務的根目錄（對於 Monorepo，即 zbpack.json 中 app_dir 所指定的目錄）下是否存在名為 Dockerfile 或 dockerfile 的檔案。如果存在，Zeabur 將會優先使用這個檔案來進行建置，而不是啟動 zbpack 的自動偵測流程 13。忽略 Dockerfile：在某些情況下，Repository 中可能包含一個僅用於本地開發的 Dockerfile，但在 Zeabur 上部署時，開發者仍希望利用 Buildpacks 的便利性。為此，Zeabur 提供了一個「逃生艙口」：可以在服務的環境變數中設定 ZBPACK_IGNORE_DOCKERFILE=true，或在 zbpack.json 中加入 "ignore_dockerfile": true。這將強制 Zeabur 忽略 Dockerfile 的存在，轉而使用 zbpack 進行建置 13。3.3 在 Monorepo 中整合 Dockerfiles在 Monorepo 中為不同的服務使用 Dockerfile 需要遵循一些最佳實踐，以避免混亂和衝突。服務專用的 Dockerfile：Zeabur 支援特定的命名慣例來將 Dockerfile 與特定服務關聯起來，例如 Dockerfile.[service-name] 或 [service-name].Dockerfile 13。例如，對於名為 backend 的服務，可以將其 Dockerfile 命名為 Dockerfile.backend 並放置在 Repository 根目錄。這樣，即使 frontend 服務使用 Buildpacks，backend 服務也能被正確地使用其專用的 Dockerfile 進行建置。優化建置上下文（Build Context）：在 Monorepo 中使用 docker build 的一個常見挑戰是建置上下文過大，因為預設情況下，整個 Repository 都會被發送到 Docker daemon。這會顯著拖慢建置速度。雖然 Zeabur 的文件未詳細說明其上下文處理機制，但業界的最佳實踐是使用如 Turborepo 的 turbo prune --docker 24 等工具。該指令可以在執行 docker build 之前，先在一個臨時目錄（例如 ./out）中創建一個僅包含目標服務及其依賴項的最小化、自給自足的專案副本。這可以極大地縮小建置上下文，提升建置效率。第四節：部署與維運的規範指南本節將前述所有概念整合成一個清晰、可執行的工作流程，並提供部署後進行管理與除錯的必要指導。4.1 推薦的架構與工作流程總結前文的分析，一個穩健且可擴展的 Zeabur 部署工作流程應遵循以下最佳實踐：程式碼結構：使用單一的 Git Repository (Monorepo)，並以 main 或 master 作為主要開發分支。將不同服務的程式碼組織在不同的子目錄中（例如 /apps/frontend、/apps/backend）。服務編排：在 Repository 的根目錄下創建一個 zeabur.yaml 檔案，用它來定義整個應用程式堆疊，包括前端、後端、資料庫等所有服務。建置設定：對於在 zeabur.yaml 中定義的每一個 GIT 類型服務，都在 Repository 根目錄下創建一個對應的 zbpack.[service-name].json 檔案，並在其中使用 app_dir 指定其原始碼所在的子目錄。建置策略：優先使用 Zeabur 預設的 Buildpacks (zbpack)。只有在遇到 zbpack 無法滿足的特定需求時（如需要安裝特殊系統依賴），才為該服務引入自訂的 Dockerfile。部署執行：使用 Zeabur CLI（命令列工具）來從 zeabur.yaml 範本部署整個專案。4.2 透過 Zeabur CLI 進行逐步部署使用 zeabur.yaml 部署專案的主要方式是透過 Zeabur CLI。前置條件：確保本地環境已安裝 Node.js，以便使用 npx 來執行 CLI 工具 25。第一步：登入帳戶：首先，需要授權 CLI 訪問您的 Zeabur 帳戶。指令：npx zeabur auth login 25此指令會自動打開瀏覽器，引導您完成 Zeabur 的 OAuth 授權流程。第二步：選擇專案上下文：部署需要一個目標專案。您可以在 Zeabur 儀表板上預先創建好一個專案 27，然後使用 CLI 將其設定為當前操作的上下文。指令：npx zeabur context set project 25執行後，CLI 會以互動模式列出您所有的專案供您選擇。第三步：部署範本：這是執行部署的核心步驟。在包含 zeabur.yaml 檔案的目錄下執行以下指令。指令：npx zeabur template deploy -f zeabur.yaml 15執行此指令後，CLI 會將 zeabur.yaml 的內容上傳至 Zeabur 的 API 29。接著，Zeabur 平台會解析這個範本：首先，根據 PREBUILT 的定義，快速佈建如 PostgreSQL 等服務；然後，根據 GIT 的定義，觸發對應 Repository 的程式碼建置流程。整個應用程式堆疊將依照 dependencies 中定義的順序被依序啟動。4.3 部署後的基本維運：除錯與日誌分析部署失敗是開發過程中的常態，而日誌（Logs）是定位問題最主要的工具。如何存取日誌：Zeabur 提供了多種管道來查看服務的日誌。儀表板介面（Dashboard UI）：這是最直觀的方式。在 Zeabur 儀表板中，每個服務的每次部署都有一個專門的日誌查看器，可以分別查看建置日誌（Build Logs）和執行日誌（Runtime Logs） 1。Zeabur CLI：對於習慣在終端機中工作的開發者，CLI 也提供了查詢建置和執行日誌的功能，方便進行腳本化操作或快速查看 30。日誌匯出：當需要進行更深入的離線分析，或與團隊成員共享日誌以協助除錯時，Zeabur 支援將執行日誌匯出為 CSV 格式的檔案 31。常見失敗點與除錯策略：建置失敗：首先檢查建置日誌。常見原因包括程式碼編譯錯誤、缺少依賴套件、或 zbpack.json 中的 app_dir 或 build_command 設定不正確。執行失敗：檢查執行日誌。一個非常普遍的問題是應用程式啟動時無法連接到資料庫。此時應檢查：zeabur.yaml 中的 dependencies 是否已正確設定，確保後端在資料庫之後啟動。後端服務的環境變數是否正確引用了資料庫的連接字串（例如，${POSTGRES_CONNECTION_STRING}）18。Zeabur 的一篇部落格文章提供了一個真實案例，作者透過檢查執行日誌，發現了因命名錯誤導致的資料庫連接失敗問題，這凸顯了日誌在除錯中的關鍵作用 32。進階除錯：如果日誌資訊不足以定位問題，可以使用 Zeabur 儀表板上的「執行指令（Execute Command）」功能。它允許您直接在正在運行的容器中打開一個 shell，進行即時的環境檢查與問題排查 33。結論：建立可擴展的部署思維回到最初的問題，將前後端服務以 Git 分支進行隔離，在現代化的 PaaS 平台上不僅是不必要的，更是一種與平台設計理念背道而馳的反模式。本報告所闡述的，是基於業界最佳實踐並充分利用 Zeabur 平台能力的推薦策略：採用 Monorepo 結構來統一管理程式碼，並透過 zeabur.yaml 檔案以「基礎設施即程式碼」的方式來宣告式地編排整個應用程式堆疊。這個工作流程的核心優勢在於其清晰性、可重現性與可擴展性。它將基礎設施的定義納入版本控制，使得每一次部署都變得可預測且可靠。雖然從傳統的分支模型轉換到此模式需要一定的學習和適應，但這項投入將帶來長期的回報：一個更穩健、更易於維護、部署效率更高的開發流程。透過採納這種部署思維，開發者將能真正釋放 Zeabur 平台的全部潛力，將更多精力投入到創造卓越的產品本身。