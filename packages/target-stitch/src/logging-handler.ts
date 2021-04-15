import { Logger } from '@node-elt/singer-js';
import size from 'lodash/size';

export const LoggingHandler = (
  output_file,
  max_batch_bytes,
  max_batch_records
) => ({
  output_file,
  max_batch_bytes,
  max_batch_records,
  handleStateOnly(state_writer, state) {
    if (state) {
      // TODO
    }
  },

  /**
   * Handles a batch of messages by saving them to a local output file.
   *
   * Serializes records in the same way StitchHandler does, so the
   * output file should contain the exact request bodies that we would
   * send to Stitch.
   *
   * @param messages
   * @param contains_activate_version
   * @param schema
   * @param key_names
   * @param bookmark_names
   * @param state_writer
   * @param state
   */
  handleBatch(
    messages,
    contains_activate_version,
    schema,
    key_names,
    bookmark_names = null,
    state_writer = null,
    state = null
  ) {
    Logger.info('LoggingHandler [handleBatch]');

    Logger.info({
      at: 'LoggingHandler [handleBatch]',
      message: `Saving batch with ${size(messages)} messages for table ${
        messages[0].stream
      } to ${this.output_file.name} `,
    });
  },
});
