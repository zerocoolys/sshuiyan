/**
 * Created by Fzk lwek on 2015/5/27.
 */
define(["../module"], function (app) {

    "use strict";

    app.controller("admintablectr", function ($timeout, $scope, $rootScope, $http, $cookieStore) {
        $rootScope.adminIndicators = function (item, entities, number, refresh) {
            console.log("adminIndicators");
            $rootScope.gridArray.shift();
            $rootScope.gridArray.shift();
            if (refresh == "refresh") {
                $rootScope.gridArray.unshift($rootScope.tableSwitch.latitude);
                return
            }
            $rootScope.tableSwitch.number != 0 ? $scope.gridArray.shift() : "";
            $scope.gridObj = {};
            $scope.gridObjButton = {};
            var a = $rootScope.checkedArray.indexOf(item.name);
            if (a != -1) {
                $rootScope.checkedArray.splice(a, 1);
                $rootScope.gridArray.splice(a, 1);

                if ($rootScope.tableSwitch.number != 0) {
                    $scope.gridObjButton["name"] = " ";
                    $scope.gridObjButton["cellTemplate"] = $scope.gridBtnDivObj;
                    $rootScope.gridArray.unshift($scope.gridObjButton);
                }
                $rootScope.gridArray.unshift($rootScope.tableSwitch.latitude);
            } else {
                if ($rootScope.checkedArray.length >= number) {
                    $rootScope.checkedArray.shift();
                    $rootScope.checkedArray.push(item.name);
                    $rootScope.gridArray.shift();

                    $scope.gridObj["name"] = item.consumption_name;
                    $scope.gridObj["displayName"] = item.consumption_name;
                    $scope.gridObj["field"] = item.name;

                    $rootScope.gridArray.push($scope.gridObj);

                    if ($rootScope.tableSwitch.number != 0) {
                        $scope.gridObjButton["name"] = " ";
                        $scope.gridObjButton["cellTemplate"] = $scope.gridBtnDivObj;
                        $rootScope.gridArray.unshift($scope.gridObjButton);
                    }

                    $rootScope.gridArray.unshift($rootScope.tableSwitch.latitude);
                    $scope.gridObjButton = {};
                    $scope.gridObjButton["name"] = "xl";
                    $scope.gridObjButton["displayName"] = "";
                    $scope.gridObjButton["cellTemplate"] = "<div class='table_xlh'>{{grid.appScope.getIndex(this)}}</div>";
                    $scope.gridObjButton["maxWidth"] = 10;
                    $rootScope.gridArray.unshift($scope.gridObjButton);
                } else {
                    $rootScope.checkedArray.push(item.name);

                    $scope.gridObj["name"] = item.consumption_name;
                    $scope.gridObj["displayName"] = item.consumption_name;
                    $scope.gridObj["field"] = item.name;
                    $rootScope.gridArray.push($scope.gridObj);

                    if ($rootScope.tableSwitch.number != 0) {
                        $scope.gridObjButton["name"] = " ";
                        $scope.gridObjButton["cellTemplate"] = $scope.gridBtnDivObj;
                        $rootScope.gridArray.unshift($scope.gridObjButton);
                    }
                    $rootScope.gridArray.unshift($rootScope.tableSwitch.latitude);
                    $scope.gridObjButton = {};
                    $scope.gridObjButton["name"] = "xl";
                    $scope.gridObjButton["displayName"] = "";
                    $scope.gridObjButton["cellTemplate"] = "<div class='table_xlh'>{{grid.appScope.getIndex(this)}}</div>";
                    $scope.gridObjButton["maxWidth"] = 10;
                    $rootScope.gridArray.unshift($scope.gridObjButton);
                }
            }
            angular.forEach(entities, function (subscription, index) {
                if (subscription.name == item.name) {
                    $scope.classInfo = 'current';
                }
            });
            //$rootScope.$broadcast("ssh_reload_datashow");
        };
        //
        if (typeof($rootScope.checkedArray) != undefined && $scope.tableJu == "html") {
            $scope.gridOptions = {
                paginationPageSize: 25,
                expandableRowTemplate: "<div ui-grid='row.entity.subGridOptions'></div>",
                expandableRowHeight: 360,
                enableColumnMenus: false,
                enablePaginationControls: false,
                enableSorting: true,
                enableGridMenu: false,
                enableHorizontalScrollbar: 0,
                columnDefs: $rootScope.gridArray,
                onRegisterApi: function (girApi) {
                    $scope.gridApi2 = girApi;
                    adminGriApihtml(girApi);
                }
            };
        } else {
            $scope.gridOptions = {
                paginationPageSize: 25,
                expandableRowTemplate: "<div ui-grid='row.entity.subGridOptions'></div>",
                expandableRowHeight: 360,
                enableColumnMenus: false,
                enablePaginationControls: false,
                enableSorting: true,
                enableGridMenu: false,
                enableHorizontalScrollbar: 0,
                columnDefs: $rootScope.gridArray,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi2 = gridApi;
                    adminGriApiInfo(gridApi);
                }
            };
        }

        //////DENG

        /**
         * 初始化数据
         */
        var refushGridData = function () {
            var uid = $cookieStore.get("uid");
            var site_id = $rootScope.userType;
            var url = "/config/site_list?index=site_list&type=search&query={\"uid\":\"" + uid + "\"}";
            $http({
                method: 'GET',
                url: url
            }).success(function (dataConfig, status) {
                $scope.gridOptions.data = dataConfig;
            });
        };
        refushGridData();
        $scope.page = "";
        $scope.pagego = function (pagevalue) {
            pagevalue.pagination.seek(Number($scope.page));
        };
        //配置展开巷HTML
        var adminGriApiInfo = function (gridApi) {
            $scope.gridOpArray = angular.copy($rootScope.gridArray);
            gridApi.expandable.on.rowExpandedStateChanged($scope, function (row) {
                console.log(row);
                var tempHtml=$rootScope.adminSetHtml.replace('ex_track_id', row.entity.track_id);//替换
                var data = [{
                    name: "p",
                    displayName: "",
                    field: 'info',
                    cellTemplate: tempHtml
                }];

                row.entity.subGridOptions = {
                    showHeader: false,
                    columnDefs: data
                };
                row.entity.subGridOptions.data = [{"info": " "}];
            })
        }
        ////
        var adminGriApihtml = function (gridApi) {
            var htmlData = [];
            gridApi.expandable.on.rowExpandedStateChanged($scope, function (row) {
                row.entity.subGridOptions = {
                    showHeader: false,
                    enableHorizontalScrollbar: 0,
                    columnDefs: htmlData
                };
                var res = {};
                res["name"] = "test";
                res["field"] = "info";
                res["cellTemplate"] = $rootScope.adminSetHtml;
                htmlData.push(res);
                row.entity.subGridOptions.data = [{"info": " "}];
            });
        };
        $scope.getDiv = function (a) {
            console.log(a);
        }
        ///////////
    });
});