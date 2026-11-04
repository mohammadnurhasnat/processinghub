# Human-Crafted Agency Polish & 3D Tactile Modal Design Plan

Transform all popup window buttons into tactile 3D glassmorphic controls (including a distinctive red glassmorphic close button), replace green tones on the consultant contact form with a sophisticated human-crafted navy/slate palette, and completely eliminate any robotic AI cues across the site in favor of authentic Senior Visa Consultant branding.

---

## 1. Requirement & Style Blueprint

### Item 1: 3D Tactile Buttons & Red Glassmorphic Close Button
- **Red Glassmorphic 3D Close Button**:
  - Apply soft red glassmorphism with tactile 3D matte depth:
    `bg-gradient-to-b from-rose-50/90 to-red-100/90 border border-red-200/80 text-red-700 shadow-[0_2px_0_#fda4af,0_4px_12px_rgba(239,68,68,0.15)] hover:from-rose-100 hover:to-red-200 active:translate-y-0.5 active:shadow-none backdrop-blur-md`
- **All Popup Buttons to 3D Tactile**:
  - Update `ServiceChecklistModal.tsx`, `HospitalDetailModal.tsx`, `DestinationDetailModal.tsx`, and `QuickBookModal.tsx`.
  - Every button has physical 3D push feel, matte bevel, and distinct elevation.

---

### Item 2: Non-Green Human-Centric Palette for Consultant Contact Form
- **Color Overhaul in `AiChatbotModal.tsx`**:
  - Replace green banners, green input rings, green badges, and green send buttons.
  - Apply a rich, executive Navy / Warm Slate Indigo theme:
    - Primary Action: Deep Navy-Indigo 3D Button (`bg-gradient-to-b from-[#1E2E48] to-[#142033] shadow-[0_3px_0_#0D1624,0_6px_16px_rgba(20,32,51,0.25)] text-white hover:from-[#243755]`)
    - Header & Icons: Warm Sapphire / Slate Blue accents (`#2A4365`, `#334E68`, `#486581`).
    - Input Focus: Warm Slate Indigo focus ring (`focus:border-[#2A4365] focus:ring-[#2A4365]/15`).
    - Status Badge: Soft Indigo / Slate active pill (`bg-[#EBF1FA] text-[#1E3A8A] border border-[#BFDBFE]`).

---

### Item 3: Total Human Agency Transformation (No Robotic/AI Trace)
- **Eliminate AI/Robotic References**:
  - Replace any mention of "AI", "Bot", "Artificial Intelligence", "রোবট", "এআই অ্যাসিস্ট্যান্ট" across the whole website.
  - Rebrand as **"সরাসরি সিনিয়র ভিসা কনসালটেন্ট" (Senior Visa Consultant)** and **"ডেডিকেটেড ফাইল ও ডকুমেন্টেশন হেল্পডেস্ক"**.
  - Update all helper texts, tooltips, placeholders, and chat prompts to sound 100% human, professional, empathetic, and personalized.
  - Ensure the conversational experience feels like chatting directly with a seasoned Bangladeshi visa processing officer.

---

## 2. Target Files & Key Modifications

1. **`src/components/ServiceChecklistModal.tsx`**:
   - Apply Red 3D Glassmorphism to `modal-bottom-close-btn`.
   - Ensure all 3 buttons have responsive 3D tactile push effects.
2. **`src/components/HospitalDetailModal.tsx` & `src/components/DestinationDetailModal.tsx`**:
   - Update bottom buttons to 3D tactile controls.
3. **`src/components/AiChatbotModal.tsx`**:
   - Redesign contact form away from green into sleek Navy-Slate/Warm Executive theme.
   - Refine text from AI terminology to Senior Visa Consultant.
4. **`src/components/FloatingWhatsApp.tsx` & Global Microcopy**:
   - Rebrand "AI Support" button to "লাইভ কনসালটেন্ট" (Live Consultant) / "ভিসা এক্সপার্ট".
   - Ensure all microcopy across components conveys human expertise.

---

## 3. Verification Plan

1. Open Service Checklist $\rightarrow$ Verify Red 3D Glassmorphism Close button and all 3D buttons.
2. Open Consultant Form $\rightarrow$ Verify non-green executive navy-slate theme and compact sizing.
3. Check entire website copy $\rightarrow$ Confirm zero AI/robotic terminology and natural human consultancy tone.
4. Run `compile_applet` and `lint_applet` to confirm clean builds.
