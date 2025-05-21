# Knowledge Guide Refactoring Plan

## Overview

This document outlines a comprehensive refactoring plan for the Knowledge Guide project, focusing on improving maintainability, readability, and testability. The plan is designed to be implemented in small, incremental steps, ensuring that the application remains functional throughout the refactoring process.

## Current Issues

1. **Large Monolithic Files**:
   - `main.py` (~1220 lines): Contains API routes, Google Drive integration, webhooks, and file processing logic
   - `organize.py` (~900 lines): Contains file extraction, content processing, and API call logic
   - Frontend components with multiple responsibilities (e.g., `StagingTable.js`)

2. **Mixed Concerns**: Code that handles multiple responsibilities within the same files

3. **API Call Logic**: Duplicated and scattered across components in the frontend

## Refactoring Goals

1. Improve code maintainability through modularization
2. Separate concerns into focused modules
3. Enhance readability
4. Enable easier future enhancements
5. Maintain functionality throughout the process

## Refactoring Plan

### Phase 1: Backend Refactoring - `organize.py`

#### Step 1: Create Extractor Modules
1. Create directory structure for extractors:
   ```
   apps/pkm-indexer/extractors/
     __init__.py
     pdf_extractor.py
     image_extractor.py
     text_extractor.py
     docx_extractor.py
     pptx_extractor.py
     xlsx_extractor.py
     web_extractor.py
   ```

2. Move specific extraction functions from `organize.py` to appropriate modules:
   - Move `extract_text_from_pdf()` → `pdf_extractor.py`
   - Move `extract_text_from_image()` → `image_extractor.py`
   - Move various document extraction functions to their respective modules

3. Create a unified extractor interface in `__init__.py` that selects the appropriate extractor based on file type

#### Step 2: Create Content Processors
1. Create directory for content processors:
   ```
   apps/pkm-indexer/processors/
     __init__.py
     content_processor.py
     metadata_processor.py
     ai_processor.py
     linkedin_processor.py
   ```

2. Move processing logic from `organize.py`:
   - Move AI processing logic → `ai_processor.py`
   - Move metadata extraction → `metadata_processor.py`
   - Move special case processing (LinkedIn, etc.) → specialized processors

#### Step 3: Create Utility Modules
1. Create utility modules for shared functionality:
   ```
   apps/pkm-indexer/utils/
     __init__.py
     file_utils.py
     logging_utils.py
     url_utils.py
   ```

2. Move utility functions from `organize.py`:
   - Move file type detection → `file_utils.py`
   - Move logging functionality → `logging_utils.py`
   - Move URL handling → `url_utils.py`

#### Step 4: Refactor `organize.py`
1. Transform `organize.py` into a coordinator that uses the new modules
2. Ensure backwards compatibility with `main.py`

### Phase 2: Backend Refactoring - `main.py`

#### Step 1: Create API Route Modules
1. Create directory for API routes:
   ```
   apps/pkm-indexer/api/
     __init__.py
     file_routes.py
     search_routes.py
     drive_routes.py
     webhook_routes.py
     status_routes.py
   ```

2. Move API endpoint handlers from `main.py` to appropriate route modules

#### Step 2: Create Service Modules
1. Create directory for services:
   ```
   apps/pkm-indexer/services/
     __init__.py
     drive_service.py
     webhook_service.py
     file_service.py
     search_service.py
   ```

2. Move service logic from `main.py`:
   - Move Google Drive integration → `drive_service.py`
   - Move webhook management → `webhook_service.py`
   - Move file operations → `file_service.py`
   - Move search functionality → `search_service.py`

#### Step 3: Refactor `main.py`
1. Transform `main.py` into an application factory that initializes and configures the FastAPI app
2. Import and register routes from the api modules
3. Set up middleware and global configurations

### Phase 3: Frontend Refactoring

#### Step 1: Create API Service
1. Create service module for API interactions:
   ```
   apps/pkm-app/services/
     api.js
   ```

2. Move all API call logic from components to this service module

#### Step 2: Refactor StagingTable Component
1. Break down the large component into smaller, focused components:
   ```
   apps/pkm-app/components/
     staging/
       StagingTableRow.js
       StagingTableActions.js
       StagingMetadataEditor.js
       StagingContentEditor.js
     StagingTable.js (coordinator)
   ```

#### Step 3: Extract Common UI Components
1. Create reusable UI components:
   ```
   apps/pkm-app/components/ui/
     Button.js
     StatusBadge.js
     Card.js
     LoadingIndicator.js
   ```

2. Replace inline styles with these components

#### Step 4: Create Custom Hooks
1. Create custom hooks for shared functionality:
   ```
   apps/pkm-app/hooks/
     useFileStats.js
     useSyncDrive.js
     useWebhookStatus.js
     useQuery.js
   ```

## Implementation Strategy

### General Guidelines
1. Tackle one module at a time
2. Make the smallest possible change that works
3. Manually test functionality after each change
4. Work through the plan in the order presented, as later steps build on earlier ones

### For Each Refactoring Step
1. Create the necessary directory/file structure
2. Extract one function or feature at a time
3. Update imports in the original file
4. Test that everything still works
5. Move to the next function or feature

### Validation Steps After Each Major Phase
1. Run the application locally
2. Test all major functionality:
   - File upload/sync with Google Drive
   - File processing
   - Search functionality
   - Staging and approval process

## Potential Future Enhancements (Post-Refactoring)

1. **Add Automated Testing**:
   - Unit tests for backend services and utilities
   - Component tests for frontend
   - Integration tests for critical paths

2. **Improved Error Handling**:
   - More consistent error handling patterns
   - Better error reporting to users

3. **Performance Optimizations**:
   - Pagination for large data sets
   - Memoization for expensive operations

4. **UI/UX Improvements**:
   - More responsive design
   - Loading states and feedback
   - Enhanced accessibility

## Conclusion

This refactoring plan provides a structured approach to improving the Knowledge Guide codebase while maintaining functionality. By following this incremental process, we can gradually transform the codebase into a more maintainable, modular structure that will be easier to enhance and extend in the future.
