import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCallToAction extends Struct.ComponentSchema {
  collectionName: 'components_blocks_call_to_actions';
  info: {
    description: 'Highlighted section with a button to drive user action';
    displayName: 'Call to Action';
    icon: 'bullhorn';
  };
  attributes: {
    buttonText: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text displayed on the button';
        };
      }>;
    buttonUrl: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL the button links to (e.g., /contact or https://example.com)';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main headline for the CTA';
        };
      }>;
    style: Schema.Attribute.Enumeration<['primary', 'secondary', 'outline']> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Button style: primary (filled), secondary (muted), outline (bordered)';
        };
      }> &
      Schema.Attribute.DefaultTo<'primary'>;
    text: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Supporting text below the heading';
        };
      }>;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
  };
}

export interface BlocksColumns extends Struct.ComponentSchema {
  collectionName: 'components_blocks_columns';
  info: {
    description: 'Multi-column layout with flexible content';
    displayName: 'Columns';
    icon: 'columns';
  };
  attributes: {
    columns: Schema.Attribute.Component<'columns.column-content', true> &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 3;
          min: 2;
        },
        number
      >;
    layout: Schema.Attribute.Enumeration<
      ['1:1', '2:1', '1:2', '2:3', '3:2', '1:1:1']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'1:1'>;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
  };
}

export interface BlocksContactForm extends Struct.ComponentSchema {
  collectionName: 'components_blocks_contact_forms';
  info: {
    description: 'General contact form';
    displayName: 'Contact Form';
    icon: 'envelope';
  };
  attributes: {
    description: Schema.Attribute.Text;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
    title: Schema.Attribute.String & Schema.Attribute.DefaultTo<'Contact Us'>;
  };
}

export interface BlocksEmbed extends Struct.ComponentSchema {
  collectionName: 'components_blocks_embeds';
  info: {
    description: 'Embed external content like YouTube or Vimeo videos';
    displayName: 'Embed';
    icon: 'code';
  };
  attributes: {
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
    title: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Accessible title describing the embedded content';
        };
      }>;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full URL to embed (e.g., https://www.youtube.com/embed/VIDEO_ID)';
        };
      }>;
  };
}

export interface BlocksGroupMembers extends Struct.ComponentSchema {
  collectionName: 'components_blocks_group_members';
  info: {
    description: 'Display a grid of staff members or team members';
    displayName: 'Group Members';
    icon: 'users';
  };
  attributes: {
    filterByTag: Schema.Attribute.Relation<
      'oneToOne',
      'api::staff-tag.staff-tag'
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: "Only show members with this tag (e.g., 'Board', 'Leadership')";
        };
      }>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Maximum number of members to show (leave empty for all)';
        };
      }> &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      >;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
  };
}

export interface BlocksHeading extends Struct.ComponentSchema {
  collectionName: 'components_blocks_headings';
  info: {
    description: 'Section heading for organizing page content';
    displayName: 'Heading';
    icon: 'heading';
  };
  attributes: {
    anchor: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: "URL anchor for linking directly to this section (e.g., 'contact-us')";
        };
      }>;
    level: Schema.Attribute.Enumeration<['h2', 'h3', 'h4']> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'h2 = main section, h3 = subsection, h4 = minor heading';
        };
      }> &
      Schema.Attribute.DefaultTo<'h2'>;
    text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The heading text';
        };
      }>;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
  };
}

export interface BlocksImage extends Struct.ComponentSchema {
  collectionName: 'components_blocks_images';
  info: {
    description: 'Image with optional caption. Alt text is set in the media library.';
    displayName: 'Image';
    icon: 'image';
  };
  attributes: {
    caption: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional text displayed below the image';
        };
      }>;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
  };
}

export interface BlocksPressReleases extends Struct.ComponentSchema {
  collectionName: 'components_blocks_press_releases';
  info: {
    description: 'Display a list of recent press releases';
    displayName: 'Press Releases';
    icon: 'newspaper';
  };
  attributes: {
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Maximum number of press releases to show';
        };
      }> &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
  };
}

