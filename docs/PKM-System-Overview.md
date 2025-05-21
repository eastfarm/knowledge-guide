# Personal Knowledge Management (PKM) System — Overview (last updated: 2025-05-20 06:45 CET)

needs updating  

---

## **Purpose**

The PKM system is designed to help a non-coder manage personal knowledge across Windows PC and iOS (iPhone, Apple Watch) using a Progressive Web App (PWA). It enables capture, organization, review, and querying of diverse data types—notes, PDFs, URLs, videos, audio, and more—using AI for metadata generation and semantic search.

The system automatically ingests files from `~/GoogleDrive/PKM/Inbox`, which can be populated via:

* iOS Drafts app
* Manual file uploads
* Email Shortcuts (Phase 2)

All data is transformed into structured markdown metadata records containing AI-enriched extracts (semantic summaries), tags, and references to the original source files. Text content is included only when appropriate. The system is simple, extensible, and will be voice-enabled (in Phase 2).

---

## **System Architecture**

![System Architecture Diagram]

### **Data Flow**

1. Files are added to Google Drive PKM/Inbox folder
2. Webhook notification triggers backend processing
3. Files are downloaded to local inbox
4. OpenAI processes files to generate metadata
5. Metadata and original files are uploaded to separate folders
6. Files are indexed for semantic search
7. Frontend displays files for review and querying

### **Component Overview**

#### **Backend (pkm-indexer)**

* **Stack**: Python (FastAPI), `frontmatter`, `openai`, `faiss`, Google Drive API
* **Deployment**: Railway — `pkm-indexer-production.up.railway.app`
* **Core Responsibilities**:
  * Monitor/sync files from Google Drive Inbox via webhooks
  * Generate rich metadata extracts using OpenAI
  * Extract and summarize content from PDFs, audio, images, URLs, and markdown
  * Store structured `.md` metadata files with frontmatter and optional content
  * Serve metadata extracts via API and enable approval/review
  * Index extracts and metadata fields into FAISS for retrieval

* **Key Modules**:
  * `main.py`: API endpoints, webhook handling, and Google Drive integration
  * `organize.py`: Processes files, generates AI extracts, injects metadata
  * `index.py`: Indexes extracts and metadata

* **File Structure**:
  (Note: The `pkm-indexer` application creates the following directories at runtime, prefixed with `pkm/` (e.g., `pkm/Inbox/`, `pkm/Logs/`). When the application is deployed on Railway.app (its primary operational environment), these directories exist **"locally" within the Railway.app server environment where `pkm-indexer` executes**. They are temporary working directories for the application, distinct from the persistent storage folders on Google Drive, and are not part of the committed repository structure. For example, on Railway, a log path might resolve to something like `/app/apps/pkm-indexer/pkm/Logs/`. During local development on a personal computer, these directories would be created on that machine, e.g., `c:\\\\Users\\\\Paul\\\\OneDrive\\\\Documents\\\\GitHub\\\\knowledge-guide\\\\apps\\\\pkm-indexer\\\\pkm\\\\Logs\\\\`.)
  * `pkm/Inbox/` — Runtime directory for files downloaded from Google Drive.
  * `pkm/Processed/`
    * `Metadata/` — Runtime directory for YAML frontmatter `.md` records (extracts, tags, source refs).
    * `Sources/` — Runtime directory for original files, organized by type (PDFs, images, audio, etc.).
  * `pkm/Logs/` — Runtime directory for detailed logs of all operations.
  * `pkm/Archive/` — Optional runtime directory for long-term storage for previously handled files

#### **Frontend (pkm-app)**

* **Stack**: Next.js PWA, React, Axios
* **Deployment**: Railway — `pkm-app-production.up.railway.app`
* **Core Responsibilities**:
  * Review metadata extracts in staging
  * Edit and approve titles, tags, categories, extracts
  * Provide access to logs and system status
  * Search indexed extracts via semantic search

* **Key Components**:
  * `index.js`: Query/search interface and system status
  * `staging.js`: File review queue
  * `StagingTable.js`: Metadata editor with Save and Reprocess options

---

## **Metadata Schema**

