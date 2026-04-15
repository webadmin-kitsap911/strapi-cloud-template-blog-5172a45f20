import type { StrapiApp } from "@strapi/strapi/admin";
import {
  setPluginConfig,
  defaultTheme,
  defaultHtmlPreset,
} from "@_sh/strapi-plugin-ckeditor";

// Content styles for CKEditor preview
// Generated from: npm run build:ckeditor-styles (in frontend project)
const contentStyles = `
.ck.ck-content.ck-editor__editable{font-family:var(--k911-font-family) !important;font-size:var(--k911-font-100) !important;line-height:1.6 !important;color:var(--k911-ctx-text) !important;background:var(--k911-bg-500) !important;--k911-font-family: "DM Sans", system-ui, -apple-system, sans-serif;--k911-font-000: 14px;--k911-font-100: 18px;--k911-font-200: 23px;--k911-font-300: 29px;--k911-font-400: 37px;--k911-font-500: 47px;--k911-font-600: 59px;--k911-line-000: 24px;--k911-line-100: 32px;--k911-line-200: 32px;--k911-line-300: 40px;--k911-line-400: 48px;--k911-line-500: 56px;--k911-line-600: 80px;--k911-space-100: 8px;--k911-space-200: 16px;--k911-space-300: 24px;--k911-space-400: 32px;--k911-space-500: 40px;--k911-space-600: 56px;--k911-space-700: 72px;--k911-font-weight-medium: 500;--k911-font-weight-semibold: 600;--k911-font-weight-bold: 700;--k911-ctx-text: #ffffff;--k911-ctx-teal: #77d4a8;--k911-ctx-blue: #89bfff;--k911-bg-500: #061424;--k911-palette-gold: #ff9827;--k911-rgb-bright: 255, 255, 255;--k911-text-muted: #8a9bb3;--k911-warning: #ff9827;--k911-warning-muted: #713f12}.ck.ck-content.ck-editor__editable h2{font-size:var(--k911-font-500) !important;line-height:var(--k911-line-500) !important;font-weight:var(--k911-font-weight-medium) !important;color:var(--k911-ctx-teal) !important;margin-block-end:var(--k911-space-400) !important}.ck.ck-content.ck-editor__editable h3{font-size:var(--k911-font-300) !important;line-height:var(--k911-line-300) !important;font-weight:var(--k911-font-weight-semibold) !important;color:var(--k911-text-muted) !important;margin-block-end:var(--k911-space-300) !important}.ck.ck-content.ck-editor__editable h4{font-size:var(--k911-font-300) !important;line-height:var(--k911-line-300) !important;font-weight:var(--k911-font-weight-bold) !important;margin-block-end:var(--k911-space-200) !important}.ck.ck-content.ck-editor__editable h5,.ck.ck-content.ck-editor__editable h6{font-size:var(--k911-font-200) !important;line-height:var(--k911-line-200) !important;font-weight:var(--k911-font-weight-bold) !important;margin-block-end:var(--k911-space-200) !important}.ck.ck-content.ck-editor__editable h2.subtle{font-size:var(--k911-font-300) !important;line-height:var(--k911-line-300) !important;font-weight:var(--k911-font-weight-medium) !important;color:var(--k911-text-muted) !important}.ck.ck-content.ck-editor__editable h3.subtle{font-size:var(--k911-font-200) !important;line-height:var(--k911-line-200) !important;font-weight:var(--k911-font-weight-semibold) !important;color:var(--k911-text-muted) !important}.ck.ck-content.ck-editor__editable p{font-size:var(--k911-font-100) !important;line-height:1.6 !important;margin-block-end:var(--k911-space-300) !important}.ck.ck-content.ck-editor__editable ul,.ck.ck-content.ck-editor__editable ol{margin-block-end:var(--k911-space-400) !important;padding-inline-start:var(--k911-space-500) !important;font-size:var(--k911-font-100) !important;line-height:var(--k911-line-100) !important}.ck.ck-content.ck-editor__editable li{margin-block-end:var(--k911-space-100) !important}.ck.ck-content.ck-editor__editable ul{list-style-type:disc !important}.ck.ck-content.ck-editor__editable ul ul{list-style-type:circle !important;margin-block-start:var(--k911-space-100) !important;margin-block-end:0 !important}.ck.ck-content.ck-editor__editable ol{list-style-type:decimal !important}.ck.ck-content.ck-editor__editable ol ol{list-style-type:lower-alpha !important;margin-block-start:var(--k911-space-100) !important;margin-block-end:0 !important}.ck.ck-content.ck-editor__editable hr{border:none !important;margin-block:var(--k911-space-500) !important;border-block-start:1px solid rgba(var(--k911-rgb-bright), 0.1) !important}.ck.ck-content.ck-editor__editable blockquote{background:rgba(var(--k911-rgb-bright), 0.05) !important;margin-block:var(--k911-space-400) !important;padding:var(--k911-space-400) var(--k911-space-500) !important;border-left:3px solid var(--k911-ctx-teal) !important}.ck.ck-content.ck-editor__editable blockquote p{font-size:var(--k911-font-200) !important;line-height:var(--k911-line-200) !important;font-style:italic !important;margin-block-end:0 !important}.ck.ck-content.ck-editor__editable code{font-family:"SF Mono",Monaco,"Cascadia Code",monospace !important;padding:2px 6px !important;font-size:var(--k911-font-000) !important;line-height:var(--k911-line-000) !important;background:rgba(var(--k911-rgb-bright), 0.1) !important}.ck.ck-content.ck-editor__editable pre{background:rgba(var(--k911-rgb-bright), 0.05) !important;padding:var(--k911-space-400) !important;overflow-x:auto !important;margin-block:var(--k911-space-400) !important}.ck.ck-content.ck-editor__editable pre code{background:none !important;padding:0 !important;font-size:var(--k911-font-000) !important;line-height:var(--k911-line-000) !important;color:var(--k911-ctx-text) !important}.ck.ck-content.ck-editor__editable a{color:var(--k911-ctx-blue) !important;text-decoration:underline !important;text-underline-offset:.15em !important}.ck.ck-content.ck-editor__editable a:hover{text-decoration-thickness:2px !important}.ck.ck-content.ck-editor__editable img{max-width:100% !important;height:auto !important;margin-block:var(--k911-space-400) !important}.ck.ck-content.ck-editor__editable table{width:100% !important;margin-block:var(--k911-space-400) !important;border-collapse:collapse !important}.ck.ck-content.ck-editor__editable table th,.ck.ck-content.ck-editor__editable table td{padding:var(--k911-space-200) var(--k911-space-300) !important;text-align:left !important;border-block-end:1px solid rgba(var(--k911-rgb-bright), 0.1) !important}.ck.ck-content.ck-editor__editable table th{font-weight:var(--k911-font-weight-semibold) !important}.ck.ck-content.ck-editor__editable dl{margin-block-end:var(--k911-space-400) !important}.ck.ck-content.ck-editor__editable dt{font-weight:var(--k911-font-weight-semibold) !important;color:var(--k911-ctx-teal) !important;margin-block-end:var(--k911-space-100) !important}.ck.ck-content.ck-editor__editable dd{margin-inline-start:var(--k911-space-400) !important;margin-block-end:var(--k911-space-300) !important}.ck.ck-content.ck-editor__editable .alert{background:var(--k911-warning-muted) !important;color:var(--k911-warning) !important;padding:var(--k911-space-300) var(--k911-space-400) !important;margin-block:var(--k911-space-400) !important;font-size:var(--k911-font-100) !important;line-height:var(--k911-line-100) !important}.ck.ck-content.ck-editor__editable .emphasis{font-weight:var(--k911-font-weight-semibold) !important;color:var(--k911-ctx-teal) !important}.ck.ck-content.ck-editor__editable a.btn-inline{display:inline-block !important;padding:var(--k911-space-100) var(--k911-space-200) !important;background:var(--k911-ctx-teal) !important;color:var(--k911-bg-500) !important;text-decoration:none !important;font-weight:var(--k911-font-weight-semibold) !important;font-size:var(--k911-font-000) !important}.ck.ck-content.ck-editor__editable a.btn-inline:hover{background:var(--k911-ctx-blue) !important;color:var(--k911-bg-500) !important}.ck.ck-content.ck-editor__editable .icon{font-family:"Material Symbols Outlined" !important;font-size:1.2em !important;font-variation-settings:"wght" 400 !important;line-height:1 !important;vertical-align:middle !important}.ck.ck-content.ck-editor__editable>*+h2{margin-block-start:var(--k911-space-700) !important}.ck.ck-content.ck-editor__editable>*+h3{margin-block-start:var(--k911-space-600) !important}.ck.ck-content.ck-editor__editable>*+h4,.ck.ck-content.ck-editor__editable>*+h5,.ck.ck-content.ck-editor__editable>*+h6{margin-block-start:var(--k911-space-500) !important}
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
      ],
    },
  },
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
  bootstrap() {},
};
