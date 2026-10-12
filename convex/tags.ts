export const NEED_TAGS = {
  frontend: "Frontend dev", backend: "Backend dev", mobile: "Mobile dev",
  "ai-ml": "AI / ML", data: "Data & analytics", devops: "DevOps & cloud",
  web3: "Web3", hardware: "Hardware & IoT", security: "Security",
  product: "Product management", "ux-design": "UI/UX design", "brand-design": "Brand & graphic design",
  marketing: "Marketing", growth: "Growth", content: "Content & social media",
  community: "Community", sales: "Sales & BD", partnerships: "Partnerships",
  investment: "Investment",          // offers = I invest · seeking = I'm raising
  legal: "Legal", finance: "Finance & accounting", operations: "Operations",
  jobs: "Jobs",                      // offers = I'm hiring · seeking = I'm looking for a job
  freelance: "Freelance work",       // offers = I freelance · seeking = I need a freelancer
  cofounder: "Co-founder",           // looking for a cofounder → put in BOTH offers and seeking
  mentorship: "Mentorship",          // offers = I mentor · seeking = I want a mentor
  customers: "Customers & pilots",   // offers = I could be a customer/pilot · seeking = I need customers
  feedback: "Product feedback", speaking: "Speaking & events", press: "Press & media",
} as const;

export const INDUSTRY_TAGS = {
  "ai-tools": "AI tools", fintech: "Fintech", healthtech: "Healthtech", edtech: "Edtech",
  ecommerce: "E-commerce", saas: "B2B SaaS", consumer: "Consumer apps", gaming: "Gaming",
  climate: "Climate", mobility: "Mobility", logistics: "Logistics", food: "Food",
  proptech: "Proptech", creator: "Creator economy", travel: "Travel", web3: "Web3",
  deeptech: "Deep tech", hrtech: "HR tech", legaltech: "Legaltech", impact: "Social impact",
  agency: "Agency & services", other: "Other",
} as const;

export type NeedTag = keyof typeof NEED_TAGS
export type IndustryTag = keyof typeof INDUSTRY_TAGS
