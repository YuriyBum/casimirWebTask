"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = [{
  "api": "database_api",
  "method": "set_block_applied_callback",
  "params": ["cb"]
}, {
  "api": "database_api",
  "method": "get_state",
  "params": ["path"]
}, {
  "api": "database_api",
  "method": "get_config"
}, {
  "api": "database_api",
  "method": "get_dynamic_global_properties"
}, {
  "api": "database_api",
  "method": "get_chain_properties"
}, {
  "api": "database_api",
  "method": "get_witness_schedule"
}, {
  "api": "database_api",
  "method": "get_hardfork_version"
}, {
  "api": "database_api",
  "method": "get_next_scheduled_hardfork"
}, {
  "api": "database_api",
  "method": "get_accounts",
  "params": ["names"]
}, {
  "api": "database_api",
  "method": "get_account_references",
  "params": ["accountId"]
}, {
  "api": "database_api",
  "method": "lookup_account_names",
  "params": ["accountNames"]
}, {
  "api": "database_api",
  "method": "lookup_accounts",
  "params": ["lowerBoundName", "limit"]
}, {
  "api": "database_api",
  "method": "get_account_count"
}, {
  "api": "database_api",
  "method": "get_account_history",
  "params": ["account", "from", "limit"]
}, {
  "api": "database_api",
  "method": "get_owner_history",
  "params": ["account"]
}, {
  "api": "database_api",
  "method": "get_recovery_request",
  "params": ["account"]
}, {
  "api": "database_api",
  "method": "get_withdraw_routes",
  "params": ["account", "withdrawRouteType"]
}, {
  "api": "database_api",
  "method": "get_account_bandwidth",
  "params": ["account", "bandwidthType"]
}, {
  "api": "database_api",
  "method": "get_transaction_hex",
  "params": ["trx"]
}, {
  "api": "database_api",
  "method": "get_contract_agreement",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "get_contract_agreement_by_creator",
  "params": ["creator"]
},
// account_by_key_api
{
  "api": "account_by_key_api",
  "method": "get_key_references",
  "params": ["keys", "full_history"]
}, {
  "api": "account_by_key_api",
  "method": "get_account_key_references",
  "params": ["accounts", "full_history"]
}, {
  "api": "account_by_key_api",
  "method": "get_team_references",
  "params": ["teams", "full_history"]
}, {
  "api": "account_by_key_api",
  "method": "get_team_member_references",
  "params": ["members", "full_history"]
},
// blockchain_history_api
{
  "api": "database_api", // TODO: Move to blockchain_history_api after refactoring delayed_node_plugin
  "method": "get_block",
  "params": ["blockNum"]
}, {
  api: 'blockchain_history_api',
  method: 'get_ops_history',
  params: ['from', 'limit', 'opt']
}, {
  "api": "blockchain_history_api",
  "method": "get_transaction",
  "params": ["trxId"]
}, {
  "api": "blockchain_history_api",
  "method": "get_block_header",
  "params": ["blockNum"]
}, {
  "api": "blockchain_history_api",
  "method": "get_ops_in_block",
  "params": ["blockNum", "onlyVirtual"]
}, {
  api: 'blockchain_history_api',
  method: 'get_blocks_history',
  params: ['from', 'limit']
},

