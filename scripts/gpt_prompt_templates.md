# GPT API Request Prompt Templates

This document provides system prompts, user prompt examples, and structured request formats to enable GPT models to generate CRUD operations against the Bytrix API via the OpenAPI specification.

## System Prompt

Use this system prompt to instruct GPT to map user intents to structured HTTP requests:

```
You are an intelligent API request mapper. Your job is to translate natural language user requests into structured HTTP request JSON objects that conform to the provided OpenAPI specification.

Rules:
1. Output ONLY valid JSON. Do not add explanations, markdown, or extra text.
2. Use the provided OpenAPI spec to determine the correct method, path, and required/optional fields.
3. Always include:
   - "method": HTTP method (GET, POST, PUT, PATCH, DELETE)
   - "path": API endpoint path (e.g., "/files/upload")
   - "base_url": Base URL for the server (https://file.bytrix.my.id/api/v1 for production, http://localhost:3000/api/v1 for dev)
   - "headers": HTTP headers, including Authorization: Bearer <token> if required
4. For request body, include "body" with JSON object matching the OpenAPI requestBody schema.
5. For path parameters, substitute them directly in the path string (e.g., /files/UUID-HERE).
6. For query parameters, include "query": { "key": "value" }.
7. For multipart/form-data (file uploads):
   - Set Content-Type: multipart/form-data in headers
   - Include "file" object with: { "fieldname": "file", "filename": "example.pdf", "content": "base64-encoded-content-or-<ATTACH-FILE>" }
   - If you cannot encode binary, set content to "<ATTACH-FILE>" and let the executor handle it.
8. Do not include fields not defined in the OpenAPI spec.
9. If a required field is missing from the user request, infer a sensible default or ask for clarification in the "notes" field.

Output format:
{
  "method": "GET|POST|PUT|PATCH|DELETE",
  "path": "/files/{id}",
  "base_url": "https://file.bytrix.my.id/api/v1",
  "headers": {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
  },
  "query": {},
  "body": { ... },
  "file": { ... },
  "notes": "any clarifications or assumptions"
}
```

---

## User Prompt Examples

### Example 1: Upload File (CREATE)

**User:** "Upload the file `quarterly_report.pdf` to the system and give me the file ID and URL."

**Expected GPT Output:**
```json
{
  "method": "POST",
  "path": "/files/upload",
  "base_url": "https://file.bytrix.my.id/api/v1",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "multipart/form-data"
  },
  "body": {},
  "file": {
    "fieldname": "file",
    "filename": "quarterly_report.pdf",
    "content": "<ATTACH-FILE-FROM-PATH:/path/to/quarterly_report.pdf>"
  },
  "notes": "Uploading file requires multipart/form-data. Executor should attach binary file content."
}
```

---

### Example 2: Get File Metadata (READ)

**User:** "Show me the metadata and signed URL for file with ID `f47ac10b-58cc-4372-a567-0e02b2c3d479`."

**Expected GPT Output:**
```json
{
  "method": "GET",
  "path": "/files/f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "base_url": "https://file.bytrix.my.id/api/v1",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  },
  "query": {},
  "notes": "GET request; no body required."
}
```

---

### Example 3: List Files (READ)

**User:** "List all files I have uploaded."

**Expected GPT Output:**
```json
{
  "method": "GET",
  "path": "/files",
  "base_url": "https://file.bytrix.my.id/api/v1",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  },
  "query": {},
  "notes": "Fetching all files for authenticated user."
}
```

---

### Example 4: Update File Metadata (UPDATE)

**User:** "Rename the file with ID `f47ac10b-58cc-4372-a567-0e02b2c3d479` to `new_report.pdf`."

**Expected GPT Output:**
```json
{
  "method": "PUT",
  "path": "/files/f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "base_url": "https://file.bytrix.my.id/api/v1",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  },
  "body": {
    "filename": "new_report.pdf"
  },
  "notes": "PUT request to update file metadata. Only filename provided; other fields optional."
}
```

---

### Example 5: Delete File (DELETE)

**User:** "Delete the file with ID `f47ac10b-58cc-4372-a567-0e02b2c3d479`."

**Expected GPT Output:**
```json
{
  "method": "DELETE",
  "path": "/files/f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "base_url": "https://file.bytrix.my.id/api/v1",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  },
  "notes": "DELETE request; no body required."
}
```

---

### Example 6: Generate Text using GPT (CREATE + GPT Action)

**User:** "Generate a concise marketing description for a product called 'CloudSync Pro'."

