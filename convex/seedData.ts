import { INDUSTRY_TAGS, NEED_TAGS } from './tags'

type NeedTag = keyof typeof NEED_TAGS
type IndustryTag = keyof typeof INDUSTRY_TAGS

export type SeedProfile = {
  name: string
  headline: string
  bio: string
  offers: NeedTag[]
  seeking: NeedTag[]
  industries: IndustryTag[]
  findMe?: string
  contacts: {
    email: string
    linkedin: string
    github?: string
    website?: string
  }
  sources: string[]
}

function profile(
  name: string,
  headline: string,
  bio: string,
  offers: NeedTag[],
  seeking: NeedTag[],
  industries: IndustryTag[],
  findMe?: string,
): SeedProfile {
  const handle = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const isDeveloper = offers.some((tag) => ['frontend', 'backend', 'mobile', 'ai-ml', 'data', 'devops', 'security', 'hardware'].includes(tag))
  return {
    name, headline, bio, offers, seeking, industries,
    contacts: {
      email: `${handle}@example.com`,
      linkedin: `https://www.linkedin.com/in/demo-${handle}`,
      ...(isDeveloper ? { github: `https://github.com/demo-${handle}` } : {}),
      website: `https://example.com/${handle}`,
    },
    sources: ['text'],
    ...(findMe ? { findMe } : {}),
  }
}

