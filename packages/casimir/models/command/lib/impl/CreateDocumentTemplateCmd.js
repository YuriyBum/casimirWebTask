import { APP_CMD } from '@casimir.one/platform-core';
import { assert } from '@casimir.one/toolbox';
import AppCmd from '../base/AppCmd';

/**
 * Create document template command
 * @extends AppCmd
 */
class CreateDocumentTemplateCmd extends AppCmd {
  /**
   * Create command for document template creation
   * @param {Object} cmdPayload
   * @param {string} cmdPayload.account
   * @param {string} cmdPayload.title
   * @param {Object} cmdPayload.body
   */
  constructor(cmdPayload) {
    const {
      account,
      // eslint-disable-next-line no-unused-vars
      title,
      body
    } = cmdPayload;

    assert(!!account, "'account' is required");
    assert(!!body, "'body' is required");

    super(APP_CMD.CREATE_DOCUMENT_TEMPLATE, cmdPayload);
  }
}

export default CreateDocumentTemplateCmd;
