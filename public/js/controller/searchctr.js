/**
 * Created by john on 2015/4/2.
 */
define(["./module"], function (ctrs) {
    ctrs.controller('searchctr', function ($scope, $rootScope, $q, requestService, areaService, $http, SEM_API_URL) {
            $scope.visible = true;
            $scope.yesterdayClass = true;
            $rootScope.tableTimeStart = -1;//开始时间
            $rootScope.tableTimeEnd = -1;//结束时间、
            $rootScope.tableFormat = null;
            //配置默认指标
            $rootScope.checkedArray = ["impression", "cost", "cpc", "outRate", "avgTime", "nuvRate"]
            $rootScope.searchGridArray = [
                {
                    name: "xl",
                    displayName: "",
                    cellTemplate: "<div class='table_xlh'>{{grid.appScope.getIndex(this)}}</div>",
                    maxWidth: 10
                },
                {
                    name: "计划",
                    displayName: "计划",
                    field: "campaignName",
                    cellTemplate: "<div><a href='javascript:void(0)' style='color:#0965b8;line-height:30px;margin-left: 10px' ng-click='grid.appScope.getHistoricalTrend(this)'>{{grid.appScope.getDataUrlInfo(grid, row,3)}}</a></div>"
                    , footerCellTemplate: "<div class='ui-grid-cell-contents'>当页汇总</div>"
                }, /*
                 {
                 name: " ",
                 displayName: " ",
                 cellTemplate: "<div class='table_box'><a ui-sref='history' ng-click='grid.appScope.getHistoricalTrend(this)' target='_parent' class='table_btn'></a></div>"
                 },*/
                {
                    name: "展现量",
                    displayName: "展现量",
                    field: "impression",
                    footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getSearchFooterData(this,grid.getVisibleRows())}}</div>"
                },
                {
                    name: "消费",
                    displayName: "消费",
                    field: "cost",
                    footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getSearchFooterData(this,grid.getVisibleRows())}}</div>"
                },
                {
                    name: "平均点击价格",
                    displayName: "平均点击价格",
                    field: "cpc",
                    footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getSearchFooterData(this,grid.getVisibleRows())}}</div>"
                },
                {
                    name: "跳出率",
                    displayName: "跳出率",
                    field: "outRate",
                    footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getSearchFooterData(this,grid.getVisibleRows())}}</div>"
                },
                {
                    name: "平均访问时长",
                    displayName: "平均访问时长",
                    field: "avgTime",
                    footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getSearchFooterData(this,grid.getVisibleRows())}}</div>"
                },
                {
                    name: "新访客比率",
                    displayName: "新访客比率",
                    field: "nuvRate",
                    footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getSearchFooterData(this,grid.getVisibleRows())}}</div>"
                }
            ];
            $rootScope.tableSwitch = {
                latitude: {name: "计划", displayName: "计划", field: "campaignName"},
                tableFilter: null,
                dimen: false,
                // 0 不需要btn ，1 无展开项btn ，2 有展开项btn
                number: 0,
                //当number等于2时需要用到coding参数 用户配置弹出层的显示html 其他情况给false
                coding: false,
                //coding:"<li><a href='http://www.best-ad.cn'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看入口页连接</a></li>"
                arrayClear: false, //是否清空指标array
                promotionSearch: {
                    turnOn: true, //是否开启推广中sem数据
                    SEMData: "campaign" //查询类型
                }
            };


            $scope.selectedQuota = ["click", "impression"];
            $scope.onLegendClickListener = function (radio, chartInstance, config, checkedVal) {
                if (checkedVal.length) {
                    $scope.init($rootScope.user, $rootScope.baiduAccount, "campaign", checkedVal, $rootScope.start, $rootScope.end);
                } else {
                    def.defData($scope.charts[0].config);
                }
            }
            $scope.charts = [
                {
                    config: {
                        legendId: "indicators_charts_legend",
                        legendData: ["点击量", "展现量", "消费", "点击率", "平均点击价格", "浏览量(PV)", "访问次数", "访客数(UV)", "新访客数", "新访客比率", "跳出率", '平均访问时长', "平均访问页数", "抵达率"],//显示几种数据
                        //legendMultiData: $rootScope.lagerMulti,
                        legendAllowCheckCount: 2,
                        legendClickListener: $scope.onLegendClickListener,
                        legendDefaultChecked: [0, 1],
                        allShowChart: 4,
                        min_max: false,
                        bGap: true,
                        autoInput: 20,
                        auotHidex: true,
                        id: "indicators_charts",
                        chartType: "bar",//图表类型
                        keyFormat: 'none',
                        noFormat: true,
                        dataKey: "key",//传入数据的key值
                        dataValue: "quota"//传入数据的value值
                    }
                }
            ];
            $scope.initGrid = function (user, baiduAccount, semType, quotas, start, end, renderLegend) {
                $rootScope.start = -1;
                $rootScope.end = -1;
                $scope.init(user, baiduAccount, semType, quotas, start, end, renderLegend);
            }
            $scope.init = function (user, baiduAccount, semType, quotas, start, end, renderLegend) {
                //var request = chartUtils.qAll(quotas);
                //var requestArray = [];
                //if (request[0] != "") {
                //    var semRequest = $http.get(SEM_API_URL + user + "/" + baiduAccount + "/" + semType + "/" + request[0] + "?startOffset=" + start + "&endOffset=" + end);
                //    requestArray.push(semRequest);
                //}
                //if (request[1].length) {
                //    var esRequest = $http.get("/api/charts/?type=" + request[1].toString() + "&dimension=one&start=" + start + "&end=" + end + "&userType=" + $rootScope.userType);
                //    requestArray.push(esRequest);
                //}
                if (quotas.length) {
                    var semRequest = "";
                    if (quotas.length == 1) {
                        semRequest = $http.get(SEM_API_URL + user + "/" + baiduAccount + "/" + semType + "/" + quotas[0] + "-?startOffset=" + start + "&endOffset=" + end);
                    } else {
                        semRequest = $http.get(SEM_API_URL + user + "/" + baiduAccount + "/" + semType + "/" + quotas[0] + "-" + quotas[1] + "-?startOffset=" + start + "&endOffset=" + end)
                    }
                    $q.all([semRequest]).then(function (final_result) {
                        final_result[0].data.sort(chartUtils.by(quotas[0]));
                        var total_result = chartUtils.getSemBaseData(quotas, final_result, "campaignName");
                        var chart = echarts.init(document.getElementById($scope.charts[0].config.id));
                        chart.showLoading({
                            text: "正在努力的读取数据中..."
                        });
                        $scope.charts[0].config.instance = chart;
                        if (renderLegend) {
                            util.renderLegend(chart, $scope.charts[0].config);
                            Custom.initCheckInfo();
                        }
                        console.log(total_result);
                        cf.renderChart(total_result, $scope.charts[0].config);
                        chart.hideLoading();
                    });
                }
            }
            $scope.initGrid($rootScope.user, $rootScope.baiduAccount, "campaign", $scope.selectedQuota, -1, -1, true);

            $scope.$on("ssh_refresh_charts", function (e, msg) {
                $rootScope.targetSearchSpread();
                $scope.init($rootScope.user, $rootScope.baiduAccount, "campaign", $scope.selectedQuota, $rootScope.start, $rootScope.end);
            });


            //$scope.initMap();
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
                {name: '访问页数目标'}
            ];
            //日历

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

            $rootScope.datepickerClick = function (start, end, label) {
                var time = chartUtils.getTimeOffset(start, end);
                var offest = time[1] - time[0];
                $scope.reset();
                $rootScope.start = time[0];
                $rootScope.end = time[1];
                $scope.init($rootScope.user, $rootScope.baiduAccount, "campaign", $scope.selectedQuota, $rootScope.start, $rootScope.end);
            }
            function GetDateStr(AddDayCount) {
                var dd = new Date();
                dd.setDate(dd.getDate() + AddDayCount);//获取AddDayCount天后的日期
                var y = dd.getFullYear();
                var m = dd.getMonth() + 1;//获取当前月份的日期
                var d = dd.getDate();
                return y + "-" + m + "-" + d;
            }

            //刷新
            $scope.page_refresh = function () {
                $rootScope.start = -1;
                $rootScope.end = -1;
                $rootScope.tableTimeStart = -1;//开始时间
                $rootScope.tableTimeEnd = -1;//结束时间、
                $rootScope.tableFormat = null;
                //$rootScope.targetSearchSpread();
                $scope.init($rootScope.user, $rootScope.baiduAccount, "campaign", $scope.selectedQuota, $rootScope.start, $rootScope.end);
                //图表
                requestService.refresh($scope.charts);
                $scope.reloadByCalendar("today");
                $('#reportrange span').html(GetDateStr(-1));
                //其他页面表格
                //classcurrent
                $scope.reset();
                $scope.yesterdayClass = true;
            };
        }
    );
});