// account_history_api
{
  "api": "account_history_api",
  "method": "get_account_deip_to_deip_transfers",
  "params": ["account", "from", "limit"]
}, {
  "api": "database_api",
  "method": "get_required_signatures",
  "params": ["trx", "availableKeys"]
}, {
  "api": "database_api",
  "method": "get_potential_signatures",
  "params": ["trx"]
}, {
  "api": "database_api",
  "method": "verify_authority",
  "params": ["trx"]
}, {
  "api": "database_api",
  "method": "get_witnesses",
  "params": ["witnessIds"]
}, {
  "api": "database_api",
  "method": "get_witness_by_account",
  "params": ["accountName"]
}, {
  "api": "database_api",
  "method": "get_witnesses_by_vote",
  "params": ["from", "limit"]
}, {
  "api": "database_api",
  "method": "lookup_witness_accounts",
  "params": ["lowerBoundName", "limit"]
}, {
  "api": "database_api",
  "method": "get_witness_count"
}, {
  "api": "database_api",
  "method": "get_active_witnesses"
}, {
  "api": "login_api",
  "method": "login",
  "params": ["username", "password"]
}, {
  "api": "login_api",
  "method": "get_api_by_name",
  "params": ["database_api"]
}, {
  "api": "login_api",
  "method": "get_version"
}, {
  "api": "network_broadcast_api",
  "method": "broadcast_transaction",
  "params": ["trx"]
}, {
  "api": "network_broadcast_api",
  "method": "broadcast_transaction_with_callback",
  "params": ["confirmationCallback", "trx"]
}, {
  "api": "network_broadcast_api",
  "method": "broadcast_transaction_synchronous",
  "params": ["trx"]
}, {
  "api": "network_broadcast_api",
  "method": "broadcast_block",
  "params": ["b"]
}, {
  "api": "network_broadcast_api",
  "method": "set_max_block_age",
  "params": ["maxBlockAge"]
}, {
  "api": "database_api",
  "method": "get_research_group",
  "params": ["account"]
}, {
  "api": "database_api",
  "method": "lookup_research_groups",
  "params": ["lower_bound", "limit"]
}, {
  "api": "database_api",
  "method": "get_research_groups",
  "params": ["ids"]
}, {
  "api": "database_api",
  "method": "get_research_group_by_permlink",
  "params": ["permlink"]
}, {
  "api": "database_api",
  "method": "get_research_group_by_id",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "get_researches_by_research_group",
  "params": ["external_id"]
}, {
  "api": "database_api",
  "method": "get_schema"
}, {
  "api": "database_api",
  "method": "get_expiring_vesting_delegations",
  "params": ["account", "from", "limit"]
}, {
  "api": "database_api",
  "method": "lookup_disciplines",
  "params": ["lower_bound", "limit"]
}, {
  "api": "database_api",
  "method": "get_discipline",
  "params": ["external_id"]
}, {
  "api": "database_api",
  "method": "get_discipline_by_name",
  "params": ["name"]
}, {
  "api": "database_api",
  "method": "get_disciplines_by_parent",
  "params": ["parent_external_id"]
}, {
  "api": "database_api",
  "method": "get_research",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "lookup_researches",
  "params": ["lower_bound", "limit"]
}, {
  "api": "database_api",
  "method": "get_research_by_permlink",
  "params": ["research_group_id", "permlink"]
}, {
  "api": "database_api",
  "method": "get_research_by_absolute_permlink",
  "params": ["research_group_permlink", "research_permlink"]
}, {
  "api": "database_api",
  "method": "get_researches",
  "params": ["ids"]
}, {
  "api": "database_api",
  "method": "get_research_contents_by_research",
  "params": ["external_id"]
}, {
  "api": "database_api",
  "method": "lookup_research_contents",
  "params": ["lower_bound", "limit"]
}, {
  "api": "database_api",
  "method": "get_research_license",
  "params": ["external_id"]
}, {
  "api": "database_api",
  "method": "get_research_licenses",
  "params": ["external_ids"]
}, {
  "api": "database_api",
  "method": "get_research_licenses_by_licensee",
  "params": ["licensee"]
}, {
  "api": "database_api",
  "method": "get_research_licenses_by_licenser",
  "params": ["licenser"]
}, {
  "api": "database_api",
  "method": "get_research_licenses_by_research",
  "params": ["research_external_id"]
}, {
  "api": "database_api",
  "method": "get_research_licenses_by_licensee_and_research",
  "params": ["licensee", "research_external_id"]
}, {
  "api": "database_api",
  "method": "get_research_licenses_by_licensee_and_licenser",
  "params": ["licensee", "licenser"]
}, {
  "api": "database_api",
  "method": "get_research_content",
  "params": ["external_id"]
}, {
  "api": "database_api",
  "method": "get_research_contents",
  "params": ["ids"]
}, {
  "api": "database_api",
  "method": "get_research_content_by_id",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "get_research_content_by_type",
  "params": ["research_id", "type"]
}, {
  "api": "database_api",
  "method": "get_research_content_by_permlink",
  "params": ["research_id", "permlink"]
}, {
  "api": "database_api",
  "method": "get_research_content_by_absolute_permlink",
  "params": ["research_group_permlink", "research_permlink", "research_content_permlink"]
}, {
  "api": "database_api",
  "method": "get_expert_token",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "get_expert_tokens_by_account_name",
  "params": ["account_name"]
}, {
  "api": "database_api",
  "method": "get_expert_tokens_by_discipline",
  "params": ["discipline_external_id"]
}, {
  "api": "database_api",
  "method": "get_proposal",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "get_proposals_by_creator",
  "params": ["creator"]
}, {
  "api": "database_api",
  "method": "get_research_group_token_by_account_and_research_group_id",
  "params": ["account", "research_group_id"]
}, {
  "api": "database_api",
  "method": "get_research_token_sale",
  "params": ["token_sale_external_id"]
}, {
  "api": "database_api",
  "method": "get_research_token_sale_by_id",
  "params": ["token_sale_id"]
}, {
  "api": "database_api",
  "method": "get_research_token_sales_by_research",
  "params": ["research_external_id"]
}, {
  "api": "database_api",
  "method": "get_research_token_sales_by_research_id",
  "params": ["research_id"]
}, {
  "api": "database_api",
  "method": "get_research_token_sales",
  "params": ["from", "limit"]
}, {
  "api": "database_api",
  "method": "get_research_token_sale_contributions_by_research_token_sale",
  "params": ["token_sale_external_id"]
}, {
  "api": "database_api",
  "method": "get_research_token_sale_contributions_by_research_token_sale_id",
  "params": ["token_sale_id"]
}, {
  "api": "database_api",
  "method": "get_research_token_sale_contributions_by_contributor",
  "params": ["owner"]
}, {
  "api": "database_api",
  "method": "get_disciplines_by_research",
  "params": ["research_id"]
}, {
  "api": "database_api",
  "method": "check_research_group_existence_by_permlink",
  "params": ["name"]
}, {
  "api": "database_api",
  "method": "check_research_existence_by_permlink",
  "params": ["research_group_external_id", "title"]
}, {
  "api": "database_api",
  "method": "check_research_content_existence_by_permlink",
  "params": ["research_external_id", "title"]
}, {
  "api": "database_api",
  "method": "lookup_witness_accounts",
  "params": ["lower_bound_name", "limit"]
}, {
  "api": "database_api",
  "method": "get_witness_by_account",
  "params": ["account_name"]
}, {
  "api": "database_api",
  "method": "get_research_token_by_id",
  "params": ["research_token_id"]
}, {
  "api": "database_api",
  "method": "get_research_tokens_by_account_name",
  "params": ["account_name"]
}, {
  "api": "database_api",
  "method": "get_research_tokens_by_research_id",
  "params": ["research_id"]
}, {
  "api": "database_api",
  "method": "get_research_token_by_account_name_and_research_id",
  "params": ["account_name", "research_id"]
}, {
  "api": "database_api",
  "method": "get_accounts_by_expert_discipline",
  "params": ["discipline_id", "from", "limit"]
},

