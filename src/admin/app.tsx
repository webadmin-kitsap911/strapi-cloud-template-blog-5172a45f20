import type { StrapiApp } from "@strapi/strapi/admin";
import {
  setPluginConfig,
  defaultTheme,
  defaultHtmlPreset,
} from "@_sh/strapi-plugin-ckeditor";

// Content styles for CKEditor preview
// Generated from: npm run build:ckeditor-styles (in frontend project)
const contentStyles = `
.ck.ck-content.ck-editor__editable{font-family:var(--k911-font-family) !important;font-size:var(--k911-font-100) !important;line-height:1.6 !important;color:var(--k911-ctx-text) !important;background:var(--k911-bg-500) !important;--k911-font-family: "DM Sans", system-ui, -apple-system, sans-serif;--k911-font-000: 14px;--k911-font-100: 18px;--k911-font-200: 23px;--k911-font-300: 29px;--k911-font-400: 37px;--k911-font-500: 47px;--k911-font-600: 59px;--k911-line-000: 24px;--k911-line-100: 32px;--k911-line-200: 32px;--k911-line-300: 40px;--k911-line-400: 48px;--k911-line-500: 56px;--k911-line-600: 80px;--k911-space-100: 8px;--k911-space-200: 16px;--k911-space-300: 24px;--k911-space-400: 32px;--k911-space-500: 40px;--k911-space-600: 56px;--k911-space-700: 72px;--k911-font-weight-medium: 500;--k911-font-weight-semibold: 600;--k911-font-weight-bold: 700;--k911-ctx-text: #ffffff;--k911-ctx-teal: #77d4a8;--k911-ctx-blue: #89bfff;--k911-bg-500: #061424;--k911-palette-gold: #ff9827;--k911-rgb-bright: 255, 255, 255;--k911-text-muted: #8a9bb3;--k911-warning: #ff9827;--k911-warning-muted: #713f12}.ck.ck-content.ck-editor__editable h2{font-size:var(--k911-font-500) !important;line-height:var(--k911-line-500) !important;font-weight:var(--k911-font-weight-medium) !important;color:var(--k911-ctx-teal) !important;margin-block-end:var(--k911-space-400) !important}.ck.ck-content.ck-editor__editable h3{font-size:var(--k911-font-300) !important;line-height:var(--k911-line-300) !important;font-weight:var(--k911-font-weight-semibold) !important;color:var(--k911-text-muted) !important;margin-block-end:var(--k911-space-300) !important}.ck.ck-content.ck-editor__editable h4{font-size:var(--k911-font-300) !important;line-height:var(--k911-line-300) !important;font-weight:var(--k911-font-weight-bold) !important;margin-block-end:var(--k911-space-200) !important}.ck.ck-content.ck-editor__editable h5,.ck.ck-content.ck-editor__editable h6{font-size:var(--k911-font-200) !important;line-height:var(--k911-line-200) !important;font-weight:var(--k911-font-weight-bold) !important;margin-block-end:var(--k911-space-200) !important}.ck.ck-content.ck-editor__editable h2.subtle{font-size:var(--k911-font-300) !important;line-height:var(--k911-line-300) !important;font-weight:var(--k911-font-weight-medium) !important;color:var(--k911-text-muted) !important}.ck.ck-content.ck-editor__editable h3.subtle{font-size:var(--k911-font-200) !important;line-height:var(--k911-line-200) !important;font-weight:var(--k911-font-weight-semibold) !important;color:var(--k911-text-muted) !important}.ck.ck-content.ck-editor__editable p{font-size:var(--k911-font-100) !important;line-height:1.6 !important;margin-block-end:var(--k911-space-300) !important}.ck.ck-content.ck-editor__editable ul,.ck.ck-content.ck-editor__editable ol{margin-block-end:var(--k911-space-400) !important;padding-inline-start:var(--k911-space-500) !important;font-size:var(--k911-font-100) !important;line-height:var(--k911-line-100) !important}.ck.ck-content.ck-editor__editable li{margin-block-end:var(--k911-space-100) !important}.ck.ck-content.ck-editor__editable ul{list-style-type:disc !important}.ck.ck-content.ck-editor__editable ul ul{list-style-type:circle !important;margin-block-start:var(--k911-space-100) !important;margin-block-end:0 !important}.ck.ck-content.ck-editor__editable ol{list-style-type:decimal !important}.ck.ck-content.ck-editor__editable ol ol{list-style-type:lower-alpha !important;margin-block-start:var(--k911-space-100) !important;margin-block-end:0 !important}.ck.ck-content.ck-editor__editable hr{border:none !important;margin-block:var(--k911-space-500) !important;border-block-start:1px solid rgba(var(--k911-rgb-bright), 0.1) !important}.ck.ck-content.ck-editor__editable blockquote{background:rgba(var(--k911-rgb-bright), 0.05) !important;margin-block:var(--k911-space-400) !important;padding:var(--k911-space-400) var(--k911-space-500) !important;border-left:3px solid var(--k911-ctx-teal) !important}.ck.ck-content.ck-editor__editable blockquote p{font-size:var(--k911-font-200) !important;line-height:var(--k911-line-200) !important;font-style:italic !important;margin-block-end:0 !important}.ck.ck-content.ck-editor__editable code{font-family:"SF Mono",Monaco,"Cascadia Code",monospace !important;padding:2px 6px !important;font-size:var(--k911-font-000) !important;line-height:var(--k911-line-000) !important;background:rgba(var(--k911-rgb-bright), 0.1) !important}.ck.ck-content.ck-editor__editable pre{background:rgba(var(--k911-rgb-bright), 0.05) !important;padding:var(--k911-space-400) !important;overflow-x:auto !important;margin-block:var(--k911-space-400) !important}.ck.ck-content.ck-editor__editable pre code{background:none !important;padding:0 !important;font-size:var(--k911-font-000) !important;line-height:var(--k911-line-000) !important;color:var(--k911-ctx-text) !important}.ck.ck-content.ck-editor__editable a{color:var(--k911-ctx-blue) !important;text-decoration:underline !important;text-underline-offset:.15em !important}.ck.ck-content.ck-editor__editable a:hover{text-decoration-thickness:2px !important}.ck.ck-content.ck-editor__editable img{max-width:100% !important;height:auto !important;margin-block:var(--k911-space-400) !important}.ck.ck-content.ck-editor__editable table{width:100% !important;margin-block:var(--k911-space-400) !important;border-collapse:collapse !important}.ck.ck-content.ck-editor__editable table th,.ck.ck-content.ck-editor__editable table td{padding:var(--k911-space-200) var(--k911-space-300) !important;text-align:left !important;border-block-end:1px solid rgba(var(--k911-rgb-bright), 0.1) !important}.ck.ck-content.ck-editor__editable table th{font-weight:var(--k911-font-weight-semibold) !important}.ck.ck-content.ck-editor__editable dl{margin-block-end:var(--k911-space-400) !important}.ck.ck-content.ck-editor__editable dt{font-weight:var(--k911-font-weight-semibold) !important;color:var(--k911-ctx-teal) !important;margin-block-end:var(--k911-space-100) !important}.ck.ck-content.ck-editor__editable dd{margin-inline-start:var(--k911-space-400) !important;margin-block-end:var(--k911-space-300) !important}.ck.ck-content.ck-editor__editable .alert{background:var(--k911-warning-muted) !important;color:var(--k911-warning-on-muted) !important;padding:var(--k911-space-300) var(--k911-space-400) !important;margin-block:var(--k911-space-400) !important;font-size:var(--k911-font-100) !important;line-height:var(--k911-line-100) !important}.ck.ck-content.ck-editor__editable .emphasis{font-weight:var(--k911-font-weight-semibold) !important;color:var(--k911-ctx-teal) !important}.ck.ck-content.ck-editor__editable a.btn-inline{display:inline-block !important;padding:var(--k911-space-100) var(--k911-space-200) !important;background:var(--k911-ctx-teal) !important;color:var(--k911-bg-500) !important;text-decoration:none !important;font-weight:var(--k911-font-weight-semibold) !important;font-size:var(--k911-font-000) !important}.ck.ck-content.ck-editor__editable a.btn-inline:hover{background:var(--k911-ctx-blue) !important;color:var(--k911-bg-500) !important}.ck.ck-content.ck-editor__editable .icon{font-family:"Material Symbols Outlined" !important;font-size:1.2em !important;font-variation-settings:"wght" 400 !important;line-height:1 !important;vertical-align:middle !important}.ck.ck-content.ck-editor__editable .admonition__container{container-type:inline-size;container-name:admonition;margin-block:var(--k911-space-400)}.ck.ck-content.ck-editor__editable .admonition__layout{display:flex;flex-direction:column;gap:var(--k911-space-400);padding:var(--k911-space-400);background:var(--k911-warning-muted)}@container admonition (min-width: 480px){.ck.ck-content.ck-editor__editable .admonition__layout{display:grid;grid-template-columns:repeat(2, 1fr)}}@container admonition (min-width: 860px){.ck.ck-content.ck-editor__editable .admonition__layout{grid-template-columns:repeat(4, 1fr)}}.ck.ck-content.ck-editor__editable .admonition__warning{text-wrap:balance;text-align:center;font-size:var(--k911-font-200);line-height:var(--k911-line-200);padding-block-end:var(--k911-space-300);grid-column:1/-1}.ck.ck-content.ck-editor__editable .admonition__entry{text-align:center}.ck.ck-content.ck-editor__editable .admonition__entry-title{text-align:center;text-transform:uppercase;font-size:var(--k911-font-000);line-height:var(--k911-line-000)}.ck.ck-content.ck-editor__editable .admonition__entry-phone{text-align:center;font-size:var(--k911-font-200);line-height:var(--k911-line-200)}.ck.ck-content.ck-editor__editable .admonition__entry-phone--primary{font-size:var(--k911-font-400);line-height:var(--k911-line-400)}.ck.ck-content.ck-editor__editable .admonition__entry-phone--alt{font-size:var(--k911-font-000);color:var(--k911-text-muted)}.ck.ck-content.ck-editor__editable .admonition__entry-description{font-size:var(--k911-font-000);line-height:var(--k911-line-000);color:var(--k911-text-muted)}.ck.ck-content.ck-editor__editable .step-by-step__container{container-type:inline-size;container-name:step-by-step;margin-block:var(--k911-space-400)}.ck.ck-content.ck-editor__editable .step-by-step__container>h2{margin-block-start:0;padding-inline:var(--k911-space-400);padding-block-start:var(--k911-space-400)}.ck.ck-content.ck-editor__editable .step-by-step__container>p{padding-inline:var(--k911-space-400)}.ck.ck-content.ck-editor__editable .step-by-step__list{list-style:none;padding-inline-start:0;margin-block-end:0;counter-reset:step}@container step-by-step (min-width: 720px){.ck.ck-content.ck-editor__editable .step-by-step__list{display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:0}}.ck.ck-content.ck-editor__editable .step-by-step__item{position:relative;padding-inline-start:var(--k911-space-600);padding-inline-end:var(--k911-space-300);padding-block:var(--k911-space-300) var(--k911-space-400);margin-block-end:var(--k911-space-400);border-inline-start:2px solid rgba(var(--k911-rgb-bright), 0.1)}.ck.ck-content.ck-editor__editable .step-by-step__item::before{content:counter(step);counter-increment:step;position:absolute;inset-inline-start:calc(-1*var(--k911-space-300) - 1px);display:flex;align-items:center;justify-content:center;width:var(--k911-space-600);height:var(--k911-space-600);background:var(--k911-ctx-teal);color:var(--k911-bg-500);font-weight:var(--k911-font-weight-bold);font-size:var(--k911-font-100);border-radius:50%}@container step-by-step (min-width: 720px){.ck.ck-content.ck-editor__editable .step-by-step__item{padding-inline:var(--k911-space-400);padding-block-start:var(--k911-space-700);padding-block-end:var(--k911-space-400);margin-block-end:0;border-inline-start:none;border-inline-end:1px solid rgba(var(--k911-rgb-bright), 0.1)}.ck.ck-content.ck-editor__editable .step-by-step__item:last-child{border-inline-end:none}.ck.ck-content.ck-editor__editable .step-by-step__item::before{inset-inline-start:50%;inset-block-start:0;transform:translateX(-50%)}}.ck.ck-content.ck-editor__editable .step-by-step__item-title{font-size:var(--k911-font-200);line-height:var(--k911-line-200);font-weight:var(--k911-font-weight-bold);color:var(--k911-ctx-text);margin-block-end:var(--k911-space-100)}@container step-by-step (min-width: 720px){.ck.ck-content.ck-editor__editable .step-by-step__item-title{text-align:center}}.ck.ck-content.ck-editor__editable .step-by-step__item-subtitle{font-size:var(--k911-font-000);line-height:var(--k911-line-000);color:var(--k911-text-muted);margin-block-end:var(--k911-space-200)}@container step-by-step (min-width: 720px){.ck.ck-content.ck-editor__editable .step-by-step__item-subtitle{text-align:center}}.ck.ck-content.ck-editor__editable .step-by-step__item-description{font-size:var(--k911-font-100);line-height:1.6}.ck.ck-content.ck-editor__editable .step-by-step__option-container{list-style:disc;padding-inline-start:var(--k911-space-400);margin-block:var(--k911-space-200)}.ck.ck-content.ck-editor__editable .step-by-step__option{font-size:var(--k911-font-100);line-height:1.6;margin-block-end:var(--k911-space-100)}.ck.ck-content.ck-editor__editable>*+h2{margin-block-start:var(--k911-space-700) !important}.ck.ck-content.ck-editor__editable>*+h3{margin-block-start:var(--k911-space-600) !important}.ck.ck-content.ck-editor__editable>*+h4,.ck.ck-content.ck-editor__editable>*+h5,.ck.ck-content.ck-editor__editable>*+h6{margin-block-start:var(--k911-space-500) !important}
`;









