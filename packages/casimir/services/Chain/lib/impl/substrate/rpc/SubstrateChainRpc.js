import BaseChainRpc from './../../../base/rpc/BaseChainRpc';
import { isAddress, isValidPubKey, pubKeyToAddress, toHexFormat, fromHexFormat, encodeAddressFormat, addressToPubKey, toAddress } from './../utils';
import { u8aToHex, hexToString } from '@polkadot/util';
import SubstrateFungibleTokenDto from './response/dto/SubstrateFungibleTokenDto';
import SubstrateNonFungibleTokenDto from './response/dto/SubstrateNonFungibleTokenDto';
import SubstrateDaoDto from './response/dto/SubstrateDaoDto';
import SubstrateFungibleTokenBalanceDto from './response/dto/SubstrateFungibleTokenBalanceDto';
import SubstrateNonFungibleTokenInstancesDto from './response/dto/SubstrateNonFungibleTokenInstancesDto';
import SubstrateInvestmentOpportunityDto from './response/dto/SubstrateInvestmentOpportunityDto';
import SubstrateContractAgreementDto from './response/dto/SubstrateContractAgreementDto';
import SubstrateProposalDto from './response/dto/SubstrateProposalDto';
import SubstratePortalDto from './response/dto/SubstratePortalDto';



class SubstrateChainRpc extends BaseChainRpc {

