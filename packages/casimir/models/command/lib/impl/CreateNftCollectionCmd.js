import { APP_CMD } from '@casimir.one/platform-core';
import { assert, isNumber, isString } from '@casimir.one/toolbox';
import ProtocolEntityCmd from '../base/ProtocolEntityCmd';

/**
 * @typedef {{entityId: string} & import('@casimir.one/platform-core').NonFungibleTokenCreateData} NonFungibleTokenCreateCmdPayload
 */

/**
 * Create nft collection command
 * @extends ProtocolEntityCmd
 */
class CreateNftCollectionCmd extends ProtocolEntityCmd {
  /**
   * Create nft collection
   * @param {NonFungibleTokenCreateCmdPayload} cmdPayload
   */
  constructor(cmdPayload) {
    const {
      entityId,
      issuer
    } = cmdPayload;

    assert(
      isNumber(entityId) || (isString(entityId) && entityId),
      "'entityId' must be a number or non emplty string"
    );
    assert(!!issuer, "'issuer' is required");

    super(APP_CMD.CREATE_NFT_COLLECTION, cmdPayload);
  }
}

export default CreateNftCollectionCmd;
