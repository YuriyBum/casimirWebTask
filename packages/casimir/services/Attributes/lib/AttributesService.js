import {
  CreateAttributeCmd,
  UpdateAttributeCmd,
  DeleteAttributeCmd,
  UpdateAttributeSettingsCmd
} from '@casimir.one/commands';
import { JsonDataMsg } from '@casimir.one/messages';
import { makeSingletonInstance } from '@casimir.one/toolbox';
import { proxydi } from '@casimir.one/proxydi';
import { AttributesHttp } from './AttributesHttp';

/**
 * Attributes data transport
 */
export class AttributesService {
  attributesHttp = AttributesHttp.getInstance();
  proxydi = proxydi;

  /**
   * Get all attributes list
   * @return {Promise<Object>}
   */
  async getList() {
    return this.attributesHttp.getList();
  }

  /**
   * Get attributes by scope
   * @param {string} scope
   * @return {Promise<Object>}
   */
  async getListByScope(scope) {
    return this.attributesHttp.getListByScope(scope);
  }

  /**
   * Get attribute info
   * @param {string} id
   * @return {Promise<Object>}
   */
  async getOne(id) {
    return this.attributesHttp.getOne(id);
  }

  /**
   * Get all network attributes
   * @return {Promise<Object>}
   */
  async getNetworkAttributes() {
    return this.attributesHttp.getNetworkAttributes();
  }

  /**
   * Get network attributes by scope
   * @param {string} scope
   * @return {Promise<Object>}
   */
  async getNetworkAttributesByScope(scope) {
    return this.attributesHttp.getNetworkAttributesByScope(scope);
  }

  /**
   * @deprecated
   * @return {Promise<Object>}
   */
  async getSystemAttributes() {
    return this.attributesHttp.getSystemAttributes();
  }

  /**
   * Create new attribute
   * @param {Object} attribute
   * @return {Promise<Object>}
   */
  async create(attribute) {
    const createAttributeCmd = new CreateAttributeCmd(attribute);
    const msg = new JsonDataMsg({ appCmds: [createAttributeCmd] });
    const env = this.proxydi.get('env');

    if (env.RETURN_MSG === true) {
      return msg;
    }

    return this.attributesHttp.create(msg);
  }

  /**
   * Update current attribute
   * @param {Object} payload
   * @return {Promise<Object>}
   */
  async update(payload) {
    const updateAttributeCmd = new UpdateAttributeCmd(payload);
    const msg = new JsonDataMsg({ appCmds: [updateAttributeCmd] });
    const env = this.proxydi.get('env');

    if (env.RETURN_MSG === true) {
      return msg;
    }

    return this.attributesHttp.update(msg);
  }

  /**
   * Delete attribute
   * @param {string} attributeId
   * @return {Promise<Object>}
   */
  async delete(attributeId) {
    const deleteAttributeCmd = new DeleteAttributeCmd({ attributeId });
    const msg = new JsonDataMsg({ appCmds: [deleteAttributeCmd] });
    const env = this.proxydi.get('env');

    if (env.RETURN_MSG === true) {
      return msg;
    }

    return this.attributesHttp.delete(msg);
  }

  /**
   * Get attributes settings
   * @return {Promise<Object>}
   */
  async getSettings() {
    return this.attributesHttp.getSettings();
  }

  /**
   * Update attributes settings
   * @param {Object} data
   * @return {Promise<Object>}
   */
  async updateSettings(data) {
    const updateAttributeSettingsCmd = new UpdateAttributeSettingsCmd(data);
    const msg = new JsonDataMsg({ appCmds: [updateAttributeSettingsCmd] });
    const env = this.proxydi.get('env');

    if (env.RETURN_MSG === true) {
      return msg;
    }

    return this.attributesHttp.updateSettings(msg);
  }

  /** @type {() => AttributesService} */
  static getInstance = makeSingletonInstance(() => new AttributesService());
}
