'use strict';

/**
 * Extension to csv-export plugin to handle repeatable component fields.
 *
 * This extends the plugin's service to:
 * 1. Populate component fields when fetching data
 * 2. Format component arrays as semicolon-separated strings
 */
module.exports = (plugin) => {
  const originalService = plugin.services.service;

  plugin.services.service = ({ strapi }) => {
    const original = originalService({ strapi });

    return {
      ...original,

      /**
       * Override restructureObject to include component fields in populate
       */
      async restructureObject(inputObject, uid, limit, offset) {
        const result = await original.restructureObject.call(this, inputObject, uid, limit, offset);

        // Add component fields to populate if defined
        if (inputObject.components) {
          for (const componentKey of Object.keys(inputObject.components)) {
            result.populate[componentKey] = true;
          }
        }

        return result;
      },

      /**
       * Override restructureData to format component fields
       */
      async restructureData(data, objectStructure) {
        const result = await original.restructureData.call(this, data, objectStructure);

        // If no components defined, return original result
        if (!objectStructure.components) {
          return result;
        }

        // Process each row to add formatted component columns
        return result.map((row, index) => {
          const originalRow = data[index];
          const newRow = { ...row };

          for (const [componentKey, componentConfig] of Object.entries(objectStructure.components)) {
            const componentData = originalRow[componentKey];

            if (Array.isArray(componentData) && componentData.length > 0) {
              // Format each item and join with semicolons
              newRow[componentKey] = componentData
                .map((item) => {
                  try {
                    return componentConfig.format(item);
                  } catch {
                    return '';
                  }
                })
                .filter(Boolean)
                .join('; ');
            } else {
              newRow[componentKey] = '';
            }
          }

          return newRow;
        });
      },

      /**
       * Override getTableData to include component columns in header
       */
      async getTableData(ctx) {
        const result = await original.getTableData.call(this, ctx);

        const excel = strapi.config.get('excel');
        const uid = ctx.query.uid;

        if (excel?.config[uid]?.components) {
          const componentKeys = Object.keys(excel.config[uid].components);
          result.columns = [...result.columns, ...componentKeys];
        }

        return result;
      },

      /**
       * Override downloadCSV to include component columns
       */
      async downloadCSV(ctx) {
        try {
          const excel = strapi.config.get('excel');
          const uid = ctx.query.uid;

          if (!uid || !excel?.config[uid]) {
            return ctx.badRequest('Invalid content type uid');
          }

          const query = await this.restructureObject(excel.config[uid], uid);
          const response = await strapi.entityService.findMany(uid, query);
          const csvData = await this.restructureData(response, excel.config[uid]);

          // Build headers including component fields
          const headers = [
            ...excel.config[uid].columns,
            ...Object.keys(excel.config[uid].relation || {}),
            ...Object.keys(excel.config[uid].components || {}),
          ];

          const headerRestructure = headers.map((element) =>
            element
              .split(/(?=[A-Z])|_/)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')
          );

          let csvContent = headerRestructure.join(',') + '\n';

          csvData.forEach((row) => {
            const csvRow = headers
              .map((header) => {
                const value =
                  row[header] !== undefined && row[header] !== null ? row[header].toString() : '';
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
              })
              .join(',');
            csvContent += csvRow + '\n';
          });

          ctx.set('Content-Disposition', 'attachment; filename=export.csv');
          ctx.set('Content-Type', 'text/csv');

          return Buffer.from(csvContent);
        } catch (error) {
          strapi.log.error('Error generating CSV file:', error);
          ctx.throw(500, 'Internal server error while generating CSV file');
        }
      },
    };
  };

  return plugin;
};
