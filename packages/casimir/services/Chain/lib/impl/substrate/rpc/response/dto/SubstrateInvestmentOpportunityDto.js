import { INVESTMENT_OPPORTUNITY_STATUS } from '@casimir.one/platform-core';
import InvestmentOpportunityDto from '../../../../../base/rpc/response/dto/InvestmentOpportunityDto';
import { fromHexFormat } from '../../../utils';

class SubstrateInvestmentOpportunityDto extends InvestmentOpportunityDto {
  constructor(invstOpp, targetAssetDto, sharesAssetsDtos) {
    const invstOppId = fromHexFormat(invstOpp.externalId);
    const softCap = { amount: invstOpp.softCap, id: targetAssetDto.assetId, symbol: targetAssetDto.symbol, precision: targetAssetDto.precision };
    const hardCap = { amount: invstOpp.hardCap, id: targetAssetDto.assetId, symbol: targetAssetDto.symbol, precision: targetAssetDto.precision };
    const totalAmount = { amount: invstOpp.totalAmount, id: targetAssetDto.assetId, symbol: targetAssetDto.symbol, precision: targetAssetDto.precision };
    const shares = sharesAssetsDtos.map((shareAssetDto) => {
      const share = invstOpp.shares.find((share) => shareAssetDto.assetId === fromHexFormat(share.id));
      return {
        amount: share.amount, id: shareAssetDto.assetId, symbol: shareAssetDto.symbol, precision: shareAssetDto.precision
      };
    });
    const { startTime } = invstOpp;
    const { endTime } = invstOpp;

    let status;
    switch (invstOpp.status) {
      case 'Active': {
        status = INVESTMENT_OPPORTUNITY_STATUS.ACTIVE;
        break;
      }
      case 'Finished': {
        status = INVESTMENT_OPPORTUNITY_STATUS.FINISHED;
        break;
      }
      case 'Expired': {
        status = INVESTMENT_OPPORTUNITY_STATUS.EXPIRED;
        break;
      }
      case 'Inactive': {
        status = INVESTMENT_OPPORTUNITY_STATUS.INACTIVE;
        break;
      }
      default: {
        throw new Error(`Unknown Investment Opportunity status: ${invstOpp.status}`);
      }
    }

    super({
      invstOppId,
      softCap,
      hardCap,
      shares,
      totalAmount,
      startTime,
      endTime,
      status
    });
  }
}

export default SubstrateInvestmentOpportunityDto;