  constructor(chainService, {
    coreAsset
  }) {

    const LIST_LIMIT = 1000;

    const getDaoIdByAddressAsync = async (address) => {
      const api = chainService.getChainNodeClient();
      const daoIdOpt = await api.query.deipDao.daoLookup(address);
      const daoId = daoIdOpt.isSome ? daoIdOpt.unwrap() : null;
      if (!daoId) return null;
      return fromHexFormat(u8aToHex(daoId));
    }

    const getFungibleTokenMetadataAsync = async (assetId) => {
      const api = chainService.getChainNodeClient();

      if (coreAsset.id === assetId)
        return {
          id: coreAsset.id,
          symbol: coreAsset.symbol,
          decimals: coreAsset.precision
        }

      const metadataRes = await api.query.assets.metadata(assetId);
      if (!metadataRes) return null;

      const metadata = metadataRes.toJSON();
      const symbol = hexToString(metadata.symbol);
      const name = metadata.name === "0x" ? symbol : hexToString(metadata.name)

      return {
        id: assetId,
        name,
        symbol,
        decimals: metadata.decimals
      };
    }

    const getNonFungibleTokenMetadataAsync = async (classId) => {
      const api = chainService.getChainNodeClient();
      
      const metadataOpt = await api.query.uniques.classMetadataOf(classId);
      const metadata = metadataOpt.isSome ? metadataOpt.unwrap().toJSON() : null;
      
      if (!metadata) return null;
      const dataStr = hexToString(metadata.data);
      const data = JSON.parse(dataStr);
      return {
        symbol: data.symbol
      };
    }


    const getCoreAssetBalanceDtoAsync = async (daoIdOrPubKeyOrAddress) => {
      const api = chainService.getChainNodeClient();
      const accountId = toAddress(daoIdOrPubKeyOrAddress, api.registry);

      const account = await api.query.system.account(accountId);
      const daoId = await getDaoIdByAddressAsync(accountId);

      const coreAssetBalanceDto = new SubstrateFungibleTokenBalanceDto({
        assetId: coreAsset.id,
        account: accountId,
        daoId: daoId,
        balance: account ? account.data.free.toString() : 0,
      }, {
        symbol: coreAsset.symbol,
        decimals: coreAsset.precision
      });

      return coreAssetBalanceDto;
    }

    const getCoreAssetBalancesDtosAsync = async () => {
      const api = chainService.getChainNodeClient();
      const accounts = await api.query.system.account.entries();
      const coreAssetBalancesDtos = await Promise.all(accounts.map((account) => {
        const accountId = encodeAddressFormat(account[0].slice(-32));
        const balance = account[1].data.free.toString();
        return getDaoIdByAddressAsync(accountId)
          .then((daoId) => {
            return new SubstrateFungibleTokenBalanceDto({
              assetId: coreAsset.id,
              account: accountId,
              balance: balance,
              daoId: daoId
            }, {
              symbol: coreAsset.symbol,
              decimals: coreAsset.precision
            });
          })
      }));

      return coreAssetBalancesDtos;
    }

    const getCoreAssetDtoAsync = async () => {
      const api = chainService.getChainNodeClient();
      const totalIssuance = await api.query.balances.totalIssuance();
      const metadata = await getFungibleTokenMetadataAsync(coreAsset.id);
      return new SubstrateFungibleTokenDto({
        assetId: coreAsset.id,
        supply: totalIssuance.toString(),
        issuer: "DEIP_PROTOCOL"
      }, metadata);
    }

    const getPreProcessedDaoAsync = async (dao) => {
      const foundSignatories = await Promise.all(dao.authority.signatories
        .map((address) => getDaoIdByAddressAsync(address).then((daoId) => {
          return daoId ? { daoId: daoId, weight: 1 } : { pubKey: addressToPubKey(address), weight: 1 };
        }))
      );
      return { ...dao, foundSignatories };
    }


    const getPreProcessedProposalAsync = async (proposal) => {
      const authorDaoId = await getDaoIdByAddressAsync(proposal.author);
      const decisions = await Promise.all(Object.keys(proposal.decisions)
        .map(async (address) => {
          const daoId = await getDaoIdByAddressAsync(address);
          return {
            address: address,
            daoId: daoId ? daoId : null,
            state: proposal.decisions[address]
          };
        })
      );

      return { ...proposal, author: authorDaoId, decisions };
    };


    const rpc = {

      sendTxAsync: (rawTx) => {
        return chainService.rpcToChainNode('author_submitExtrinsic', [rawTx]);
      },


      /* DAO */

      getAccountAsync: async (daoId) => {
        const dao = await chainService.rpcToChainNode("deipDao_get", [null, toHexFormat(daoId)]);
        if (!dao) return null;
        const item = await getPreProcessedDaoAsync(dao);
        return new SubstrateDaoDto(item);
      },

      getAccountsAsync: async (daoIds) => {
        const daos = await chainService.rpcToChainNode("deipDao_getMulti", [null, daoIds.map((daoId) => toHexFormat(daoId))]);
        const list = await Promise.all(daos.filter((dao) => !!dao).map(async (dao) => {
          const item = await getPreProcessedDaoAsync(dao);
          return new SubstrateDaoDto(item);
        }));
        return list;
      },

      getAccountsListAsync: async (startIdx = null, limit = LIST_LIMIT) => {
        const daos = await chainService.rpcToChainNode("deipDao_getList", [null, limit, toHexFormat(startIdx)]);
        const list = await Promise.all(daos.map(async ({ value: dao }) => {
          const item = await getPreProcessedDaoAsync(dao);
          return new SubstrateDaoDto(item);
        }));
        return list;
      },


      /* PORTAL */

      getPortalAsync: async (tenantId) => {
        const api = chainService.getChainNodeClient();
        const portalOpt = await api.query.deipPortal.portalRepository(toHexFormat(tenantId));
        const portal = portalOpt.isSome ? portalOpt.unwrap().toJSON() : null;
        if (!portal) return null;
        return new SubstratePortalDto(portal);
      },

      getPortalsAsync: async () => {
        const api = chainService.getChainNodeClient();
        const entries = await api.query.deipPortal.portalRepository.entries();
        const list = await Promise.all(entries.map(async ([{ args: [key] }, value]) => {
          const portal = value.toJSON();
          return new SubstratePortalDto(portal);
        }));
        return list;
      },


      /* INVESTMENT OPPORTUNITY */

      getInvestmentOpportunityAsync: async (invstOppId) => {
        const api = chainService.getChainNodeClient();
        const opt = await api.query.deip.simpleCrowdfundingMap(`0x${invstOppId}`);
        const invstOppOpt = opt.toJSON();
        const invstOpp = invstOppOpt.externalId !== "0x0000000000000000000000000000000000000000" ? invstOppOpt : null;
        if (!invstOpp) return null;
        const targetAssetDto = await this.getFungibleTokenAsync(invstOpp.assetId);
        const sharesAssetsDtos = await Promise.all(invstOpp.shares.map(share => this.getFungibleTokenAsync(share.id)));
        return new SubstrateInvestmentOpportunityDto(invstOpp, targetAssetDto, sharesAssetsDtos);
      },


      getInvestmentOpportunitiesListAsync: async (startIdx = null, limit = LIST_LIMIT) => {
        const api = chainService.getChainNodeClient();
        const entries = await api.query.deip.simpleCrowdfundingMap.entries();
        const list = await Promise.all(entries.map(async ([{ args: [key] }, value]) => {
          const invstOpp = value.toJSON();
          const targetAssetDto = await this.getFungibleTokenAsync(invstOpp.assetId);
          const sharesAssetsDtos = await Promise.all(invstOpp.shares.map(share => this.getFungibleTokenAsync(share.id)));
          return new SubstrateInvestmentOpportunityDto(invstOpp, targetAssetDto, sharesAssetsDtos);
        }));
        return list;
      },



      /* CONTRACT AGREEMENT */

      getContractAgreementAsync: async (agreementId) => {
        const agreement = await chainService.rpcToChainNode("deip_getContractAgreement", [null, toHexFormat(agreementId)]);
        if (!agreement) return null;
        return new SubstrateContractAgreementDto(agreement);
      },

      getContractAgreementsListAsync: async (startIdx = null, limit = LIST_LIMIT) => {
        const agreements = await chainService.rpcToChainNode("deip_getContractAgreementList", [null, limit, toHexFormat(startIdx)]);
        return agreements.map(({ value: agreement }) => new SubstrateContractAgreementDto(agreement));
      },

      getContractAgreementsByTypeAsync: async (type, startIdx = null, limit = LIST_LIMIT) => {
        const agreements = await chainService.rpcToChainNode("deip_getContractAgreementListByType", [null, type, limit, toHexFormat(startIdx)]);
        return agreements.map(({ value: agreement }) => new SubstrateContractAgreementDto(agreement));
      },



      /* PROPOSAL */

      getProposalAsync: async (proposalId) => {
        const api = chainService.getChainNodeClient();
        const proposalOpt = await api.query.deipProposal.proposalRepository(`0x${proposalId}`);
        const proposal = proposalOpt.isSome ? proposalOpt.unwrap().toJSON() : null;
        if (!proposal) return null;
        const item = await getPreProcessedProposalAsync(proposal);
        return new SubstrateProposalDto(item);
      },

      getProposalsListAsync: async (startIdx = null, limit = LIST_LIMIT) => {
        const api = chainService.getChainNodeClient();
        const entries = await api.query.deipProposal.proposalRepository.entries();
        const list = await Promise.all(entries.map(async ([{ args: [key] }, value]) => {
          const item = await getPreProcessedProposalAsync(value.toJSON());
          return new SubstrateProposalDto(item);
        }));
        return list;
      },


      /* FUNGIBLE TOKEN  */

      getFungibleTokenAsync: async (assetId) => {
        const api = chainService.getChainNodeClient();
        if (assetId == coreAsset.id) {
          const coreAssetDto = await getCoreAssetDtoAsync();
          return coreAssetDto;
        }
        const assetOpt = await api.query.assets.asset(assetId);
        const asset = assetOpt.isSome ? assetOpt.unwrap().toJSON() : null;
        if (!asset) return null;
        const metadata = await getFungibleTokenMetadataAsync(assetId);
        return new SubstrateFungibleTokenDto({ assetId, ...asset }, metadata);
      },

      getFungibleTokenBySymbolAsync: async (symbol) => {
        const assetsDtos = await this.getFungibleTokenListAsync();
        const assetDto = assetsDtos.find((assetDto) => assetDto.symbol === symbol);
        return assetDto || null;
      },

      getFungibleTokenListAsync: async () => {
        const api = chainService.getChainNodeClient();
        const entries = await api.query.assets.asset.entries();
        const assets = await Promise.all(entries.map(async ([{ args: [key] }, value]) => {
          const assetId = key.toString();
          const asset = value.toJSON();
          if (assetId == coreAsset.id) {
            const coreAssetDto = await getCoreAssetDtoAsync();
            return coreAssetDto;
          }
          const metadata = await getFungibleTokenMetadataAsync(assetId);
          return new SubstrateFungibleTokenDto({ assetId, ...asset }, metadata);
        }));

        return assets;
      },

      getProjectAssetsAsync: async (projectId) => {
        const api = chainService.getChainNodeClient();
        const assetsOpt = await api.query.assets.assetIdByProjectId(toHexFormat(projectId));

        const assets = assetsOpt.isSome ? assetsOpt.unwrap().toJSON() : null;
        if (!assets) return [];
        const assetsDtos = await Promise.all(assets.map((assetId) => this.getFungibleTokenAsync(assetId)));
        return assetsDtos;
      },

      getNextAvailableFtId: async () => {
        // TODO: must be replaced with read model index
        const list = await this.getFungibleTokenListAsync();
        return list.length + 1;
      },


      /* FUNGIBLE TOKEN BALANCE */

      getFungibleTokenBalanceByOwnerAsync: async (daoIdOrPubKeyOrAddress, assetId) => {
        if (assetId == coreAsset.id) {
          const coreAssetBalanceDto = await getCoreAssetBalanceDtoAsync(daoIdOrPubKeyOrAddress);
          return coreAssetBalanceDto;
        }

        const api = chainService.getChainNodeClient();
        const accountId = toAddress(daoIdOrPubKeyOrAddress, api.registry);
        const balanceRes = await api.query.assets.account(assetId, accountId);
        if (!balanceRes) return null;
        const balance = balanceRes.toJSON();
        let daoId;
        if (isAddress(daoIdOrPubKeyOrAddress)) {
          daoId = await getDaoIdByAddressAsync(daoIdOrPubKeyOrAddress);
        } else if (isValidPubKey(toHexFormat(daoIdOrPubKeyOrAddress))) {
          const id = await getDaoIdByAddressAsync(pubKeyToAddress(daoIdOrPubKeyOrAddress));
          daoId = id || daoIdOrPubKeyOrAddress;
        } else {
          daoId = daoIdOrPubKeyOrAddress;
        }
        const assetMetadata = await getFungibleTokenMetadataAsync(assetId);
        return new SubstrateFungibleTokenBalanceDto({ assetId, daoId, account: daoIdOrPubKeyOrAddress, ...balance }, assetMetadata);
      },

      // [DEPRECATED]
      getFungibleTokenBalanceByOwnerAndSymbolAsync: async (daoIdOrPubKeyOrAddress, symbol) => {
        if (symbol == coreAsset.symbol) {
          const coreAssetBalanceDto = await getCoreAssetBalanceDtoAsync(daoIdOrPubKeyOrAddress);
          return coreAssetBalanceDto;
        }

        const assetDto = await this.getFungibleTokenBySymbolAsync(symbol);
        if (!assetDto) return null;
        const balanceDto = await this.getFungibleTokenBalanceByOwnerAsync(daoIdOrPubKeyOrAddress, assetDto.assetId);
        return balanceDto;
      },

      getFungibleTokenBalancesByOwnerAsync: async (daoIdOrPubKeyOrAddress) => {
        const balancesDtos = await this.getFungibleTokenBalancesListAsync(false);
        const coreBalanceDto = await getCoreAssetBalanceDtoAsync(daoIdOrPubKeyOrAddress);
        return [coreBalanceDto, ...balancesDtos.filter((balanceDto) => balanceDto.account == daoIdOrPubKeyOrAddress)];
      },

      getFungibleTokenBalancesAsync: async (assetId) => {
        const api = chainService.getChainNodeClient();

        if (assetId == coreAsset.id) {
          const coreAssetBalancesDtos = await getCoreAssetBalancesDtosAsync();
          return coreAssetBalancesDtos;
        }

        const balancesList = await api.query.assets.account.entries(assetId);
        const daoMap = {};
        const assetMetadata = await getFungibleTokenMetadataAsync(assetId);
        const balancesDtos = await balancesList.reduce(async (arrP, [{ args: [u32, accountId32] }, value]) => {
          const arr = await arrP;
          const assetId = u32.toString();
          const accountId = accountId32.toString();
          const balance = value.toJSON();
          if (daoMap[accountId] === undefined) {
            const daoId = await getDaoIdByAddressAsync(accountId);
            daoMap[accountId] = daoId;
          }
          arr.push(new SubstrateFungibleTokenBalanceDto({ assetId, daoId: daoMap[accountId], account: accountId, ...balance }, assetMetadata));
          return arr;
        }, Promise.resolve([]));

        return balancesDtos;
      },

      // [DEPRECATED]
      getFungibleTokenBalancesBySymbolAsync: async (symbol) => {
        const assetDto = await this.getFungibleTokenBySymbolAsync(symbol);
        if (!assetDto) return [];
        const balancesDtos = await this.getFungibleTokenBalancesAsync(assetDto.assetId);
        return balancesDtos;
      },

      getFungibleTokenBalancesListAsync: async (withCore = false) => {
        const api = chainService.getChainNodeClient();

        const balancesList = await api.query.assets.account.entries();
        const map = {};
        const balancesDtos = await balancesList.reduce(async (arrP, [{ args: [u32, accountId32] }, value]) => {
          const arr = await arrP;
          const assetId = u32.toString();
          const accountId = accountId32.toString();
          const balance = value.toJSON();

          if (map[assetId] === undefined) {
            const metadata = await getFungibleTokenMetadataAsync(assetId);
            map[assetId] = { metadata };
          }

          if (map[assetId][accountId] === undefined) {
            const daoId = await getDaoIdByAddressAsync(accountId);
            map[assetId][accountId] = daoId;
          }

          arr.push(new SubstrateFungibleTokenBalanceDto({ assetId, daoId: map[assetId][accountId], account: accountId, ...balance }, map[assetId].metadata));
          return arr;
        }, Promise.resolve([]));

        if (withCore) {
          const coreAssetBalancesDtos = await getCoreAssetBalancesDtosAsync();
          return [...coreAssetBalancesDtos, ...balancesDtos];
        } else {
          return balancesDtos;
        }

      },


      /* NON-FUNGIBLE TOKEN  */

      getNonFungibleTokenClassAsync: async (classId) => {
        const api = chainService.getChainNodeClient();

        const classOpt = await api.query.uniques.class(classId);
        const nftClass = classOpt.isSome ? classOpt.unwrap().toJSON() : null;
        if (!nftClass) return null;

        const metadata = await getNonFungibleTokenMetadataAsync(classId);
        return new SubstrateNonFungibleTokenDto({ classId, ...nftClass }, metadata);
      },


      getNonFungibleTokenClassesAsync: async () => {
        const api = chainService.getChainNodeClient();
        const entries = await api.query.uniques.class.entries();
        const list = await Promise.all(entries.map(async ([{ args: [u32] }, value]) => {
          const nftClass = value.toJSON();
          const classId = u32.toString();
          const metadata = await getNonFungibleTokenMetadataAsync(classId);
          return new SubstrateNonFungibleTokenDto({ classId, ...nftClass }, metadata);
        }));
        return list;
      },


      getNextAvailableNftCollectionId: async () => {
        // TODO: must be replaced with read model index
        const list = await this.getNonFungibleTokenClassesAsync();
        return String(list.length + 1);
      },


      /* NON-FUNGIBLE TOKEN CLASS INSTANCES */

      getNonFungibleTokenClassInstancesByOwnerAsync: async (daoIdOrPubKeyOrAddress, classId) => {
        const api = chainService.getChainNodeClient();
        const accountId = toAddress(daoIdOrPubKeyOrAddress, api.registry);

        const classOpt = await api.query.uniques.class(classId);
        const nftClass = classOpt.isSome ? classOpt.unwrap().toJSON() : null;
        if (!nftClass) return [];

        const classInstancesByAccount = await api.query.uniques.account.entries(accountId);
        const metadata = await getNonFungibleTokenMetadataAsync(classId);

        const instancesIds = classInstancesByAccount.reduce((arr, [{ args: [accountId, u32, instanceId] }, value]) => {
          const classU32 = u32.toString();
          if (classId == classU32)
            arr.push(instanceId.toNumber());
          return arr;
        }, []);

        return new SubstrateNonFungibleTokenInstancesDto({ classId, account: daoIdOrPubKeyOrAddress, instancesIds: instancesIds.sort() }, metadata);
      },


      getNonFungibleTokenClassesInstancesByOwnerAsync: async (daoIdOrPubKeyOrAddress) => {
        const api = chainService.getChainNodeClient();
        const accountId = toAddress(daoIdOrPubKeyOrAddress, api.registry);
        const classInstancesByAccount = await api.query.uniques.account.entries(accountId);

        const classesMap = await classInstancesByAccount.reduce(async (mapP, [{ args: [accountId, u32, instanceId] }, value]) => {
          const map = await mapP;
          const classId = u32.toString();

          if (!map[classId]) {
            const metadata = await getNonFungibleTokenMetadataAsync(classId);
            map[classId] = {
              classId: classId,
              instancesIds: [instanceId.toNumber()],
              metadata: metadata
            }
          } else {
            map[classId].instancesIds.push(instanceId.toNumber());
          }

          return map;
        }, Promise.resolve({}));

        return Object.keys(classesMap).map((classU32) => {
          const { classId, instancesIds, metadata } = classesMap[classU32];
          return new SubstrateNonFungibleTokenInstancesDto({ classId, account: daoIdOrPubKeyOrAddress, instancesIds: instancesIds.sort() }, metadata);
        });

      },

      // TODO:

      setBlockAppliedCallbackAsync: async function (cb) { throw Error(`Not implemented exception`); },
      getStateAsync: async function (path) { throw Error(`Not implemented exception`); },
      getConfigAsync: async function () { throw Error(`Not implemented exception`); },
      getDynamicGlobalPropertiesAsync: async function () { throw Error(`Not implemented exception`); },
      getChainPropertiesAsync: async function () { throw Error(`Not implemented exception`); },
      getWitnessScheduleAsync: async function () { throw Error(`Not implemented exception`); },
      getHardforkVersionAsync: async function () { throw Error(`Not implemented exception`); },
      getNextScheduledHardforkAsync: async function () { throw Error(`Not implemented exception`); },
      getAccountReferencesAsync: async function (accountId) { throw Error(`Not implemented exception`); },
      getAccountCountAsync: async function () { throw Error(`Not implemented exception`); },
      getAccountHistoryAsync: async function (account, from, limit) { throw Error(`Not implemented exception`); },
      getOwnerHistoryAsync: async function (account) { throw Error(`Not implemented exception`); },
      getRecoveryRequestAsync: async function (account) { throw Error(`Not implemented exception`); },
      getWithdrawRoutesAsync: async function (account, withdrawRouteType) { throw Error(`Not implemented exception`); },
      getAccountBandwidthAsync: async function (account, bandwidthType) { throw Error(`Not implemented exception`); },
      getTransactionHexAsync: async function (trx) { throw Error(`Not implemented exception`); },
      getKeyReferencesAsync: async function (keys, fullHistory) { throw Error(`Not implemented exception`); },
      getAccountKeyReferencesAsync: async function (accounts, fullHistory) { throw Error(`Not implemented exception`); },
      getTeamReferencesAsync: async function (teams, fullHistory) { throw Error(`Not implemented exception`); },
      getTeamMemberReferencesAsync: async function (members, fullHistory) { throw Error(`Not implemented exception`); },
      getBlockAsync: async function (blockNum) { throw Error(`Not implemented exception`); },
      getOpsHistoryAsync: async function (from, limit, opt) { throw Error(`Not implemented exception`); },
      getTransactionAsync: async function (trxId) { throw Error(`Not implemented exception`); },
      getBlockHeaderAsync: async function (blockNum) { throw Error(`Not implemented exception`); },
      getOpsInBlockAsync: async function (blockNum, onlyVirtual) { throw Error(`Not implemented exception`); },
      getBlocksHistoryAsync: async function (from, limit) { throw Error(`Not implemented exception`); },
      getAccountDeipToDeipTransfersAsync: async function (account, from, limit) { throw Error(`Not implemented exception`); },
      getRequiredSignaturesAsync: async function (trx, availableKeys) { throw Error(`Not implemented exception`); },
      getPotentialSignaturesAsync: async function (trx) { throw Error(`Not implemented exception`); },
      verifyAuthorityAsync: async function (trx) { throw Error(`Not implemented exception`); },
      getWitnessesAsync: async function (witnessIds) { throw Error(`Not implemented exception`); },
      getWitnessByAccountAsync: async function (accountName) { throw Error(`Not implemented exception`); },
      getWitnessesByVoteAsync: async function (from, limit) { throw Error(`Not implemented exception`); },
      lookupWitnessAccountsAsync: async function (lowerBoundName, limit) { throw Error(`Not implemented exception`); },
      getWitnessCountAsync: async function () { throw Error(`Not implemented exception`); },
      getActiveWitnessesAsync: async function () { throw Error(`Not implemented exception`); },
      loginAsync: async function (username, password) { throw Error(`Not implemented exception`); },
      getApiByNameAsync: async function (databaseApi) { throw Error(`Not implemented exception`); },
      getVersionAsync: async function () { throw Error(`Not implemented exception`); },
      broadcastTransactionAsync: async function (trx) { throw Error(`Not implemented exception`); },
      broadcastTransactionWithCallbackAsync: async function (confirmationCallback, trx) { throw Error(`Not implemented exception`); },
      broadcastBlockAsync: async function (b) { throw Error(`Not implemented exception`); },
      setMaxBlockAgeAsync: async function (maxBlockAge) { throw Error(`Not implemented exception`); },
      getTeamAsync: async function (account) { throw Error(`Not implemented exception`); },
      lookupTeamsAsync: async function (lowerBound, limit) { throw Error(`Not implemented exception`); },
      getTeamsAsync: async function (ids) { throw Error(`Not implemented exception`); },
      getTeamByPermlinkAsync: async function (permlink) { throw Error(`Not implemented exception`); },
      getSchemaAsync: async function () { throw Error(`Not implemented exception`); },
      getExpiringVestingDelegationsAsync: async function (account, from, limit) { throw Error(`Not implemented exception`); },
      getProjectByPermlinkAsync: async function (teamId, permlink) { throw Error(`Not implemented exception`); },
      getProjectByAbsolutePermlinkAsync: async function (teamPermlink, projectPermlink) { throw Error(`Not implemented exception`); },
      getProjectLicenseAsync: async function (id) { throw Error(`Not implemented exception`); },
      getProjectLicensesAsync: async function (ids) { throw Error(`Not implemented exception`); },
      getProjectLicensesByLicenseeAsync: async function (licensee) { throw Error(`Not implemented exception`); },
      getProjectLicensesByLicenserAsync: async function (licenser) { throw Error(`Not implemented exception`); },
      getProjectLicensesByProjectAsync: async function (projectId) { throw Error(`Not implemented exception`); },
      getProjectLicensesByLicenseeAndProjectAsync: async function (licensee, projectId) { throw Error(`Not implemented exception`); },
      getProjectLicensesByLicenseeAndLicenserAsync: async function (licensee, licenser) { throw Error(`Not implemented exception`); },
      getExpertTokenAsync: async function (id) { throw Error(`Not implemented exception`); },
      getExpertTokensByAccountNameAsync: async function (accountName) { throw Error(`Not implemented exception`); },
      getTeamTokenByAccountAndProjectGroupIdAsync: async function (account, teamId) { throw Error(`Not implemented exception`); },
      checkTeamExistenceByPermlinkAsync: async function (name) { throw Error(`Not implemented exception`); },
      checkProjectExistenceByPermlinkAsync: async function (teamId, title) { throw Error(`Not implemented exception`); },
      lookupWitnessAccountsAsync: async function (lowerBoundName, limit) { throw Error(`Not implemented exception`); },
      getWitnessByAccountAsync: async function (accountName) { throw Error(`Not implemented exception`); },
      getProjectTokensByAccountNameAsync: async function (accountName) { throw Error(`Not implemented exception`); },
      getProjectTokensByProjectIdAsync: async function (projectId) { throw Error(`Not implemented exception`); },
      getProjectTokenByAccountNameAndProjectIdAsync: async function (accountName, projectId) { throw Error(`Not implemented exception`); },
      getFundingOpportunityAnnouncementAsync: async function (id) { throw Error(`Not implemented exception`); },
      getFundingOpportunityAnnouncementByNumberAsync: async function (number) { throw Error(`Not implemented exception`); },
      getFundingOpportunityAnnouncementsByOrganizationAsync: async function (teamId) { throw Error(`Not implemented exception`); },
      getFundingOpportunityAnnouncementsListingAsync: async function (page, limit) { throw Error(`Not implemented exception`); },
      getFungibleTokenByIssuerAsync: async function (issuer) { throw Error(`Not implemented exception`); },
      getFungibleTokenByTypeAsync: async function (type) { throw Error(`Not implemented exception`); },
      getFundingTransactionAsync: async function (id) { throw Error(`Not implemented exception`); },
      getFundingTransactionsBySenderOrganisationAsync: async function (senderOrganisationId) { throw Error(`Not implemented exception`); },
      getFundingTransactionsByReceiverOrganisationAsync: async function (receiverOrganisationId) { throw Error(`Not implemented exception`); },
      getAssetStatisticsAsync: async function (symbol) { throw Error(`Not implemented exception`); },
      getSubscriptionAsync: async function (id) { throw Error(`Not implemented exception`); },
      getSubscriptionByTeamIdAsync: async function (teamId) { throw Error(`Not implemented exception`); },
      getSubscriptionsByOwnerAsync: async function (owner) { throw Error(`Not implemented exception`); },
      getOrganisationHistoryAsync: async function (organisationId) { throw Error(`Not implemented exception`); },
      getContentHistoryByHashAsync: async function (contentHash) { throw Error(`Not implemented exception`); },
      getContentHistoryByProjectAndHashAsync: async function (projectId, contentHash) { throw Error(`Not implemented exception`); },
      getContributionsHistoryByContributorAsync: async function (investor) { throw Error(`Not implemented exception`); },
      getContributionsHistoryByContributorAndProjectAsync: async function (investor, projectId) { throw Error(`Not implemented exception`); },
      getContributionsHistoryByProjectAsync: async function (projectId) { throw Error(`Not implemented exception`); },
      getProposalsBySignerAsync: async function (account) { throw Error(`Not implemented exception`); },
      getProposalsBySignersAsync: async function (accounts) { throw Error(`Not implemented exception`); },
      getProposalStateAsync: async function (id) { throw Error(`Not implemented exception`); },
      getProposalsStatesAsync: async function (ids) { throw Error(`Not implemented exception`); },
      lookupProposalsStatesAsync: async function (lowerBound, limit) { throw Error(`Not implemented exception`); },
      getContractAgreementsByCreatorAsync: (creator) => { throw Error(`Not implemented exception`); },
    }
    return super(rpc);
  }
}


export default SubstrateChainRpc;