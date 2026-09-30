# Bangladeshi Natural Scenery Dynamic Hero Slider

Replace the static hero image with a high-fidelity, 4-slide automatic image carousel showcasing the iconic natural landscapes of Bangladesh, with seamless 3-second transitions and optimal readability for the Indian visa consultancy website.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Specifications from Clarification Phase:**
> 1. **All 4 Scenic Themes Selected**: Sajek Valley/Bandarban hills & clouds, Sreemangal lush tea gardens, Cox's Bazar/Saint Martin sea beach, and Sundarbans mangrove riverways.
> 2. **Auto-Slide Rotation**: Slides will automatically transition every 3 seconds (3000ms) with smooth cross-fade animation.
> 3. **Contextual Harmony**: High-contrast overlay gradients ensure all headline typography, badges, and WhatsApp consultation CTAs remain crisp, premium, and easy to read.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the main Hero section into a cinematic 4-slide background carousel featuring Bangladesh's most celebrated scenic locations. The slides cycle automatically every 3 seconds with smooth cross-fade animations, subtle Ken Burns slow-pan motion, interactive slide indicator dots, and previous/next navigation buttons.
- **Target Audience / Persona**: Bangladeshi applicants seeking reliable Indian medical, tourist, and business visa processing, greeted by familiar and inspiring natural beauty that conveys trust, warmth, and professionalism.
- **Key Value**: Delivers a vibrant, patriotic, and visually captivating first impression while keeping the primary call-to-action ("ফ্রি ভিসা পরামর্শ নিন") prominently legible.

---

## 2. User Experience & Visual Design

### Key Visual Assets (4 Dedicated 16:9 Landscapes)
1. **সাজেক ও বান্দরবান (Sajek & Bandarban)**: Lush green hill ranges bathed in golden morning light with floating misty white cloud carpets.
2. **শ্রীমঙ্গল চা বাগান (Sreemangal Tea Estates)**: Serene rolling emerald tea hills with gentle morning dew and winding pathways.
3. **কক্সবাজার ও সেন্টমার্টিন (Cox's Bazar & Saint Martin)**: Expansive golden sandy coastline, azure blue Bay of Bengal waves, and coconut palm silhouettes.
4. **সুন্দরবন ম্যানগ্রোভ (Sundarbans River & Forest)**: Serene delta riverways, pristine Sundari tree mangrove forest, and calm reflecting waters at dawn.

### Motion & Interaction Design
- **Auto-Rotation Interval**: Changes slide every 3.0 seconds (`3000ms`).
- **Interactive Controls**:
  - Pill/dot indicators at the bottom indicating active slide with smooth width expansion.
  - Hover/touch pause so reading users aren't disrupted.
  - Left/Right subtle arrow controls for manual switching.
  - Smooth 700ms ease-in-out opacity/transform transition between slides.
- **Contrast Scrim**: Measured multi-stop gradient overlay (`from-black/75 via-black/45 to-black/80`) to satisfy WCAG AA contrast standards for all Bengali text and the green WhatsApp action button.

---

## 3. Technical Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                           Hero Section                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Background Slider Container (overflow-hidden, relative)    │  │
│  │  ├─ Slide 1: Sajek Valley Hills & Clouds (Active/Fade)    │  │
│  │  ├─ Slide 2: Sreemangal Lush Tea Garden (Transition)      │  │
│  │  ├─ Slide 3: Cox's Bazar / Saint Martin Coastline         │  │
│  │  └─ Slide 4: Sundarbans Mangrove River                    │  │
│  │  └─ Dark Scrim Layer (bg-gradient-to-t & backdrop shadow) │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Hero Content Overlay (Z-index 10, Flex Column Centered)   │  │
│  │  ├─ Trust Badge: "Processing Hub — নির্ভরযোগ্য ভিসা সেবা"   │  │
│  │  ├─ H1: সহজ ও নির্ভুল ইন্ডিয়ান ভিসা প্রসেসিং                 │  │
│  │  ├─ Subtitle: অভিজ্ঞ কনসালট্যান্টদের সহায়তায়...            │  │
│  │  ├─ Primary CTA: "ফ্রি ভিসা পরামর্শ নিন" (Direct WhatsApp) │  │
│  │  └─ Carousel Dots Indicator (4 Dots with 3s progress bar) │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Steps

1. **Batch Image Generation (Phase 1)**:
   - Generate all 4 Bangladeshi landscape assets in parallel via `generate_image` tool with `16:9` aspect ratio.
2. **Hero Component Update (Phase 2)**:
   - Enhance `src/components/Hero.tsx` with slider state (`currentSlide`, auto-play timer `setInterval`, touch handlers, dot controls, and keyboard navigation).
   - Apply smooth transition styling and dark gradient overlay.
3. **Verification**:
   - Verify build integrity with `compile_applet` and `lint_applet`.
   - Test 3-second cycle, indicator interactions, and mobile responsiveness.