// Create custom preset based on defaultHtmlPreset
const customHtmlPreset = {
  ...defaultHtmlPreset,
  editorConfig: {
    ...defaultHtmlPreset.editorConfig,
    // Add 'style' to the toolbar
    toolbar: [
      "heading",
      "style",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "subscript",
      "superscript",
      "removeFormat",
      "|",
      "bulletedList",
      "numberedList",
      "outdent",
      "indent",
      "alignment",
      "|",
      "link",
      "insertImage",
      "strapiMediaLib",
      "insertTable",
      "blockQuote",
      "codeBlock",
      "htmlEmbed",
      "horizontalLine",
      "|",
      "sourceEditing",
      "fullScreen",
      "|",
      "undo",
      "redo",
    ],
    // Remove H1, keep H2-H6
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4",
          view: "h4",
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
        {
          model: "heading5",
          view: "h5",
          title: "Heading 5",
          class: "ck-heading_heading5",
        },
        {
          model: "heading6",
          view: "h6",
          title: "Heading 6",
          class: "ck-heading_heading6",
        },
      ],
    },
    // Add custom style definitions
    style: {
      definitions: [
        { name: "Subtle Heading", element: ["h2", "h3"], classes: ["subtle"] },
        { name: "Alert", element: "p", classes: ["alert"] },
        { name: "Emphasis", element: "span", classes: ["emphasis"] },
        { name: "Button", element: "a", classes: ["btn-inline"] },
        { name: "Icon", element: "span", classes: ["icon"] },
        // Admonition styles
        { name: "Admonition Container", element: "div", classes: ["admonition__container"] },
        { name: "Admonition Layout", element: "div", classes: ["admonition__layout"] },
        { name: "Admonition Warning", element: "div", classes: ["admonition__warning"] },
        { name: "Admonition Entry", element: "div", classes: ["admonition__entry"] },
        { name: "Admonition Title", element: "div", classes: ["admonition__entry-title"] },
        { name: "Admonition Phone", element: "div", classes: ["admonition__entry-phone"] },
        { name: "Admonition Phone (Primary)", element: "div", classes: ["admonition__entry-phone", "admonition__entry-phone--primary"] },
        { name: "Admonition Phone (Alt)", element: "div", classes: ["admonition__entry-phone", "admonition__entry-phone--alt"] },
        { name: "Admonition Description", element: "div", classes: ["admonition__entry-description"] },
        // Step-by-step styles
        { name: "Step-by-Step Container", element: "div", classes: ["step-by-step__container"] },
        { name: "Step-by-Step List", element: "ol", classes: ["step-by-step__list"] },
        { name: "Step-by-Step Item", element: "li", classes: ["step-by-step__item"] },
        { name: "Step-by-Step Title", element: "h3", classes: ["step-by-step__item-title"] },
        { name: "Step-by-Step Subtitle", element: "p", classes: ["step-by-step__item-subtitle"] },
        { name: "Step-by-Step Description", element: "div", classes: ["step-by-step__item-description"] },
        { name: "Step-by-Step Options", element: "ul", classes: ["step-by-step__option-container"] },
        { name: "Step-by-Step Option", element: "li", classes: ["step-by-step__option"] },
        // Frost effect styles
        { name: "Frost (Flat)", element: "div", classes: ["frost", "frost-flat"] },
        { name: "Frost (Subtle)", element: "div", classes: ["frost", "frost-subtle"] },
        { name: "Frost (Standard)", element: "div", classes: ["frost", "frost-standard"] },
        { name: "Frost (High)", element: "div", classes: ["frost", "frost-high"] },
      ],
    },
    // Allow block structure via General HTML Support
    htmlSupport: {
      allow: [
        {
          name: "div",
          classes: /^(admonition__|step-by-step__|frost|effect--frosted-glass|effect-mode--)/,
        },
        {
          name: "a",
          classes: /^(admonition__|step-by-step__)/,
        },
        {
          name: "ol",
          classes: /^step-by-step__/,
        },
        {
          name: "ul",
          classes: /^step-by-step__/,
        },
        {
          name: "li",
          classes: /^step-by-step__/,
        },
        {
          name: "h3",
          classes: /^step-by-step__/,
        },
        {
          name: "p",
          classes: /^step-by-step__/,
        },
        {
          name: /.*/,
          classes: /^reporting-agencies/,
        },
      ],
    },
  },
};

