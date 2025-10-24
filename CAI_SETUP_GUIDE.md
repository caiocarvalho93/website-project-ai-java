# 🤖 CAI Setup Guide - Custom AI Assistant

## Complete Setup Instructions

### 1. Environment Variables

Add to your `backend/.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# CAI Server Configuration
CAI_PORT=3001
VITE_CAI_API_URL=http://localhost:3001
```

### 2. Install CAI Dependencies

```bash
# Install CAI server dependencies
npm run cai:install

# Or manually:
cd backend/cai
npm install
```

### 3. Start CAI Server

Choose one of these options:

#### Option A: Start CAI Only

```bash
npm run cai:start
```

#### Option B: Start Everything (Recommended)

```bash
npm run dev:all
```

This starts:

- Main backend server (port 3000)
- Frontend dev server (port 5173)
- CAI server (port 3001)

### 4. Verify CAI is Running

Check health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "success": true,
  "service": "CAI - Custom AI Assistant",
  "status": "operational",
  "capabilities": [
    "Natural language processing",
    "Code analysis and generation",
    "File system operations",
    "Translation integration",
    "Approval workflows"
  ]
}
```

### 5. Test CAI Integration

1. Open your app at `http://localhost:5173`
2. Look for the floating CAI button (bottom-right corner)
3. Click the button to open the chat interface
4. Send a test message: "Hello CAI, can you help me?"

## CAI Features

### 🧠 Intelligent Responses

- Powered by OpenAI GPT-4
- Understands your project context
- Provides code-specific assistance

### 🔒 Safe Code Execution

- All file operations require approval
- Preview actions before execution
- Detailed action descriptions

### 💬 Real-time Chat

- Instant messaging interface
- Conversation history
- Project context awareness

### 📁 File Operations

CAI can help with:

- Reading project files
- Creating new components
- Modifying existing code
- Running commands (with approval)

## Example Conversations

### Creating a New Component

**You:** "Create a new React component for displaying user profiles"

**CAI:** "I'll create a UserProfile component for you. This will require creating a new file."

_[Shows approval dialog for file creation]_

### Code Analysis

**You:** "Analyze my NewsFeed component and suggest improvements"

**CAI:** "Let me read your NewsFeed component and provide suggestions..."

_[Requests approval to read the file]_

### Translation Help

**You:** "Help me add translation support to my dashboard"

**CAI:** "I can help integrate the translation system. I'll need to read your dashboard component and modify it to use TranslatedText components."

## Troubleshooting

### CAI Button Shows Offline

1. Check if CAI server is running: `curl http://localhost:3001/health`
2. Verify OPENAI_API_KEY is set in `.env`
3. Check console for error messages

### Chat Not Opening

1. Check browser console for errors
2. Verify frontend can reach CAI server
3. Check CORS configuration

### Actions Not Working

1. Ensure file paths are correct
2. Check file permissions
3. Verify approval workflow is functioning

### OpenAI API Errors

1. Verify API key is valid
2. Check API usage limits
3. Ensure sufficient credits

## Security Notes

- CAI never executes code without explicit approval
- All actions are logged and reviewable
- Conversations are isolated by user ID
- File operations are sandboxed to project directory

## Advanced Configuration

### Custom Project Context

```jsx
<CAIButton
  userId="your-user-id"
  projectContext={{
    projectType: "E-commerce Platform",
    techStack: ["React", "Node.js", "MongoDB"],
    features: ["Payment", "Inventory", "Analytics"],
    currentGoals: ["Add AI recommendations", "Improve performance"],
  }}
/>
```

### Environment-Specific Settings

```env
# Development
CAI_PORT=3001
NODE_ENV=development

# Production
CAI_PORT=3001
NODE_ENV=production
OPENAI_API_KEY=prod_key_here
```

## Integration with Existing Features

CAI integrates seamlessly with:

- ✅ Universal Translation System
- ✅ News Feed Components
- ✅ Database Operations
- ✅ API Endpoints
- ✅ File System Operations

## Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies
3. ✅ Start CAI server
4. ✅ Test basic functionality
5. 🔄 Customize project context
6. 🔄 Train CAI on your specific needs
7. 🔄 Set up production deployment

## Support

If you encounter issues:

1. Check the console logs
2. Verify all environment variables
3. Test API endpoints manually
4. Review the CAI server logs

CAI is now ready to revolutionize your development workflow! 🚀
