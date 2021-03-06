/**
 * Created by john on 2015/3/31.
 */
define(["./module"], function (ctrs) {
    ctrs.controller("provincemapctr", function ($scope, uiGridConstants, $rootScope, $http, $cookieStore,areaService, $location, $stateParams, $state) {
        $scope.allBrowsers = angular.copy($rootScope.browsers);
        //        高级搜索提示
        $scope.sourceSearch = "";
        $scope.visitorSearch = "";
//        取消显示的高级搜索的条件
        $scope.removeSourceSearch = function (obj) {
            $scope.souce.selected = {"name": "全部"};
            $rootScope.$broadcast("loadAllSource");
            obj.sourceSearch = "";
        }
        $scope.removeVisitorSearch = function (obj) {
            $rootScope.$broadcast("loadAllVisitor");
            obj.visitorSearch = "";
        }

        if ($location.url().split("?").length > 1) {
            var param = $location.url().split("?")[1];
            if (param == 1) {
                $scope.todayClass = true;
            } else if (param == 2) {
                $scope.yesterdayClass = true;

            } else if (param == 3) {
                $scope.sevenDayClass = true;
            } else if (param == 4) {
                $scope.monthClass = true;
            }
        } else {
            $scope.todayClass = true;
        }
        $scope.souce.selected = {"name": "全部"};
        $scope.browser.selected = {"name": "全部"};
        $rootScope.tableTimeStart = 0;//开始时间
        $rootScope.tableTimeEnd = 0;//结束时间、
        $rootScope.tableFormat = null;
        //配置默认指标
        $rootScope.checkedArray = ["pv", "uv", "outRate"];
        $rootScope.gridArray = [
            {
                name: "a",
                displayName: "",
                cellTemplate: "<div class='table_xlh'>{{grid.appScope.getIndex(this)}}</div>",
                maxWidth: 10,
                enableSorting: false
            },
            {
                name: "地域",
                displayName: "地域",
                footerCellTemplate: "<div class='ui-grid-cell-contents'>当页汇总</div>",
                field: "region",
                enableSorting: false
            },
            {
                name: " ",
                cellTemplate: "<div class='table_box'><a ng-click='grid.appScope.getHistoricalTrend(this, \"history1\")' target='_parent' class='table_nextbtn' title='查看历史趋势'></a></div>",
                enableSorting: false
            },
            {
                name: "浏览量(PV)",
                displayName: "浏览量(PV)",
                footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getFooterData(this,grid.getVisibleRows())}}</div>",
                sort: {
                    direction: uiGridConstants.DESC,
                    priority: 1
                },
                field: "pv"
            },
            {
                name: "访客数(UV)",
                displayName: "访客数(UV)",
                footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getFooterData(this,grid.getVisibleRows())}}</div>",
                field: "uv"
            },
            {
                name: "跳出率",
                displayName: "跳出率",
                footerCellTemplate: "<div class='ui-grid-cell-contents'>{{grid.appScope.getFooterData(this,grid.getVisibleRows())}}</div>",
                field: "outRate"
            }
        ];
        $rootScope.tableSwitch = {
            latitude: {name: "地域", displayName: "地域", field: "region"},
            tableFilter: $stateParams.data != undefined && $stateParams.data != null && $stateParams.data != "" ? "[{\"region\":[\"" + $stateParams.data + "\"]}]" : null,
            dimen: "city",
            // 0 不需要btn ，1 无展开项btn ，2 有展开项btn
            number: 1,
            //当number等于2时需要用到coding参数 用户配置弹出层的显示html 其他情况给false
            coding: false,
            //coding:"<li><a href='http://www.best-ad.cn'>查看历史趋势</a></li><li><a href='http://www.best-ad.cn'>查看入口页连接</a></li>"
            arrayClear: false //是否清空指标array
        };
        $scope.isShowExpandable = function (e) {
            return e.region == "暂无数据";
        };

        $scope.dateTimeStart = 0;
        $scope.dateTimeEnd = 0;

        $scope.$on("ssh_refresh_charts", function (e, msg) {
            $rootScope.targetSearch();
            $scope.tableTimeStart = $rootScope.start;
            $scope.tableTimeEnd = $rootScope.end;
            $scope.doSearchAreas($scope.tableTimeStart, $scope.tableTimeEnd, $rootScope.userType, $scope.mapOrPieConfig);
        });

        $scope.gridOptions = {
            enableScrollbars: false,
            enableHorizontalScrollbar: 0,
            enableVerticalScrollbar: 0,
            columnDefs: [
                {name: '地域', displayName: "地域"},
                {name: '访问时间', displayName: "访问时间"},
                {name: '来源', displayName: "来源"},
                {name: '访问IP', displayName: "访问IP"},
                {name: '访问时长', displayName: "访问时长"},
                {name: '访问页数', displayName: "访问页数"}
            ]
        };
        //$scope.pieHover = function (params) {
        //
        //}
        $scope.mapOrPieConfig = {
            chartId: "VistorMap_charts",
            serieName: "地域分布"
            //pieHover: $scope.pieHover
        }

        $scope.areas = "region";
        $scope.property = "loc";

        $scope.setProperty = function (property, position, entities) {
            $scope.property = property;
            $scope.doSearchAreas($rootScope.start, $rootScope.end, $rootScope.userType, $scope.mapOrPieConfig);
        }

        $scope.setArea = function (area) {
            $scope.areas = area;
            $scope.doSearchAreas()
        };
        $scope.lat = "region";
        $scope.setLat = function (lat) {
            if (lat == undefined) {
                $scope.lat = "region";
            } else {
                $scope.lat = lat;
            }
        }
        /**
         * 基础数据
         * @param start
         * @param end
         * @param areas  地域分组
         * @param property  数据统计
         * @param type
         */
        $scope.doSearch = function (start, end, type) {
            var quotas = [];
            quotas.push("pv");
            quotas.push("uv");
            quotas.push("ip");
            quotas.push("outRate");
            quotas.push("avgTime");
            $http({
                method: 'GET',
                url: '/api/visitormap/?start=' + start + "&end=" + end + "&type=" + type + "&quotas=" + quotas
            }).success(function (data, status) {
                $scope.pv = data.pv;
                $scope.uv = data.uv;
                $scope.ip = data.ip;
                $scope.jump = data.outRate;
                $scope.avgTime = data.avgTime;
            }).error(function (error) {
                console.log(error);
            });
        };


        //图表数据
        $scope.doSearchAreas = function (start, end, type, chartConfig) {
            var dataValueSum = 0;
            var title_name;
            var chart = echarts.init(document.getElementById(chartConfig.chartId));
            window.onresize = chart.resize;//charts 自适应
            chart.showLoading({
                text: "正在努力的读取数据中...",
                effect: 'whirling',
                textStyle: {
                    fontSize: 12
                }
            });
            var jupName = "";
            chart.on("hover", function (param) {
                var option = this.getOption();
                var mapSeries = option.series[0];
                if (param.seriesIndex == 1) {
                    var data = [];
                    if (jupName == param.name) {
                        return;
                    }
                    jupName = param.name;
                    for (var p = 0, len = mapSeries.data.length; p < len; p++) {
                        var name = mapSeries.data[p].name;
                        if (mapSeries.data[p].name == param.name) {
                            data.push({
                                name: name,
                                value: option.series[0].data[p].value,
                                /*tooltip: function (params) {
                                 var returnValue = 0
                                 if (parseInt(params.value) != 0 && !isNaN(params.value)) {
                                 returnValue = ((parseInt(params.value) / dataValueSum) * 100).toFixed(2)
                                 }
                                 var value = "<p>" + params.name + "</p><p>" + title_name + " : " + params.value + "</p><p>占比：" + returnValue + "%</p>";
                                 return value;
                                 },*/
                                selected: true
                            });
                        } else {
                            data.push({
                                name: name,
                                value: option.series[0].data[p].value,
                                selected: false
                            });
                        }
                    }
                    option.series[0].data = data;
                    chart.setOption(option, true);
                }
            });
            var chartOrMapFilter = $stateParams.data != undefined && $stateParams.data != null && $stateParams.data != "" ? $stateParams.data : null;
            $http({
                method: 'GET',
                url: '/api/provincemap/?start=' + start + "&end=" + end + "&type=" + type + "&areas=" + $scope.areas + "&property=" + $scope.property + "&chartFilter=" + chartOrMapFilter
            }).success(function (data, status) {
                switch ($scope.property) {
                    case "loc":
                        title_name = "浏览量(PV)";
                        break;
                    case "tt":
                        title_name = "访问次数";
                        break;
                    case "vid":
                        title_name = "访客数(UV)";
                        break;
                    case "ct":
                        title_name = "新访客数";
                        break;
                    case "remote":
                        title_name = "IP数";
                        break;
                }
                if (data != 0) {
                    data.chart_data.forEach(function (item, i) {
                        dataValueSum += item["value"]
                    });
                }

                data["title_name"] = title_name;
                chart.quota = title_name;
                mixingMap.mapOrPie(data, chart, dataValueSum, title_name);

            }).error(function (error) {
                console.log(error);
            });
        };

        //图标数据

        // init
        $scope.doSearch($scope.dateTimeStart, $scope.dateTimeEnd, $rootScope.userType);
        $scope.doSearchAreas($scope.dateTimeStart, $scope.dateTimeEnd, $rootScope.userType, $scope.mapOrPieConfig);
        if ($stateParams.data != undefined && $stateParams.data != null && $stateParams.data != "") {
            $scope.doSearchAreas($scope.dateTimeStart, $scope.dateTimeEnd, $rootScope.userType, $scope.mapOrPieConfig);
        }
        $scope.mapselect = [
            {consumption_name: "浏览量(PV)"},
            {consumption_name: "访问次数"},
            {consumption_name: "访客数(UV)"},
            {consumption_name: "新访客数"},
            {consumption_name: "新访客比率"},
            {consumption_name: "IP数"}
        ];
        $scope.mapset = function (row) {


        };
        //日历
        this.selectedDates = [new Date().setHours(0, 0, 0, 0)];
        this.type = 'range';
        /*      this.identity = angular.identity;*/

        //日历
        $rootScope.datepickerClick = function (start, end, label) {
            var time = chartUtils.getTimeOffset(start, end);
            $rootScope.tableTimeStart = time[0];
            $rootScope.tableTimeEnd = time[1];
            $rootScope.targetSearch();
            $scope.doSearchAreas($rootScope.tableTimeStart, $rootScope.tableTimeEnd, $rootScope.userType, $scope.mapOrPieConfig);
            $scope.$broadcast("ssh_dateShow_options_time_change");
        }

        //刷新
        $scope.page_refresh = function () {
            $rootScope.start = 0;
            $rootScope.end = 0;
            $rootScope.tableTimeStart = 0;
            $rootScope.tableTimeEnd = 0;
//            $scope.doSearch($scope.dateTimeStart, $scope.dateTimeEnd, $rootScope.userType);
//            $scope.doSearchAreas($scope.dateTimeStart, $scope.dateTimeEnd, $rootScope.userType, $scope.mapOrPieConfig);
            $scope.reloadByCalendar("today");
            $('#reportrange span').html(GetDateStr(0));
            //其他页面表格
//            $rootScope.targetSearch();
            //classcurrent
            $scope.reset();
            $scope.todayClass = true;
        };

        // 构建PDF数据
        $scope.generatePDFMakeData = function (cb) {
            var dataInfo = angular.copy($rootScope.gridApi2.grid.options.data);
            var dataHeadInfo = angular.copy($rootScope.gridApi2.grid.options.columnDefs);
            var _tableBody = $rootScope.getPDFTableBody(dataInfo, dataHeadInfo);
            var docDefinition = {
                header: {
                    text: "Visitor Province Map Data Report",
                    style: "header",
                    alignment: 'center'
                },
                content: [
                    {
                        table: {
                            headerRows: 1,
                            body: _tableBody
                        }
                    },
                    {text: '\nPower by www.best-ad.cn', style: 'header'},
                ],
                styles: {
                    header: {
                        fontSize: 20,
                        fontName: "标宋",
                        alignment: 'justify',
                        bold: true
                    }
                }
            };
            cb(docDefinition);
        };


        //发送邮件功能-初始化数据
        $rootScope.initMailData = function () {
            $http.get("api/saveMailConfig?rt=read&rule_url=" + $rootScope.mailUrl[14] + "").success(function (result) {
                if (result) {
                    var ele = $("ul[name='sen_form']");
                    formUtils.rendererMailData(result, ele);
                }
            });
        }
        //发送邮件功能-确定发送
        $scope.sendConfig = function () {
            var formData = formUtils.vaildateSubmit($("ul[name='sen_form']"));
            var result = formUtils.validateEmail(formData.mail_address, formData);
            if (result.ec) {
                alert(result.info);
            } else {
                formData.rule_url = $rootScope.mailUrl[14];
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
        //删除配置信息
        $scope.deleteConfig = function () {
            var formData = formUtils.vaildateSubmit($("ul[name='sen_form']"));
            var result = formUtils.validateEmail(formData.mail_address, formData);
            if (result.ec) {
                alert(result.info);
            } else {
                formData.rule_url = $rootScope.mailUrl[14];
                formData.uid = $cookieStore.get('uid');
                formData.site_id = $rootScope.siteId;
                formData.type_id = $rootScope.userType;

                $http.get("api/deleteMailConfig?data=" + JSON.stringify(formData)).success(function (data) {
                    var result = JSON.parse(eval("(" + data + ")").toString());
                    if (result.ok == 1) {
                        alert("操作成功!");
                        $http.get("api/initSchedule").success(function (result) {
                            if (result) {
                                var ele = $("ul[name='sen_form']");
                                formUtils.initData(ele);
                            }
                        });
                    } else {
                        alert("操作失败!");
                    }
                });
            }
        };


    });

});
