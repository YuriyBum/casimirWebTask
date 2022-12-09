import {
  VIcon
// eslint-disable-next-line import/extensions,import/no-unresolved
} from 'vuetify/lib/components';
import { VeStack } from '@casimir.one/vue-elements';
import { defineComponent } from '@casimir.one/platform-util';
import { AttributeReadMixin } from '../../mixins';

// TODO: move to toolbox?
const iconsMap = [
  { icon: 'mdi-file-image-outline', ext: ['jpg', 'jpeg', 'png', 'svg', 'bmp', 'gif'] },
  { icon: 'mdi-file-document-outline', ext: [] },
  { icon: 'mdi-file-excel-outline', ext: ['xlsx'] },
  { icon: 'mdi-file-table-outline', ext: [] },
  { icon: 'mdi-file-pdf-outline', ext: ['pdf'] },
  { icon: 'mdi-file-powerpoint-outline', ext: ['ppt', 'pptx'] }
];

/**
 * Get file icon
 *
 * @param {string} fileName
 */
const getFileIcon = (fileName) => {
  if (!fileName) return false;

  const target = iconsMap
    .find((item) => item.ext.includes(fileName.split('.').pop()));

  if (!target) return 'mdi-file-outline';

  return target.icon;
};

/**
 * Component for read only file attribute
 */
export default defineComponent({
  name: 'AttributeFileRead',

  mixins: [AttributeReadMixin],

  methods: {
    /**
     * Generate file attribute for read only
     */
    genAttribute() {
      return (
        <VeStack gap={16}>
          <div class="d-flex">
            <VIcon size={20} class="mr-2">
              {getFileIcon(this.internalValue)}
            </VIcon>
            <a href={this.schemaData.getAttributeFileSrc(this.attributeId)}>{this.internalValue}</a>
          </div>
        </VeStack>
      );
    }
  }
});