// TOTP setup UI for users who need to set up TOTP
const showTotpSetupUI = async (session: {
  totpSessionToken: string;
  expiresAt: string;
  user: { email: string };
}) => {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'totp-setup-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f6f6f9;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  overlay.innerHTML = `
    <div style="
      background: white;
      padding: 32px;
      border-radius: 4px;
      box-shadow: 0 1px 4px rgba(33, 33, 52, 0.1);
      max-width: 480px;
      width: 100%;
      text-align: center;
    ">
      <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Set Up Two-Factor Authentication</h2>
      <p style="margin: 0 0 24px 0; color: #666;">Your administrator requires two-factor authentication for your account.</p>
      <div id="setup-loading" style="padding: 40px 0;">
        <p style="color: #666;">Loading setup...</p>
      </div>
      <div id="setup-content" style="display: none;"></div>
      <div id="backup-codes-content" style="display: none;"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Fetch QR code
  try {
    const response = await fetch('/admin-totp/totp/setup-with-session/begin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ totpSessionToken: session.totpSessionToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Failed to start setup');
    }

    const { qrCode, secret } = data.data;

    // Show setup form
    const loadingEl = document.getElementById('setup-loading');
    const contentEl = document.getElementById('setup-content');
    if (loadingEl) loadingEl.style.display = 'none';
    if (contentEl) {
      contentEl.style.display = 'block';
      contentEl.innerHTML = `
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
          </p>
          <img src="${qrCode}" alt="QR Code" style="max-width: 200px; margin: 0 auto; display: block;" />
          <p style="margin: 16px 0 0 0; font-size: 12px; color: #888;">
            Or enter this code manually: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${secret}</code>
          </p>
        </div>
        <form id="setup-form">
          <div style="margin-bottom: 16px; text-align: left;">
            <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500;">
              Verification Code
            </label>
            <input
              type="text"
              id="setup-code"
              placeholder="Enter 6-digit code"
              autocomplete="one-time-code"
              autofocus
              style="
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
                box-sizing: border-box;
              "
            />
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #888;">
              Enter the 6-digit code from your authenticator app to verify setup
            </p>
            <p id="setup-error" style="margin: 4px 0 0 0; font-size: 12px; color: #d02b20; display: none;"></p>
          </div>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button type="button" id="setup-cancel" style="
              padding: 10px 20px;
              border: 1px solid #ddd;
              background: white;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Cancel</button>
            <button type="submit" id="setup-submit" style="
              padding: 10px 20px;
              border: none;
              background: #4945ff;
              color: white;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Enable</button>
          </div>
        </form>
      `;

      // Handle cancel
      document.getElementById('setup-cancel')?.addEventListener('click', () => {
        sessionStorage.removeItem('totpSession');
        overlay.remove();
        window.location.href = '/admin/auth/login';
      });

      // Handle form submit
      document.getElementById('setup-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codeInput = document.getElementById('setup-code') as HTMLInputElement;
        const errorEl = document.getElementById('setup-error') as HTMLElement;
        const submitBtn = document.getElementById('setup-submit') as HTMLButtonElement;

        const code = codeInput?.value?.trim();
        if (!code || code.length !== 6) {
          errorEl.textContent = 'Please enter a valid 6-digit code';
          errorEl.style.display = 'block';
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enabling...';
        errorEl.style.display = 'none';

        try {
          const completeResponse = await fetch('/admin-totp/totp/setup-with-session/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              totpSessionToken: session.totpSessionToken,
              code,
            }),
          });

          const completeData = await completeResponse.json();

          if (!completeResponse.ok) {
            throw new Error(completeData?.error?.message || 'Setup failed');
          }

          // Show backup codes
          const setupContentEl = document.getElementById('setup-content');
          const backupCodesEl = document.getElementById('backup-codes-content');
          if (setupContentEl) setupContentEl.style.display = 'none';
          if (backupCodesEl) {
            backupCodesEl.style.display = 'block';
            backupCodesEl.innerHTML = `
              <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #32324d;">Save Your Backup Codes</h3>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #666;">
                Store these codes securely. You can use them to access your account if you lose your authenticator device.
              </p>
              <div style="
                background: #f6f6f9;
                padding: 16px;
                border-radius: 4px;
                margin-bottom: 16px;
                font-family: monospace;
                font-size: 14px;
                text-align: left;
              ">
                ${completeData.data.backupCodes.map((code: string) => `<div style="padding: 4px 0;">${code}</div>`).join('')}
              </div>
              <button id="backup-continue" style="
                padding: 10px 24px;
                border: none;
                background: #4945ff;
                color: white;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
              ">I've saved these codes - Continue</button>
            `;

            document.getElementById('backup-continue')?.addEventListener('click', () => {
              sessionStorage.removeItem('totpSession');
              overlay.remove();
              window.location.href = '/admin';
            });
          }
        } catch (err: any) {
          errorEl.textContent = err.message || 'Setup failed';
          errorEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enable';
        }
      });
    }
  } catch (err: any) {
    const loadingEl = document.getElementById('setup-loading');
    if (loadingEl) {
      loadingEl.innerHTML = `
        <p style="color: #d02b20; margin-bottom: 16px;">${err.message || 'Failed to start setup'}</p>
        <button id="setup-back" style="
          padding: 10px 20px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Back to Login</button>
      `;
      document.getElementById('setup-back')?.addEventListener('click', () => {
        sessionStorage.removeItem('totpSession');
        overlay.remove();
        window.location.href = '/admin/auth/login';
      });
    }
  }
};