**Expected GPT Output:**
```json
{
  "method": "POST",
  "path": "/gpt/generate",
  "base_url": "https://file.bytrix.my.id/api/v1",
  "headers": {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "Content-Type": "application/json"
  },
  "body": {
    "prompt": "Write a concise, compelling marketing description for a product called 'CloudSync Pro'. Focus on benefits and target audience.",
    "temperature": 0.7,
    "max_tokens": 250,
    "model": "gpt-4o-mini"
  },
  "notes": "POST request to /gpt/generate endpoint. Model and temperature tuned for marketing copy."
}
```

---

## Curl Examples (How the Executor Runs Them)

### Upload File
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/quarterly_report.pdf" \
  "https://file.bytrix.my.id/api/v1/files/upload"
```

### Get File Metadata
```bash
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "https://file.bytrix.my.id/api/v1/files/f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

### List Files
```bash
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  "https://file.bytrix.my.id/api/v1/files"
```

### Update File
```bash
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename":"new_report.pdf"}' \
  "https://file.bytrix.my.id/api/v1/files/f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

### Delete File
```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  "https://file.bytrix.my.id/api/v1/files/f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

### Generate Text
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a concise, compelling marketing description...",
    "temperature": 0.7,
    "max_tokens": 250,
    "model": "gpt-4o-mini"
  }' \
  "https://file.bytrix.my.id/api/v1/gpt/generate"
```

---

## Integration Workflow

1. **Set up System Prompt**: Provide the system prompt above to GPT (via API or UI) before starting a conversation.
2. **Provide OpenAPI Spec**: Include the full OpenAPI spec (`openapi.json`) in the context so GPT can reference it.
3. **User Request**: User provides a natural language request (e.g., "Upload my file and show me the URL").
4. **GPT Response**: GPT outputs a JSON request object conforming to the spec.
5. **Executor**: Pass the JSON to the executor script (`scripts/gpt_api_executor.js`), which:
   - Parses the JSON,
   - Attaches files if needed,
   - Sends the HTTP request,
   - Returns the response to the user.
6. **User Feedback**: Share API response with user; if needed, continue the conversation for refinement.

---

## Limitations & Best Practices

### What GPT Can Do
- Understand the OpenAPI spec and map user intents to correct endpoints.
- Generate valid request JSON with proper HTTP methods, headers, paths, and query/body parameters.
- Handle authentication headers (if provided the Bearer token).
- Suggest sensible defaults for optional parameters (e.g., `temperature: 0.7`, `max_tokens: 2000`).

### What GPT Cannot Do Alone
- Attach binary file content directly (must be handled by the executor).
- Make the actual HTTP request (executor layer required).
- Handle secure token storage; tokens must be provided securely to the executor.
- Verify if files exist or if IDs are valid before the request.

### Best Practices
- **Always validate the JSON output** from GPT before executing—ensure all required fields are present.
- **Sanitize file paths** provided by GPT or the user to prevent path traversal attacks.
- **Store and manage tokens securely**—never hardcode tokens in prompts or logs.
- **Provide feedback loops**: if a request fails, share the error message with GPT and ask it to generate a corrected request.
- **Test with the dev server first** (`http://localhost:3000/api/v1`) before running against production.
- **Rate limit requests** to avoid overwhelming the API, especially when iterating on prompts.

---

## Advanced: Chaining Multiple Requests

GPT can also be instructed to generate a sequence of requests. Example:

**User:** "Upload a file, then generate a description for it based on the filename."

**GPT Output** (array of requests):
```json
[
  {
    "method": "POST",
    "path": "/files/upload",
    "base_url": "https://file.bytrix.my.id/api/v1",
    "headers": { "Authorization": "Bearer ...", "Content-Type": "multipart/form-data" },
    "file": { "fieldname": "file", "filename": "report.pdf", "content": "<ATTACH-FILE>" },
    "notes": "Step 1: Upload file"
  },
  {
    "method": "POST",
    "path": "/gpt/generate",
    "base_url": "https://file.bytrix.my.id/api/v1",
    "headers": { "Authorization": "Bearer ...", "Content-Type": "application/json" },
    "body": {
      "prompt": "Generate a professional summary for a PDF report named 'report.pdf'.",
      "max_tokens": 300
    },
    "notes": "Step 2: Generate description using file metadata"
  }
]
```

The executor would run these sequentially and thread the results between steps.

---

## Questions for Implementation

- **Token Management**: How should the executor access the Bearer token? Environment variable, config file, or API call to retrieve it?
- **File Paths**: Should file paths be absolute, relative to project root, or user-provided at execution time?
- **Error Handling**: If a request fails, should the executor retry, log, or halt immediately?
- **Response Format**: Should the executor return raw API response, prettified JSON, or a summary for the user?

