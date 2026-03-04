import type { Schema, Struct } from '@strapi/strapi';

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

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
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

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.document-attachment': SharedDocumentAttachment;
      'shared.incident': SharedIncident;
      'shared.media': SharedMedia;
      'shared.officer': SharedOfficer;
      'shared.person-name': SharedPersonName;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
