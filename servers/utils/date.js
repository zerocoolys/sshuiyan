var fmt = require('strftime');
var url = require('url');

var dateutils = {
    createIndexes: function (startDay, endDay, prefix) {
        var dayMills = 24 * 60 * 60 * 1000;

        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        var startTime = date.getTime();

        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);

        var endTime = date.getTime();

        var start_offset = parseInt(startDay);
        var end_offset = parseInt(endDay);

        startTime = startTime + start_offset * dayMills;
        endTime = endTime + end_offset * dayMills;

        var start = new Date(startTime);
        var end = new Date(endTime);

        var number = Math.floor((end - start) / dayMills);

        var dates = [prefix + fmt("%F", start)];


        for (var i = 1; i <= number; i++) {
            start.setDate(start.getDate() + 1);
            dates.push(prefix + fmt("%F", start))
        }

        return dates;
    },
    period: function (startDay, endDay) {
        var dayMills = 24 * 60 * 60 * 1000;

        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        var startTime = date.getTime();

        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);

        var endTime = date.getTime();

        var start_offset = parseInt(startDay);
        var end_offset = parseInt(endDay);

        startTime = startTime + start_offset * dayMills;
        endTime = endTime + end_offset * dayMills;

        return [startTime, endTime];
    },
    /**
     *
     * @param startDay
     * @param endDay
     * @param inv 时间间隔(由前端传递参数, 24小时, 7天, 30天, 自定义天数)
     * @returns {number}    返回间隔的时间毫秒数
     */
    interval: function (startDay, endDay, inv) {
        var dayMills = 24 * 60 * 60 * 1000;

        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        var startTime = date.getTime();

        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);

        var endTime = date.getTime();

        var start_offset = parseInt(startDay);
        var end_offset = parseInt(endDay);

        startTime = startTime + start_offset * dayMills;
        endTime = endTime + end_offset * dayMills;

        var start = new Date(startTime);
        var end = new Date(endTime);

        return Math.ceil((end - start) / inv);
    },
    between: function (req, prefix) {
        var parsed = url.parse(req.url, true);
        var start = this.fromTime(parsed.query['start']);

        var end;
        if (parsed.query['end']) {
            end = this.fromTime(parsed.query['end'])
        } else {
            end = new Date().getTime();
        }

        var number = Math.floor((end - start) / (24 * 60 * 60 * 1000));

        var dates = [prefix + fmt("%F", start)];


        for (var i = 1; i <= number; i++) {
            start.setDate(start.getDate() + 1);
            dates.push(prefix + fmt("%F", start))
        }

        return dates;
    },

    fromTime: function (time) {
        var date = new Date();
        date.setTime(time);
        return date
    },
    formatTime: function (time) {
        return new Date(parseInt(time)).toLocaleTimeString();
    },
    formatDate: function (time) {
        return new Date(parseInt(time)).toLocaleDateString();
    }
};

module.exports = dateutils;
