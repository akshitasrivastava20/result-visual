# Result Visual - Gemini Analytics Router 📊

A Cloudflare Worker-powered API that uses Google's Gemini AI to intelligently route natural language queries to appropriate analytics endpoints for student result visualization.

## 🚀 Overview

This project provides a smart query routing system that:
- Accepts natural language queries about student performance analytics
- Uses Google Gemini AI to understand user intent
- Routes queries to appropriate data visualization endpoints
- Returns structured data for charts, metrics, and analytics

## 🛠️ Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono.js
- **AI Integration**: Google Gemini 2.5 Flash
- **Language**: JavaScript (ES Modules)

## 📊 Supported Analytics

The system supports 9 different types of analytics queries:

1. **Student Status Distribution** - Pass/Fail/PCP pie charts
2. **Branch Breakdown** - Branch-wise performance bar charts
3. **Year Comparison** - Multi-year metric comparisons
4. **Performance Metrics** - KPI cards for SGPA and pass rates
5. **Semester Progression** - SGPA trend analysis
6. **SGPA Distribution** - Grade frequency histograms
7. **Backlog Analysis** - Failure and backlog statistics
8. **Branch Performance Radar** - Comparative radar charts
9. **Top Performers** - Rankings and leaderboards

## 🔧 Setup

### Prerequisites

- Node.js (v18+)
- Cloudflare Workers CLI (`wrangler`)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akshitasrivastava20/result-visual.git
   cd result-visual
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Configure Cloudflare secrets** (for production)
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```

### Development

```bash
# Start local development server
wrangler dev

# Deploy to Cloudflare Workers
wrangler deploy
```

## 📡 API Usage

### Endpoint
```
GET /api/query?text=<your_natural_language_query>
```

### Example Requests

```bash
# Get student status distribution for CSE 2023
curl "https://your-worker.workers.dev/api/query?text=Show me pass fail distribution for CSE 2023"

# Get top performers in ECE
curl "https://your-worker.workers.dev/api/query?text=Who are the top 10 students in ECE branch?"

# Compare SGPA trends across semesters
curl "https://your-worker.workers.dev/api/query?text=Show SGPA progression for IT 2022 batch"
```

### Response Format

```json
{
  "intent": "get_student_status",
  "params": {
    "year": 2023,
    "branch": "CSE"
  },
  "data": {
    // Structured data for visualization
  }
}
```

## 🧠 How It Works

1. **Query Processing**: Natural language input is sent to Google Gemini AI
2. **Intent Recognition**: Gemini uses function calling to identify the appropriate analytics function
3. **Parameter Extraction**: AI extracts relevant parameters (year, branch, metrics, etc.)
4. **Data Fetching**: System routes to the appropriate data worker endpoint
5. **Response**: Returns structured data ready for visualization

## 🔗 Integration

This router works in conjunction with:
- **Data Worker**: `https://singularity-server.devxoshakya.workers.dev` (provides raw analytics data)
- **Frontend Dashboard**: Consumes the structured responses for chart rendering

## 🚦 CORS Configuration

CORS is enabled for `/api/*` routes to allow frontend applications to consume the API.

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI processing | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🐛 Issues

Found a bug? Please report it [here](https://github.com/akshitasrivastava20/result-visual/issues).

## 👥 Author

Created by [akshitasrivastava20](https://github.com/akshitasrivastava20)

---

**Note**: Make sure to keep your Gemini API key secure and never commit it to version control. Always use Cloudflare Workers secrets for production deployments.
