import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ChecklistPdfData {
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
  // Create an offscreen container specifically styled for clean A4 printing
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px'; // ~96 DPI A4 width
  container.style.minHeight = '1123px'; // A4 height
  container.style.padding = '40px 48px';
  container.style.backgroundColor = '#FFFFFF';
  container.style.color = '#1E2519';
  container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Bengali", sans-serif';
  container.style.boxSizing = 'border-box';
  container.style.zIndex = '-1000';

  const completedCount = data.documents.filter(d => d.isCompleted).length;
  const totalCount = data.documents.length;
  const progressPercent = Math.round((completedCount / (totalCount || 1)) * 100);

  const formattedDate = new Date().toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  container.innerHTML = `
    <div style="border: 2px solid #5F7758; border-radius: 12px; padding: 28px 32px; background-color: #FFFFFF; min-height: 1040px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <!-- Brand Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #EAE5DA; padding-bottom: 20px; margin-bottom: 24px;">
          <div>
            <div style="font-size: 24px; font-weight: 800; color: #26301F; letter-spacing: -0.5px; margin-bottom: 4px;">
              ${data.brandName}
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #5F7758; margin-bottom: 6px;">
              ইন্ডিয়ান ভিসা প্রসেসিং ও ফাইল কনসালটেন্সি সার্ভিস
            </div>
            <div style="font-size: 11px; color: #6E7866;">
              হেল্পলাইন: <strong>${data.phoneDisplay}</strong> | ইমেইল: ${data.email}
            </div>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; background-color: #EFF4EC; color: #3A4E33; border: 1px solid #C8D8C2; font-size: 11px; font-weight: 700; padding: 4px 10px; rounded: 6px; border-radius: 6px; margin-bottom: 6px;">
              অফলাইন প্রস্তুতি চেকলিস্ট
            </span>
            <div style="font-size: 11px; color: #8A9584;">তারিখ: ${formattedDate}</div>
          </div>
        </div>

        <!-- Service Info Box -->
        <div style="background-color: #FAF9F5; border: 1px solid #E5DFD1; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 16px; font-weight: 700; color: #1E2519;">
              ${data.serviceTitle}
            </div>
            <span style="font-size: 12px; font-weight: 700; color: #4E5C46; background-color: #ECE8DC; padding: 3px 8px; border-radius: 4px;">
              ${data.category}
            </span>
          </div>

          <div style="display: flex; gap: 24px; font-size: 12px; color: #55604C;">
            <div>সার্ভিস ফি: <strong style="color: #1E2519;">${data.price}</strong></div>
            ${data.isSlotBooking && data.slotName ? `<div>ক্যাটাগরি: <strong style="color: #1E2519;">${data.slotName}</strong></div>` : ''}
            ${data.isSlotBooking && data.ivacCenter ? `<div>আইভ্যাক সেন্টার: <strong style="color: #1E2519;">${data.ivacCenter}</strong></div>` : ''}
          </div>
        </div>

        <!-- Progress Summary -->
        <div style="display: flex; justify-content: space-between; align-items: center; background-color: #F4F7F2; border: 1px solid #D9E4D3; border-radius: 8px; padding: 10px 16px; margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: 700; color: #3A4E33;">
            ফাইল প্রস্তুতির অবস্থা: ${completedCount} / ${totalCount} টি রেডি (${progressPercent}%)
          </div>
          <div style="font-size: 11px; color: #5F7758; font-weight: 600;">
            ${completedCount === totalCount ? '✓ সকল তথ্য প্রস্তুত' : `বাকি রয়েছে: ${totalCount - completedCount} টি`}
          </div>
        </div>

        <!-- Checklist Title -->
        <div style="font-size: 14px; font-weight: 700; color: #26301F; margin-bottom: 12px; border-left: 4px solid #5F7758; padding-left: 10px;">
          প্রয়োজনীয় ডকুমেন্টস ও তথ্যের তালিকা
        </div>

        <!-- Documents Table -->
        <div style="margin-bottom: 24px;">
          ${data.documents.map((doc, idx) => `
            <div style="display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border-bottom: 1px solid #EFEBE2; background-color: ${doc.isCompleted ? '#F9FBF8' : '#FFFFFF'};">
              <div style="width: 20px; height: 20px; border: 2px solid ${doc.isCompleted ? '#5F7758' : '#B5BCAD'}; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #5F7758; flex-shrink: 0; margin-top: 1px;">
                ${doc.isCompleted ? '✓' : ''}
              </div>
              <div style="font-size: 12px; line-height: 1.5; color: ${doc.isCompleted ? '#1E2519' : '#3A4432'}; font-weight: ${doc.isCompleted ? '600' : '400'}; flex: 1;">
                <span style="color: #727C6B; font-size: 11px; margin-right: 6px;">${idx + 1}.</span>
                ${doc.title}
              </div>
              <div style="font-size: 11px; font-weight: 600; color: ${doc.isCompleted ? '#3A6832' : '#8A9584'}; background-color: ${doc.isCompleted ? '#E4EFE0' : '#F1EFEA'}; padding: 2px 8px; border-radius: 4px; flex-shrink: 0;">
                ${doc.isCompleted ? 'প্রস্তুত' : 'সংগ্রহ করুন'}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- General Indian Visa Instructions -->
        <div style="background-color: #FAF9F5; border: 1px dashed #D5CFBF; border-radius: 8px; padding: 14px 18px; margin-top: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #26301F; margin-bottom: 6px;">
            📌 সাধারণ জরুরি নির্দেশনা (IVAC নিয়মাবলী):
          </div>
          <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #55604C; line-height: 1.6;">
            <li>পাসপোর্টের মেয়াদ আবেদনের দিন থেকে নূন্যতম ৬ মাস এবং কমপক্ষে ২টি ফাঁকা পৃষ্ঠা থাকতে হবে।</li>
            <li>ছবি অবশ্যই সদ্য তোলা (৩ মাসের কম পুরানো), ২×২ ইঞ্চি, সম্পূর্ণ সাদা ব্যাকগ্রাউন্ড ও ল্যাব প্রিন্ট হতে হবে।</li>
            <li>বর্তমান ঠিকানার স্বপক্ষে বিদ্যুৎ, গ্যাস অথবা পানি বিলের আসল ও ফটোকপি সাথে রাখতে হবে।</li>
            <li>ব্যাংক স্টেটমেন্টে আবেদনকারী বা স্পন্সরের পর্যাপ্ত ব্যালেন্স ও ব্যাংক কর্তৃক সিল-স্বাক্ষর থাকতে হবে।</li>
          </ul>
        </div>
      </div>

      <!-- Footer Note -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #EAE5DA; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #6E7866;">
        <div>
          যেকোনো সহায়তা ও ফাইল পর্যালোচনার জন্য WhatsApp: <strong>${data.phoneDisplay}</strong>
        </div>
        <div>
          Processing Hub Platform | ${data.email}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // High resolution crisp text
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Clean filename
    const safeServiceName = data.serviceTitle.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_').substring(0, 30);
    pdf.save(`Indian_Visa_Checklist_${safeServiceName}.pdf`);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
