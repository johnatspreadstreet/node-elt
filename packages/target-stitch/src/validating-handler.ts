/* eslint-disable camelcase */
import get from 'lodash/get';
import size from 'lodash/size';
import { Unprocessable } from '@feathersjs/errors';
import { Logger } from '@node-elt/singer-js';
import { Validator } from 'jsonschema';

export const ValidatingHandler = () => ({
  handle_state_only(state_writer = null, state = null) {},
  handle_batch(
    messages,
    contains_activate_version,
    schema,
    key_names,
    bookmark_names = null,
    state_writer = null,
    state = null
  ) {
    Logger.info({
      at: 'ValidatingHandler [handle_batch]',
      message: 'Starting schema validation...',
    });

    const errorPrefix = `ValidatingHandler [handle_batch] | `;

    const validator = new Validator();

    messages.forEach((message, i) => {
      try {
        if (message.type === 'RECORD') {
          validator.validate(message.record, schema, {
            throwFirst: true,
          });

          if (key_names) {
            key_names.forEach((k) => {
              if (!get(message, ['record', k])) {
                throw new Unprocessable(
                  `Message ${i} is missing key property ${k}`
                );
              }
            });
          }
        }
      } catch (e) {
        throw new Unprocessable(
          `${errorPrefix} Record does not pass schema validation`,
          {
            errors: e,
          }
        );
      }
    });

    Logger.info(`${messages[0].stream} (${size(messages)}): Batch is valid`);

    if (state) {
      state_writer(state);
    }
  },
});
