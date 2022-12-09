// eslint-disable-next-line import/no-extraneous-dependencies
import { mount } from '@vue/test-utils';
import Vuetify from 'vuetify';

import { VexTreeview } from '../lib/components/VexTreeview';

const items = [
  {
    id: 0,
    name: 'Root',
    children: [
      {
        id: 1,
        name: 'Child',
        children: [{ id: 2, name: 'Grandchild' }]
      },
      { id: 3, name: 'Child' }
    ]
  }
];

const itemsWithCustomId = [
  {
    customId: 0,
    name: 'Root 1',
    children: [
      {
        customId: 1,
        name: 'Child',
        children: [{ customId: 2, name: 'Grandchild' }]
      },
      { customId: 3, name: 'Child' }
    ]
  },
  {
    customId: 4,
    name: 'Root 2'
  }
];

describe('VexTreeview', () => {
  let vuetify;

  beforeAll(() => {
    vuetify = new Vuetify();
  });

  it('should autoselect parents', async () => {
    const wrapper = mount(VexTreeview, {
      sync: false,
      propsData: {
        items,
        selectable: true,
        selectionType: 'independent',
        autoselectParents: true
      },
      vuetify

    });

    const fn = jest.fn();
    wrapper.vm.$on('input', fn);

    await wrapper.find('.v-treeview-node__toggle').trigger('click');
    await wrapper.vm.$nextTick();

    await wrapper.findAll('.v-treeview-node__checkbox').at(1).trigger('click');
    await wrapper.vm.$nextTick();
    expect(fn).toHaveBeenLastCalledWith([0, 1]);

    await wrapper.findAll('.v-treeview-node__checkbox').at(0).trigger('click');
    await wrapper.vm.$nextTick();
    expect(fn).toHaveBeenLastCalledWith([]);

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should work with items with custom id key', async () => {
    const wrapper = mount(VexTreeview, {
      sync: false,
      propsData: {
        items: itemsWithCustomId,
        itemKey: 'customId',
        selectable: true,
        selectionType: 'independent',
        autoselectParents: true
      },
      vuetify

    });

    const fn = jest.fn();
    wrapper.vm.$on('input', fn);

    await wrapper.find('.v-treeview-node__toggle').trigger('click');
    await wrapper.vm.$nextTick();

    await wrapper.findAll('.v-treeview-node__checkbox').at(1).trigger('click');
    await wrapper.vm.$nextTick();
    expect(fn).toHaveBeenLastCalledWith([0, 1]);

    await wrapper.findAll('.v-treeview-node__checkbox').at(0).trigger('click');
    await wrapper.vm.$nextTick();
    expect(fn).toHaveBeenLastCalledWith([]);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
