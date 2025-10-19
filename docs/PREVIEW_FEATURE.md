# Preview Feature Documentation

## Overview
A new preview feature has been added to the Online Notebook application, allowing users to preview notes before downloading them. This helps users make informed decisions about whether the content is useful for them.

## Features Implemented

### 1. Backend API Endpoint
**Location:** `routes/notes.js`

- **New Endpoint:** `GET /api/notes/:id/preview`
- **Purpose:** Serves the file for inline viewing in the browser (without triggering download)
- **Access:** Public
- **Behavior:** 
  - Streams the file with `Content-Disposition: inline`
  - Sets appropriate content type
  - Does NOT increment download counter (only actual downloads count)

### 2. Preview Modal Component
**Location:** `client/src/components/PreviewModal.vue`

A reusable modal component that displays file previews:

**Supported File Types:**
- ✅ **PDF Files** - Displayed in an iframe for full document viewing
- ✅ **Image Files** - Displayed directly in the modal (jpg, jpeg, png, gif, webp, svg, bmp)
- ✅ **Text Files** - Plain text files displayed in iframe (txt, log, md, csv)
- ✅ **Office Documents** - Word, PowerPoint, Excel via Google Docs Viewer (doc, docx, ppt, pptx, xls, xlsx)
- ⚠️ **Other Files** - Shows a message that preview is unavailable with download option

**Features:**
- Large modal window (1200px max width)
- Responsive design for mobile devices
- File information display (type, size)
- Quick download button
- Close functionality (click outside or close button)

### 3. Notes List View (Browse Page)
**Location:** `client/src/views/Notes.vue`

**Changes:**
- Added **"Preview"** button to each note card
- Buttons layout: Preview (secondary) | Details (primary)
- Opens preview modal when clicking preview button
- No page navigation required

### 4. Note Detail View
**Location:** `client/src/views/NoteDetail.vue`

**Changes:**
- Added **"Preview"** button before download button
- Button order: Preview | Download | Delete (if authorized)
- Integrated PreviewModal component
- User can preview before deciding to download

## User Experience Flow

### From Notes List Page:
1. User browses notes
2. Clicks **"Preview"** button on any note
3. Modal opens with file preview
4. User can:
   - View the content (if supported format)
   - Close the modal
   - Download from the modal
   - Or close and click "Details" for more info

### From Note Detail Page:
1. User views note details
2. Clicks **"Preview"** button
3. Modal opens with file preview
4. User decides whether to download
5. If useful, clicks "Download" (increments counter)

## Technical Details

### File Serving
- **Preview:** Uses `Content-Disposition: inline` - browser attempts to display
- **Download:** Uses `Content-Disposition: attachment` - triggers download
- Only downloads increment the download counter

### Browser Compatibility
- PDF preview works in modern browsers with built-in PDF viewers
- Fallback message shown for unsupported file types
- Mobile browsers may handle previews differently

### Performance
- Files are streamed, not loaded into memory
- Preview modal loads on demand
- No impact on existing download functionality

## Benefits

1. **Informed Decisions:** Users can verify content before downloading
2. **Reduced Downloads:** Only useful files are downloaded
3. **Better UX:** Quick preview without leaving the page
4. **Bandwidth Savings:** Users won't download irrelevant files
5. **Accurate Metrics:** Download counter reflects actual useful downloads

## File Type Support

| File Type | Preview Support | Notes |
|-----------|----------------|-------|
| PDF (.pdf) | ✅ Full Support | Displayed in iframe with native browser viewer |
| Images (.jpg, .jpeg, .png, .gif, .webp, .svg, .bmp) | ✅ Full Support | Displayed directly as image |
| Text Files (.txt, .log, .md, .csv) | ✅ Full Support | Displayed in iframe |
| Word Documents (.doc, .docx) | ✅ Full Support | Via Google Docs Viewer |
| Excel (.xls, .xlsx) | ✅ Full Support | Via Google Docs Viewer |
| PowerPoint (.ppt, .pptx) | ✅ Full Support | Via Google Docs Viewer |
| Other | ❌ Not Supported | Download option provided |

**Note:** Office documents (Word, Excel, PowerPoint) use Google Docs Viewer for preview. This requires the file to be publicly accessible. The preview may take a few seconds to load.

## Usage Instructions

### For End Users:
1. Navigate to Notes page (`/notes`)
2. Click "Preview" on any note card
3. View the content in the modal
4. Decide to download or close
5. Download button available in both modal and detail page

### For Administrators:
- No additional configuration needed
- Preview feature works automatically for all notes
- Download statistics remain accurate

## Future Enhancements (Optional)

Potential improvements that could be added:
- Support for more file types (Office documents)
- Thumbnail previews on note cards
- Full-screen preview mode
- Print from preview
- Share preview link
- Preview with annotations

## Files Modified

1. `routes/notes.js` - Added preview endpoint
2. `client/src/components/PreviewModal.vue` - New component with multi-format support
3. `client/src/views/NoteDetail.vue` - Added preview button
4. `client/src/views/Notes.vue` - Added preview button to cards
5. `middleware/upload.js` - Updated to allow images and Excel files

## Testing Checklist

- [ ] Preview PDF files (.pdf)
- [ ] Preview image files (.jpg, .png, .gif, .webp)
- [ ] Preview text files (.txt)
- [ ] Preview Word documents (.doc, .docx)
- [ ] Preview PowerPoint files (.ppt, .pptx)
- [ ] Preview Excel files (.xls, .xlsx)
- [ ] Preview unsupported file types (shows fallback)
- [ ] Download from preview modal
- [ ] Download counter increments only on actual download
- [ ] Mobile responsive design
- [ ] Close modal by clicking outside
- [ ] Close modal by close button
- [ ] Preview from notes list
- [ ] Preview from detail page
- [ ] File extension detection works correctly
- [ ] Google Docs Viewer loads for Office documents

---

**Last Updated:** October 12, 2025
**Version:** 1.0.0