// TOTP verification UI
const showTotpVerificationUI = (session: {
  totpSessionToken: string;
  expiresAt: string;
  user: { email: string };
  needsSetup: boolean;
}) => {
  // If user needs to set up TOTP, show setup UI instead
  if (session.needsSetup) {
    showTotpSetupUI(session);
    return;
  }

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'totp-verify-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #f6f6f9;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  overlay.innerHTML = `
    <div style="
      background: white;
      padding: 32px;
      border-radius: 4px;
      box-shadow: 0 1px 4px rgba(33, 33, 52, 0.1);
      max-width: 400px;
      width: 100%;
      text-align: center;
    ">
      <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600;">Two-Factor Authentication</h2>
      <p style="margin: 0 0 24px 0; color: #666;">Enter the code for ${session.user.email}</p>
      <form id="totp-form">
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500;">
            Verification Code
          </label>
          <input
            type="text"
            id="totp-code"
            placeholder="Enter 6-digit code or backup code"
            autocomplete="one-time-code"
            autofocus
            style="
              width: 100%;
              padding: 10px 12px;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 16px;
              box-sizing: border-box;
            "
          />
          <p id="totp-hint" style="margin: 4px 0 0 0; font-size: 12px; color: #888;">
            Enter the code from your authenticator app or a backup code
          </p>
          <p id="totp-error" style="margin: 4px 0 0 0; font-size: 12px; color: #d02b20; display: none;"></p>
        </div>
        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <button type="button" id="totp-cancel" style="
            padding: 10px 20px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">Cancel</button>
          <button type="submit" id="totp-submit" style="
            padding: 10px 20px;
            border: none;
            background: #4945ff;
            color: white;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">Verify</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  // Handle cancel
  document.getElementById('totp-cancel')?.addEventListener('click', () => {
    sessionStorage.removeItem('totpSession');
    overlay.remove();
    window.location.href = '/admin/auth/login';
  });

  // Handle form submit
  const form = document.getElementById('totp-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const codeInput = document.getElementById('totp-code') as HTMLInputElement;
      const errorEl = document.getElementById('totp-error') as HTMLElement;
      const submitBtn = document.getElementById('totp-submit') as HTMLButtonElement;

      const code = codeInput?.value?.trim();
      if (!code || code.length < 6) {
        errorEl.textContent = 'Please enter a valid code';
        errorEl.style.display = 'block';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying...';
      errorEl.style.display = 'none';

      try {
        const response = await fetch('/admin-totp/totp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totpSessionToken: session.totpSessionToken,
            code,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error?.message || 'Verification failed');
        }

        // Success - clear session and redirect
        sessionStorage.removeItem('totpSession');
        overlay.remove();

        // The verify endpoint sets the refresh cookie, so just redirect
        window.location.href = '/admin';
      } catch (err: any) {
        errorEl.textContent = err.message || 'Verification failed';
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Verify';
      }
    });
  }
};

// Install TOTP login interceptor
const installTotpInterceptor = () => {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    // Check if this is a login request
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    if (url?.endsWith('/admin/login') && args[1]?.method?.toUpperCase() === 'POST') {
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        if (data?.data?.requiresTOTP) {
          // Store TOTP session data
          const session = {
            totpSessionToken: data.data.totpSessionToken,
            expiresAt: data.data.expiresAt,
            user: data.data.user,
            needsSetup: data.data.needsSetup,
          };
          sessionStorage.setItem('totpSession', JSON.stringify(session));

          // Show TOTP verification UI
          showTotpVerificationUI(session);

          // Return a promise that never resolves - this keeps Strapi's login
          // handler waiting indefinitely while the user interacts with the TOTP overlay
          return new Promise(() => {});
        }
      } catch (e) {
        // Not JSON or other error, continue normally
      }
    }
    return response;
  };
};

export default {
  config: {
    locales: [],
  },
  register() {
    // Apply content styles and custom preset to CKEditor
    setPluginConfig({
      theme: {
        ...defaultTheme,
        additional: contentStyles,
      },
      presets: [customHtmlPreset],
    });
  },
  bootstrap() {
    // Install TOTP interceptor on app bootstrap
    installTotpInterceptor();
  },
};
