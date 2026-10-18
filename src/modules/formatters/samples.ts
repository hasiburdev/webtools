import type { FormatterLanguage } from "./types";

export interface CodeSample {
  id: string;
  label: string;
  description: string;
  content: string;
}

export const LANGUAGE_SAMPLES: Record<FormatterLanguage, CodeSample[]> = {
  json: [
    {
      id: "json-user",
      label: "User Profile",
      description: "User profile with nested properties and array.",
      content: '{"id":"usr_100","name":"Hasibur Rahman","username":"hasiburdev","active":true,"skills":["TypeScript","Next.js","React","Go"],"stats":{"projects":24,"rating":4.95}}',
    },
    {
      id: "json-api",
      label: "API Response",
      description: "Paginated REST API response.",
      content: '{"status":"success","code":200,"pagination":{"page":1,"perPage":2,"total":48},"data":[{"id":1,"title":"Deploy v2.4","status":"completed"},{"id":2,"title":"Database Migration","status":"in_progress"}]}',
    },
  ],
  yaml: [
    {
      id: "yaml-k8s",
      label: "Kubernetes Deployment",
      description: "Sample Kubernetes Deployment manifest.",
      content: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: webtools-frontend
  labels:
    app: webtools
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webtools
  template:
    metadata:
      labels:
        app: webtools
    spec:
      containers:
      - name: webtools
        image: ghcr.io/hasiburdev/webtools:latest
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"`,
    },
    {
      id: "yaml-docker",
      label: "Docker Compose",
      description: "Sample docker-compose.yml file.",
      content: `version: "3.8"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
    restart: always`,
    },
  ],
  toml: [
    {
      id: "toml-cargo",
      label: "Cargo / Config",
      description: "Sample TOML configuration document.",
      content: `[package]
name = "webtools"
version = "0.1.0"
edition = "2024"
authors = ["Hasibur Rahman Hasan <hasiburhasan.com>"]

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1.40", features = ["full"] }

[profile.release]
opt-level = 3
lto = true`,
    },
  ],
  sql: [
    {
      id: "sql-analytics",
      label: "Analytics Query",
      description: "Complex SQL query with JOINs, aggregations, and conditions.",
      content: `select u.id as user_id, u.full_name, u.email, count(distinct o.id) as total_orders, sum(o.total_amount) as lifetime_value, max(o.created_at) as last_order_date from users u inner join orders o on u.id = o.user_id left join user_profiles p on u.id = p.user_id where u.status = 'active' and o.created_at >= '2026-01-01' group by u.id, u.full_name, u.email having count(distinct o.id) > 2 order by lifetime_value desc limit 50;`,
    },
  ],
  xml: [
    {
      id: "xml-catalog",
      label: "Product Catalog",
      description: "Sample XML product catalog with nested tags and attributes.",
      content: `<?xml version="1.0" encoding="UTF-8"?><catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer's Guide</title><genre>Computer</genre><price>44.95</price><publish_date>2026-10-01</publish_date><description>An in-depth look at creating applications with XML.</description></book><book id="bk102"><author>Ralls, Kim</author><title>Midnight Rain</title><genre>Fantasy</genre><price>5.95</price><publish_date>2026-12-16</publish_date><description>A former architect battles corporate zombies.</description></book></catalog>`,
    },
  ],
  html: [
    {
      id: "html-landing",
      label: "Landing Page",
      description: "Semantic HTML5 layout structure.",
      content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>WebTools</title></head><body><header><nav><a href="/">Home</a><a href="/formatters">Formatters</a></nav></header><main><section class="hero"><h1>Developer utilities without the friction</h1><p>Free, instant, browser-based tools.</p><button type="button">Get Started</button></section></main><footer><p>&copy; 2026 WebTools</p></footer></body></html>`,
    },
  ],
  css: [
    {
      id: "css-card",
      label: "Component Stylesheet",
      description: "CSS styling with modern flexbox and custom properties.",
      content: `:root{--primary-color:#3b82f6;--border-radius:8px;--spacing-md:16px;}.card{display:flex;flex-direction:column;gap:var(--spacing-md);padding:var(--spacing-md);border-radius:var(--border-radius);background-color:#ffffff;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);transition:transform 0.2s ease,box-shadow 0.2s ease;}.card:hover{transform:translateY(-2px);box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1);}.card__title{font-size:1.25rem;font-weight:600;color:var(--primary-color);}`,
    },
  ],
  javascript: [
    {
      id: "js-api",
      label: "Async API Client",
      description: "Modern JavaScript function with fetch, async/await, and error handling.",
      content: `async function fetchUserData(userId,options={}){const{timeout=5000,retries=3}=options;const url=\`https://api.example.com/v1/users/\${userId}\`;try{const response=await fetch(url,{headers:{"Content-Type":"application/json"}});if(!response.ok){throw new Error(\`HTTP error! status: \${response.status}\`);}const data=await response.json();return{success:true,data};}catch(error){console.error("Failed to load user:",error);return{success:false,error:error.message};}}`,
    },
  ],
  typescript: [
    {
      id: "ts-generic",
      label: "TypeScript Interface & Utility",
      description: "TypeScript interfaces, generics, and types.",
      content: `export interface ApiResponse<T>{data:T;status:number;success:boolean;timestamp:string;}export interface UserProfile{id:string;name:string;email:string;role:"admin"|"user"|"guest";tags:readonly string[];}export type SafeUser=Omit<UserProfile,"email">;export async function requestData<T>(endpoint:string):Promise<ApiResponse<T>>{const res=await fetch(endpoint);const json=await res.json();return json;}`,
    },
  ],
  markdown: [
    {
      id: "md-readme",
      label: "Project README",
      description: "Markdown with titles, badges, tables, and lists.",
      content: `# WebTools\n\n> Fast, simple, browser-based utilities for developers and designers.\n\n## Features\n\n- No signup required\n- 100% Client-side execution\n- Free and open source\n\n| Tool | Description | Status |\n| :--- | :--- | :---: |\n| Formatters | JSON, YAML, SQL, TOML, XML, HTML, CSS, JS, TS, MD | Ready |\n| Slugify | Clean URL slug generator | Ready |\n| Password Generator | Secure cryptographic password generator | Ready |`,
    },
  ],
};
