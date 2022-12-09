import { attributesStore, attributesRegistry } from './store';
import { getAttributeFileSrc } from './composables/attributes';

// eslint-disable-next-line no-unused-vars
const install = (Vue, options = {}) => {
  if (install.installed) return;
  install.installed = true;

  const {
    store,
    attributes = []
  } = options;

  if (store) {
    store.registerModule('attributesRegistry', attributesRegistry);

    store.registerModule('attributes', attributesStore);
    store.dispatch('attributes/getList');
    store.dispatch('attributes/getSettings');

    for (const attribute of attributes) {
      store.dispatch('attributesRegistry/addAttribute', attribute);
    }

    Object.defineProperty(Vue.prototype, '$attributes', {
      get() {
        return {
          getMappedData: (key, attrs) => {
            const attributeId = this.$store.getters['attributes/mappedId'](key);

            return attributeId
              ? attrs.find((attr) => attr.attributeId === attributeId)
              : null;
          },

          getMappedInfo: (key) => {
            const attributeId = this.$store.getters['attributes/mappedId'](key);

            return attributeId
              ? this.$store.getters['attributes/one'](attributeId)
              : null;
          },

          getFileSrc: (opts = {}) => getAttributeFileSrc({
            serverUrl: this.$env.DEIP_SERVER_URL,
            ...opts
          })
        };
      }
    });
  } else {
    throw Error('[AttributesModule]: storeInstance is not provided');
  }
};

export const AttributesModule = {
  name: 'AttributesModule',
  deps: [
    'ValidationPlugin',
    'VuetifyExtended',
    'EnvModule'
  ],
  install
};