/* FOA */
{
  "api": "database_api",
  "method": "get_funding_opportunity_announcement",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "get_funding_opportunity_announcement_by_number",
  "params": ["number"]
}, {
  "api": "database_api",
  "method": "get_funding_opportunity_announcements_by_organization",
  "params": ["research_group_id"]
},

// Assets
{
  "api": "database_api",
  "method": "get_asset",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "get_asset_by_symbol",
  "params": ["symbol"]
}, {
  "api": "database_api",
  "method": "get_assets_by_issuer",
  "params": ["issuer"]
}, {
  "api": "database_api",
  "method": "get_assets_by_type",
  "params": ["type"]
}, {
  "api": "database_api",
  "method": "lookup_assets",
  "params": ["lower_bound_symbol", "limit"]
},
// Funding Transactions
{
  "api": "database_api",
  "method": "get_funding_transaction",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "get_funding_transactions_by_sender_organisation",
  "params": ["sender_organisation_id"]
}, {
  "api": "database_api",
  "method": "get_funding_transactions_by_receiver_organisation",
  "params": ["receiver_organisation_id"]
}, {
  "api": "database_api",
  "method": "get_asset_statistics",
  "params": ["symbol"]
},

// Account Balances
{
  "api": "database_api",
  "method": "get_account_asset_balance",
  "params": ["owner", "symbol"]
}, {
  "api": "database_api",
  "method": "get_account_assets_balances",
  "params": ["owner"]
}, {
  "api": "database_api",
  "method": "get_accounts_asset_balances_by_asset",
  "params": ["symbol"]
},

