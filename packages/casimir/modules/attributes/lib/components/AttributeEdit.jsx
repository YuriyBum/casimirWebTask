import {
  VTextField,
  VTextarea,
  VSwitch,
  VCheckbox,
  VSelect,
  VBtn,
  VCol,
  VRow,
  VForm,
  VSheet,
  VDivider,
  VSpacer,
  VDialog,
  VCard,
  VCardActions,
  VToolbar,
  VIcon
// eslint-disable-next-line import/extensions,import/no-unresolved
} from 'vuetify/lib/components';

import { VeRawDisplay, VeStack } from '@casimir.one/vue-elements';
import { VlsBuilder } from '@casimir.one/vue-layout-schema';
import { isObject, RecursiveIterator, camelCase } from '@casimir.one/toolbox';
import { isEqual, cloneDeep } from 'lodash';
import draggable from 'vuedraggable';

import { ViewMode } from '@casimir.one/platform-core';

import {
  contentBlocks,
  layoutBlocks,
  formBlocks,
  genReflectedFormBlocks
} from '../composables/schemaPartials';

const defaultAttributeModel = () => ({
  type: 'text',
  scope: 'nftCollection',

  title: '',
  shortTitle: '',
  description: '',

  defaultValue: null,
  valueOptions: [],

  isEditable: true,
  isHidden: false,
  isMultiple: false,
  isRequired: false,
  isSystem: false,

  schemas: {},

  portalId: null,
  blockchainFieldMeta: null
});

