import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS so your frontend can actually fetch the data
app.use('/api/*', cors());

const DATA_WORKER_BASE = "https://singularity-server.devxoshakya.workers.dev";

const analyticsTools = [{
  function_declarations: [
    { name: "get_student_status", description: "Pass/Fail/PCP distribution pie chart.", parameters: { type: "OBJECT", properties: { year: { type: "integer" }, branch: { type: "string" } } } },
    { name: "get_branch_breakdown", description: "Branch-wise breakdown bar chart.", parameters: { type: "OBJECT", properties: { year: { type: "integer" }, branch: { type: "string" } } } },
    { name: "get_year_comparison", description: "Compare metrics across years.", parameters: { type: "OBJECT", properties: { metric: { type: "string", enum: ["avgSgpa", "passRate", "avgMarks"] } } } },
    { name: "get_performance_metrics", description: "KPI cards for avg SGPA and pass rates.", parameters: { type: "OBJECT", properties: { year: { type: "integer" }, branch: { type: "string" }, metric: { type: "string" } } } },
    { name: "get_semester_progression", description: "SGPA trend line chart.", parameters: { type: "OBJECT", properties: { year: { type: "integer" }, branch: { type: "string" } } } },
    { name: "get_sgpa_distribution", description: "SGPA frequency histogram.", parameters: { type: "OBJECT", properties: { year: { type: "integer" }, branch: { type: "string" }, semester: { type: "string" } } } },
    { name: "get_backlog_analysis", description: "Backlog/failure stats.", parameters: { type: "OBJECT", properties: { year: { type: "integer" }, branch: { type: "string" }, groupBy: { type: "string", enum: ["semester", "subject", "branch"] } } } },
    { name: "get_branch_performance_radar", description: "Radar Chart comparing branch strength.", parameters: { type: "OBJECT", properties: { year: { type: "integer" } } } },
    { name: "get_top_performers", description: "Rankings and toppers list.", parameters: { type: "OBJECT", properties: { limit: { type: "integer" }, year: { type: "integer" }, branch: { type: "string" }, metric: { type: "string", enum: ["sgpa", "marks"] } } } }
  ]
}];

app.get('/api/query', async (c) => {
  const userQuery = c.req.query('text');
  // In Cloudflare Workers, secrets are in c.env
  const apiKey = c.env.GEMINI_API_KEY;

  if (!userQuery) return c.json({ error: "Missing ?text=" }, 400);

  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const aiResponse = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userQuery }] }],
        tools: analyticsTools,
        toolConfig: {
          functionCallingConfig: { mode: "ANY" }
        },
        generationConfig: { temperature: 0 }
      })
    });

    const aiData = await aiResponse.json();
    const toolCallPart = aiData.candidates?.[0]?.content?.parts?.find(p => p.functionCall);

    if (!toolCallPart) {
      return c.json({ error: "Routing failed.", ai_raw: aiData }, 500);
    }

    const { name, args } = toolCallPart.functionCall;

    const apiMap = {
      get_student_status: "/api/analytics/student-status-distribution",
      get_branch_breakdown: "/api/analytics/branch-status-breakdown",
      get_year_comparison: "/api/analytics/year-branch-comparison",
      get_performance_metrics: "/api/analytics/performance-metrics",
      get_semester_progression: "/api/analytics/semester-progression",
      get_sgpa_distribution: "/api/analytics/sgpa-range-distribution",
      get_backlog_analysis: "/api/analytics/backlog-analysis",
      get_branch_performance_radar: "/api/analytics/branch-performance-radar",
      get_top_performers: "/api/analytics/top-performers"
    };

    const finalDataUrl = `${DATA_WORKER_BASE}${apiMap[name]}?${new URLSearchParams(args).toString()}`;
    
    // Fetch from your Data Worker
    const workerResponse = await fetch(finalDataUrl);
    const resultData = await workerResponse.json();

    return c.json({
      intent: name,
      params: args,
      data: resultData.data || resultData
    });

  } catch (err) {
    return c.json({ error: "Processing Error", detail: err.message }, 500);
  }
});

export default app;