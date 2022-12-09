import { AuthService } from '@casimir.one/auth-service';
import { UserService } from '@casimir.one/user-service';
import { AccessService } from '@casimir.one/access-service';
import { WebSocketService } from '@casimir.one/web-socket-service';

import { wrapInArray, genRipemd160Hash } from '@casimir.one/toolbox';

const accessService = AccessService.getInstance();
const authService = AuthService.getInstance();
const userService = UserService.getInstance();
const webSocketService = WebSocketService.getInstance();

const STATE = {
  username: null,
  isLoggedIn: false,
  settings: {
    signInRouteName: 'signIn',
    signUpRouteName: 'signUp',
    signInRedirectRouteName: 'home'
  }
};

const GETTERS = {
  username: (state) => state.username,
  settings: (state) => state.settings,
  isLoggedIn: (state) => state.isLoggedIn
};

const ACTIONS = {

  restoreData({ commit }) {
    if (accessService.isLoggedIn()) {
      commit('setData');
    }
  },

  async makeSignIn({ commit, dispatch }, payload) {
    const {
      username,
      secretSigHex,
      privateKey = null,
      publicKey = null
    } = payload;

    const { data: signIn } = await authService.signIn({
      username,
      secretSigHex
    });

    if (!signIn.success) {
      dispatch('clear');
      throw new Error(signIn.error);
    }

    commit('setData', {
      jwtToken: signIn.jwtToken,
      privateKey,
      publicKey
    });

    webSocketService.connect();
  },

  async signIn({ dispatch }, { username: usernameOrEmail, password: passwordOrPrivKey }) {
    const exists = await authService.isExist(usernameOrEmail);

    if (!exists) {
      throw new Error('Wrong email or password. Please try again.');
    }

    const { data: seedUser } = await userService.getOne(usernameOrEmail);
    const seedAccount = await authService.generateSeedAccount(seedUser.username, passwordOrPrivKey);

    dispatch('makeSignIn', {
      username: seedAccount.getUsername(),
      secretSigHex: seedAccount.signString(this._vm.$env.SIG_SEED),
      privateKey: seedAccount.getPrivKey(),
      publicKey: seedAccount.getPubKey()
    });
  },

  async walletSignIn({ dispatch }, payload) {
    const { daoId, secretSigHex } = payload;

    const exists = await authService.isExist(daoId);

    if (exists) {
      dispatch('makeSignIn', {
        username: daoId,
        secretSigHex
      });
    } else {
      await authService.importDao(payload);

      dispatch('makeSignIn', {
        username: daoId,
        secretSigHex
      });
    }
  },

  async signUp(_, payload) {
    const { email, password: passwordOrPrivKey } = payload;

    const exists = await authService.isExist(email);

    if (exists) {
      throw new Error('User with such email exists');
    }

    // TODO: Move to service
    const username = genRipemd160Hash(email);
    const seedAccount = await authService.generateSeedAccount(username, passwordOrPrivKey);

    const { data: signUp } = await authService.signUp({
      privKey: seedAccount.getPrivKey(),
      isAuthorizedCreatorRequired: seedAccount.isAuthorizedCreatorRequired()
    }, {
      email: payload.email,
      username: seedAccount.getUsername(),
      pubKey: seedAccount.getPubKey(),
      attributes: payload.attributes,
      ...{ roles: wrapInArray(payload.roles) }
    });

    return signUp;
  },

  signOut({ dispatch }) {
    dispatch('clear');
    window.location.reload();
  },

  clear({ commit }) {
    commit('clearData');
  },

  setup({ commit }, {
    signInRouteName,
    signInRedirectRouteName,
    signUpRouteName
  }) {
    commit('setSettings', {
      ...(signInRouteName ? { signInRouteName } : {}),
      ...(signInRedirectRouteName ? { signInRedirectRouteName } : {}),
      ...(signUpRouteName ? { signUpRouteName } : {})
    });
  },

  changePassword({ dispatch }, payload) {
    const { initiator, data: formPass } = payload;
    const { oldPassword, newPassword } = formPass;

    return authService.generateSeedAccount(initiator.username, oldPassword)
      .then((oldSeedAccount) => {
        const oldPublicKey = oldSeedAccount.getPubKey();

        if (initiator.pubKey !== oldPublicKey) throw new Error('Old password is invalid');

        return authService.generateSeedAccount(initiator.username, newPassword);
      })
      .then((newSeedAccount) => {
        const newPublicKey = newSeedAccount.getPubKey();
        const newPrivateKey = newSeedAccount.getPrivKey();

        const authority = {
          owner: {
            auths: [{ key: newPublicKey, weight: 1 }],
            weight: 1
          }
        };

        const data = {
          ...initiator,
          authority
        };

        return userService.changePassword({ initiator, ...data })
          .then(() => dispatch('currentUser/get', null, { root: true })
            .then(() => accessService.setOwnerKeysPair(newPrivateKey, newPublicKey))
            .then(() => Promise.resolve({ privKey: newPrivateKey, pubKey: newPublicKey })));
      })
      .catch((err) => Promise.reject(err));
  }

};

const MUTATIONS = {
  setData(state, data = {}) {
    const {
      jwtToken,
      privateKey = null,
      publicKey = null
    } = data;

    if (jwtToken) {
      accessService.setAccessToken(jwtToken, privateKey, publicKey);
    }

    state.username = accessService.getDecodedToken().username;
    state.isLoggedIn = accessService.isLoggedIn();
  },

  clearData(state) {
    accessService.clearAccessToken();

    state.username = null;
    state.isLoggedIn = accessService.isLoggedIn();
  },

  setSettings(state, payload) {
    state.settings = {
      ...state.settings,
      ...payload
    };
  }

};

export const authStore = {
  state: STATE,
  getters: GETTERS,
  actions: ACTIONS,
  mutations: MUTATIONS,
  namespaced: true
};
