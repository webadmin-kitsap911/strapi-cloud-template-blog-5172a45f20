import { PLUGIN_ID } from './pluginId';
import { File } from '@strapi/icons';

export default {
  register(app: any) {
    app.customFields.register({
      name: 'private-file',
      pluginId: PLUGIN_ID,
      type: 'integer',
      inputSize: {
        default: 12,
        isResizable: false,
      },
      intlLabel: {
        id: `${PLUGIN_ID}.private-file.label`,
        defaultMessage: 'Private File',
      },
      intlDescription: {
        id: `${PLUGIN_ID}.private-file.description`,
        defaultMessage: 'Upload a file without using the media library browser',
      },
      icon: File,
      components: {
        Input: async () =>
          import('./components/Input').then((module) => ({
            default: module.Input,
          })),
      },
      options: {
        advanced: [
          {
            sectionTitle: {
              id: `${PLUGIN_ID}.private-file.settings`,
              defaultMessage: 'Settings',
            },
            items: [
              {
                name: 'required',
                type: 'checkbox',
                intlLabel: {
                  id: `${PLUGIN_ID}.private-file.required`,
                  defaultMessage: 'Required field',
                },
                description: {
                  id: `${PLUGIN_ID}.private-file.required.description`,
                  defaultMessage: 'You won\'t be able to create an entry if this field is empty',
                },
              },
            ],
          },
        ],
      },
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