const AttributeEdit = {
  name: 'AttributeEdit',

  model: {
    prop: 'value',
    event: 'input'
  },

  props: {
    mode: {
      type: Number,
      default: ViewMode.CREATE,
      validator(value) {
        return [ViewMode.CREATE, ViewMode.EDIT].includes(value);
      }
    },
    value: {
      type: Object,
      default: () => defaultAttributeModel()
    }
  },

  data() {
    return {
      attributeData: defaultAttributeModel(),

      settings: {
        optionsHasDescription: false
      },

      dialogs: {
        composerSet: false,
        composerRead: false
      },

      disabled: false,
      loading: false
    };
  },

  computed: {
    registryAttrList() {
      return this.$store.getters['attributesRegistry/list']();
    },
    registryScopesList() {
      return this.$store.getters['scopesRegistry/list']();
    },
    attrTypeInfo() {
      return this.$store.getters['attributesRegistry/one'](this.attributeData.type);
    },

    isEditMode() { return this.mode === ViewMode.EDIT; },
    isCreateMode() { return this.mode === ViewMode.CREATE; },

    canHaveOptions() {
      return this.attrTypeInfo.canHaveOptions
        || (this.attrTypeInfo.isMultipleOptions && this.attributeData.isMultiple);
    },
    canBeMultiple() {
      return this.attrTypeInfo.canBeMultiple;
    },
    canHaveTemplate() {
      return this.attrTypeInfo.canHaveTemplate;
    },

    /**
     * @return {Array.<{key: string, label: string, disabled: (boolean|undefined)}>}
     */
    availableFlags() {
      const flags = [
        { key: 'isRequired', label: 'Required' }
      ];

      if (this.canBeMultiple) {
        flags.push({ key: 'isMultiple', label: 'Multiple', disabled: this.isEditMode });
      }

      return flags;
    }
  },

  watch: {
    value: {
      handler(val) {
        if (val && !isEqual(this.value, this.attributeData)) this.attributeData = val;
      },
      immediate: true,
      deep: true
    },
    attributeData: {
      handler(val) {
        if (!isEqual(this.value, val)) {
          this.$emit('input', val);
        }
      },
      immediate: true,
      deep: true
    }
  },

  methods: {
    // RENDER GENERATORS

    /**
     * Generate base attribute setup fields: type, scope
     * @return {JSX.Element}
     */
    genAttributeSetup() {
      const scopesList = this.registryScopesList
        .map((scope) => ({ text: scope.label, value: scope.type }));

      const typesList = this.$store.getters['attributesRegistry/list']((i) => {
        if (!i.scopes) return true;
        return i.scopes.includes(this.attributeData.scope);
      }).map((attr) => ({ text: attr.label, value: attr.type }));

      return (
        <VRow>
          <VCol cols={6}>
            <VSelect
              vModel={this.attributeData.scope}
              label="Attribute scope"
              items={scopesList}
              disabled={this.isEditMode}
              hide-details
            />
          </VCol>
          <VCol cols={6}>
            <VSelect
              vModel={this.attributeData.type}
              label="Attribute type"
              items={typesList}
              disabled={this.isEditMode}
              hide-details
            />
          </VCol>
        </VRow>
      );
    },

    /**
     * Generate base attribute metadata: title, short title, description
     * @return {JSX.Element}
     */
    genAttributeMetaInfoFields() {
      const titleField = () => (<VTextField vModel={this.attributeData.title} label="Title" hide-details/>);
      const shortTitleField = () => (<VTextField vModel={this.attributeData.shortTitle} label="Short title" hide-details/>);
      const descriptionField = () => (<VTextarea vModel={this.attributeData.description} label="Description" hide-details/>);

      return (
        <VRow>
          <VCol cols={8}>{titleField()}</VCol>
          <VCol cols={4}>{shortTitleField()}</VCol>
          <VCol cols={12}>{descriptionField()}</VCol>
        </VRow>
      );
    },

    /**
     * Generate attribute is* flags
     * @return {JSX.Element}
     */
    genAttributeFlags() {
      const renderedFlags = this.availableFlags.map((flag) => (
        <VCol cols={4}>
          <VCheckbox
            class="ma-0 pa-0"
            vModel={this.attributeData[flag.key]}
            label={flag.label}
            disabled={!!flag.disabled}
            hide-details
          />
        </VCol>
      ));

      return (
        <VRow>
          {renderedFlags}
        </VRow>
      );
    },

    /**
     * Generate attribute.valueOptions items
     * @return {JSX.Element[]}
     */
    genAttributeOptionRows() {
      return this.attributeData.valueOptions
        .map((_, index) => (
          <div>
            <VRow noGutters align="start">
              <VCol cols="auto" class="px-4 py-7">
                <VIcon class="handle">mdi-drag-vertical</VIcon>
              </VCol>
              <VCol class="py-4">
                <VeStack gap={16}>
                  <VTextField
                    vModel={this.attributeData.valueOptions[index].title}
                    placeholder="Title"
                    hide-details
                  />
                  {
                    this.settings.optionsHasDescription
                      ? <VTextarea
                        vModel={this.attributeData.valueOptions[index].description}
                        placeholder="Description"
                        hide-details
                      />
                      : null
                  }
                </VeStack>
              </VCol>
              <VCol cols="auto" class="px-3 py-5">
                <VBtn
                  icon
                  small
                  onClick={() => {
                    this.attributeData.valueOptions.splice(index, 1);
                  }}
                >
                  <VIcon>mdi-close</VIcon>
                </VBtn>
              </VCol>
            </VRow>
            <VDivider/>
          </div>
        ));
    },

    /**
     * Generate attribute.valueOptions block
     * @return {JSX.Element}
     */
    genAttributeOptions() {
      return (
        <VCard outlined>
          <VToolbar>
            <div class="text-subtitle-1">Options</div>
            <VSpacer/>
            <VSwitch class="ma-0 pa-0" vModel={this.settings.optionsHasDescription} label="Show description" hide-details/>
          </VToolbar>
          <VDivider/>
          <draggable
            list={this.attributeData.valueOptions}
            handle=".handle"
          >
            {this.genAttributeOptionRows()}
          </draggable>
          <VCardActions class="px-4">
            <VBtn
              text
              small
              color="primary"
              onClick={() => this.attributeData.valueOptions.push({ title: '', description: '' })}
            >
              Add item
            </VBtn>
          </VCardActions>
        </VCard>
      );
    },

    /**
     * Generate template schema builders
     * @returns {JSX.Element}
     */
    genAttributeSchemasComposer() {
      const builderSubmitHandler = (
        schema,
        target,
        cb = () => {
        }
      ) => {
        const clone = cloneDeep(schema);

        for (const { node } of new RecursiveIterator(clone, 1, true)) {
          if (isObject(node) && !!node.model) {
            node.model = node.uid;
          }
        }

        this.$set(this.attributeData.schemas, target, clone);
        cb();
      };

      const setBuilderSubmitHandler = (schema) => {
        builderSubmitHandler(schema, 'set', () => {
          this.dialogs.composerSet = false;
        });
      };

      const readBuilderSubmitHandler = (schema) => {
        builderSubmitHandler(schema, 'read', () => {
          this.dialogs.composerRead = false;
        });
      };

      const genEditBtn = (label, key) => {
        const hasShema = !!this.attributeData.schemas[key];
        const dialogKey = camelCase(`composer ${key}`);
        return (
          <VBtn
            outlined
            block
            color="primary"
            onClick={() => { this.dialogs[dialogKey] = true; }}
          >
            {hasShema ? (<VIcon left>mdi-checkbox-marked-circle-outline</VIcon>) : null}
            {label}
          </VBtn>
        );
      };

      const {
        set: composerSetSchema = [],
        read: composerReadSchema = []
      } = this.attributeData.schemas;

      const composerSetBlocks = [
        contentBlocks,
        layoutBlocks,
        formBlocks
      ];
      const composerReadBlocks = [
        contentBlocks,
        layoutBlocks,
        genReflectedFormBlocks(composerSetSchema)
      ];

      return (
        <div>
          <VRow>
            <VCol>{genEditBtn('Edit Set schema', 'set')}</VCol>
            <VCol>{genEditBtn('Edit READ schema', 'read')}</VCol>
          </VRow>

          <VDialog
            width="80vw"
            scrollable
            value={this.dialogs.composerSet}
            onInput={(val) => { this.dialogs.composerSet = val; }}
            retainFocus={false}
            eager
          >
            <VSheet height="80vh" class="d-flex" color="white">
              <VlsBuilder
                class="spacer"
                value={composerSetSchema}
                blocks={composerSetBlocks}
                onSubmit={setBuilderSubmitHandler}
              />
            </VSheet>
          </VDialog>

          <VDialog
            width="80vw"
            scrollable
            value={this.dialogs.composerRead}
            onInput={(val) => { this.dialogs.composerRead = val; }}
            retainFocus={false}
            eager
          >
            <VSheet height="80vh" class="d-flex" color="white">
              <VlsBuilder
                class="spacer"
                value={composerReadSchema}
                blocks={composerReadBlocks}
                onSubmit={readBuilderSubmitHandler}
              />
            </VSheet>
          </VDialog>

        </div>
      );
    },

    /**
     * Generate submit block
     * @return {JSX.Element}
     */
    genSubmit() {
      return (
        <div className="d-flex">
          <VSpacer/>
          <VBtn
            color="primary"
            loading={this.loading}
            disabled={this.disabled}
            onClick={this.handleSubmitBtn}
          >
            {this.isEditMode ? 'Update' : 'Create'}
          </VBtn>
        </div>
      );
    },

    // HANDLERS ////////////////////////////////////

    /**
     * Set component loading state
     * @param {boolean} state
     */
    setLoading(state) {
      this.disabled = state;
      this.loading = state;
    },

    /**
     * Update attribute data
     */
    async update() {
      this.setLoading(true);

      try {
        await this.$store.dispatch('attributes/update', this.attributeData);
        this.$emit('success', true);
      } catch (err) {
        this.$emit('error', err);
      }

      this.setLoading(false);
    },

    /**
     * Create new attribute
     */
    create() {
      this.setLoading(true);

      this.$store.dispatch('attributes/create', this.attributeData)
        .then(() => {
          this.$emit('success', true);
          this.setLoading(false);
        })
        .catch((err) => {
          this.$emit('error', err);
          this.setLoading(false);
        });
    },

    /**
     * Handle submit button click
     */
    handleSubmitBtn() {
      if (this.isEditMode) {
        this.update();
      } else {
        this.create();
      }
    }
  },

  render() {
    return (
      <VForm disabled={this.disabled}>
        <VeStack gap={32}>
          {this.genAttributeSetup()}
          <VDivider/>
          {this.genAttributeMetaInfoFields()}
          {this.canHaveOptions ? this.genAttributeOptions() : null}
          {this.canHaveTemplate ? this.genAttributeSchemasComposer() : null}
          {this.genAttributeFlags()}
          {
            process.env.NODE_ENV === 'development'
              ? <VeRawDisplay value={this.attributeData}/>
              : null
          }
          {this.genSubmit()}
        </VeStack>
      </VForm>
    );
  }
};

export default AttributeEdit;
export { AttributeEdit };
