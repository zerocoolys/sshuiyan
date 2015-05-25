/**
 * Created by XiaoWei on 2015/5/15.
 */
define(["./module"], function (ctrs) {

    "use strict";

    ctrs.controller('search_ssc_ctr', function ($scope, $rootScope, requestService, areaService, $http) {
        $scope.yesterdayClass = true;

        $rootScope.tableTimeStart = -1;//开始时间
        $rootScope.tableTimeEnd = -1;//结束时间、
        $rootScope.tableFormat = null;
        //配置默认指标
        $rootScope.checkedArray = ["impression", "cost", "cpc", "outRate", "avgTime", "nuvRate"]
        $rootScope.searchGridArray = [
            {
                name: "触发关键词的搜索词",
                displayName: "触发关键词的搜索词",
                field: "kw",
                cellTemplate: "<a href='http://www.baidu.com/s?wd={{grid.appScope.getDataUrlInfo(grid, row,1)}}' style='color:#0965b8;line-height:30px;' target='_blank'>{{grid.appScope.getDataUrlInfo(grid, row,1)}}</a><br/>{{grid.appScope.getDataUrlInfo(grid, row,2)}}"
            },/*
            {
                name: " ",
                displayName: " ",
                cellTemplate: "<div class='table_box'><a ui-sref='history' ng-click='grid.appScope.getHistoricalTrend(this)' target='_parent' class='table_btn'></a></div>"
            },*/
            {name: "展现", displayName: "展现", field: "impression"},
            {name: "消费", displayName: "消费", field: "cost"},
            {name: "平均点击价格", displayName: "平均点击价格", field: "cpc"},
            {name: "跳出率", displayName: "跳出率", field: "outRate"},
            {name: "平均访问时长", displayName: "平均访问时长", field: "avgTime"},
            {name: "新访客比率", displayName: "新访客比率", field: "nuvRate"}
        ];
        $rootScope.tableSwitch = {
            latitude: {name: "触发关键词的搜索词", displayName: "触发关键词的搜索词", field: "kw"},
            tableFilter: null,
            dimen: false,
            // 0 不需要btn ，1 无展开项btn ，2 有展开项btn
            number: 0,
            //当number等于2时需要用到coding参数 用户配置弹出层的显示html 其他情况给false
            coding: false,
            //coding:"<li><a href='http://www.best-ad.cn'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看入口页连接</a></li>"
            arrayClear: false, //是否清空指标array
            promotionSearch: {
                turnOn: "ssc", //是否开始推广中sem数据
                SEMData: "keyword" //查询类型
            }
        };
        $scope.charts = [
            {
                config: {
                    legendId: "indicators_charts_legend",
                    legendData: ["浏览量(PV)", "访客数(UV)", "跳出率", "抵达率", "平均访问时长", "页面转化"],//显示几种数据
                    legendMultiData: $rootScope.lagerMulti,
                    legendAllowCheckCount: 2,
                    legendClickListener: $scope.onLegendClickListener,
                    id: "indicators_charts",
                    bGap: false,//首行缩进
                    chartType: "line",//图表类型
                    dataKey: "key",//传入数据的key值
                    dataValue: "quota"//传入数据的value值
                },
                types: ["pv", "uv"],
                dimension: ["period"],
                interval: $rootScope.interval,
                url: "/api/charts"
            }
        ];
        $scope.init = function () {
            $scope.charts.forEach(function (e) {
                var chart = echarts.init(document.getElementById(e.config.id));
                e.config.instance = chart;
                util.renderLegend(chart, e.config);
            })
            requestService.refresh($scope.charts);
        }
        $scope.init();

        $scope.$on("ssh_refresh_charts", function (e, msg) {
            $rootScope.targetSearchSSC();
        });

        //点击显示指标
        $scope.visible = true;
        $scope.select = function () {
            $scope.visible = false;
        };
        $scope.clear = function () {
            $scope.page.selected = undefined;
            $scope.city.selected = undefined;
            $scope.country.selected = undefined;
            $scope.continent.selected = undefined;
        };
        $scope.page = {};
        $scope.pages = [
            {name: '全部页面目标'},
            {name: '全部事件目标'},
            {name: '所有页面右上角按钮'},
            {name: '所有页面底部400按钮'},
            {name: '详情页右侧按钮'},
            {name: '时长目标'},
            {name: '访问页数目标'},
        ];
        //日历
        $scope.dateClosed = function () {
            $rootScope.start = $scope.startOffset;
            $rootScope.end = $scope.endOffset;
            $scope.charts.forEach(function (e) {
                var chart = echarts.init(document.getElementById(e.config.id));
                e.config.instance = chart;
            })
            if ($rootScope.start <= -1) {
                $scope.charts[0].config.keyFormat = "day";
            } else {
                $scope.charts[0].config.keyFormat = "hour";
            }
            requestService.refresh($scope.charts);
            $rootScope.targetSearch();
            $rootScope.tableTimeStart = $scope.startOffset;
            $rootScope.tableTimeEnd = $scope.endOffset;
            $scope.$broadcast("ssh_dateShow_options_time_change");
        };
        //

        this.selectedDates = [new Date().setHours(0, 0, 0, 0)];
        //this.type = 'range';
        /*      this.identity = angular.identity;*/
        //$scope.$broadcast("update", "msg");
        $scope.$on("update", function (e, datas) {
            // 选择时间段后接收的事件
            datas.sort();
            //console.log(datas);
            var startTime = datas[0];
            var endTime = datas[datas.length - 1];
            $scope.startOffset = (startTime - today_start()) / 86400000;
            $scope.endOffset = (endTime - today_start()) / 86400000;
            //console.log("startOffset=" + startOffset + ", " + "endOffset=" + endOffset);
        });
    });

});