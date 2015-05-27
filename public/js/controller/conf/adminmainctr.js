/**
 * Created by john on 2015/4/1.
 */
define(["./module"], function (ctrs) {
    "use strict";

    ctrs.controller('adminmainctr', function ($scope, $q, $rootScope, $http, requestService, messageService, areaService, uiGridConstants) {
        $scope.todayClass = true;
        $scope.hourcheckClass = true;
        $scope.lastDaySelect = true;
        $scope.lastWeekSelect = true;
        $scope.clearCompareSelect = true;
        $scope.reset = function () {
        $scope.todayClass = false;
        $scope.yesterdayClass = false;
        $scope.sevenDayClass = false;s
        $scope.monthClass = false;
        $scope.definClass = false;
        $scope.hourcheckClass = false;
        };
        /*    $scope.hourcheck= function(){
         $scope.dayClass=false;
         $scope.hourcheckClass=true;
         }
         $scope.daycheck= function(){
         $scope.dayClass=true;
         $scope.hourcheckClass=false;
         }*/
        //table配置
        $rootScope.tableTimeStart = 0;
        $rootScope.tableTimeEnd = 0;
        $rootScope.tableFormat = "hour";
        //配置默认指标
        $rootScope.checkArray = ["", "", ""];
        $rootScope.gridArray = [
            {name: "网站域名", displayName:"网站域名", field: ""},
            {name: "网站名称",  displayName:"网站名称", field: ""},
            {name: "首页代码状态", displayName:"首页代码状态",field: "",
            },
            {
                name: " 1",
                cellTemplate: "<div class='table_box'><button onclick='getMyButton(this)' class='table_nextbtn '></button><div class='table_win'><ul style='color: #45b1ec'><li><a ui-sref='history' ng-click='grid.appScope.getHistoricalTrend(this)' target='_parent' target='_blank'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看来源分布</a></li></ul></div></div>"
            },
            {
                name: "2 ",
                cellTemplate: "<div class='table_box'><button onclick='getMyButton(this)' class='table_nextbtn'></button><div class='table_win'><ul style='color: #45b1ec'><li><a ui-sref='history' ng-click='grid.appScope.getHistoricalTrend(this)' target='_parent' target='_blank'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看来源分布</a></li></ul></div></div>"
            },
            {
                name: "3 ",
                cellTemplate: "<div class='table_box'><button onclick='getMyButton(this)' class='table_nextbtn'></button><div class='table_win'><ul style='color: #45b1ec'><li><a ui-sref='history' ng-click='grid.appScope.getHistoricalTrend(this)' target='_parent' target='_blank'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看来源分布</a></li></ul></div></div>"
            },
            {
                name: "4 ",
                cellTemplate: "<div class='table_box'><button onclick='getMyButton(this)' class='table_nextbtn'></button><div class='table_win'><ul style='color: #45b1ec'><li><a ui-sref='history' ng-click='grid.appScope.getHistoricalTrend(this)' target='_parent' target='_blank'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看来源分布</a></li></ul></div></div>"
            },
            {
                name: "5 ",
                cellTemplate: "<div class='table_box'><button onclick='getMyButton(this)' class='table_nextbtn'></button><div class='table_win'><ul style='color: #45b1ec'><li><a ui-sref='history' ng-click='grid.appScope.getHistoricalTrend(this)' target='_parent' target='_blank'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看来源分布</a></li></ul></div></div>"
            }
        ];

        $rootScope.tableSwitch = {
            latitude: {name: "网站域名", displayName: "网站域名", field: ""},
            tableFilter: null,
            dimen: false,
            // 0 不需要btn ，1 无展开项btn ，2 有展开项btn
            number: 0,
            //当number等于2时需要用到coding参数 用户配置弹出层的显示html 其他情况给false
            coding: false,
            //coding:"<li><a href='http://www.best-ad.cn'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看入口页连接</a></li>"
            arrayClear: false //是否清空指标array
        };
        //
        $scope.dt = new Date();
        $scope.onLegendClickListener = function (radio, chartObj, chartConfig, checkedVal) {
            if ($scope.charts[0].config.compare) {
                var time = $rootScope.start;
                if ($scope.compareType == 2) {
                    time = $rootScope.start - 7;
                }
                $scope.charts[0].config.instance = echarts.init(document.getElementById($scope.charts[0].config.id));
                var todayData = $http.get("api/charts?type=" + checkedVal + "&dimension=period&start=" + time + "&end=" + time + "&userType=" + $rootScope.userType + "&int=" + $rootScope.interval);
                var lastDayData = $http.get("api/charts?type=" + checkedVal + "&dimension=period&start=" + (time - 1) + "&end=" + ( time - 1) + "&userType=" + $rootScope.userType + "&int=" + $rootScope.interval);
                $q.all([todayData, lastDayData]).then(function (res) {
                    var dateStamp = chartUtils.getDateStamp(time);
                    console.log(dateStamp);
                    var final_result = chartUtils.compareTo(res, dateStamp);
                    $scope.charts[0].config.noFormat = "none";
                    $scope.charts[0].config.compare = true;
                    cf.renderChart(final_result, $scope.charts[0].config);
                });
            } else {
                clear.lineChart($scope.charts[0].config, checkedVal);
                $scope.charts[0].config.instance = echarts.init(document.getElementById($scope.charts[0].config.id));
                $scope.charts[0].types = checkedVal;
                var chartarray = [$scope.charts[0]];
                requestService.refresh(chartarray);
            }
        }



    });
});