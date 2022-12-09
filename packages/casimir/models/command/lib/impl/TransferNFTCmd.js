import { APP_CMD } from '@casimir.one/platform-core';
import { assert, isNumber, isString } from '@casimir.one/toolbox';
import ProtocolCmd from '../base/ProtocolCmd';

/**
 * Transfer non-fungible token command
 * @extends ProtocolCmd
 */
class TransferNFTCmd extends ProtocolCmd {
  /**
   * Transfer non-fungible token
   * @param {Object} cmdPayload
   * @param {string} cmdPayload.from
   * @param {string} cmdPayload.to
   * @param {string} cmdPayload.nftCollectionId
   * @param {string} cmdPayload.nftItemId
   */
  constructor(cmdPayload) {
    const {
      from,
      to,
      nftCollectionId,
      nftItemId
    } = cmdPayload;

    assert(!!from, "'from' is required");
    assert(!!to, "'to' is required");
    assert(
      isNumber(nftCollectionId) || (isString(nftCollectionId) && nftCollectionId),
      "'nftCollectionId' is required and must be a number or non emplty string"
    );
    assert(
      isNumber(nftItemId) || (isString(nftItemId) && nftItemId.length),
      "'nftItemId' is required and must be a number or non emplty string"
    );

    super(APP_CMD.TRANSFER_NFT, cmdPayload);
  }
}

export default TransferNFTCmd;