All processed files generate a metadata record with the following fields:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| title | string | Document title | Yes |
| date | string | Processing date (YYYY-MM-DD) | Yes |
| file_type | string | Original file type (pdf, image, text, etc.) | Yes |
| source | string | Original filename | Yes |
| source_url | string/null | URL if applicable | No |
| tags | array | Topic-related tags | Yes |
| category | string | Document category | Yes |
| author | string | Content author | No |
| extract_title | string | AI-generated title | Yes |
| extract_content | string | AI-generated summary | Yes |
| reviewed | boolean | Whether file has been approved | Yes |
| parse_status | string | Processing status | Yes |
| extraction_method | string | Method used to extract content | Yes |
| reprocess_status | string | Status of reprocessing (none, requested, in_progress, complete, failed) | Yes |
| reprocess_rounds | string | Number of reprocessing attempts | Yes |
| reprocess_notes | string | User instructions for reprocessing | No |
| processing_profile | string | AI processing profile used | No |
| referenced_urls | array | URLs found in the content | No |
| referenced_resources | array | Resources referenced in content | No |

---

## **API Endpoints**

### **Core Endpoints**

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/staging` | GET | Get files in staging area for review | None |
| `/approve` | POST | Approve or reprocess a file | `file` object with metadata |
| `/sync-drive` | POST | Sync files from Google Drive | None |
| `/search` | POST | Search the knowledge base | `query` string |
| `/trigger-organize` | POST | Process files in local inbox | None |
| `/webhook/status` | GET | Check webhook status | None |
| `/file-stats` | GET | Get file and system statistics | None |
| `/logs` | GET | List available log files | None |
| `/logs/{log_file}` | GET | Get content of specific log | `log_file` string |
| `/upload/{folder}` | POST | Upload file to specified folder | `filename`, `content` (base64) |

### **Google Drive Endpoints**

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/drive-webhook` | POST | Handle Google Drive change notifications | None |
| `/auth/initiate` | GET | Initiate OAuth flow for Google Drive | None |
| `/oauth/callback` | GET | OAuth callback handler | `code` query param |

---

## **Development Environment Setup**

### **Prerequisites**
- Node.js 16+ for frontend development
- Python 3.10+ for backend development
- Google Cloud account with Drive API enabled
- OpenAI API key
- Railway.app account for deployment

### **Local Development Setup**
1. Clone the repository: `git clone https://github.com/eastfarm/pkm-system.git`
2. Set up backend:
   ```bash
   cd apps/pkm-indexer
   pip install -r requirements.txt
   # Create a .env file with the following variables:
   # OPENAI_API_KEY=your_key_here
   # GOOGLE_TOKEN_JSON=your_json_here
   # WEBHOOK_URL=your_webhook_url
   uvicorn main:app --reload
   ```
3. Set up frontend:
   ```bash
   cd apps/pkm-app
   npm install
   npm run dev
   ```

### **Testing Environment**
- The system uses manual testing on the Railway.app deployment
- Frontend: https://pkm-app-production.up.railway.app
- Backend: https://pkm-indexer-production.up.railway.app

---

## **Current Status and Roadmap**

### **Completed Features (May 2025)**
- ✅ Complete backend implementation with FastAPI
- ✅ Complete frontend implementation with Next.js
- ✅ Google Drive webhook integration for real-time file processing
- ✅ AI-powered metadata extraction for various file types
- ✅ Comprehensive logging system
- ✅ Semantic search functionality
- ✅ Save and Reprocess workflow for metadata editing

### **In Progress**
- 🔄 Improving AI extraction reliability and error handling
- 🔄 Fixing metadata display issues in the staging UI
- 🔄 Enhancing reprocessing workflow for failed extractions

### **Next Milestones (June 2025)**
1. Implement thematic taxonomy beyond simple tags
2. Add multi-modal processing improvements for images and audio
3. Develop email integration for direct capture
4. Create dashboard for system monitoring

### **Future Expansion (Q3 2025)**
1. Voice-enabled commands and control
2. Integration with additional storage providers
3. Mobile-optimized UI enhancements
4. AI-assisted content organization recommendations

---

## **Known Issues and Troubleshooting**

### **Common Issues**
1. **Missing Extracts**: If extracts are not being generated, check:
   - OPENAI_API_KEY environment variable is set correctly
   - OpenAI API has not reached its rate limit
   - The file content is readable and not corrupted

