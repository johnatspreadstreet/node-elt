import { Logger } from '@node-elt/singer-js';
import size from 'lodash/size';
import { serialize } from './serialize';
import { asyncBatchProcess } from './arrays';
import { write } from './write';

export const LoggingHandler = (
  output_file,
  max_batch_bytes,
  max_batch_records
) => ({
  output_file,
  max_batch_bytes,
  max_batch_records,
  handle_state_only(state_writer, state) {
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
  async handle_batch(
    messages,
    contains_activate_version,
    schema,
    key_names,
    bookmark_names = null,
    state_writer = null,
    state = null
  ) {
    Logger.info('LoggingHandler [handle_batch]');

    Logger.info({
      at: 'LoggingHandler [handle_batch]',
      message: `Saving batch with ${size(messages)} messages for table ${
        messages[0].stream
      } to ${this.output_file} `,
    });

    const serializedMessages = serialize(
      messages,
      schema,
      key_names,
      bookmark_names,
      this.max_batch_bytes,
      this.max_batch_records
    );

    await asyncBatchProcess(
      serializedMessages,
      write,
      size(serializedMessages),
      {
        fileName: this.output_file,
      }
    );
  },
});
