import {
  quicktype,
  jsonInputForTargetLanguage,
  InputData,
} from 'quicktype-core';

/**
 * Transforms JSON input into a JSON schema
 * @param {string} name Schema definition name
 * @param {string} json JSON input to transform into JSON Schema
 * @returns {string} JSON Schema
 */
export const jsonToJsonSchema = async (name = 'Root', json) => {
  const jsonInput = jsonInputForTargetLanguage('schema');
  await jsonInput.addSource({ name, samples: [json] });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  const { lines } = await quicktype({ inputData, lang: 'schema' });
  const schema = lines.join('\n');

  return schema;
};