2. **Google Drive Sync Issues**:
   - Webhook registration may fail if the WEBHOOK_URL is not publicly accessible
   - Ensure GOOGLE_TOKEN_JSON contains valid OAuth credentials
   - Check logs in `pkm/Logs/` (runtime directory, e.g., `apps/pkm-indexer/pkm/Logs/`) for detailed error messages

3. **Frontend Build Errors**:
   - JavaScript files must use `//` comments, not `#` comments
   - Ensure Next.js compatibility with Link components

### **Debugging Tools**
- Backend logs accessible at `/logs` endpoint
- System status displayed on the frontend homepage
- Railway.app provides deployment logs for debugging

---

## **Code Patterns and Conventions**

### **File Organization**
- Backend Python files follow the single-responsibility principle
- Frontend components are organized by feature
- Logs and data files are stored in a structured folder hierarchy

### **Naming Conventions**
- Python: snake_case for functions and variables, PascalCase for classes
- JavaScript: camelCase for variables and functions, PascalCase for components
- Files: descriptive names with hyphens for multi-word filenames

### **Error Handling**
- Backend errors are logged to timestamped files in `pkm/Logs/` (runtime directory, e.g., `apps/pkm-indexer/pkm/Logs/`).
- Critical errors send meaningful responses to the frontend
- Frontend displays user-friendly error messages

### **State Management**
- Frontend uses React useState and useEffect for local component state
- Backend maintains a webhook state object for tracking Google Drive integration

---

## **Integration Details**

### **Google Drive Integration**
- Authentication uses OAuth 2.0 flow
- Webhook notifications trigger real-time processing
- File hierarchy mirrors the local PKM structure
- Credentials are stored in Railway environment variables

### **OpenAI Integration**
- Uses GPT-4 for complex content, optimizes for smaller content
- Extracts use structured prompting with JSON output format
- Error handling includes retries and fallbacks
- API key management via environment variable

### **Future Integrations**
- Email capture will use IMAP/POP3 protocols
- Voice integration will leverage OpenAI Whisper API
- Additional cloud providers will use standardized adapter pattern

---

## **Multi-Modal Processing Pipeline**

The system supports different strategies for different file types:

* **Notes & Text**: Captured and summarized with tags
* **PDFs**: Analyzed for structure, key points extracted with AI
* **Images**: OCR-processed to extract readable text
* **URLs**: Detected and enriched using requests and BeautifulSoup
* **Audio**: Preprocessed (transcription planned for Phase 2)

---

## **Required Environment Variables**

| Variable | Purpose | Format | Required |
|----------|---------|--------|----------|
| OPENAI_API_KEY | Authenticates with OpenAI API | String | Yes |
| GOOGLE_TOKEN_JSON | Google Drive OAuth credentials | JSON String | Yes |
| WEBHOOK_URL | URL for Google Drive webhooks | String | Yes |
| PORT | Web server port | Number | No (defaults to 8000) |

---

## **Deployment Guide**

### **Railway.app Deployment**
1. Fork the repository to your GitHub account
2. Connect your Railway account to GitHub
3. Create two new Railway projects:
   - pkm-indexer
   - pkm-app
4. Set the following environment variables for pkm-indexer:
   - OPENAI_API_KEY
   - GOOGLE_TOKEN_JSON (base64-encoded OAuth credentials)
   - WEBHOOK_URL (set to your Railway deployment URL + "/drive-webhook")
5. Deploy both services from your GitHub repository
6. Configure the Railway domain for CORS (if needed)

---

## **Recent Enhancements**

### **1. Google Drive Real-time Integration**

* Implemented webhook-based monitoring of the PKM/Inbox folder
* Files are processed immediately when added to Google Drive (no manual intervention needed)
* The integration includes automatic renewal of webhooks and comprehensive error handling
* Detailed logs are created for all operations, making troubleshooting easier

### **2. Enhanced Logging System**

* All operations (file discovery, download, processing, upload) are now extensively logged
* Log files are created for each sync operation with timestamp-based naming
* Logs are accessible via the UI for easy troubleshooting
* Error conditions are clearly indicated with detailed information

### **3. Improved Error Handling**

* The system now handles errors gracefully at each step of the process
* Error details are captured in the logs for easier diagnosis
* The UI shows clear information about sync status and issues

### **4. Deployment Optimizations**

* Railway.app deployment has been optimized for reliable operation
* Background tasks ensure webhook registration stays active
* Startup processes automatically set up necessary folders and integrations

