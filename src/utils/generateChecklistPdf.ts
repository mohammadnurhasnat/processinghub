import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Language, toBnDigits, toEnDigits } from '../context/LanguageContext';

export interface ChecklistPdfData {
  language?: Language;
  serviceTitle: string;
  category: string;
  price: string;
  isSlotBooking?: boolean;
  slotName?: string;
  ivacCenter?: string;
  documents: {
    title: string;
    isCompleted: boolean;
  }[];
  phoneDisplay: string;
  email: string;
  brandName: string;
}

export async function generateChecklistPdf(data: ChecklistPdfData): Promise<void> {
  const lang: Language = data.language || 'bn';
  const isBn = lang === 'bn';
  const fmtNum = (val: string | number) => (isBn ? toBnDigits(val) : toEnDigits(val));

  // Ensure web fonts are loaded before rendering to canvas
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignore font readiness errors
    }
  }

  // Create an offscreen container specifically styled for clean A4 printing
  const container = document.createElement('div');
  container.id = 'pdf-export-root';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '-9999px';
  container.style.width = '794px'; // ~96 DPI A4 width
  container.style.minHeight = '1123px'; // A4 height
  container.style.padding = '36px 44px';
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#1E2519';
  container.style.fontFamily = '"Inter", "Noto Serif Bengali", "Noto Sans Bengali", Arial, sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-1000';

  const completedCount = data.documents.filter((d) => d.isCompleted).length;
  const totalCount = data.documents.length;
  const progressPercent = Math.round((completedCount / (totalCount || 1)) * 100);
  const remainingCount = Math.max(0, totalCount - completedCount);

  const formattedDateRaw = new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedDate = fmtNum(formattedDateRaw);
  const localizedPhone = fmtNum(data.phoneDisplay);

  // Optical vertical shift to counter html2canvas font baseline drop inside pill boxes
  const pillTextOffset = isBn ? '-4px' : '-1px';
  const rowTextOffset = isBn ? '-3px' : '-1px';

  // Pure SVG checkmark inside exact pixel-centered box (eliminates html2canvas font baseline shift)
  const renderCheckbox = (isCompleted: boolean) => `
    <div style="
      position: relative;
      width: 18px;
      height: 18px;
      margin-top: 2px;
      box-sizing: border-box;
      border: 2px solid ${isCompleted ? '#5F7758' : '#B5BCAD'};
      border-radius: 4px;
      background-color: ${isCompleted ? '#EFF4EC' : '#FFFFFF'};
    ">
      ${isCompleted ? `
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" style="position: absolute; top: 2px; left: 2px; display: block;">
          <path d="M2.8 8.4L6.4 12L13.2 4.2" stroke="#3A6832" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      ` : ''}
    </div>
  `;

  const copy = isBn
    ? {
        tagline: 'ইন্ডিয়ান ভিসা প্রসেসিং ও ফাইল সহায়তা সার্ভিস',
        helplineLabel: 'হেল্পলাইন:',
        emailLabel: 'ইমেইল:',
        offlineBadge: 'অফলাইন প্রস্তুতি চেকলিস্ট',
        dateLabel: 'তারিখ:',
        serviceFeeLabel: 'সার্ভিস ফি:',
        slotCategoryLabel: 'ক্যাটাগরি:',
        ivacCenterLabel: 'আইভ্যাক সেন্টার:',
        progressText: `ফাইল প্রস্তুতির অবস্থা: ${fmtNum(completedCount)} / ${fmtNum(totalCount)} টি প্রস্তুত (${fmtNum(progressPercent)}%)`,
        remainingText:
          completedCount === totalCount
            ? 'সকল তথ্য প্রস্তুত'
            : `বাকি রয়েছে: ${fmtNum(remainingCount)} টি`,
        listTitle: 'প্রয়োজনীয় ডকুমেন্টস ও তথ্যের তালিকা',
        statusReady: 'প্রস্তুত',
        statusCollect: 'সংগ্রহ করুন',
        guidelinesTitle: 'সাধারণ জরুরি নির্দেশনা (IVAC নিয়মাবলী):',
        guidelines: [
          'পাসপোর্টের মেয়াদ আবেদনের দিন থেকে ন্যূনতম ৬ মাস এবং কমপক্ষে ২টি ফাঁকা পৃষ্ঠা থাকতে হবে।',
          'ছবি অবশ্যই সদ্য তোলা (৩ মাসের কম পুরনো), ২×২ ইঞ্চি, সম্পূর্ণ সাদা ব্যাকগ্রাউন্ড ও ল্যাব প্রিন্ট হতে হবে।',
          'বর্তমান ঠিকানার স্বপক্ষে বিদ্যুৎ, গ্যাস অথবা পানি বিলের আসল ও ফটোকপি সাথে রাখতে হবে।',
          'ব্যাংক স্টেটমেন্টে আবেদনকারী বা স্পনসরের পর্যাপ্ত ব্যালেন্স ও ব্যাংক কর্তৃক সিল-স্বাক্ষর থাকতে হবে।',
        ],
        footerContact: `যেকোনো সহায়তা ও ফাইল পর্যালোচনার জন্য হোয়াটসঅ্যাপ: <strong style="color: #26301F;">${localizedPhone}</strong>`,
        footerPlatform: `Processing Hub | ${data.email}`,
        filePrefix: 'ProcessingHub_Checklist_BN',
      }
    : {
        tagline: 'Indian Visa Processing & File Assistance Service',
        helplineLabel: 'Helpline:',
        emailLabel: 'Email:',
        offlineBadge: 'Offline Preparation Checklist',
        dateLabel: 'Date:',
        serviceFeeLabel: 'Service Fee:',
        slotCategoryLabel: 'Category:',
        ivacCenterLabel: 'IVAC Center:',
        progressText: `File Preparation Status: ${fmtNum(completedCount)} / ${fmtNum(totalCount)} Ready (${fmtNum(progressPercent)}%)`,
        remainingText:
          completedCount === totalCount
            ? 'All Documents Ready'
            : `Remaining: ${fmtNum(remainingCount)}`,
        listTitle: 'Required Documents & Information Checklist',
        statusReady: 'Ready',
        statusCollect: 'Collect',
        guidelinesTitle: 'Important IVAC Guidelines:',
        guidelines: [
          'Passport must have at least 6 months validity from the application date and a minimum of 2 blank pages.',
          'Photographs must be recently taken (under 3 months), 2×2 inch, plain white background, and lab-printed.',
          'Carry the original and photocopy of a recent electricity, gas, or water utility bill for current address proof.',
          'Bank statements must show sufficient balance and carry the bank’s official seal and signature.',
        ],
        footerContact: `For assistance and file review on WhatsApp: <strong style="color: #26301F;">${localizedPhone}</strong>`,
        footerPlatform: `Processing Hub Platform | ${data.email}`,
        filePrefix: 'ProcessingHub_Checklist_EN',
      };

  container.innerHTML = `
    <style>
      #pdf-export-root, #pdf-export-root * {
        font-family: "Inter", "Noto Serif Bengali", "Noto Sans Bengali", Arial, sans-serif !important;
        box-sizing: border-box !important;
        letter-spacing: normal !important;
      }
    </style>
    <div style="
      border: 2px solid #5F7758;
      border-radius: 12px;
      padding: 26px 30px;
      background-color: #FFFFFF;
      min-height: 1050px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    ">
      <div>
          <!-- Brand Header -->
          <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #EAE5DA; margin-bottom: 20px;">
            <tr>
              <td style="vertical-align: top; padding-bottom: 18px;">
                <div style="font-size: 24px; font-weight: 800; color: #26301F; line-height: 1.2; margin-bottom: 4px;">
                  ${data.brandName}
                </div>
                <div style="font-size: 13px; font-weight: 600; color: #5F7758; line-height: 1.35; margin-bottom: 5px;">
                  ${copy.tagline}
                </div>
                <div style="font-size: 11px; color: #6E7866; line-height: 1.35;">
                  ${copy.helplineLabel} <strong style="color: #26301F;">${localizedPhone}</strong> | ${copy.emailLabel} ${data.email}
                </div>
              </td>
              <td style="vertical-align: top; text-align: right; padding-bottom: 18px;">
                <div style="
                  display: inline-block;
                  background-color: #EFF4EC;
                  color: #3A4E33;
                  border: 1px solid #C8D8C2;
                  font-size: 11px;
                  font-weight: 700;
                  line-height: 1;
                  padding: 6px 12px;
                  border-radius: 6px;
                  margin-bottom: 7px;
                  text-align: center;
                "><span style="position: relative; top: ${pillTextOffset}; display: inline-block; line-height: 1.15;">${copy.offlineBadge}</span></div>
                <div style="font-size: 11px; color: #8A9584; line-height: 1.3;">${copy.dateLabel} ${formattedDate}</div>
              </td>
            </tr>
          </table>

          <!-- Service Info Box -->
          <div style="background-color: #FAF9F5; border: 1px solid #E5DFD1; border-radius: 10px; padding: 14px 18px 16px 18px; margin-bottom: 18px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
              <tr>
                <td style="vertical-align: middle; font-size: 16px; font-weight: 700; color: #1E2519; line-height: 1.35;">
                  ${data.serviceTitle}
                </td>
                <td style="vertical-align: middle; text-align: right; white-space: nowrap;">
                  <span style="
                    display: inline-block;
                    font-size: 11.5px;
                    font-weight: 700;
                    color: #4E5C46;
                    background-color: #ECE8DC;
                    line-height: 1;
                    padding: 5px 11px;
                    border-radius: 5px;
                    text-align: center;
                  "><span style="position: relative; top: ${pillTextOffset}; display: inline-block; line-height: 1.15;">${data.category}</span></span>
                </td>
              </tr>
            </table>

            <div style="font-size: 12px; color: #55604C; line-height: 1.45;">
              <span>${copy.serviceFeeLabel} <strong style="color: #1E2519;">${fmtNum(data.price)}</strong></span>
              ${data.isSlotBooking && data.slotName ? `<span style="margin-left: 18px;">${copy.slotCategoryLabel} <strong style="color: #1E2519;">${data.slotName}</strong></span>` : ''}
              ${data.isSlotBooking && data.ivacCenter ? `<span style="margin-left: 18px;">${copy.ivacCenterLabel} <strong style="color: #1E2519;">${data.ivacCenter}</strong></span>` : ''}
            </div>
          </div>

          <!-- Progress Summary -->
          <div style="background-color: #F4F7F2; border: 1px solid #D9E4D3; border-radius: 8px; margin-bottom: 18px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding: 9px 16px; font-size: 12px; font-weight: 700; color: #3A4E33; line-height: 1.2;">
                  <span style="position: relative; top: ${rowTextOffset}; display: inline-block;">${copy.progressText}</span>
                </td>
                <td style="vertical-align: middle; text-align: right; padding: 9px 16px; font-size: 11px; color: #5F7758; font-weight: 600; line-height: 1.2;">
                  <span style="position: relative; top: ${rowTextOffset}; display: inline-block;">${copy.remainingText}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Checklist Title -->
          <table style="border-collapse: collapse; margin-bottom: 10px;">
            <tr>
              <td style="vertical-align: middle; width: 4px; padding: 0;">
                <div style="width: 4px; height: 15px; background-color: #5F7758; border-radius: 2px;"></div>
              </td>
              <td style="vertical-align: middle; padding: 0 0 0 10px; font-size: 14px; font-weight: 700; color: #26301F; line-height: 1.3;">
                <span style="position: relative; top: ${isBn ? '-2px' : '0px'}; display: inline-block;">${copy.listTitle}</span>
              </td>
            </tr>
          </table>

          <!-- Documents Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 18px;">
            ${data.documents
              .map(
                (doc, idx) => `
              <tr style="background-color: ${doc.isCompleted ? '#F9FBF8' : '#FFFFFF'}; border-bottom: 1px solid #EFEBE2;">
                <td style="width: 34px; vertical-align: top; padding: 10px 4px 10px 10px;">
                  ${renderCheckbox(doc.isCompleted)}
                </td>
                <td style="vertical-align: top; padding: 9px 10px 11px 4px; font-size: 12px; line-height: 1.5; color: ${doc.isCompleted ? '#1E2519' : '#3A4432'}; font-weight: ${doc.isCompleted ? '600' : '400'};">
                  <span style="color: #727C6B; font-size: 11px; font-weight: 600; margin-right: 5px;">${fmtNum(idx + 1)}.</span>${fmtNum(doc.title)}
                </td>
                <td style="width: 104px; vertical-align: top; text-align: right; padding: 9px 10px 10px 4px; white-space: nowrap;">
                  <span style="
                    display: inline-block;
                    font-size: 10.5px;
                    font-weight: 700;
                    line-height: 1;
                    color: ${doc.isCompleted ? '#3A6832' : '#7A8575'};
                    background-color: ${doc.isCompleted ? '#E4EFE0' : '#F1EFEA'};
                    padding: 5px 10px;
                    border-radius: 4px;
                    text-align: center;
                  "><span style="position: relative; top: ${pillTextOffset}; display: inline-block; line-height: 1.1;">${doc.isCompleted ? copy.statusReady : copy.statusCollect}</span></span>
                </td>
              </tr>
            `
              )
              .join('')}
          </table>

          <!-- General Indian Visa Instructions -->
          <div style="background-color: #FAF9F5; border: 1px dashed #D5CFBF; border-radius: 8px; padding: 12px 16px 14px 16px; margin-top: 10px;">
            <div style="font-size: 12px; font-weight: 700; color: #26301F; line-height: 1.35; margin-bottom: 6px;">
              📌 ${copy.guidelinesTitle}
            </div>
            <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #55604C; line-height: 1.6;">
              ${copy.guidelines.map((line) => `<li>${line}</li>`).join('')}
            </ul>
          </div>
      </div>

      <!-- Footer Note -->
      <div style="padding-top: 22px;">
        <table style="width: 100%; border-collapse: collapse; border-top: 1px solid #EAE5DA;">
          <tr>
            <td style="padding-top: 12px; font-size: 11px; color: #6E7866; line-height: 1.3;">
              ${copy.footerContact}
            </td>
            <td style="padding-top: 12px; text-align: right; font-size: 11px; color: #6E7866; line-height: 1.3;">
              ${copy.footerPlatform}
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let renderWidth = pageWidth;
    let renderHeight = (canvas.height * pageWidth) / canvas.width;

    // Fit cleanly on a single A4 page if extra-long checklists exceed 297mm
    if (renderHeight > pageHeight) {
      const ratio = pageHeight / renderHeight;
      renderHeight = pageHeight;
      renderWidth = pageWidth * ratio;
    }

    const offsetX = (pageWidth - renderWidth) / 2;
    pdf.addImage(imgData, 'PNG', offsetX, 0, renderWidth, renderHeight);

    // Clean filename
    const safeServiceName = data.serviceTitle.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_').substring(0, 30);
    pdf.save(`${copy.filePrefix}_${safeServiceName}.pdf`);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
