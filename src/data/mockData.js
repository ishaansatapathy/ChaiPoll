export const mockPolls = [
  {
    id: "chai-101",
    title: "What should ChaiPoll ship next?",
    description: "Help the product team prioritize the next platform milestone.",
    status: "Active",
    responses: 1284,
    questions: 3,
    expiresAt: "May 18, 2026",
    participation: 82,
  },
  {
    id: "dev-stack",
    title: "Preferred full-stack workflow",
    description: "A pulse check for modern developer tooling preferences.",
    status: "Draft",
    responses: 342,
    questions: 4,
    expiresAt: "May 22, 2026",
    participation: 64,
  },
  {
    id: "feedback",
    title: "Hackathon feedback survey",
    description: "Collect quick impressions from demo viewers.",
    status: "Published",
    responses: 918,
    questions: 5,
    expiresAt: "Completed",
    participation: 91,
  },
];

export const analyticsSummary = [
  { label: "Total responses", value: "2,544", detail: "+18% this week" },
  { label: "Active polls", value: "12", detail: "4 closing soon" },
  { label: "Avg. participation", value: "78%", detail: "Across public links" },
  { label: "Published results", value: "7", detail: "Ready to share" },
];

export const voteDistribution = [
  { name: "Analytics dashboard", votes: 612, percentage: 48 },
  { name: "Public results", votes: 410, percentage: 32 },
  { name: "Anonymous links", votes: 262, percentage: 20 },
];

export const timelineData = [
  { name: "Mon", responses: 120 },
  { name: "Tue", responses: 240 },
  { name: "Wed", responses: 190 },
  { name: "Thu", responses: 380 },
  { name: "Fri", responses: 510 },
  { name: "Sat", responses: 430 },
  { name: "Sun", responses: 610 },
];

export const pollQuestions = [
  {
    id: "q1",
    text: "Which feature matters most?",
    required: true,
    options: ["Analytics dashboard", "Public results", "Anonymous links"],
  },
  {
    id: "q2",
    text: "How often do you create polls?",
    required: false,
    options: ["Daily", "Weekly", "Monthly"],
  },
];
