import { VexDateTimeInput } from '@casimir.one/vuetify-extended';

import { defineComponent } from '@casimir.one/platform-util';
import { AttributeSetMixin } from '../../mixins';

/**
 * Component for changing date time attribute
 */
export default defineComponent({
  name: 'AttributeDateTimeSet',

  mixins: [AttributeSetMixin],

  methods: {
    /**
     * Generate changing date time attribute
     *
     * @param {Array} errors
     */
    genAttribute(errors) {
      return (
        <VexDateTimeInput
          vModel={this.internalValue}
          label={this.attributeInfo.title}
          errorMessages={errors}
        />

      );
    }
  }
});