### **5. Extract Title and Content Separation**

* The extract is now split into `extract_title` and `extract_content`
* `extract_title` can be inferred by the AI or taken from document content if clearly present
* `extract_content` captures the semantic core of the file

### **6. Approval Workflow: Save vs Reprocess**

* Metadata schema includes:
  * `reprocess_status`: `none`, `requested`, `in_progress`, `complete`
  * `reprocess_rounds`: count of times a file has been reprocessed
  * `reprocess_notes`: optional user instructions for improving analysis or clarifying intent
  * `processing_profile`: preset applied by system or selected by user

* Replaced the "Approve" model with **Save** and **Reprocess** options.

---

## **Glossary**

- **Extract**: An AI-generated summary of a file's content that captures its semantic meaning
- **Frontmatter**: YAML metadata at the beginning of markdown files
- **Metadata**: Structured information about a file, including title, tags, and extracts
- **PKM**: Personal Knowledge Management
- **Reprocessing**: The process of regenerating AI extracts with different parameters
- **Staging Area**: UI for reviewing and approving processed files before they enter the knowledge base
- **Webhook**: HTTP callback that notifies the system when files change in Google Drive

---

## **Research-Grade Extraction Prompt**

```text
You are an expert literary analyst with exceptional comprehension and synthesis abilities. Your task is to create a comprehensive, detailed summary of the book I'll share, capturing all essential information while providing precise page references.

Follow this analytical framework:

1. First, examine the book's structure and organization to understand its framework
- Identify major sections, chapters, and logical divisions
- Note how information flows and connects throughout the text

2. Systematically identify and extract:
- Central arguments and key claims (with exact page references)
- Critical evidence supporting each major point
- Important data, statistics, and research findings
- Essential frameworks, models, or methodologies
- Notable quotes that capture core concepts

3. Step by step, analyze the relationships between concepts by:
- Mapping how ideas build upon each other
- Identifying cause-effect relationships
- Noting comparative analyses or contrasting viewpoints
- Recognizing progression of arguments or narrative development

4. Create a comprehensive summary that:
- Maintains the book's logical structure
- Includes ALL key information with exact page references
- Preserves complex nuances and sophisticated reasoning
- Captures both explicit statements and implicit conclusions
- Retains critical examples that illustrate main concepts

Format your summary with:
- Clear hierarchical organization matching the book's structure
- Bullet points for discrete information with page numbers in parentheses (p.XX)
- Short paragraphs for connected concepts with inline page citations
- Special sections for methodologies, frameworks, or models
- Brief concluding synthesis of the book's most essential contributions

Remember:
- Prioritize depth and comprehensiveness over brevity
- Include ALL significant information, not just highlights
- Reference specific pages for every important point
- Preserve the author's original reasoning process
- Think step by step through the entire content before summarizing
```

---

## **File Processing and Reprocessing Workflow**

This section details the end-to-end lifecycle of a file from ingestion to its availability in the knowledge base, including how it's processed, reviewed, and reprocessed if necessary.

### I. File Ingestion and Initial Processing (`pkm-indexer`)

**Primary Python Modules:** `main.py` (controls synchronization and orchestration), `organize.py` (handles individual file processing, extraction, and AI enrichment).

**A. Synchronization from Google Drive (`main.py:sync_drive`)**
1.  **Connection:** Establishes a connection to the user's Google Drive account.
2.  **Folder Structure Verification:** Ensures the necessary folder structure (`PKM/Inbox`, `PKM/Processed/Metadata`, `PKM/Processed/Sources`) exists, creating them if not.
3.  **Download New Files:** Downloads any new files found in the `PKM/Inbox` Google Drive folder to a temporary local `pkm/Inbox` directory within the `pkm-indexer` service's runtime environment.

**B. Individual File Processing (`organize.py:organize_files` calling `process_file_content`)**
For each file downloaded to the local `pkm/Inbox`:
1.  **File Type Inference (`infer_file_type`):** The file type (e.g., PDF, TXT, DOCX, PNG, JPG) is determined based on its extension.
2.  **Raw Text Extraction:** Content is extracted based on file type:
    *   **PDFs:** `pdfplumber` library is used. A special function (`process_linkedin_pdf`) attempts to isolate the main post content from comments and extraneous elements in LinkedIn PDFs.
    *   **Images (PNG, JPG, etc.):** Optical Character Recognition (OCR) is performed using `pytesseract`.
    *   **Microsoft Office (DOCX, PPTX, XLSX):** Text is extracted using relevant Python libraries (e.g., `python-docx`, `python-pptx`, `openpyxl`).
    *   **Markdown/Text:** Raw content is read directly.
    *   Extraction failures are noted, and an error message may be included in the extracted text itself.
