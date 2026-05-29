# Cloudinary Integration Guide

This guide explains how to use Cloudinary for file uploads in the Modo backend.

## Setup Complete ✅

Cloudinary has been successfully integrated for:
- **User profile pictures** (`imagem_utilizador`)
- **Avatar decorations** (`caminho_decoracao`)
- **User reports** (`caminho_relatorio`)

## Upload Configuration

### 1. User Profile Pictures
- **Folder**: `modo/user-profiles`
- **Allowed Formats**: JPG, JPEG, PNG, GIF
- **Auto-Transformation**: 500x500 crop
- **Max File Size**: 5MB
- **Request Parameter**: `imagem_utilizador` (multipart/form-data)

**Example Request (Create User with Profile Picture)**:
```bash
curl -X POST http://localhost:3000/users \
  -F "nome=John Doe" \
  -F "email=john@example.com" \
  -F "password=Password123!" \
  -F "tipo_utilizador=Client" \
  -F "imagem_utilizador=@/path/to/profile.jpg"
```

**Example Request (Update User Profile Picture)**:
```bash
curl -X PATCH http://localhost:3000/users/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "imagem_utilizador=@/path/to/new-profile.jpg"
```

### 2. Avatar Decorations
- **Folder**: `modo/decorations`
- **Allowed Formats**: JPG, JPEG, PNG, GIF, SVG
- **Auto-Transformation**: 300x300 crop
- **Max File Size**: 3MB
- **Request Parameter**: `caminho_decoracao` (multipart/form-data)

**Example Request (Create Decoration with Image)**:
```bash
curl -X POST http://localhost:3000/avatar-decorations \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -F "nome_decoracao=Golden Crown" \
  -F "nivel_necessario=10" \
  -F "caminho_decoracao=@/path/to/crown.png"
```

**Example Request (Update Decoration Image)**:
```bash
curl -X PATCH http://localhost:3000/avatar-decorations/1 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -F "caminho_decoracao=@/path/to/new-crown.png"
```

### 3. User Reports
- **Folder**: `modo/reports`
- **Allowed Formats**: PDF, JPG, JPEG, PNG, DOC, DOCX
- **No Auto-Transformation** (preserves original format)
- **Max File Size**: 10MB
- **Request Parameter**: `caminho_relatorio` (multipart/form-data)

**Example Request (Create Report with PDF)**:
```bash
curl -X POST http://localhost:3000/users/1/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "mes=5" \
  -F "semana=3" \
  -F "conteudo=Monthly habit report for May, Week 3" \
  -F "caminho_relatorio=@/path/to/report.pdf"
```

## Response Format

When a file is uploaded, Cloudinary returns a secure URL that is automatically stored in your database:

```json
{
  "id_utilizador": 1,
  "nome": "John Doe",
  "email": "john@example.com",
  "imagem_utilizador": "https://res.cloudinary.com/drcziqeyj/image/upload/...",
  "links": [...]
}
```

## Error Handling

### Invalid File Type
```json
{
  "description": "Invalid file type. Only JPEG, PNG, and GIF are allowed.",
  "status": 400
}
```

### File Too Large
```json
{
  "description": "File size exceeds the limit.",
  "status": 413
}
```

## File Storage Organization

Cloudinary organizes your files into folders:
- `modo/user-profiles/` - User profile pictures
- `modo/decorations/` - Avatar decoration images
- `modo/reports/` - User reports

All files are automatically transformed based on their category and optimized for web delivery.

## Postman Collection Example

If using Postman:

1. **Create User with Profile Picture**
   - Method: POST
   - URL: `http://localhost:3000/users`
   - Body: form-data
     - `nome`: John Doe
     - `email`: john@example.com
     - `password`: Password123!
     - `imagem_utilizador`: [Select file]

2. **Update User Profile Picture**
   - Method: PATCH
   - URL: `http://localhost:3000/users/1`
   - Headers: `Authorization: Bearer YOUR_JWT_TOKEN`
   - Body: form-data
     - `imagem_utilizador`: [Select file]

## Testing Without Files

All endpoints still work without file uploads (file uploads are optional):

```bash
# Create user without profile picture
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "tipo_utilizador": "Client"
  }'
```

## Notes

- All file uploads are optional - you can still create/update records without uploading files
- Cloudinary automatically optimizes images for web delivery
- All uploaded files are stored securely in Cloudinary's CDN
- File URLs are permanent and can be used directly in your frontend
- Transformations (resizing, cropping) are applied automatically based on the upload context

## Troubleshooting

If uploads aren't working:
1. Check that `C_CLOUD_NAME`, `C_API_KEY`, and `C_API_SECRET` are set in `.env`
2. Verify that the file format is allowed for that endpoint
3. Check file size doesn't exceed the limit
4. Ensure you're sending `Content-Type: multipart/form-data` in POST requests
5. Check that authentication token is valid (for protected routes)
