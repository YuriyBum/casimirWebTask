import BaseTx from './../../base/BaseTx';
import { assert } from '@casimir.one/toolbox';
import { ProtocolChain } from '@casimir.one/platform-core';

class GrapheneTx extends BaseTx {

  constructor(tx) {
    if (!tx) {
      super();
    } else {
      super(tx, tx.operations);
    }
  }

  getProtocolChain() {
    return ProtocolChain.GRAPHENE;
  }

  signAsync(privKey, chainNodeClient, options = {}) {
    assert(super.isFinalized(), 'Transaction is not finalized');
    chainNodeClient.auth.signTransaction(this.getTx(), { owner: privKey });
    return Promise.resolve(this);
  }

  isSigned() {
    return !!this.getTx() && !!this.getTx().signatures.length;
  }

  verifyByPortalAsync({ verificationPubKey, verificationPrivKey }, chainNodeClient) {
    assert(!!this.isOnBehalfPortal(), `Transaction is not supposed for tenant verification`);
    assert(super.isFinalized(), 'Transaction is not finalized');
    assert(!!this.isSigned(), `Transaction is not signed for sending`);
    chainNodeClient.auth.signTransaction(this.getTx(), {}, { tenant: verifier, tenantPrivKey: verificationKey });
    return this.getRawTx();
  }

  getRawTx() {
    assert(super.isFinalized(), 'Transaction is not finalized');
    return JSON.parse(JSON.stringify(this.getTx()));
  }

  getSignedRawTx() {
    assert(super.isFinalized(), 'Transaction is not finalized');
    assert(!!this.isSigned(), `Transaction is not signed for sending`);
    return this.getRawTx();
  }

  finalize({ chainNodeClient }) {
    if (!super.isFinalized()) {
      let refBlockNum;
      let refBlockPrefix;

      return chainNodeClient.api.getDynamicGlobalPropertiesAsync()
        .then((res) => {
          refBlockNum = (res.last_irreversible_block_num - 1) & 0xFFFF;
          return chainNodeClient.api.getBlockHeaderAsync(res.last_irreversible_block_num);
        })
        .then((res) => {
          refBlockPrefix = new Buffer(res.previous, 'hex').readUInt32LE(4);
          const tx = {
            operations: super.getOps(),
            ref_block_num: refBlockNum,
            ref_block_prefix: refBlockPrefix,
            expiration: new Date(new Date().getTime() + 3e6).toISOString().split('.')[0], // 1 hour
            extensions: [],
            signatures: [],
            tenant_signature: undefined
          };
          super.finalize(tx);
          return this;
        });

    } else {
      return Promise.resolve(this);
    }
  }

  serialize() {
    assert(super.isFinalized(), 'Transaction is not finalized');
    return GrapheneTx.Serialize(this);
  }

  deserialize(serializedTx) {
    return GrapheneTx.Deserialize(serializedTx);
  }

  static Serialize(tx) {
    assert(!!tx, "Transaction is not specified");
    return JSON.stringify(tx.getRawTx());
  }

  static Deserialize(serializedTx) {
    const finalizedTx = JSON.parse(serializedTx);
    return new GrapheneTx(finalizedTx);
  }

}


export default GrapheneTx;