3.  **URL Extraction (`extract_urls`):** Standard `http(s)://` links and Markdown-style links (`[text](url)`) are identified within the extracted text.
4.  **URL Enrichment (`enrich_urls`):** For each discovered URL, the system attempts to fetch the webpage's title and meta description to provide more context.
5.  **Initial Metadata Generation (`process_file_content`):** A JSON object is created to store the file's metadata. This includes:
    *   `filename`: Original name of the file.
    *   `file_type`: Inferred file type.
    *   `extraction_method`: Tool/library used for text extraction (e.g., `pdfplumber`, `ocr`).
    *   `raw_text`: The full extracted text content.
    *   `urls`: A list of found URLs.
    *   `enriched_urls_block`: A formatted string containing URLs with their fetched titles and descriptions.
    *   **`parse_status` Determination (Critical Step):**
        *   If the `OPENAI_API_KEY` environment variable is missing or invalid at this stage, `parse_status` is set to `"basic"` (or a similar status like `"extraction_failed"`). AI processing is skipped, and an error tag/message is typically added to the metadata.
        *   If the API key is valid, the system proceeds to AI enrichment.
6.  **OpenAI Enrichment (`get_extract`):**
    *   This step is performed if the OpenAI API key is valid and `parse_status` indicates readiness for AI processing.
    *   A tailored prompt is constructed based on the file type, content length, extracted text, and any `reprocess_notes` (if the file is undergoing reprocessing).
    *   A call is made to OpenAI's ChatCompletion API (e.g., `gpt-4` or `gpt-3.5-turbo-16k`) to generate:
        *   `extract_title`: A concise, AI-generated title for the content.
        *   `extract_content`: A thematic summary or a more detailed extraction of key information.
        *   `tags`: A list of relevant keywords or tags.
    *   If the OpenAI call is successful and returns valid JSON, these fields are added to the metadata, and `parse_status` is updated to `"full_ai"` (or a similar success status).
    *   Errors during the OpenAI call (e.g., API errors, rate limits, invalid JSON response) are handled. `parse_status` might be set to reflect the error (e.g., `"basic_plus_gpt_error"`), and an `error_message` is added to the metadata.
7.  **Local Persistence:**
    *   The complete metadata (now a JSON object) is saved to a file in the `pkm-indexer`'s local `pkm/Processed/Metadata` directory. The metadata filename typically corresponds to the original file (e.g., `original_filename.pdf.json`).
    *   The original source file is moved from the local `pkm/Inbox` to the local `pkm/Processed/Sources` directory.

**C. Upload to Google Drive (`main.py:sync_drive`)**
1.  The newly created/updated metadata `.json` files are uploaded from the local `pkm/Processed/Metadata` directory to the `PKM/Processed/Metadata` folder on Google Drive.
2.  The original source files (which were moved locally) are uploaded from the local `pkm/Processed/Sources` directory to the `PKM/Processed/Sources` folder on Google Drive.
3.  Successfully processed files (originals) are deleted from the `PKM/Inbox` folder on Google Drive to prevent re-processing.

### II. Staging, Review, and Approval (`pkm-app` Frontend & `pkm-indexer` Backend)

**Components:** `pkm-app/pages/staging.js` (frontend page), `pkm-app/components/StagingTable.js` (frontend component), `pkm-indexer/main.py` (backend API endpoints `/staging` and `/approve`).

**A. Fetching Files for Staging (Frontend Initiated)**
1.  The user navigates to the "Review Staging Files" page in the `pkm-app`.
2.  The frontend (`staging.js`) makes an API call to the `/staging` endpoint of the `pkm-indexer` service.

