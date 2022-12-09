import { PortalService } from '@casimir.one/portal-service';
import { proxydi } from '@casimir.one/proxydi';

const portalService = PortalService.getInstance();

const STATE = {
  data: null
};

const GETTERS = {
  data: (state) => state.data
};

const ACTIONS = {
  get({ commit }) {
    return portalService.getPortal(proxydi.get('env').TENANT)
      .then((res) => {
        commit('setData', res.data);
      });
  },

  updateProfile({ commit }, payload) {
    return portalService.updatePortalProfile(payload)
      .then((res) => {
        commit('setData', res.data);
      });
  },

  updateNetworkSettings({ commit }, payload) {
    return portalService.updateNetworkSettings(payload)
      .then((res) => {
        commit('setData', res.data);
      });
  },

  updateSettings({ commit }, payload) {
    return portalService.updatePortalSettings(payload)
      .then((res) => {
        commit('setData', res.data);
      });
  }
};

const MUTATIONS = {
  setData(state, payload) {
    state.data = payload;
  }
};

export const currentPortalStore = {
  namespaced: true,
  state: STATE,
  getters: GETTERS,
  actions: ACTIONS,
  mutations: MUTATIONS
};
