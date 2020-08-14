import DragZone              from '../../draggable/DragZone.mjs';
import {default as VDomUtil} from '../../util/VDom.mjs';

/**
 * @class Neo.calendar.draggable.WeekEventDragZone
 * @extends Neo.draggable.DragZone
 */
class WeekEventDragZone extends DragZone {
    static getConfig() {return {
        /**
         * @member {String} className='Neo.calendar.draggable.WeekEventDragZone'
         * @protected
         */
        className: 'Neo.calendar.draggable.WeekEventDragZone',
        /**
         * @member {String} ntype='calendar-week-event-dragzone'
         * @protected
         */
        ntype: 'calendar-week-event-dragzone',
        /**
         * @member {Number} columnHeight=0
         */
        columnHeight: 0,
        /**
         * @member {Number} columnTop=0
         */
        columnTop: 0,
        /**
         * @member {Number} currentInterval=0
         */
        currentInterval: 0,
        /**
         * @member {Number} startTime=0
         */
        endTime: 0,
        /**
         * time in minutes
         * @member {Number} eventDuration=0
         */
        eventDuration: 0,
        /**
         * @member {Object} eventRecord=null
         */
        eventRecord: null,
        /**
         * @member {Boolean} moveHorizontal=false
         */
        moveHorizontal: false,
        /**
         * @member {Boolean} moveInMainThread=false
         */
        moveInMainThread: false,
        /**
         * @member {Neo.calendar.view.WeekComponent} owner=null
         */
        owner: null,
        /**
         * @member {Number} startTime=0
         */
        startTime: 0,
        /**
         * @member {Boolean} useProxyWrapper=false
         */
        useProxyWrapper: false
    }}

    /**
     * Triggered after the proxyParentId config got changed
     * @param {String} value
     * @param {String} oldValue
     * @protected
     */
    afterSetProxyParentId(value, oldValue) {
        if (value && oldValue !== undefined) {
            if (this.dragProxy) {
                Neo.currentWorker.promiseMessage('main', {
                    action: 'updateDom',
                    deltas: [{
                        action  : 'moveNode',
                        id      : this.dragProxy.id,
                        index   : 0,
                        parentId: value
                    }]
                });
            }
        }
    }

    /**
     * DragEnd equals drop, since we can only drag to valid positions
     * todo: ESC key
     */
    dragEnd() {
        super.dragEnd();

        let me        = this,
            startDate = new Date(VDomUtil.findVdomChild(me.owner.vdom, me.proxyParentId).vdom.flag),
            endDate;

        startDate.setHours(me.startTime);
        startDate.setMinutes(me.currentInterval * 15);

        endDate = new Date(startDate.valueOf());
        endDate.setMinutes(endDate.getMinutes() + me.eventDuration);

        me.eventRecord.endDate   = endDate;
        me.eventRecord.startDate = startDate;

        me.owner.updateEvents();
    }

    /**
     *
     * @param {Object} data
     */
    dragMove(data) {
        let me   = this,
            path = data.targetPath,
            i    = 0,
            len  = path.length,
            intervalHeight, intervals, position, style;

        if (me.dragProxy) {
            for (; i < len; i++) {
                if (path[i].cls.includes('neo-c-w-column')) {
                    me.proxyParentId = path[i].id;
                    break;
                }
            }

            intervals      = (me.endTime - me.startTime) * 4; // 15 minutes each
            intervalHeight = me.columnHeight / intervals;

            position = Math.min(me.columnHeight, data.clientY - me.offsetY - me.columnTop);
            position = Math.max(0, position);

            me.currentInterval = Math.floor(position / intervalHeight);

            // events must not end after the last visible interval
            me.currentInterval = Math.min(me.currentInterval, intervals - (me.eventDuration / 15));

            position = me.currentInterval * intervalHeight; // snap to valid intervals
            position = position / me.columnHeight * 100;

            style = me.dragProxy.style;

            if (me.moveVertical) {
                style.top = `calc(${position}% + 1px)`;
            }

            me.dragProxy.style = style;
        }
    }

    /**
     *
     * @param {Object} data
     */
    dragStart(data) {
        let me = this;

        Neo.main.DomAccess.getBoundingClientRect({
            id: [me.dragElement.id, data.path[1].id]
        }).then(rects => {
            Object.assign(me, {
                columnHeight : rects[1].height,
                columnTop    : rects[1].top,
                eventDuration: (me.eventRecord.endDate - me.eventRecord.startDate) / 60 / 1000,
                offsetX      : data.clientX - rects[0].left,
                offsetY      : data.clientY - rects[0].top
            });

            me.createDragProxy(rects[0]);
        });
    }
}

Neo.applyClassConfig(WeekEventDragZone);

export {WeekEventDragZone as default};