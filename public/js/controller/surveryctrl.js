/**
 * Created by john on 2015/3/30.
 */
define(["./module"], function (ctrs) {

    "use strict";

    ctrs.controller('SurveyCtrl', function ($scope, $http, $q, $rootScope, areaService, SEM_API_URL, requestService,uiGridConstants) {
            $scope.day_offset = 0;    // 默认是今天(值为0), 值为-1代表昨天, 值为-7代表最近7天, 值为-30代表最近30天
            $scope.yesterdayClass = true;
            $scope.todaySelect = true;
            $scope.datechoice = true;
            $scope.reset = function () {
                $scope.todayClass = false;
                $scope.yesterdayClass = false;
                $scope.sevenDayClass = false;
                $scope.monthClass = false;
                $scope.definClass = false;
            };
            $scope.selectedQuota = ["cost", "vc"];
            $scope.$on("ssh_refresh_charts", function (e, msg) {
                $scope.refreshGrid($rootScope.userType);
                $scope.charts[0].config.qingXie = undefined;
                $scope.compareArray = [];
                if ($rootScope.start > -6) {
                    $(".under_top").show();
                } else {
                    $(".under_top").hide();
                }
                if ($rootScope.start == -29) {
                    $scope.charts[0].config.auotHidex = undefined;
                }
                $scope.initGrid($scope.selectedQuota[0], $scope.selectedQuota[1]);
            });
            $scope.yesterday = function () {
                $(".under_top").show();
                $scope.reset();
                $scope.yesterdayClass = true;
                $scope.day_offset = -1;
                $rootScope.start = -1;
                $rootScope.end = -1;
                $scope.compareArray = [];
                //$scope.reloadGrid();
                $scope.initGrid($scope.selectedQuota[0], $scope.selectedQuota[1]);
                $scope.clickFirst = true;
                $scope.clickSecond = true;
                $scope.sevenFirst = false;
                $scope.sevenSecond = false;
            };
            $scope.open = function ($event) {
                $scope.reset();
                $scope.definClass = true;
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = true;
            };
            $scope.checkopen = function ($event) {
                $scope.reset();
                $scope.othersdateClass = true;
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opens = true;
            };

            // 推广概况表格配置项
            $scope.gridOptions = {
                enableColumnMenus: false,
                enableSorting: true,
                enableScrollbars: false,
                enableGridMenu: false,
                enableHorizontalScrollbar: 0,
                enableVerticalScrollbar: 0,
                columnDefs: [
                    {name: ' ', field: 'category', cellClass: 'grid_padding', enableSorting: false},
                    {
                        name: '消费', field: 'cost',
                        sort: {
                            direction: uiGridConstants.DESC,
                            priority: 1
                        }
                    },
                    {name: '展现量', field: 'impression'},
                    {name: '点击量', field: 'click'},
                    {name: '访问次数', field: 'vc'},
                    {name: '跳出率', field: 'outRate'},
                    {name: '平均访问时长', field: 'avgTime'},
                    {name: '抵达率', field: 'arrivedRate'},
                    {name: '浏览量（PV)', displayName: "浏览量(PV)", field: 'pv'}
                ]
            };

            $scope.select = {};

            //数组对象用来给ng-options遍历
            $scope.select.optionsData = [
                {
                    title: "搜索推广"
                },
                {
                    title: "网盟推广"
                }];

            // 投放指标 outQuota
            //推广select
            $scope.disabled = undefined;
            $scope.enable = function () {
                $scope.disabled = false;
            };

            $scope.disable = function () {
                $scope.disabled = false;
            };
            $scope.clear = function () {
                $scope.survey.selected = undefined;
                $scope.outQuotas.selected = undefined;
                $scope.effectQuotas.selected = undefined;

            };
            $scope.survey = {};
            $scope.surveys = [
                {name: '全部推广方式'},
                {name: '搜索推广'},
                {name: '网盟推广'}
            ];
            $scope.outQuotas = {};
            $scope.outQuota = [
                {
                    name: "消费",
                    value: "cost"
                },
                {
                    name: "展现量",
                    value: "impression"
                },
                {
                    name: "点击量",
                    value: "click"
                },
                {
                    name: "点击率",
                    value: "ctr"
                },
                {
                    name: "平均点击价格",
                    value: "cpc"
                }
            ];

            // 效果指标 effectQuota
            $scope.effectQuotas = {};
            $scope.effectQuota = [
                {
                    name: "访问次数",
                    value: "vc"
                },
                {
                    name: "浏览量(PV)",
                    value: "pv"
                },
//                {
//                    name: "页面转化",
//                    value: "pageConversion"
//                },
                {
                    name: "跳出率",
                    value: "outRate"
                },
                {
                    name: "抵达率",
                    value: "arrivedRate"
                },
                {
                    name: "平均访问时长",
                    value: "avgTime"
                },
                {
                    name: '平均访问页数',
                    value: 'avgPage'
                }
            ];

            // 默认投放指标
            $scope.outQuota_ = "cost";
            // 默认效果指标
            $scope.effectQuota_ = "vc";

            $rootScope.start = 0;
            $rootScope.end = 0;

            //// 根据$scope.day_offset计算startDate和endDate
            //$scope.calDatePeriod = function () {
            //    switch ($scope.day_offset) {
            //        case 0:
            //            $scope.startDate_ = 0;
            //            $scope.endDate_ = 0;
            //            break;
            //        case -1:
            //            $scope.startDate_ = -1;
            //            $scope.endDate_ = -1;
            //            break;
            //        case -7:
            //            $scope.startDate_ = -7;
            //            $scope.endDate_ = -1;
            //            break;
            //        case -30:
            //            $scope.startDate_ = -30;
            //            $scope.endDate_ = -1;
            //            break;
            //        default :
            //            break;
            //    }
            //};

            // 更改指标或日期时刷新数据
            $scope.refreshData = function () {
                $scope.calDatePeriod();

                //$scope.doSearchByEffectQuota("1");

                //$scope.getSemQuotaRealTimeData($rootScope.baiduAccount, "account", $scope.startDate_, $scope.endDate_, 0, 7, PERFORMANCE_DATA);

                var timeInterval = setInterval(function () {
                    if ($scope.effectDataArray.length > 0 && $scope.semDataArray.length > 0) {
                        $scope.loadLineData();
                        clearInterval(timeInterval);
                    }
                }, 500);
            };
            $scope.charts = [
                {
                    config: {
                        legendId: "index_charts_legend",
                        //legendData: ["浏览量(PV)", "访客数(UV)", "跳出率", "抵达率", "平均访问时长", "页面转化"],//显示几种数据
                        //legendAllowCheckCount: 2,
                        //legendClickListener: $scope.onLegendClickListener,
                        //legendDefaultChecked: [0, 1],
                        id: "index_charts",
                        //min_max: false,
                        chartType: "line",//图表类型
                        keyFormat: 'eq',
                        noFormat: true,
                        auotHidex: true,
                        qingXie: false,
                        dataKey: "key",//传入数据的key值
                        dataValue: "quota"//传入数据的value值
                    }
                }
            ];
            $rootScope.chartTmp = [];
            $scope.initGrid = function (quota, estype, cb) {
                $rootScope.chartTmp = [];
                var semRegionRequest = $http.get(SEM_API_URL + "/sem/report/account?a=" + $rootScope.user + "&b=" + $rootScope.baiduAccount + "&startOffset=" + $rootScope.start + "&endOffset=" + $rootScope.end);
                var esRequest = $http.get("/api/charts?start=" + $rootScope.start + "&end=" + $rootScope.end + "&dimension=period&userType=" + $rootScope.userType + "&type=" + estype);
                $scope.charts[0].config.instance = echarts.init(document.getElementById($scope.charts[0].config.id));
                $scope.charts[0].config.instance.showLoading({
                    effect: 'whirling',
                    text: "正在努力的读取数据中..."
                });
                $q.all([semRegionRequest, esRequest]).then(function (final_result) {
                    if ($rootScope.start == -1 && $rootScope.end == -1) {

                        var chart_result = chartUtils.getSurveryDataByOneDay(final_result, quota, estype);

                        $scope.charts[0].config.chartType = "bar";
                        $scope.charts[0].config.bGap = true;
                        //chartUtils.addStep(chart_result, 24);
                        $rootScope.chartTmp = chart_result;
                        //console.log($rootScope.chartTmp)
                        cf.renderChart(chart_result, $scope.charts[0].config);
                        if (cb) {
                            cb(chart_result);
                        }
                    } else {
                        var esJson = JSON.parse(eval("(" + final_result[1].data + ")").toString());
                        chartUtils.formatDate(esJson);//格式化日期
                        chartUtils.addSemData(esJson, final_result[0], quota);
                        $scope.charts[0].config.chartType = "line";
                        $scope.charts[0].config.bGap = false;//首行缩进
                        cf.renderChart(esJson, $scope.charts[0].config);
                    }
                });
                return $rootScope.chartTmp;
            };
            $scope.yesterday();

            // 触发投放指标的事件
            $scope.setOutQuota = function (outQuota) {
                $scope.outQuota_ = outQuota.value;
                $scope.selectedQuota[0] = outQuota.value;
                $scope.reloadGrid();
                $scope.compareSemArray = [];


                var quota = $scope.selectedQuota[0];
                var semType = $scope.selectedQuota[1];
                if ($scope.tmpSemCompare) {
                    $scope.initGrid($scope.selectedQuota[0], $scope.selectedQuota[1], function (chart_result) {
                        $http.get(SEM_API_URL + "/sem/report/account?a=" + $rootScope.user + "&b=" + $rootScope.baiduAccount + "&startOffset=" + $scope.tmpSemCompare.value + "&endOffset=" + $scope.tmpSemCompare.value + "&q=" + outQuota.value).success
                        (function (res) {
                            chart_result.forEach(function (item, index) {
                                if (index == 0) {
                                    item.key.push("对比数据");
                                    item.quota.push(res[0][quota]);
                                } else {
                                    item.key.push("对比数据");
                                    item.quota.push(0);
                                }
                            });
                            cf.renderChart(chart_result, $scope.charts[0].config);
                        });
                    });
                } else {
                    $scope.initGrid(quota, semType);
                }
            };

            // 触发效果指标的事件
            $scope.setEffectQuota = function (effectQuota) {
                $scope.effectQuota_ = effectQuota.value;
                $scope.selectedQuota[1] = effectQuota.value;
                var esType = effectQuota.value;
                $scope.reloadGrid();
                $scope.compareEsArray = [];
                var quota = $scope.selectedQuota[0];
                if ($scope.tmpEsCompare) {
                    $scope.initGrid(quota, esType, function (chart_result) {
                        $http.get("/api/charts?start=" + $scope.tmpEsCompare.value + "&end=" + $scope.tmpEsCompare.value + "&dimension=period&userType=" + $rootScope.userType + "&type=" + esType).success
                        (function (res) {
                            var json = JSON.parse(eval("(" + res + ")").toString());
                            if (json.length) {
                                var date = json[0].key[0].substring(0, 10);
                                var count = 0;
                                json[0].quota.forEach(function (item) {
                                    if (esType == "outRate" || esType == "arrivedRate") {
                                        count += parseFloat(item);
                                    } else {
                                        count += item;
                                    }
                                });
                                if (esType == "outRate" || esType == "arrivedRate") {
                                    count = parseFloat(count / json[0].quota.length).toFixed(2);
                                }
                                chart_result.forEach(function (item, index) {
                                    if (index == 1) {
                                        item.key.push("对比数据");
                                        item.quota.push(count);
                                    } else {
                                        //item.key.push(date);
                                        item.key.push("对比数据");
                                        item.quota.push(0);
                                    }
                                });
                                cf.renderChart(chart_result, $scope.charts[0].config);
                            }
                        });
                    });
                    //$scope.tmpEsCompare
                } else {
                    $scope.initGrid(quota, esType);
                }

                //$scope.refreshData();
            };


            $scope.compareType = false;
            $scope.compareSemCompare = null;
            $scope.tmpSemCompare = null;
            $scope.semCompareTo = function (semSelected) {
                if (semSelected.value == 100) {
                    $scope.compareReset();
                    return;
                }
                $scope.tmpSemCompare = semSelected;
                $scope.compareType = true;
                $scope.compareSemCompare = true;
                var semQuery = $scope.selectedQuota[0];
                if (!$scope.compareEsCompare) {
                    $rootScope.chartTmp.forEach(function (item) {
                        item.key = item.key.slice(0, 1);
                        item.quota = item.quota.slice(0, 1);
                    });
                }
                $http.get(SEM_API_URL + "/sem/report/account?a=" + $rootScope.user + "&b=" + $rootScope.baiduAccount + "&startOffset=" + semSelected.value + "&endOffset=" + semSelected.value + "&q=" + semQuery).success
                (function (res) {
                    if ($scope.compareEsCompare) {
                        $rootScope.chartTmp[0].quota[1] = res[0][semQuery];
                        cf.renderChart($rootScope.chartTmp, $scope.charts[0].config);
                        return;
                    }
                    $rootScope.chartTmp.forEach(function (item, index) {
                        if (index == 0) {
                            item.key.push("对比数据");
                            item.quota.push(res[0][semQuery]);
                        } else {
                            item.key.push("对比数据");
                            item.quota.push(0);
                        }
                    });
                    cf.renderChart($rootScope.chartTmp, $scope.charts[0].config);
                });
            }

            $scope.compareEsCompare = null;
            $scope.tmpEsCompare = null;
            $scope.esCompareTo = function (esSelected) {
                if (esSelected.value == 100) {
                    $scope.compareReset();
                    return;
                }
                $scope.compareType = true;
                $scope.compareEsCompare = true;
                $scope.tmpEsCompare = esSelected;
                if (!$scope.compareSemCompare) {
                    $rootScope.chartTmp.forEach(function (item) {
                        item.key = item.key.slice(0, 1);
                        item.quota = item.quota.slice(0, 1);
                    });
                }
                var esQuery = $scope.selectedQuota[1];
                $http.get("/api/charts?start=" + esSelected.value + "&end=" + esSelected.value + "&dimension=period&userType=" + $rootScope.userType + "&type=" + esQuery).success
                (function (res) {
                    var json = JSON.parse(eval("(" + res + ")").toString());
                    if (json.length) {
                        //var date = json[0].key[0].substring(0, 10);
                        var count = 0;
                        json[0].quota.forEach(function (item) {
                            if (esQuery == "outRate" || esQuery == "arrivedRate") {
                                count += parseFloat(item);
                            } else {
                                count += item;
                            }
                        });
                        if (esQuery == "outRate" || esQuery == "arrivedRate") {
                            count = parseFloat(count / json[0].quota.length).toFixed(2);
                        }
                        if ($scope.compareSemCompare) {
                            $rootScope.chartTmp[1].quota[1] = count;
                            cf.renderChart($rootScope.chartTmp, $scope.charts[0].config);
                            return;
                        }
                        $rootScope.chartTmp.forEach(function (item, index) {
                            if (index == 1) {
                                item.key.push("对比数据");
                                item.quota.push(count);
                            } else {
                                //item.key.push(date);
                                item.key.push("对比数据");
                                item.quota.push(0);
                            }
                        });
                        //console.log($rootScope.chartTmp);
                        cf.renderChart($rootScope.chartTmp, $scope.charts[0].config);
                    } else {
                        $scope.compareType = false;
                        $scope.compareEsCompare = false;
                        $scope.tmpEsCompare = null;
                        alert("暂无数据");
                    }
                });
            }
            $scope.compareReset = function () {
                $scope.tmpSemCompare = null;
                $scope.tmpEsCompare = null;
                $scope.compareType = false;
                $scope.compareSemCompare = false;
                $scope.compareEsCompare = false;
                $scope.initGrid($scope.selectedQuota[0], $scope.selectedQuota[1]);
            }

            // 通过效果指标获取搜索结果
            $scope.doSearchByEffectQuota = function (type) {
                var interval = 24;
                if ($scope.day_offset == -7 || $scope.day_offset == -30)
                    interval = -$scope.day_offset;
                $http({
                    method: 'GET',
                    url: "/api/survey/?start=" + $rootScope.start + "&end=" + $rootScope.end + "&type=" + type + "&int=" + interval + "&qtype=" + $scope.effectQuota_
                }).success(function (data, status) {
                    data = JSON.parse(eval('(' + data + ')').toString());

                    $scope.effectDataArray.length = 0;
                    $scope.timePeriod.length = 0;

                    data.forEach(function (result) {
                        result.quota.forEach(function (item) {
                            $scope.effectDataArray.push(item);
                        });
                    });

                    data.forEach(function (result) {
                        result.key.forEach(function (item) {
                            $scope.timePeriod.push(item);
                        });
                    });

                }).error(function (error) {
                    console.log(error);
                });
            };

            // 线型图的时间段
            $scope.timePeriod = [];


            $scope.surveyData1 = [];

            // 推广概况获取
            $scope.doSearch = function (startDate, endDate, type) {
                $http({
                    method: 'GET',
                    url: '/api/survey/1?start=' + startDate + "&end=" + endDate + "&type=" + type
                }).success(function (data, status) {
                    $scope.surveyData1 = [];
                    var obj = {};
                    data.forEach(function (item) {
                        obj[item.label] = item.quota[0];
                        if (item.label == "avgTime") {
                            obj[item.label] = ad.formatFunc(item.quota[0], "avgTime")
                        }
                    });
                    obj["arrivedRate"] = obj["arrivedRate"] == undefined ? "--" : obj["arrivedRate"];
                    obj["outRate"] = (obj["outRate"] == undefined ? "--" : obj["outRate"] + "%");
                    obj["pv"] = obj["pv"] == undefined ? "--" : obj["pv"];
                    obj["avgTime"] = obj["avgTime"] == undefined ? "--" : obj["avgTime"];
                    obj["avgPage"] = obj["avgPage"] == undefined ? "--" : obj["avgPage"];
                    obj["vc"] = obj["vc"] == undefined ? "--" : obj["vc"];

                    $scope.surveyData1.push(obj);

                    $scope.getSemAccountData($rootScope.user, $rootScope.baiduAccount, "account", -1, -1, 0);
                }).error(function (error) {
                    console.log(error);
                });
            };

            // 帐户实时数据报告
            $scope.getSemAccountData = function (user, baiduAccount, type, startOffset, endOffset, device) {

                var url = SEM_API_URL + "/sem/report/" + type + "?a=" + user + "&b=" + baiduAccount + "&startOffset=" + startOffset + "&endOffset=" + endOffset + "&device=" + device;
                $http({
                    method: 'GET',
                    url: url
                }).success(function (data, status) {
                    var obj = $scope.surveyData1[0];
                    obj["category"] = "昨日";
                    if (data[0]) {
                        obj["cost"] = data[0].cost;
                        obj["impression"] = data[0].impression;
                        obj["click"] = data[0].click;
                    } else {
                        obj["cost"] = 0;
                        obj["impression"] = 0;
                        obj["click"] = 0;
                    }
                    $scope.gridOptions.data = [obj];
                });
            };

            $scope.contains = function (orgStr, subStr, isIgnoreCase) {
                if (isIgnoreCase) {
                    orgStr = orgStr.toLowerCase();
                    subStr = subStr.toLowerCase();
                }
                var startChar = subStr.substring(0, 1);
                var strLen = subStr.length;
                for (var j = 0, l = orgStr.length - strLen + 1; j < l; j++) {
                    if (orgStr.charAt(j) == startChar) { //如果匹配起始字符, 开始查找
                        if (orgStr.substring(j, j + strLen) == subStr) { //如果从j开始的字符与str匹配, ok
                            return true;
                        }
                    }
                }
                return false;
            };

            // =============== 推广概况底部表格数据展示 ===============

            $scope.reloadGrid = function () {
                $scope.columns1.splice($scope.columns1.length - 1, 1);
                $scope.columns1.splice($scope.columns1.length - 1, 1);
                $scope.columns2.splice($scope.columns2.length - 1, 1);
                $scope.columns2.splice($scope.columns2.length - 1, 1);
                $scope.columns3.splice($scope.columns3.length - 1, 1);
                $scope.columns3.splice($scope.columns3.length - 1, 1);
                $scope.columns4.splice($scope.columns4.length - 1, 1);
                $scope.columns4.splice($scope.columns4.length - 1, 1);

                $scope.columns1.push({
                    name: $scope.quotaMap.get($scope.outQuota_),
                    displayName: $scope.quotaMap.get($scope.outQuota_),
                    field: $scope.outQuota_
                });
                $scope.columns1.push({
                    name: $scope.quotaMap.get($scope.effectQuota_),
                    displayName: $scope.quotaMap.get($scope.effectQuota_),
                    field: $scope.effectQuota_
                });

                $scope.columns2.push({
                    name: $scope.quotaMap.get($scope.outQuota_),
                    displayName: $scope.quotaMap.get($scope.outQuota_),
                    field: $scope.outQuota_
                });
                $scope.columns2.push({
                    name: $scope.quotaMap.get($scope.effectQuota_),
                    displayName: $scope.quotaMap.get($scope.effectQuota_),
                    field: $scope.effectQuota_
                });

                $scope.columns3.push({
                    name: $scope.quotaMap.get($scope.outQuota_),
                    displayName: $scope.quotaMap.get($scope.outQuota_),
                    field: $scope.outQuota_
                });
                $scope.columns3.push({
                    name: $scope.quotaMap.get($scope.effectQuota_),
                    displayName: $scope.quotaMap.get($scope.effectQuota_),
                    field: $scope.effectQuota_
                });

                $scope.columns4.push({
                    name: $scope.quotaMap.get($scope.outQuota_),
                    displayName: $scope.quotaMap.get($scope.outQuota_),
                    field: $scope.outQuota_
                });
                $scope.columns4.push({
                    name: $scope.quotaMap.get($scope.effectQuota_),
                    displayName: $scope.quotaMap.get($scope.effectQuota_),
                    field: $scope.effectQuota_
                });

                // refresh grid data
                // TODO replace trackId
                $scope.loadGridOptions1Data($rootScope.user, $rootScope.baiduAccount, "account", $scope.start, $scope.end, -1, 2);
                $scope.loadGridOptions2Data($rootScope.user, $rootScope.baiduAccount, "account", $scope.start, $scope.end, -1, 2);
                $scope.loadGridOptions3Data($rootScope.user, $rootScope.baiduAccount, "account", $scope.start, $scope.end, 2);
                $scope.loadGridOptions4Data($rootScope.user, $rootScope.baiduAccount, "region", $scope.start, $scope.end, -1, 2);
            };

            $scope.gridOptions1Data = [];
            $scope.gridOptions2Data = [];
            $scope.gridOptions3Data = [];
            $scope.gridOptions4Data = [];

            $scope.columns1 = [
                {name: '全部推广方式 - 推广账户', field: "accountName"},
                {name: '消费', field: "cost"},
                {name: '访问次数', field: "vc"}
            ];

            $scope.gridOptions1 = {
                enableColumnMenus: false,
                enableSorting: false,
                enableScrollbars: false,
                enableGridMenu: false,
                enableHorizontalScrollbar: 0,
                enableVerticalScrollbar: 0,
                columnDefs: $scope.columns1

            };

            $scope.loadGridOptions1Data = function (user, baiduAccount, type, startOffset, endOffset, device, esType) {

                var url = SEM_API_URL + "/sem/report/" + type + "?a=" + user + "&b=" + baiduAccount + "&startOffset=" + startOffset + "&endOffset=" + endOffset + "&device=" + device;
                $http({
                    method: 'GET',
                    url: url
                }).success(function (data, status) {
                    var _obj = {};
                    if (data[0]) {
                        _obj["accountName"] = data[0].accountName;
                    } else {
                        _obj["accountName"] = '';
                    }
                    var _val = 0;
                    if (data.length) {
                        data.forEach(function (item) {
                            _val += parseFloat(item[$scope.outQuota_]);
                        });
                        if ($scope.outQuota_ == "cpc" || $scope.outQuota_ == "ctr")_val = parseFloat(_val / data.length).toFixed(2);
                    } else {
                        if (data[0]) {
                            _val = data[0][$scope.outQuota_];
                        } else {
                            _val = 0;
                        }
                    }
                    _obj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? parseFloat(_val).toFixed(2) + "%" : (_val == 0 ? 0 : parseFloat(_val).toFixed(2));
//                    _obj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? parseFloat(_val).toFixed(2) + "%" : parseFloat(_val).toFixed(2);
                    $scope.gridOptions1Data = [];
                    $scope.gridOptions1Data.push(_obj);

                    $http({
                        method: 'GET',
                        url: '/api/survey/1?start=' + -1 + "&end=" + -1 + "&type=" + esType
                    }).success(function (data, status) {
                        var obj = {};
                        data.forEach(function (item) {
                            obj[item.label] = item.quota[0];
                        });

                        if (data.length == 0)
                            obj[$scope.effectQuota_] = "--";

                        $scope.gridOptions1Data[0][$scope.effectQuota_] = (($scope.effectQuota_ == "outRate" || $scope.effectQuota_ == "arrivedRate") && obj[$scope.effectQuota_] != "--") ? obj[$scope.effectQuota_] + "%" : obj[$scope.effectQuota_];
                        $scope.gridOptions1.data = $scope.gridOptions1Data;
                    }).error(function (error) {
                        console.log(error);
                    });

                });
            };

            $scope.columns2 = [
                {name: '全部推广方式 - 推广方式', field: "way"},
                {name: '消费', field: "cost"},
                {name: '访问次数', field: "vc"}
            ];

            $scope.gridOptions2 = {
                enableColumnMenus: false,
                enableSorting: false,
                enableScrollbars: false,
                enableGridMenu: false,
                enableHorizontalScrollbar: 0,
                enableVerticalScrollbar: 0,
                columnDefs: $scope.columns2

            };

            $scope.loadGridOptions2Data = function (user, baiduAccount, type, startOffset, endOffset, device, esType) {
                var url = SEM_API_URL + "/sem/report/" + type + "?a=" + user + "&b=" + baiduAccount + "&startOffset=" + startOffset + "&endOffset=" + endOffset + "&device=" + device;
                $http({
                    method: 'GET',
                    url: url
                }).success(function (data, status) {
                    var _obj = {};
                    if (data[0]) {
                        _obj["way"] = "搜索推广(" + data[0].accountName + ")";
                    } else {
                        _obj["way"] = "搜索推广()";
                    }

                    var _val = 0;
                    if (data.length) {
                        data.forEach(function (item) {
                            _val += parseFloat(item[$scope.outQuota_]);
                        });
                        if ($scope.outQuota_ == "cpc" || $scope.outQuota_ == "ctr")_val = parseFloat(_val / data.length).toFixed(2);
                    } else {
                        if (data[0]) {
                            _val = data[0][$scope.outQuota_];
                        } else {
                            _val = 0;
                        }
                    }
                    _obj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? parseFloat(_val).toFixed(2) + "%" : (_val == 0 ? 0 : parseFloat(_val).toFixed(2));
                    $scope.gridOptions2Data = [];
                    $scope.gridOptions2Data.push(_obj);

                    $http({
                        method: 'GET',
                        url: '/api/survey/1?start=' + -1 + "&end=" + -1 + "&type=" + esType
                    }).success(function (data, status) {
                        var obj = {};
                        data.forEach(function (item) {
                            obj[item.label] = item.quota[0];
                        });

                        if (data.length == 0)
                            obj[$scope.effectQuota_] = "--";

                        $scope.gridOptions2Data[0][$scope.effectQuota_] = (($scope.effectQuota_ == "outRate" || $scope.effectQuota_ == "arrivedRate")&& obj[$scope.effectQuota_] != "--") ? obj[$scope.effectQuota_] + "%" : obj[$scope.effectQuota_];
                        $scope.gridOptions2.data = $scope.gridOptions2Data;
                    }).error(function (error) {
                        console.log(error);
                    });

                });
            };

            $scope.columns3 = [
                {name: '全部推广方式 - 设备', field: "device"},
                {name: '消费', field: "cost"},
                {name: '访问次数', field: "vc"}
            ];

            $scope.gridOptions3 = {
                enableColumnMenus: false,
                enableSorting: false,
                enableScrollbars: false,
                enableGridMenu: false,
                enableHorizontalScrollbar: 0,
                enableVerticalScrollbar: 0,
                columnDefs: $scope.columns3

            };

            $scope.loadGridOptions3Data = function (user, baiduAccount, type, startOffset, endOffset, esType) {
                var semPCRequest = $http.get(SEM_API_URL + "/sem/report/" + type + "?a=" + user + "&b=" + baiduAccount + "&startOffset=" + startOffset + "&endOffset=" + endOffset + "&device=0");
                var semMobileRequest = $http.get(SEM_API_URL + "/sem/report/" + type + "?a=" + user + "&b=" + baiduAccount + "&startOffset=" + startOffset + "&endOffset=" + endOffset + "&device=1");
                var esPCRequest = $http.get("/api/survey/2?start=" + startOffset + "&end=" + endOffset + "&type=" + esType + "&filter=" + JSON.stringify([{"pm": [0]}]));
                var esMobileRequest = $http.get("/api/survey/2?start=" + startOffset + "&end=" + endOffset + "&type=" + esType + "&filter=" + JSON.stringify([{"pm": [1]}]));

                $q.all([semPCRequest, semMobileRequest, esPCRequest, esMobileRequest]).then(function (result) {
                    var tmp = [];
                    angular.forEach(result, function (response) {
                        tmp.push(response.data);
                    });
                    return tmp;
                }).then(function (tmpResult) {
                    var pcObj = {};
                    pcObj["device"] = "计算机";
                    var _val = 0;
                    if (tmpResult[0].length) {
                        tmpResult[0].forEach(function (item) {
                            _val += parseFloat(item[$scope.outQuota_]);
                        });
                        if ($scope.outQuota_ == "cpc" || $scope.outQuota_ == "ctr")_val = parseFloat(_val / tmpResult[0].length).toFixed(2);
                    } else {
                        if (tmpResult[0][0]) {
                            _val = tmpResult[0][0][$scope.outQuota_];
                        } else {
                            _val = 0;
                        }
                    }
                    pcObj[$scope.outQuota_] = parseFloat(_val).toFixed(2);
                    pcObj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? pcObj[$scope.outQuota_] + "%" : (_val == 0 ? 0 : parseFloat(_val).toFixed(2));
//                    pcObj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? pcObj[$scope.outQuota_] + "%" : pcObj[$scope.outQuota_];
                    pcObj[$scope.effectQuota_] = tmpResult[2][0] + "" == "undefined" ? "--" : tmpResult[2][0].quota[0];
                    pcObj[$scope.effectQuota_] = (($scope.effectQuota_ == "outRate" || $scope.effectQuota_ == "arrivedRate") && pcObj[$scope.effectQuota_] != "--") ? pcObj[$scope.effectQuota_] + "%" : pcObj[$scope.effectQuota_];
                    $scope.gridOptions3Data = [];
                    $scope.gridOptions3Data.push(pcObj);


                    var mobileObj = {};
                    mobileObj["device"] = "移动设备";
                    var _val = 0;
                    if (tmpResult[1].length) {
                        tmpResult[1].forEach(function (item) {
                            _val += parseFloat(item[$scope.outQuota_]);
                        });
                        if ($scope.outQuota_ == "cpc" || $scope.outQuota_ == "ctr")_val = parseFloat(_val / tmpResult[1].length).toFixed(2);
                    } else {
                        if (tmpResult[1][0]) {
                            _val = tmpResult[1][0][$scope.outQuota_];
                        } else {
                            _val = 0;
                        }
                    }
                    mobileObj[$scope.outQuota_] = parseFloat(_val).toFixed(2);
                    mobileObj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? mobileObj[$scope.outQuota_] + "%" : (_val == 0 ? 0 : parseFloat(_val).toFixed(2));
//                    mobileObj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? mobileObj[$scope.outQuota_] + "%" : mobileObj[$scope.outQuota_];
                    mobileObj[$scope.effectQuota_] = tmpResult[3][0] + "" == "undefined" ? "--" : tmpResult[3][0].quota[0];
                    mobileObj[$scope.effectQuota_] = (($scope.effectQuota_ == "outRate" || $scope.effectQuota_ == "arrivedRate") && mobileObj[$scope.effectQuota_] != "--") ? mobileObj[$scope.effectQuota_] + "%" : mobileObj[$scope.effectQuota_];
                    $scope.gridOptions3Data.push(mobileObj);
                    $scope.gridOptions3.data = $scope.gridOptions3Data;

                });
            };

            $scope.columns4 = [
                {name: '全部推广方式 - 地域', field: "region"},
                {name: '消费', field: "cost"},
                {name: '访问次数', field: "vc"}
            ];

            $scope.gridOptions4 = {
                enableColumnMenus: false,
                enableSorting: false,
                enableScrollbars: false,
                enableGridMenu: false,
                enableHorizontalScrollbar: 0,
                enableVerticalScrollbar: 0,
                columnDefs: $scope.columns4
            };

            $scope.loadGridOptions4Data = function (user, baiduAccount, type, startOffset, endOffset, device, esType) {
                var semRegionRequest = $http.get(SEM_API_URL + "/sem/report/" + type + "?a=" + user + "&b=" + baiduAccount + "&startOffset=" + startOffset + "&endOffset=" + endOffset);
                var esRegionRequest = $http.get("/api/survey/3?start=" + startOffset + "&end=" + endOffset + "&type=" + esType);

                $q.all([semRegionRequest, esRegionRequest]).then(function (result) {
                    var tmp = [];
                    angular.forEach(result, function (response) {
                        tmp.push(response.data);
                    });
                    return tmp;
                }).then(function (tmpResult) {
                    tmpResult[0].sort(chartUtils.by($scope.selectedQuota[0]));
                    $scope.gridOptions4Data = [];
                    tmpResult[0].forEach(function (item) {
                        if (!(tmpResult[1][0] + "" == "undefined")) {
                            var esRegionArr = tmpResult[1][0].key;
                            var regionName = item.regionName;
                            if ($scope.contains(esRegionArr.toString(), regionName, true)) {
                                for (var i = 0, l = esRegionArr.length; i < l; i++) {
                                    if (esRegionArr[i].replace("市", "") == regionName) {
                                        var obj = {};
                                        obj["region"] = regionName;
                                        obj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? item[$scope.outQuota_] + "%" : item[$scope.outQuota_];
                                        obj[$scope.effectQuota_] = tmpResult[1][0].quota[i];
                                        obj[$scope.effectQuota_] = ($scope.effectQuota_ == "outRate" || $scope.effectQuota_ == "arrivedRate") ? obj[$scope.effectQuota_] + "%" : obj[$scope.effectQuota_];
                                        $scope.gridOptions4Data.push(obj);
                                    }
                                }
                            }
                        } else {
                            var _obj = {};
                            _obj["region"] = item.regionName;
                            _obj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? item[$scope.outQuota_] + "%" : (item[$scope.outQuota_] == 0 ? 0 : parseFloat(item[$scope.outQuota_]).toFixed(2));
//                            _obj[$scope.outQuota_] = $scope.outQuota_ == "ctr" ? item[$scope.outQuota_] + "%" : item[$scope.outQuota_];
                            _obj[$scope.effectQuota_] = 0;
                            $scope.gridOptions4Data.push(_obj);
                        }
                    });
                    $scope.gridOptions4.data = $scope.gridOptions4Data;

                });

            };
            // ===================================================


            // 初始化操作
            $scope.init = function (trackId) {
                $scope.quotaMap = new Map();
                $scope.quotaMap.put("pv", "浏览量(PV)");
                $scope.quotaMap.put("vc", "访问次数");
                $scope.quotaMap.put("outRate", "跳出率");
                $scope.quotaMap.put("pageConversion", "页面转化");
                $scope.quotaMap.put("arrivedRate", "抵达率");
                $scope.quotaMap.put("avgTime", "平均访问时长");
                $scope.quotaMap.put("avgPage", "平均访问页数");
                $scope.quotaMap.put("cost", "消费");
                $scope.quotaMap.put("impression", "展现量");
                $scope.quotaMap.put("click", "点击量");
                $scope.quotaMap.put("ctr", "点击率");
                $scope.quotaMap.put("cpc", "平均点击价格");

                $scope.doSearch($rootScope.start, $rootScope.end, trackId);
                $scope.loadGridOptions1Data($rootScope.user, $rootScope.baiduAccount, "account", $rootScope.start, $rootScope.end, -1, trackId);
                $scope.loadGridOptions2Data($rootScope.user, $rootScope.baiduAccount, "account", $rootScope.start, $rootScope.end, -1, trackId);
                $scope.loadGridOptions3Data($rootScope.user, $rootScope.baiduAccount, "account", $rootScope.start, $rootScope.end, trackId);
                $scope.loadGridOptions4Data($rootScope.user, $rootScope.baiduAccount, "region", $rootScope.start, $rootScope.end, -1, trackId);
            };

            $scope.refreshGrid = function (trackId) {
                $scope.doSearch($rootScope.start, $rootScope.end, trackId);
                $scope.loadGridOptions1Data($rootScope.user, $rootScope.baiduAccount, "account", $rootScope.start, $rootScope.end, -1, trackId);
                $scope.loadGridOptions2Data($rootScope.user, $rootScope.baiduAccount, "account", $rootScope.start, $rootScope.end, -1, trackId);
                $scope.loadGridOptions3Data($rootScope.user, $rootScope.baiduAccount, "account", $rootScope.start, $rootScope.end, trackId);
                $scope.loadGridOptions4Data($rootScope.user, $rootScope.baiduAccount, "region", $rootScope.start, $rootScope.end, -1, trackId);
            }
            // initialize
            $scope.init($rootScope.userType);
        }
    )
    ;
});
