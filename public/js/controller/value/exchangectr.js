/**
 * Created by perfection on 2015/5/29.....
 */
define(["./module"], function (ctrs) {

    "use strict";

    ctrs.controller('exchangectr', function ($cookieStore, $http, $rootScope, $scope) {
            $scope.selectedIndex = 0;
            $rootScope.start = -1;//时间偏移量开始
            $rootScope.end = -1;//时间偏移量结束
            $scope.sites = [];
            $scope.exchange = {};
            //对应域名的点击时间，获取该域名下的层级下数据
            $scope.itemClicked = function (page, $index) {
                $http.get("api/exchange?start=" + $scope.start + ",end=" + $scope.end + ",type=" + page.id).success(function (data) {
                    //注：data里面的数据在name、id、pv和uv与page对象的值不同，数据混乱
                    //原因是type的数量与数据查出来的域名数量不符合，数据库有问题
                    $scope.exchange = {
                        name: page.name,
                        id: page.id,
                        pv: page.pv,
                        uv: page.uv,
                        path1: data[0].path1//层级下数据
                    }
                    $scope.exchange_prefix = {
                        name: page.prefix + page.name,
                        id: page.id,
                        pv: page.pv,
                        uv: page.uv,
                        path1: data[0].path1//层级下数据
                    };
                });
                $scope.selectedIndex = $index;
            };
            $scope.reloadByCalendar = function (type) {
                $rootScope.$broadcast("ssh_refresh_charts");
                $rootScope.$broadcast("ssh_dateShow_options_time_change", type);
            };
            $scope.reset = function () {
                $scope.todayClass = false;
                $scope.yesterdayClass = false;
                $scope.sevenDayClass = false;
                $scope.monthClass = false;
                $scope.definClass = false;
            };

            $scope.usites = $cookieStore.get('usites');

            $scope.exchanges = {};
            var ids = "";
            $scope.usites.forEach(function (item, i) {
                $scope.sites.push({
                    name: item.site_name,
                    id: item.site_id
                });
                ids += item.site_id + ";";
            });

            $scope.exchanges = $scope.sites;
            //根据域名type查询pv和uv

            $scope.init = function () {
                $http.get("api/exchange?start=" + $rootScope.start + ",end=" + $rootScope.end + ",type=" + ids.substring(0, ids.length - 1)).success(function (data) {
                    $scope.exchanges = dataSave($scope, data);
                    $scope.exchange = {};
                    $scope.exchange = {
                        name: data[0].pathName.replace(/www./g, ""),
                        id: data[0].id,
                        pv: data[0].pv,
                        uv: data[0].uv,
                        path1: data[0].path1
                    };
                    $scope.exchange_prefix = {
                        name: data[0].pathName,
                        id: data[0].id,
                        pv: data[0].pv,
                        uv: data[0].uv,
                        path1: data[0].path1
                    };
                });
            }

            $scope.init();

            $scope.times = [{}];
            $scope.isCollapsed = false;
            $scope.treeclose = true;

            $scope.yesterday = function () {
                $scope.reset();
                $scope.isShowCalendar = false;
                $scope.hiddenSeven = false;
                $scope.todayCalendar = GetDateStr(-1);
                $scope.hourselect = false;
                $scope.dayselect = false;
                $scope.weekselected = true;
                $scope.mothselected = true;
                $scope.lastDaySelect = true;
                $scope.lastWeekSelect = true;
                $scope.clearCompareSelect = true;
                $rootScope.tableTimeStart = -1;
                $rootScope.tableTimeEnd = -1;
                $scope.reloadByCalendar("yesterday");
                $('#reportrange span').html(GetDateStr(-1));
                $scope.yesterdayClass = true;
                $rootScope.start = -1;
                $rootScope.end = -1;
                $scope.init();
            };
            //获取前天统计数据
            $scope.beforeyesterday = function () {
                $scope.reset();
                $scope.isShowCalendar = false;
                $scope.hiddenSeven = false;
                $scope.todayCalendar = GetDateStr(-2);
                $scope.hourselect = false;
                $scope.dayselect = false;
                $scope.weekselected = true;
                $scope.mothselected = true;
                $scope.lastDaySelect = true;
                $scope.lastWeekSelect = true;
                $scope.clearCompareSelect = true;
                $rootScope.tableTimeStart = -2;
                $rootScope.tableTimeEnd = -2;
                $scope.reloadByCalendar("beforeyesterday");
                $('#reportrange span').html(GetDateStr(-2));
                $scope.yesterdayClass = true;
                $rootScope.start = -2;
                $rootScope.end = -2;
                $scope.init();
            }
            $scope.sevenDay = function () {
                $scope.reset();
                $scope.isShowCalendar = false;
                $scope.hiddenSeven = true;//今日统计和昨日统计中，点击7、30天时隐藏对比
                $scope.todayCalendar = GetDateStr(-6);
                $scope.hourselect = false;
                $scope.dayselect = false;
                $scope.weekselected = true;
                $scope.mothselected = true;
                $rootScope.tableTimeStart = -7;
                $rootScope.tableTimeEnd = -1;
                $scope.reloadByCalendar("seven");
                $('#reportrange span').html(GetDateStr(-6) + "至" + GetDateStr(0));
                $scope.sevenDayClass = true;
                $rootScope.start = -7;
                $rootScope.end = -1;
                $rootScope.interval = 7;
                $scope.init();
            };
            $scope.month = function () {
                $scope.reset();
                $scope.isShowCalendar = false;
                $scope.hiddenSeven = true;
                $scope.hourselect = false;
                $scope.dayselect = false;
                $scope.weekselected = false;
                $scope.mothselected = true;
                $rootScope.tableTimeStart = -29;
                $rootScope.tableTimeEnd = 0;
                $scope.reloadByCalendar("month");
                $('#reportrange span').html(GetDateStr(-29) + "至" + GetDateStr(0));
                $scope.monthClass = true;
                $rootScope.start = -30;
                $rootScope.end = -1;
                $rootScope.interval = 30;
                $scope.init();
            };
            function GetDateStr(AddDayCount) {
                var dd = new Date();
                dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
                var y = dd.getFullYear();
                var m = dd.getMonth() + 1;//获取当前月份的日期
                var d = dd.getDate();
                return y + "-" + m + "-" + d;
            }
            $('#reportrange span').html(GetDateStr(0));
            $('#reportrange').daterangepicker({
                format: 'YYYY-MM-DD',
                maxDate: GetDateStr(0),
                showDropdowns: true,
                showWeekNumbers: false,
                timePicker: false,
                //timePickerIncrement: 1,
                timePicker12Hour: false,
                opens: 'left',
                drops: 'down',
                timeZone: true,
                buttonClasses: ['btn', 'btn-sm'],
                applyClass: 'btn-primary',
                cancelClass: 'btn-default',
                separator: ' to '
            }, function (start, end, label) {
                $rootScope.datepickerClick(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'), label);
                $rootScope.startString = (start.format('YYYY-MM-DD') + ' 至 ' + end.format('YYYY-MM-DD'))
                $('#reportrange span').html(start.format('YYYY-MM-DD') + '至' + end.format('YYYY-MM-DD'));
            });
            //日历
            this.selectedDates = [new Date().setHours(0, 0, 0, 0)];
            this.type = 'range';
            /*      this.identity = angular.identity;*/

            this.removeFromSelected = function (dt) {
                this.selectedDates.splice(this.selectedDates.indexOf(dt), 1);
            }
        }
    );
});
var dataSave = function ($scope, data) {
    var text = [];
    var replaceString = new RegExp("www.", "g");
    for (var k = 0; k < data.length; k++) {
        var prefix = "";
        if (data[k].pathName.match(/www./g) != null) {
            prefix = "www.";
        }
        text.push({
            name: data[k].pathName.replace(replaceString, ""),
            id: data[k].id,
            pv: data[k].pv,
            uv: data[k].uv,
            path1: data[k].path1,
            prefix: prefix
        });

    }
    return text;
}