**B. `/staging` API Endpoint (Backend Logic - `pkm-indexer/main.py:get_staging_files`)**
1.  The `pkm-indexer` reads all `.json` metadata files currently present in its local `pkm/Processed/Metadata` directory (these files are kept in sync with Google Drive).
2.  It filters these files to identify those considered "pending review." The criteria typically include:
    *   The metadata does *not* contain `reviewed: true` (or the `reviewed` field is absent).
    *   The `reprocess_status` is not `approved` or `completed` (exact conditions might vary slightly based on implementation details).
3.  A list of these pending files (including their full metadata and potentially a reference to their original content for display) is returned to the frontend.

**C. Display and User Interaction (Frontend - `StagingTable.js`)**
1.  The files received from the `/staging` endpoint are rendered in a table.
2.  The user can review and edit metadata fields such as `title`, `category`, `tags`, and `extract_content`.
3.  The user can also add `reprocess_notes` if they intend to send the file for reprocessing by the AI.
4.  **"Save" Action:**
    *   The frontend updates its local copy of the file's metadata with any user changes.
    *   It typically sets `reviewed: true` and `reprocess_status: "none"` (or clears the reprocess status).
    *   The entire updated metadata object for the file is sent via a POST request to the `/approve` API endpoint on the `pkm-indexer`.
5.  **"Reprocess" Action:**
    *   The frontend updates its local copy of the file's metadata.
    *   It sets `reprocess_status: "requested"`.
    *   It may increment a `reprocess_rounds` counter in the metadata.
    *   Any `reprocess_notes` entered by the user are included.
    *   The entire updated metadata object is sent via a POST request to the `/approve` API endpoint.

**D. `/approve` API Endpoint (Backend Logic - `pkm-indexer/main.py:approve_file`)**
1.  The `pkm-indexer` receives the updated metadata object from the frontend.
2.  It overwrites the corresponding `.json` metadata file in its local `pkm/Processed/Metadata` directory with the new data.
3.  This change to the local metadata file is then automatically synchronized back to the `PKM/Processed/Metadata` folder on Google Drive by the `sync_drive` process during its next scheduled run or if triggered by a file watcher (if implemented).

### III. Reprocessing Loop (`pkm-indexer` and Google Drive Integration)

**Trigger:** A file's metadata (either updated via the `/approve` endpoint with "Reprocess" or manually edited on Google Drive) contains the flag `reprocess_status: "requested"`.

**A. Detection by `pkm-indexer` (`organize.py:organize_files` and `process_file_content`)**
1.  During its regular scan of local metadata files (which are synced from Google Drive), the `organize_files` function checks the `reprocess_status` field of each metadata object.

**B. Initiating Reprocessing**
1.  If `reprocess_status` is found to be `"requested"`:
    *   The system logs that a reprocessing attempt is being made, often including any `reprocess_notes` found in the metadata.
    *   It may clear or reset previously AI-generated fields (like `extract_title`, `extract_content`, `tags`) and `parse_status` to ensure a fresh analysis. For instance, `parse_status` might be temporarily set to `"reprocessing"`.
    *   The `get_extract` function (responsible for OpenAI calls) is invoked again. The crucial difference is that any `reprocess_notes` from the metadata are passed to `get_extract` and can be incorporated into the prompt sent to OpenAI, guiding the AI's new analysis.

**C. OpenAI Enrichment (Repeated)**
1.  As described in section I.B.6, the file's raw text (and potentially the `reprocess_notes`) is sent to OpenAI for a new round of analysis, title generation, summarization, and tagging.

**D. Metadata Update Post-Reprocessing**
1.  The metadata JSON object is updated with the new AI-generated `extract_title`, `extract_content`, and `tags`.
2.  `parse_status` is updated to reflect the outcome of the reprocessing attempt (e.g., `"full_ai"` if successful).
3.  `reprocess_status` is changed to `"completed"` (or a similar status indicating the request has been handled).
4.  A timestamp, such as `reprocess_last_attempt`, might be recorded.

**E. Persistence and Return to Staging**
1.  The updated metadata file is saved locally by the `pkm-indexer` and subsequently synced back to the `PKM/Processed/Metadata` folder on Google Drive.
2.  If the reprocessing was successful and the `reviewed` flag in the metadata is still `false` (or absent), the file should reappear in the "Review Staging Files" page of the `pkm-app`. This time, it will display its newly AI-enriched metadata, ready for the user's final review and approval via the "Save" action. If "Save" is clicked, `reviewed` becomes `true`, and it will no longer appear in staging unless flagged for reprocessing again.