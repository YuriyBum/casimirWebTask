import { VexNotifier } from '../components';

const install = (Vue, options = {}) => {
  if (install.installed) return;
  install.installed = true;

  const property = options.property || '$notifier';
  const { vuetify } = options;

  if (!vuetify) {
    console.warn('VexNotifier needs vuetify instance. Use Vue.use(VexNotifier, { vuetify })');
  }

  Vue.delete(options, 'property');
  Vue.delete(options, 'vuetify');

  function createNotifierCmp(opts) {
    const container = document.querySelector('[data-app=true]') || document.body;

    return new Promise((resolve) => {
      const cmp = new VexNotifier({
        vuetify,
        propsData: { ...Vue.prototype[property].options, ...opts },
        created() {
          this.$nextTick(() => {
            this.isActive = true;
          });
        },
        destroyed() {
          container.removeChild(cmp.$el);
          resolve(true);
        }
      });
      container.appendChild(cmp.$mount().$el);
    });
  }

  function showNotifier(message, opts = {}) {
    const o = {
      ...opts,
      ...{
        message
      }
    };
    return createNotifierCmp(o);
  }

  Vue.prototype[property] = {
    show: showNotifier,

    showError: (message, opts = {}) => {
      const defMessage = 'Something wrong. Please try later.';
      return showNotifier(message || defMessage, { ...opts, ...{ color: 'error' } });
    },

    showWarning: (message, opts = {}) => {
      const defMessage = 'Something wrong. Please try later.';
      return showNotifier(message || defMessage, { ...opts, ...{ color: 'warning' } });
    },

    showSuccess: (message, opts = {}) => {
      const defMessage = 'Successful!';
      return showNotifier(message || defMessage, { ...opts, ...{ color: 'success' } });
    }
  };

  // Vue.component('VexNotifier', { vuetify, ...VexNotifier });
};

export const Notifier = {
  install
};
