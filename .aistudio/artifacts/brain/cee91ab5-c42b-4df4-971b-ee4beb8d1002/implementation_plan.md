# Implementation Plan: Contact Form & Telegram Summary Integration

## Overview
1. **Telegram Status Confirmation**: Currently, no Telegram bot is active or configured in this codebase or server environment. We will build the full Telegram Bot notification integration.
2. **Lead Contact Form Gate**: When a visitor opens the chat modal, show a clean, high-conversion contact form requiring **Name** and **Phone Number (WhatsApp)** before the chat interface appears.
3. **User Memory**: Persist the customer's name and phone number across sessions. Mohammad (the Senior Consultant) will address the customer warmly by name.
4. **Automatic Telegram Summary on Close**: When the user closes the chat window, an automatic API call triggers in the background (`/api/telegram/summary`), which generates an executive summary of the consultation along with the customer's details and dispatches it directly to your Telegram chat/channel via the Telegram Bot API.

---

## User Review Required

> [!IMPORTANT]
> To receive the summaries directly on your Telegram account or channel, please provide:
> 1. **Telegram Bot Token** (from `@BotFather`)
> 2. **Telegram Chat ID** (your numeric user/group ID, obtainable from `@userinfobot`)
> *If you don't have them right now, we will add support for them in `.env` and provide a fallback configuration so the form and chat work smoothly immediately.*

---

## Proposed Changes

### Backend (`server.ts`)
- Add secure `/api/telegram/summary` endpoint:
  - Receives customer name, phone number, active service context, and message history.
  - Summarizes the conversation (or uses Gemini to extract key client interests and requested documents/dates).
  - Sends a beautifully formatted Telegram notification message (using HTML/Markdown) to the configured Telegram bot.
- Support environment variables `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` with graceful logging and error prevention if not yet set.

### Chat Interface (`src/components/AiChatbotModal.tsx`)
- **Contact Form View (First Screen)**:
  - If the user hasn't filled out their contact info yet (checked via `localStorage`), render a professional, trust-building contact card:
    - Input: **আপনার নাম (Full Name)**
    - Input: **মোবাইল / WhatsApp নম্বর (Phone Number)**
    - Button: **পরামর্শ শুরু করুন (Start Consultation)**
  - Validates valid Bangladeshi/international phone numbers (at least 10-11 digits).
- **Smooth Transition**:
  - Once submitted, saves to `localStorage` (`processinghub_user_profile`), slides out the form, and reveals the chat interface.
  - Displays user identity badge at the top with a subtle "পরিবর্তন" (edit profile) button.
- **Personalized AI Consultant**:
  - Passes user's name to `/api/ai/chat` so Mohammad greets and advises the client personally by name without robotic repetition.
- **Auto Telegram Dispatch on Close**:
  - When `onClose` is triggered (modal close button or background tap), if there are conversation messages (>1 message), fire the `/api/telegram/summary` beacon/request to send the lead and summary to Telegram.

---

## Verification Plan

### Automated Tests
- Test TypeScript types and bundle compilation with `npm run build` / `compile_applet`.
- Run `lint_applet` to ensure zero errors.

### Manual / Browser Verification
1. Open support chat -> verify Contact Form is shown first.
2. Enter Name & Phone number -> submit -> verify chat opens smoothly and displays personalized greeting.
3. Chat with Mohammad about a visa query -> close the chat window.
4. Verify Telegram summary endpoint is invoked with full client details and consultation summary.
