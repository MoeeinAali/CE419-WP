import type { BoardType } from "@/types/board.ts";

export const boardsData: BoardType[] = [
  {
    id: "board-1",
    title: "E-Commerce Platform",
    description:
      "Roadmap and delivery board for the online shop. Tracks UI, backend, and content work from planning to release.",
    color: "blue",
    lists: [
      {
        id: "list-1",
        title: "🔜 Backlog",
        items: [
          {
            id: "item-1",
            title: "Product listing grid",
            description:
              "Responsive grid with filters, sort, and skeleton state.",
            dueDate: "2026-02-20",
            priority: "P1",
            tagIds: ["tag-1", "tag-3"],
          },
          {
            id: "item-2",
            title: "Cart API endpoints",
            description:
              "CRUD for cart items + validation and error responses.",
            dueDate: "2026-02-18",
            priority: "P0",
            tagIds: ["tag-2"],
          },
          {
            id: "item-3",
            title: "Checkout UX copy",
            description:
              "Write microcopy for steps, errors, and confirmations.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-4"],
          },
          {
            id: "item-4",
            title: "Design: Product page",
            description: "Layout for gallery, specs, reviews, and add-to-cart.",
            dueDate: "2026-02-22",
            priority: "P1",
            tagIds: ["tag-3"],
          },
          {
            id: "item-5",
            title: "Storefront SEO basics",
            description: "Meta tags, canonical URLs, and sitemap strategy.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-4", "tag-7"],
          },
        ],
      },
      {
        id: "list-2",
        title: "🔨 In Progress",
        items: [
          {
            id: "item-6",
            title: "Authentication + roles",
            description: "Customer/admin roles, guards, and token refresh.",
            dueDate: "2026-02-15",
            priority: "P0",
            tagIds: ["tag-2"],
          },
          {
            id: "item-7",
            title: "Header + mega menu",
            description:
              "Categories, search input, cart icon, responsive menu.",
            dueDate: "",
            priority: "P1",
            tagIds: ["tag-1"],
          },
          {
            id: "item-8",
            title: "Design system tokens",
            description: "Spacing, typography, and button variants in docs.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-3", "tag-7"],
          },
        ],
      },
      {
        id: "list-3",
        title: "🎉 Done",
        items: [
          {
            id: "item-9",
            title: "Project scaffold",
            description: "Repo structure, linting, and base configs ready.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-7"],
          },
          {
            id: "item-10",
            title: "Homepage hero",
            description: "Hero section with CTA, trust badges, and banner.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-1", "tag-3"],
          },
        ],
      },
    ],
  },

  {
    id: "board-2",
    title: "Mobile App",
    description:
      "Kanban for a habit tracking app. Focuses on core UX, data sync, and release readiness.",
    color: "green",
    lists: [
      {
        id: "list-4",
        title: "💡 Ideas",
        items: [
          {
            id: "item-11",
            title: "Streaks + achievements",
            description:
              "Gamification layer: badges, streak freezes, milestones.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-3"],
          },
          {
            id: "item-12",
            title: "Offline-first syncing",
            description: "Queue changes and sync when online.",
            dueDate: "",
            priority: "P1",
            tagIds: ["tag-2"],
          },
          {
            id: "item-13",
            title: "Onboarding checklist",
            description:
              "Simple flow: choose habits, reminders, goal frequency.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-1", "tag-3"],
          },
        ],
      },
      {
        id: "list-5",
        title: "🔨 Doing",
        items: [
          {
            id: "item-14",
            title: "Calendar view",
            description: "Monthly calendar with completion states and details.",
            dueDate: "2026-03-01",
            priority: "P1",
            tagIds: ["tag-1", "tag-3"],
          },
          {
            id: "item-15",
            title: "Habit CRUD API",
            description: "Create/edit habits + validation and pagination.",
            dueDate: "2026-02-25",
            priority: "P0",
            tagIds: ["tag-2"],
          },
          {
            id: "item-16",
            title: "Copy: empty states",
            description: "Friendly empty state messages across main screens.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-4"],
          },
        ],
      },
      {
        id: "list-6",
        title: "🚀 Release Ready",
        items: [
          {
            id: "item-17",
            title: "App icon exploration",
            description: "3 concepts + final export sizes checklist.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-3", "tag-7"],
          },
          {
            id: "item-18",
            title: "Privacy policy draft",
            description: "Draft policy for data usage + analytics disclosure.",
            dueDate: "2026-03-03",
            priority: "P1",
            tagIds: ["tag-7", "tag-4"],
          },
        ],
      },
    ],
  },

  {
    id: "board-3",
    title: "Company Website",
    description:
      "Board for marketing website refresh and documentation updates (release notes, guides, and information architecture).",
    color: "yellow",
    lists: [
      {
        id: "list-7",
        title: "🧭 Planning",
        items: [
          {
            id: "item-19",
            title: "New sitemap proposal",
            description:
              "Group pages by intent: product, solutions, pricing, docs.",
            dueDate: "2026-02-14",
            priority: "P1",
            tagIds: ["tag-4", "tag-7"],
          },
          {
            id: "item-20",
            title: "Design: typography refresh",
            description: "Evaluate font pairing and update heading scale.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-3"],
          },
          {
            id: "item-21",
            title: "Docs: quickstart outline",
            description: "Define structure for 'Get started in 10 minutes'.",
            dueDate: "",
            priority: "P1",
            tagIds: ["tag-7"],
          },
        ],
      },
      {
        id: "list-8",
        title: "✍️ Drafting",
        items: [
          {
            id: "item-22",
            title: "Pricing page rewrite",
            description: "Clarify tiers, limits, and FAQs + reduce jargon.",
            dueDate: "2026-02-19",
            priority: "P1",
            tagIds: ["tag-4"],
          },
          {
            id: "item-23",
            title: "Docs: API auth guide",
            description: "Explain tokens, refresh, and common error cases.",
            dueDate: "",
            priority: "P1",
            tagIds: ["tag-7", "tag-2"],
          },
          {
            id: "item-24",
            title: "Landing page sections",
            description:
              "Hero, social proof, features, integrations, CTA blocks.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-4", "tag-3"],
          },
        ],
      },
      {
        id: "list-9",
        title: "✅ Published",
        items: [
          {
            id: "item-25",
            title: "Docs: installation steps",
            description: "Updated install steps and troubleshooting notes.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-7"],
          },
          {
            id: "item-26",
            title: "Changelog format",
            description:
              "Standardized release notes template for each version.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-7", "tag-4"],
          },
        ],
      },
    ],
  },

  {
    id: "board-4",
    title: "Client Project: Brand Refresh",
    description:
      "End-to-end board for a client brand refresh: research, design, content, and handoff documentation.",
    color: "orange",
    lists: [
      {
        id: "list-10",
        title: "🔎 Research",
        items: [
          {
            id: "item-27",
            title: "Competitor audit",
            description: "Collect 10 competitors and analyze visual patterns.",
            dueDate: "2026-02-16",
            priority: "P1",
            tagIds: ["tag-3", "tag-4"],
          },
          {
            id: "item-28",
            title: "Stakeholder interview notes",
            description: "Summarize interviews and extract key themes.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-4"],
          },
        ],
      },
      {
        id: "list-11",
        title: "🎨 Design",
        items: [
          {
            id: "item-29",
            title: "Logo directions (3 options)",
            description: "Create three logo directions with rationale.",
            dueDate: "2026-02-28",
            priority: "P0",
            tagIds: ["tag-3"],
          },
          {
            id: "item-30",
            title: "Color palette + usage rules",
            description: "Primary/secondary colors + accessibility notes.",
            dueDate: "",
            priority: "P1",
            tagIds: ["tag-3", "tag-7"],
          },
          {
            id: "item-31",
            title: "UI components: buttons + cards",
            description: "Design core components for site/app consistency.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-3", "tag-1"],
          },
        ],
      },
      {
        id: "list-12",
        title: "📦 Handoff",
        items: [
          {
            id: "item-32",
            title: "Brand guidelines document",
            description: "Logo usage, spacing, colors, and typography rules.",
            dueDate: "2026-03-05",
            priority: "P1",
            tagIds: ["tag-7", "tag-3"],
          },
          {
            id: "item-33",
            title: "Asset export checklist",
            description: "SVG/PNG sizes, favicon set, social preview images.",
            dueDate: "",
            priority: "P2",
            tagIds: ["tag-7"],
          },
          {
            id: "item-34",
            title: "Website copy v1",
            description: "Rewrite homepage copy aligned with new positioning.",
            dueDate: "",
            priority: "P1",
            tagIds: ["tag-4"],
          },
        ],
      },
    ],
  },
];
