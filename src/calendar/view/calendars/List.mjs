import BaseList      from '../../../list/Base.mjs';
import CheckBoxField from '../../../form/field/CheckBox.mjs';

/**
 * @class Neo.calendar.view.calendars.List
 * @extends Neo.list.Base
 */
class List extends BaseList {
    static getConfig() {return {
        /**
         * @member {String} className='Neo.calendar.view.calendars.List'
         * @protected
         */
        className: 'Neo.calendar.view.calendars.List',
        /**
         * @member {String} ntype='calendar-calendars-list'
         * @protected
         */
        ntype: 'calendar-calendars-list',
        /**
         * @member {Object} bind
         */
        bind: {
            store: 'stores.calendars'
        },
        /**
         * @member {String[]} cls=['neo-calendars-list','neo-list']
         */
        cls: ['neo-calendars-list', 'neo-list'],
        /**
         * @member {Object} itemDefaults
         */
        itemDefaults: {
            module        : CheckBoxField,
            flex          : 'none',
            hideLabel     : true,
            hideValueLabel: false
        },
        /**
         * @member {Neo.form.field.CheckBox[]|null} items=null
         */
        items: null
    }}

    /**
     * Triggered after the appName config got changed
     * @param {String|null} value
     * @param {String|null} oldValue
     * @protected
     */
    afterSetAppName(value, oldValue) {
        let me = this;

        super.afterSetAppName(value, oldValue);

        if (value && me.items) {
            me.items.forEach(item => {
                item.appName = value;
            });
        }
    }

    /**
     * Override this method for custom renderers
     * @param {Object} record
     * @param {Number} index
     * @returns {Object[]|String} Either an vdom cn array or a html string
     */
    createItemContent(record, index) {
        let me       = this,
            id       = record[me.store.keyProperty],
            items    = me.items || [],
            listItem = items[index],

        config = {
            checked       : record.active,
            cls           : ['neo-checkboxfield', `neo-color-${record.color}`],
            fieldValue    : id,
            id            : me.getCheckboxId(id),
            valueLabelText: record.name
        };

        if (listItem) {
            listItem.set(config);
        } else {
            items[index] = listItem = Neo.create({
                appName  : me.appName,
                listeners: {change: me.onCheckboxChange, scope: me},
                parentId : me.id,
                ...me.itemDefaults,
                ...config
            });
        }

        me.items = items;

        return [listItem.vdom, {tag: 'i', cls: ['neo-edit-icon', 'fas fa-edit']}];
    }

    /**
     *
     */
    destroy(...args) {
        let items = this.items || [];

        items.forEach(checkBox => {
            checkBox.destroy();
        });

        super.destroy(...args);
    }

    /**
     *
     * @param {Number|String} id
     * @returns {String}
     */
    getCheckboxId(id) {
        return `${this.id}__checkbox__${id}`;
    }

    /**
     *
     * @param {Object} data
     */
    onCheckboxChange(data) {
        this.store.get(data.component.fieldValue).active = data.value;
    }

    /**
     *
     * @param {Object} data
     */
    onClick(data) {
        super.onClick(data);

        if (data.path[0].cls.includes('neo-edit-icon')) {
            let record = this.store.get(this.getItemRecordId(data.path[1].id));

            console.log('edit icon click', record.name);
        }
    }

    /**
     *
     * @param {String} itemId
     */
    onKeyDownEnter(itemId) {
        let me       = this,
            recordId = me.getItemRecordId(itemId),
            checkBox = me.items[me.store.indexOf(recordId)];

        checkBox.checked = !checkBox.checked;
    }
}

Neo.applyClassConfig(List);

export {List as default};