export const SEED_PROFILES: SeedProfile[] = [
  profile('Ayşe Yılmaz', 'Product designer · building in healthtech', 'I turn complex care journeys into clear, human product experiences. Looking for a technical co-founder for a patient follow-up idea.', ['ux-design', 'feedback'], ['backend', 'cofounder'], ['healthtech'], 'Blue jacket, near the coffee bar'),
  profile('Deniz Kaya', 'Backend developer · open to cofounding', 'I build reliable APIs and event-driven systems. I would love to pair with a product-minded designer on a useful side project.', ['backend', 'devops'], ['ux-design', 'cofounder'], ['saas']),
  profile('Mert Demir', 'Founder · fintech for small businesses', 'I am building simpler cash-flow tools for independent shops. I have early customer interviews and am preparing for a pre-seed round.', ['product', 'customers'], ['investment', 'backend'], ['fintech']),
  profile('Elif Şahin', 'Angel investor · operator turned investor', 'I back early teams in fintech and B2B software, and enjoy helping founders find their first ten customers.', ['investment', 'mentorship'], ['customers', 'partnerships'], ['fintech', 'saas']),
  profile('Can Arslan', 'AI engineer · practical LLM products', 'I work on retrieval, evaluation, and small AI features that solve real workflow problems. Happy to advise or prototype with a product team.', ['ai-ml', 'backend'], ['product', 'customers'], ['ai-tools', 'saas']),
  profile('Sofia Martinez', 'Growth marketer · early-stage SaaS', 'I help small teams turn positioning into a steady pipeline through experiments, lifecycle messaging, and clear metrics.', ['growth', 'marketing'], ['content', 'product'], ['saas']),
  profile('Luca Bianchi', 'UX and brand designer · independent', 'I help founders make their product feel clear and memorable, from first wireframe to launch identity.', ['ux-design', 'brand-design'], ['frontend', 'cofounder'], ['consumer', 'agency']),
  profile('Zeynep Çelik', 'Technical recruiter · startup teams', 'I recruit engineers and product leaders for growing teams and can share practical advice on hiring your first ten people.', ['jobs', 'mentorship'], ['backend', 'ai-ml'], ['saas', 'hrtech']),
  profile('Omar Haddad', 'Founder · AI tools for local commerce', 'We are helping neighborhood businesses automate repetitive work. I am looking for a commercial co-founder and strategic early partners.', ['frontend', 'ai-ml'], ['investment', 'marketing'], ['ai-tools', 'ecommerce']),
  profile('Ece Aydın', 'Content strategist · creator economy', 'I shape editorial systems and launch stories for products that need to earn attention without losing their voice.', ['content', 'marketing'], ['customers', 'product'], ['creator', 'consumer']),
  profile('Kerem Yılmaz', 'Computer science student · data curious', 'I am studying software engineering and building small analytics projects. I am looking for a mentor and an internship where I can learn by shipping.', ['frontend', 'data'], ['mentorship', 'jobs'], ['edtech', 'saas']),
  profile('Maya Johnson', 'Angel investor · consumer and fintech', 'I invest in ambitious early teams and offer hands-on help with product discovery, fundraising stories, and founder introductions.', ['investment', 'feedback'], ['cofounder', 'customers'], ['consumer', 'fintech']),
  profile('Arda Koç', 'Frontend developer · React and accessibility', 'I build fast, accessible web experiences and enjoy turning rough product ideas into something people can use.', ['frontend'], ['backend', 'product'], ['saas']),
  profile('Selin Aksoy', 'Startup counsel · commercial and privacy', 'I help founders make sound early decisions on contracts, privacy, and company setup without slowing down product work.', ['legal'], ['customers', 'partnerships'], ['legaltech', 'saas']),
  profile('James Wilson', 'Freelance product designer · B2B tools', 'I work with small teams on research, UX, and visual systems. I have room for one more short project this month.', ['ux-design', 'brand-design'], ['customers', 'sales'], ['agency', 'saas']),
  profile('Fatma Özdemir', 'Founder · community health platform', 'I am connecting independent clinics with better patient follow-up. We have a pilot cohort and need a technical partner for our next phase.', ['product', 'customers'], ['investment', 'backend'], ['healthtech']),
  profile('Tom Nguyen', 'Data analyst · marketplace metrics', 'I translate messy product data into decisions teams can act on. I am interested in responsible growth and marketplace design.', ['data', 'feedback'], ['product', 'customers'], ['ecommerce', 'saas']),
  profile('Esra Yıldız', 'Community builder · founder programs', 'I bring builders together through practical peer groups and workshops. I am always looking for partners who care about inclusive communities.', ['community', 'speaking'], ['mentorship', 'partnerships'], ['impact']),
  profile('Patrick O’Connor', 'Sales and partnerships · B2B', 'I build early sales motions and channel partnerships for software companies entering new markets.', ['sales', 'partnerships'], ['customers', 'product'], ['saas']),
  profile('Derya Kurt', 'DevOps engineer · secure cloud platforms', 'I make deployments more reliable with sensible infrastructure, observability, and security defaults.', ['devops', 'security'], ['backend', 'jobs'], ['fintech', 'saas']),
  profile('Alihan Güneş', 'Mobile developer · iOS and Android', 'I ship cross-platform apps from prototype to production and care about making the first-run experience feel effortless.', ['mobile'], ['ux-design', 'cofounder'], ['consumer']),
  profile('Amina Yusuf', 'Founder · last-mile logistics', 'We help independent retailers coordinate local deliveries. I am looking for a data-minded co-founder and investors who know logistics.', ['operations', 'product'], ['investment', 'cofounder'], ['logistics']),
  profile('Bruno Silva', 'Content and growth lead · B2B', 'I help early teams find a useful point of view and turn it into content that creates real conversations.', ['content', 'growth'], ['customers', 'speaking'], ['creator', 'saas']),
  profile('Nazlı Erdem', 'Finance lead · startup operations', 'I help startups get a clear handle on cash, reporting, and fundraising readiness before complexity sets in.', ['finance', 'operations'], ['cofounder', 'customers'], ['fintech', 'saas']),
  profile('Ethan Brooks', 'Recruiter · engineering and AI', 'I help ambitious product teams hire people who enjoy building from zero. I am also happy to coach candidates on the process.', ['jobs', 'mentorship'], ['backend', 'ai-ml'], ['saas', 'ai-tools']),
  profile('İrem Kılıç', 'People operations consultant', 'I set up lightweight hiring and people practices for teams moving from five people to their first fifty.', ['operations', 'mentorship'], ['customers', 'partnerships'], ['hrtech']),
  profile('Jonas Müller', 'Hardware engineer · connected devices', 'I prototype connected products and bring hardware, firmware, and cloud teams together around a testable first version.', ['hardware', 'devops'], ['product', 'investment'], ['deeptech', 'mobility']),
  profile('Gökhan Polat', 'Product manager · mobility platforms', 'I lead discovery and delivery for products that connect digital services to the physical world.', ['product', 'feedback'], ['data', 'ux-design'], ['mobility']),
  profile('Clara Rossi', 'Design student · visual storyteller', 'I am studying communication design and building a portfolio around helpful tools for everyday life.', ['brand-design', 'content'], ['mentorship', 'freelance'], ['agency', 'consumer']),
  profile('Emre Karaca', 'E-commerce founder · independent brands', 'I help local makers sell online and have a growing list of merchants ready to test new tools.', ['customers', 'marketing'], ['backend', 'investment'], ['ecommerce']),
  profile('Yasmin Rahman', 'UX writer · product language', 'I make digital products easier to understand through research-led content design and thoughtful onboarding.', ['content', 'brand-design'], ['product', 'feedback'], ['consumer', 'saas']),
  profile('Rafael Costa', 'Investor · climate and deep tech', 'I support technical founders who are turning difficult infrastructure problems into focused, commercial products.', ['investment', 'partnerships'], ['cofounder', 'customers'], ['deeptech', 'climate']),
  profile('Aslıhan Korkmaz', 'Startup lawyer · founder friendly', 'I advise technology companies on practical legal foundations and help first-time founders understand the trade-offs.', ['legal', 'finance'], ['customers', 'community'], ['legaltech']),
  profile('Noah Kim', 'Security engineer · application security', 'I help teams find security issues early and build safe defaults into modern web products.', ['security', 'devops'], ['backend', 'ai-ml'], ['saas', 'fintech']),
  profile('Melis Tan', 'Speaker and community host', 'I host candid conversations about building products in Türkiye and connect new founders with people who can help.', ['speaking', 'community'], ['mentorship', 'cofounder'], ['impact']),
  profile('Victor Chen', 'ML researcher · applied computer vision', 'I turn research prototypes into measurable product experiments and am looking for teams with a real data problem.', ['ai-ml', 'data'], ['hardware', 'customers'], ['deeptech', 'ai-tools']),
  profile('Bora Şimşek', 'Freelance full-stack developer', 'I build early product versions for founders and can help a small team get from a sketch to a first pilot.', ['backend', 'frontend'], ['sales', 'customers'], ['saas', 'agency']),
  profile('Chloé Dubois', 'Brand designer · early-stage products', 'I help founders explain what makes their product different through clear identity systems and useful launch assets.', ['brand-design', 'ux-design'], ['product', 'cofounder'], ['consumer', 'agency']),
  profile('Yusuf Demir', 'Operations student · aspiring analyst', 'I am learning operations and analytics while helping a student founder group run more smoothly.', ['operations', 'data'], ['jobs', 'mentorship'], ['logistics', 'edtech']),
  profile('Isabella Garcia', 'PR and communications · tech startups', 'I help technical teams tell a credible story to customers, partners, and the press.', ['press', 'marketing'], ['product', 'speaking'], ['creator', 'saas']),
]
