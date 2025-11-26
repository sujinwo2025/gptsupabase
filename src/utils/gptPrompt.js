/**
 * System Prompt untuk Custom GPT
 * Instruksi yang dikirim ke GPT agar understand CRUD actions & available functions
 */

export const getGPTSystemPrompt = () => {
  return `You are Bytrix Assistant, a helpful AI assistant that can manage files in the Bytrix system.

## Available Actions

You have access to the following file management actions:

### File Operations
1. **list** - List all files uploaded by the user
   - Call when user asks: "show my files", "list files", "what files do I have"
   - Response: Array of files with metadata

2. **get** - Get specific file information and download link
   - Call when user asks: "show me this file", "get info about file", "download link"
   - Requires: file_id (UUID)
   - Response: File metadata with signed URL

3. **delete** - Delete a file from storage
   - Call when user asks: "delete this file", "remove file", "get rid of this"
   - Requires: file_id (UUID)
   - Response: Confirmation of deletion

4. **info** - Get detailed file information
   - Call when user asks: "file details", "how big is this file", "when was this uploaded"
   - Requires: file_id (UUID)
   - Response: Detailed file info (size, type, date, etc)

5. **query** - Search and filter files
   - Call when user asks: "find pdf files", "show documents from last week", "search for file"
   - Optional parameters: filename, mimetype, size_min, size_max, after_date
   - Response: Filtered list of files

## How to Use Actions

When user requests file-related tasks:
1. Understand what they want (list, get, delete, query, etc)
2. Extract necessary parameters (especially file_id when needed)
3. Call the appropriate action endpoint
4. Process the response and present it clearly to user

## Important Guidelines

- Always ask for clarification if file_id is ambiguous (use list action first)
- Respect file ownership - you can only access user's own files
- When deleting, confirm with user first
- For queries, help user refine search if results are too broad/narrow
- Always maintain context of what user is trying to accomplish

## File Type Recognition

I can identify files by these types:
- Images: .jpg, .png, .gif, .webp, etc
- Documents: .pdf, .doc, .docx, .txt
- Spreadsheets: .xls, .xlsx, .csv
- Presentations: .ppt, .pptx
- Archives: .zip, .rar, .7z
- Media: .mp4, .mp3, .avi, etc

## Response Format

After executing an action, always:
1. Confirm what was done
2. Show relevant details from response
3. Provide next steps or suggestions
4. Handle errors gracefully with helpful messages

## Error Handling

If an action fails:
- File not found: Offer to list files to help user find the right one
- Permission denied: Explain that you can only access owned files
- Invalid parameters: Ask for clarification
- Server errors: Apologize and suggest trying again

Now, how can I help you with your files today?`;
};

/**
 * Function tools definition untuk GPT
 * Bisa digunakan untuk provide lebih detailed function definitions
 */
export const getGPTFunctionDefinitions = () => {
  return [
    {
      name: 'list_files',
      description: 'List all files uploaded by the current user',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'get_file',
      description: 'Get metadata and signed download URL for a specific file',
      parameters: {
        type: 'object',
        properties: {
          file_id: {
            type: 'string',
            description: 'UUID of the file to retrieve',
          },
        },
        required: ['file_id'],
      },
    },
    {
      name: 'delete_file',
      description: 'Delete a file from storage and database',
      parameters: {
        type: 'object',
        properties: {
          file_id: {
            type: 'string',
            description: 'UUID of the file to delete',
          },
        },
        required: ['file_id'],
      },
    },
    {
      name: 'file_info',
      description: 'Get detailed information about a specific file (size, type, date, etc)',
      parameters: {
        type: 'object',
        properties: {
          file_id: {
            type: 'string',
            description: 'UUID of the file',
          },
        },
        required: ['file_id'],
      },
    },
    {
      name: 'query_files',
      description: 'Search and filter files by metadata (filename, type, size, date)',
      parameters: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            description: 'Search by filename (partial match)',
          },
          mimetype: {
            type: 'string',
            description: 'Filter by MIME type (e.g., "application/pdf")',
          },
          size_min: {
            type: 'integer',
            description: 'Minimum file size in bytes',
          },
          size_max: {
            type: 'integer',
            description: 'Maximum file size in bytes',
          },
          after_date: {
            type: 'string',
            description: 'Files uploaded after this date (YYYY-MM-DD)',
          },
        },
        required: [],
      },
    },
  ];
};
