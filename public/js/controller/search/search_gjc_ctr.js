/**
 * Created by XiaoWei on 2015/5/14.
 */
define(["./../module"], function (ctrs) {

    "use strict";

    ctrs.controller('search_gjc_ctr', function ($scope, $rootScope, $q, requestService, areaService, $http, SEM_API_URL, uiGridConstants, $cookieStore) {
        $scope.city.selected = {"name": "全部"};
        //        高级搜索提示
        $scope.areaSearch = "";
//        取消显示的高级搜索的条件
        $scope.removeAreaSearch = function (obj) {
            $scope.city.selected = {"name": "全部"};
            $rootScope.$broadcast("searchLoadAllArea");
            obj.areaSearch = "";
        }
        $scope.todayClass = true;
        $rootScope.tableTimeStart = 0;//开始时间
        $rootScope.tableTimeEnd = 0;//结束时间、
        $rootScope.tableFormat = null;
        //配置默认指标
        $rootScope.checkedArray = ["impression", "cost", "cpc", "outRate", "avgTime", "nuvRate"]
        $rootScope.searchGridArray = [
            {
                name: "xl",
                displayName: "",
                cellTemplate: "<div class='table_xlh'>{{grid.appScope.getIndex(this)}}</div>",
                maxWidth: 10,
                enableSorting: false
            },
            {
                name: "关键词",
                displayName: "关键词",
                field: "keywordName",
                cellTemplate: "<div><a href='http://www.baidu.com/s?wd={{grid.appScope.getDataUrlInfo(grid, row,1)}}' target='_blank' style='color:#0965b8;line-height:30px;margin-left: 10px'>{{grid.appScope.getDataUrlInfo(grid, row,1)}}</a><br/>{{grid.appScope.getDataUrlInfo(grid, row,2)}}</div>"
                , footerCellTemplate: "<div class='ui-grid-cell-contents'>当页汇总</div>",
                enableSorting: false
            },
            {
                name: "展现",
                displayName: "展现",
                field: "impression",
                footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getSearchFooterData(this,grid.getVisibleRows())}}</div>",
                sort: {
                    direction: uiGridConstants.DESC,
                    priority: 1
                }
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
            latitude: {name: "关键词", displayName: "关键词", field: "keywordName"},
            tableFilter: null,
            dimen: "city",
            // 0 不需要btn ，1 无展开项btn ，2 有展开项btn
            number: 0,
            //当number等于2时需要用到coding参数 用户配置弹出层的显示html 其他情况给false
            coding: false,
            //coding:"<li><a href='http://www.best-ad.cn'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看入口页连接</a></li>"
            arrayClear: false, //是否清空指标array
            promotionSearch: {
                turnOn: true, //是否开始推广中sem数据
                SEMData: "keyword" //查询类型
            }
        };

        $scope.selectedQuota = ["click", "impression"];
        $scope.onLegendClickListener = function (radio, chartInstance, config, checkedVal) {
            $scope.init($rootScope.user, $rootScope.baiduAccount, "keyword", checkedVal, $rootScope.start, $rootScope.end);
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
                    min_max: false,
                    bGap: true,
                    id: "indicators_charts",
                    chartType: "bar",//图表类型
                    keyFormat: 'eq',
                    noFormat: true,
                    autoInput: 20,
                    auotHidex: true,
                    qingXie: true,
                    dataKey: "key",//传入数据的key值
                    dataValue: "quota"//传入数据的value值
                }
            }
        ];
        $scope.initGrid = function (user, baiduAccount, semType, quotas, start, end, renderLegend) {
            $rootScope.start = 0;
            $rootScope.end = 0;
            $scope.init(user, baiduAccount, semType, quotas, start, end, renderLegend);
        }
        $scope.init = function (user, baiduAccount, semType, quotas, start, end, renderLegend) {
            if (quotas.length) {
                var semRequest = "";
                if (quotas.length == 1) {
                    semRequest = $http.get(SEM_API_URL + "/sem/report/" + semType + "?a=" + user + "&b=" + baiduAccount + "&startOffset=" + start + "&endOffset=" + end + "&q=" + quotas[0]);
                } else {
                    semRequest = $http.get(SEM_API_URL + "/sem/report/" + semType + "?a=" + user + "&b=" + baiduAccount + "&startOffset=" + start + "&endOffset=" + end + "&q=" + quotas[0] + "," + quotas[1]);
                }
                $q.all([semRequest]).then(function (final_result) {
                    final_result[0].data.sort(chartUtils.by(quotas[0]));
                    final_result[0].data = final_result[0].data.slice(0, 20);
                    var total_result = chartUtils.getSemBaseData(quotas, final_result, "keywordName");
                    var chart = echarts.init(document.getElementById($scope.charts[0].config.id));
                    chart.showLoading({
                        text: "正在努力的读取数据中..."
                    });
                    $scope.charts[0].config.instance = chart;
                    if (renderLegend) {
                        util.renderLegend(chart, $scope.charts[0].config);
                        Custom.initCheckInfo();
                    }
                    cf.renderChart(total_result, $scope.charts[0].config);
                    //if (final_result.length) {
                    //    if (final_result[0].data.length) {
                    //        chart.hideLoading();
                    //    }
                    //}
                });
            }
        }
        $scope.initGrid($rootScope.user, $rootScope.baiduAccount, "keyword", $scope.selectedQuota, 0, 0, true);


        $scope.$on("ssh_refresh_charts", function (e, msg) {
            $rootScope.targetSearchSpread();
            $scope.init($rootScope.user, $rootScope.baiduAccount, "keyword", $scope.selectedQuota, $rootScope.start, $rootScope.end);
        });

        //点击显示指标
        $scope.visible = false;
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
        //刷新
        $scope.page_refresh = function () {
            //$rootScope.start = -1;
            //$rootScope.end = -1;
            //$rootScope.tableTimeStart = -1;//开始时间
            //$rootScope.tableTimeEnd = -1;//结束时间、
            //$rootScope.tableFormat = null;
            //$scope.init($rootScope.user, $rootScope.baiduAccount, "keyword", $scope.selectedQuota, $rootScope.start, $rootScope.end);
            ////图表
            //requestService.refresh($scope.charts);
            $scope.reloadByCalendar("today");
            $('#reportrange span').html(GetDateStr(0));
            //其他页面表格
            //classcurrent
            $scope.reset();
            $scope.todayClass = true;
        };

        $rootScope.initMailData = function () {
            $http.get("api/saveMailConfig?rt=read&rule_url=" + $rootScope.mailUrl[1] + "").success(function (result) {
                if (result) {
                    var ele = $("ul[name='sen_form']");
                    formUtils.rendererMailData(result, ele);
                }
            });
        };

        $scope.sendConfig = function () {
            var formData = formUtils.vaildateSubmit($("ul[name='sen_form']"));
            var result = formUtils.validateEmail(formData.mail_address, formData);
            if (result.ec) {
                alert(result.info);
            } else {
                formData.rule_url = $rootScope.mailUrl[1];
                formData.uid = $cookieStore.get('uid');
                formData.site_id = $rootScope.siteId;
                formData.type_id = $rootScope.userType;
                formData.schedule_date = $scope.mytime.time.Format('hh:mm');
                $http.get("api/saveMailConfig?data=" + JSON.stringify(formData)).success(function (data) {
                    var result = JSON.parse(eval("(" + data + ")").toString());
                    if (result.ok == 1) {
                        alert("操作成功!");
                        $http.get("/api/initSchedule");
                    } else {
                        alert("操作失败!");
                    }
                });
            }
        };
    });


});