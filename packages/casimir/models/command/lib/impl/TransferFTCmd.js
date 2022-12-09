import { APP_CMD } from '@casimir.one/platform-core';
import {
  assert,
  isNumber,
  isString,
  isNumeric
} from '@casimir.one/toolbox';
import ProtocolCmd from '../base/ProtocolCmd';

/**
 * Transfer fungible token command
 * @extends ProtocolCmd
 */
class TransferFTCmd extends ProtocolCmd {
  /**
   * Transfer fungible token
   * @param {Object} cmdPayload
   * @param {string} cmdPayload.from
   * @param {string} cmdPayload.to
   * @param {string} cmdPayload.tokenId
   * @param {string} cmdPayload.amount
   */
  constructor(cmdPayload) {
    const {
      from,
      to,
      tokenId,
      amount
    } = cmdPayload;

    assert(!!from, "'from' is required");
    assert(!!to, "'to' is required");
    assert(
      isNumber(tokenId) || (isString(tokenId) && tokenId.length),
      "'tokenId' is required and must be a number or non emplty string"
    );
    assert(
      (isNumber(amount) || isNumeric(amount)) && +amount > 0,
      "'amount' is required and must be a number greater than zero"
    );

    super(APP_CMD.TRANSFER_FT, cmdPayload);
  }
}

export default TransferFTCmd;
