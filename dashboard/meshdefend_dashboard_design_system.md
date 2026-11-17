# MeshDefend GTM OS - Design System & UI Guidelines

## 1. Design Philosophy: "Enterprise Standard, Not AI Magic"
The MeshDefend internal dashboard is a professional tool for GTM teams, executives, and editors. It must feel like a robust, high-performance financial or ERP system, not a consumer AI toy.

*   **No "AI Gimmicks":** Avoid neon gradients, glowing borders, or sparkle (✨) icons. Automation should feel like a background utility, not magic.
*   **White Standard (Light Mode Default):** Crisp white backgrounds, subtle gray borders, and high-contrast text. Dark mode is strictly optional and not the primary design focus.
*   **High-Density & Scannable:** GTM teams need to read data fast. Use dense tables, clear typography, and compact padding.
*   **Action-Oriented:** The UI must guide the user to their next task (Approve, Edit, Reject) with zero ambiguity.

---

## 2. Color Palette (Tailwind CSS)

The color palette is built on "Slate" (a professional, slightly cool gray) and a standard "Enterprise Blue" for primary actions.

### Backgrounds & Surfaces
*   **App Background:** `bg-slate-50` (`#F8FAFC`) - Gives a subtle contrast against white cards.
*   **Card/Container Background:** `bg-white` (`#FFFFFF`) - Pure white for all data tables, forms, and approval cards.
*   **Borders & Dividers:** `border-slate-200` (`#E2E8F0`) - Crisp, thin borders. No glowing effects.

### Typography Colors
*   **Primary Text (Headings/Data):** `text-slate-900` (`#0F172A`) - High contrast, easy to read.
*   **Secondary Text (Labels/Metadata):** `text-slate-500` (`#64748B`) - Used for dates, source links, and minor details.
*   **Muted Text (Placeholders):** `text-slate-400` (`#94A3B8`).

### Brand & Action Colors
*   **Primary Action (Approve / Submit):** `bg-blue-600` (`#2563EB`). Hover: `bg-blue-700`.
*   **Destructive/Reject:** `text-red-600` (`#DC2626`) / `bg-red-50` (for subtle backgrounds).
*   **Warning/Draft:** `text-amber-600` (`#D97706`) / `bg-amber-50`.
*   **Success/Published:** `text-emerald-600` (`#059669`) / `bg-emerald-50`.

---

## 3. Typography
Use a clean, standard sans-serif font. No quirky or overly stylized fonts.
*   **Primary Font:** `Inter` or standard System Sans (San Francisco, Segoe UI).
*   **Font Weights:** 
    *   Regular (400) for body and table data.
    *   Medium (500) for table headers and button text.
    *   Semibold (600) for page titles and card headers.
*   **Sizing:** Keep text small and professional. Default body size should be `text-sm` (14px).

---

## 4. Component Styling (Shadcn UI Defaults)

### Borders and Radius
*   **Border Radius:** Use `rounded-md` (0.375rem) or `rounded-lg` (0.5rem). Avoid `rounded-full` (pill shapes) except for status badges or avatars. 
*   **Shadows:** Use standard drop shadows `shadow-sm` for cards. **Never use colored or large spread shadows.**

### Buttons
*   **Primary:** Solid blue background, white text, medium weight, slightly rounded corners. (e.g., `Approve exact version`).
*   **Secondary/Outline:** White background, slate border, slate text. (e.g., `Request evidence`).
*   **Ghost:** No background or border until hover. Use for table actions (e.g., Edit icon).

### Data Tables (The Core UI)
*   Use `TanStack Table` with standard Shadcn styling.
*   Compact padding (`py-2 px-3`).
*   Horizontal dividers only (`border-b border-slate-200`). No vertical borders inside the table body.
*   Sticky headers for long lists.
*   **Empty States:** Simple text: "No pending approvals." No cute illustrations.

### Badges & Status Indicators
*   Keep them subtle. Use a light background with colored text, not solid blocks of bright color.
*   `[Draft]` = `bg-slate-100 text-slate-700`
*   `[Pending Approval]` = `bg-amber-50 text-amber-700`
*   `[Published]` = `bg-emerald-50 text-emerald-700`
*   `[Blocked/Failed]` = `bg-red-50 text-red-700`

---

## 5. Standard Layout Structure

### 1. Sidebar (Left Navigation)
*   **Width:** Fixed ~240px.
*   **Color:** `bg-slate-50` or `bg-white` with a right border (`border-r border-slate-200`).
*   **Content:**
    *   MeshDefend Logo (Top left).
    *   Navigation Links (Overview, Market Intelligence, Editorial Queue, Approvals).
    *   Deferred Modules (Outbound Engines 05-10) should be visible but faded (`opacity-50`) with a small "Coming Soon" or lock icon.
    *   User Profile / Entra ID Sign-out (Bottom).

### 2. Top Header (Control Bar)
*   **Height:** Fixed ~64px.
*   **Color:** `bg-white border-b border-slate-200`.
*   **Content:** Breadcrumbs (e.g., *Inbound Engines > Editorial Queue*), Global Search (Cmd+K), and system health indicator (e.g., "All systems operational").

### 3. Main Content Area
*   **Background:** `bg-slate-50`.
*   **Width:** Max-width container (`max-w-7xl`) for readability, or full-width for large data tables.
*   **Page Header:** Title (`text-2xl font-semibold`), Subtitle, and Primary Page Action (Top right).

---

## 6. Representing "AI" in the UI
Since we are actively avoiding the "AI gimmick" look, how do we show that the system is doing the work?

*   **Use Audit Logs:** Show *how* the data was fetched. E.g., `Gathered by Gemini via Serper.dev on [Date/Time]`.
*   **Confidence Scores:** Show data quality using clean progress bars or text (e.g., `Confidence: High (Official Source)`), not glowing magic wands.
*   **Clear Delineation:** Make it visually obvious what the system drafted versus what a human has approved. Use a subtle blue left-border for system-generated drafts awaiting review.