// Subscription quota
{
  "api": "database_api",
  "method": "get_subscription",
  "params": ["id"]
}, {
  "api": "database_api",
  "method": "get_subscription_by_research_group_id",
  "params": ["research_group_id"]
}, {
  "api": "database_api",
  "method": "get_subscriptions_by_owner",
  "params": ["owner"]
},

// NSF History plugin
{
  "api": "nsf_history_api",
  "method": "get_organisation_history",
  "params": ["organisation_id"]
},

// IP Protection Plugin
{
  "api": "ip_protection_history_api",
  "method": "get_content_history_by_hash",
  "params": ["content_hash"]
}, {
  "api": "ip_protection_history_api",
  "method": "get_content_history_by_research_and_hash",
  "params": ["research_id", "content_hash"]
},

// Token Sales Plugin
{
  "api": "tsc_history_api",
  "method": "get_contributions_history_by_contributor",
  "params": ["contributor"]
}, {
  "api": "tsc_history_api",
  "method": "get_contributions_history_by_contributor_and_research",
  "params": ["contributor", "research_id"]
}, {
  "api": "tsc_history_api",
  "method": "get_contributions_history_by_research",
  "params": ["research_id"]
}, {
  "api": "tsc_history_api",
  "method": "get_contributions_history_by_token_sale",
  "params": ["research_token_sale_id"]
},
// Research Content References Plugin
{
  "api": "research_content_reference_history_api",
  "method": "get_content_references",
  "params": ["research_content_id"]
}, {
  "api": "research_content_reference_history_api",
  "method": "get_content_references2",
  "params": ["research_content_external_id"]
}, {
  "api": "research_content_reference_history_api",
  "method": "get_contents_refer_to_content",
  "params": ["research_content_id"]
}, {
  "api": "research_content_reference_history_api",
  "method": "get_contents_refer_to_content2",
  "params": ["research_content_external_id"]
},

// Investments History Plugin
{
  "api": "proposal_history_api",
  "method": "get_proposals_by_signer",
  "params": ["account"]
}, {
  "api": "proposal_history_api",
  "method": "get_proposals_by_signers",
  "params": ["accounts"]
}, {
  "api": "proposal_history_api",
  "method": "get_proposal_state",
  "params": ["external_id"]
}, {
  "api": "proposal_history_api",
  "method": "get_proposals_states",
  "params": ["external_ids"]
}, {
  "api": "proposal_history_api",
  "method": "lookup_proposals_states",
  "params": ["lower_bound", "limit"]
}];