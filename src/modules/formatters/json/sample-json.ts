export interface JsonSample {
  id: string;
  label: string;
  description: string;
  content: string;
}

export const JSON_SAMPLES: JsonSample[] = [
  {
    id: "user-profile",
    label: "User Profile",
    description: "Nested user profile with contact details, tags, and preferences.",
    content: JSON.stringify(
      {
        id: "usr_99482b",
        username: "hasiburdev",
        profile: {
          fullName: "Hasibur Rahman",
          title: "Full Stack Engineer",
          location: "Dhaka, Bangladesh",
          website: "https://hasiburhasan.com",
          verified: true,
          social: {
            github: "hasiburdev",
            twitter: "@hasiburdev",
          },
        },
        skills: ["TypeScript", "Next.js", "React", "Tailwind CSS", "Go"],
        stats: {
          projectsCount: 24,
          contributions: 1420,
          rating: 4.95,
        },
        settings: {
          notifications: {
            email: true,
            push: false,
          },
          theme: "system",
        },
      },
      null,
      2,
    ),
  },
  {
    id: "api-response",
    label: "API Response",
    description: "Paginated REST API response with data array and pagination metadata.",
    content: JSON.stringify(
      {
        status: "success",
        code: 200,
        pagination: {
          page: 1,
          perPage: 3,
          totalPages: 12,
          totalCount: 36,
          hasNextPage: true,
          hasPrevPage: false,
        },
        data: [
          {
            id: 101,
            name: "Cloud Server Pro",
            status: "active",
            specs: { cpu: "8 vCPU", ram: "32GB", storage: "500GB NVMe" },
            tags: ["production", "us-east"],
            metrics: { uptime: 99.98, cpuLoad: 24.5 },
          },
          {
            id: 102,
            name: "Database Replica",
            status: "syncing",
            specs: { cpu: "4 vCPU", ram: "16GB", storage: "1TB SSD" },
            tags: ["database", "read-only"],
            metrics: { uptime: 100.0, cpuLoad: 12.1 },
          },
          {
            id: 103,
            name: "Edge Cache Proxy",
            status: "active",
            specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD" },
            tags: ["caching", "global"],
            metrics: { uptime: 99.99, cpuLoad: 8.7 },
          },
        ],
      },
      null,
      2,
    ),
  },
  {
    id: "minified",
    label: "Minified JSON",
    description: "Compact single-line payload ideal for testing beautification.",
    content:
      '{"service":"analytics","version":"2.4.1","timestamp":"2026-10-18T12:00:00Z","events":[{"name":"page_view","url":"/formatters","referrer":"https://google.com","browser":"Chrome","session_id":"s_8831"},{"name":"button_click","target":"format_button","duration_ms":42}],"active":true}',
  },
  {
    id: "lenient-sample",
    label: "JSON with Trailing Commas & Comments",
    description: "Common informal JSON format with comments and trailing commas for lenient parser.",
    content: `// Configuration with comments and trailing commas
{
  name: "webtools",
  version: "1.0.0",
  // Build settings
  build: {
    target: "esnext",
    minify: true,
    sourcemap: false, // trailing comma here
  },
  dependencies: [
    "react",
    "next",
    "tailwindcss", // trailing comma in array
  ],
}`,
  },
];