export interface BlocksPublicMeetings extends Struct.ComponentSchema {
  collectionName: 'components_blocks_public_meetings';
  info: {
    description: 'Display upcoming and past public meetings';
    displayName: 'Public Meetings';
    icon: 'calendar';
  };
  attributes: {
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Maximum number of meetings to show';
        };
      }> &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
    showPast: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Include past meetings in the list';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
  };
}

export interface BlocksPublicRecordsRequestForm extends Struct.ComponentSchema {
  collectionName: 'components_blocks_public_records_request_forms';
  info: {
    description: 'Form for submitting public records requests';
    displayName: 'Public Records Request Form';
    icon: 'file-alt';
  };
  attributes: {
    description: Schema.Attribute.Text;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Public Records Request'>;
  };
}

export interface BlocksRichText extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rich_texts';
  info: {
    description: 'Formatted text content with headings, lists, links, and more';
    displayName: 'Rich Text';
    icon: 'align-left';
  };
  attributes: {
    content: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    theme: Schema.Attribute.Enumeration<
      ['none', 'standard', 'brighter', 'darker']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'standard'>;
  };
}

export interface ColumnsColumnContent extends Struct.ComponentSchema {
  collectionName: 'components_columns_column_contents';
  info: {
    description: 'Content container for a single column';
    displayName: 'Column Content';
    icon: 'apps';
  };
  attributes: {
    children: Schema.Attribute.DynamicZone<
      ['blocks.rich-text', 'blocks.image']
    >;
  };
}

export interface SharedDocumentAttachment extends Struct.ComponentSchema {
  collectionName: 'components_shared_document_attachments';
  info: {
    description: 'Document with title and posted date';
    displayName: 'Document Attachment';
  };
  attributes: {
    file: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.CustomField<'plugin::private-file-upload.private-file'>;
    postedDate: Schema.Attribute.Date &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Date used for sorting documents';
        };
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Display name for the document';
        };
      }>;
  };
}

export interface SharedIncident extends Struct.ComponentSchema {
  collectionName: 'components_shared_incidents';
  info: {
    description: 'Incident details for public records request';
    displayName: 'Incident';
    icon: 'exclamation-triangle';
  };
  attributes: {
    dateTime: Schema.Attribute.DateTime;
    description: Schema.Attribute.Text;
    location: Schema.Attribute.String;
  };
}

export interface SharedOfficer extends Struct.ComponentSchema {
  collectionName: 'components_shared_officers';
  info: {
    description: 'Officer details for public records request';
    displayName: 'Officer';
    icon: 'user-shield';
  };
  attributes: {
    idNumber: Schema.Attribute.String;
    name: Schema.Attribute.String;
  };
}

export interface SharedPersonName extends Struct.ComponentSchema {
  collectionName: 'components_shared_person_names';
  info: {
    description: 'Simple name entry';
    displayName: 'Person Name';
    icon: 'user';
  };
  attributes: {
    name: Schema.Attribute.String;
  };
}

export interface StaffTitle extends Struct.ComponentSchema {
  collectionName: 'components_staff_titles';
  info: {
    description: 'Staff member job title';
    displayName: 'Title';
  };
  attributes: {
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.call-to-action': BlocksCallToAction;
      'blocks.columns': BlocksColumns;
      'blocks.contact-form': BlocksContactForm;
      'blocks.embed': BlocksEmbed;
      'blocks.group-members': BlocksGroupMembers;
      'blocks.heading': BlocksHeading;
      'blocks.image': BlocksImage;
      'blocks.press-releases': BlocksPressReleases;
      'blocks.public-meetings': BlocksPublicMeetings;
      'blocks.public-records-request-form': BlocksPublicRecordsRequestForm;
      'blocks.rich-text': BlocksRichText;
      'columns.column-content': ColumnsColumnContent;
      'shared.document-attachment': SharedDocumentAttachment;
      'shared.incident': SharedIncident;
      'shared.officer': SharedOfficer;
      'shared.person-name': SharedPersonName;
      'staff.title': StaffTitle;
    }
  }
}
