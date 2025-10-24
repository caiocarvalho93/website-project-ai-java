# 🤖 CAI - Custom AI Assistant

A revolutionary AI assistant that functions like Kiro with approval workflows for safe code execution.

## Features

- 🧠 **OpenAI GPT-4 Integration** - Intelligent responses and code analysis
- 🔒 **Approval Workflows** - All file operations require user approval
- 💬 **Real-time Chat** - Instant messaging with project context awareness
- 📁 **File Operations** - Read, write, and modify files with permission
- 🌍 **Translation Integration** - Works with your existing translation system
- 📊 **Project Context** - Understands your project structure and goals
- 🎯 **Developer-Focused** - Speaks your language and understands dev workflows

## Quick Start

### 1. Environment Setup

Create a `.env` file in the backend root with:

```env
OPENAI_API_KEY=your_openai_api_key_here
CAI_PORT=3001
```

### 2. Install Dependencies

```bash
cd backend/cai
npm install
```

### 3. Start CAI Server

```bash
npm run dev
```

### 4. Add CAI Button to Frontend

```jsx
import CAIButton from './cai/CAIButton';

function App() {
  return (
    <div>
      {/* Your app content */}
      <CAIButton 
        userId="your-user-id" 
        projectContext={{
          projectType: "React + Node.js News Platform",
          features: ["Translation", "News Feed", "AI Analysis"]
        }}
      />
    </div>
  );
}
```

## API Endpoints

- `POST /conversation/start` - Initialize new conversation
- `POST /conversation/:id/message` - Send message to CAI
- `GET /conversation/:id` - Get conversation history
- `GET /conversation/:id/actions/pending` - Get pending actions
- `POST /action/:id/approve` - Approve/reject actions
- `GET /user/:userId/conversations` - Get user conversations
- `DELETE /conversation/:id` - Delete conversation
- `GET /stats` - Service statistics
- `GET /health` - Health check

## Action Types

CAI can request approval for these actions:

- **file_write** - Create new files
- **file_read** - Read existing files
- **file_modify** - Modify existing files
- **run_command** - Execute shell commands
- **api_call** - Make API requests

## Security

- All file operations require explicit user approval
- Actions are logged and can be reviewed
- Conversations are isolated by user ID
- No automatic code execution without permission

## Integration

CAI integrates seamlessly with your existing:
- Translation system
- News processing
- Database operations
- API endpoints

## Development

```bash
# Start in development mode
npm run dev

# Start in production mode
npm start

# Check health
curl http://localhost:3001/health
```

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `CAI_PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Example Usage

```javascript
// Start conversation
const response = await fetch('http://localhost:3001/conversation/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    projectContext: {
      projectType: 'News Platform',
      currentFeatures: ['Translation', 'AI Analysis']
    }
  })
});

// Send message
const messageResponse = await fetch(`http://localhost:3001/conversation/${conversationId}/message`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Help me add a new feature to translate articles',
    projectFiles: [
      { path: 'src/components/NewsFeed.jsx', type: 'component' },
      { path: 'backend/services/translation-service.js', type: 'service' }
    ]
  })
});
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use in your projects!