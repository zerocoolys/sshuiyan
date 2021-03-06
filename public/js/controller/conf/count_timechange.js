/**
 * Created by john on 2015/4/1.
 */
define(["./module"], function (ctrs) {
    "use strict";

    ctrs.controller('count_timechange', function ($scope, $http, $rootScope, $cookieStore, ngDialog) {
        //$scope.
        $scope.time_conv = {
            status: false,
            val: 30
        };
         $scope.timeconv=function(val){
            console.log(val)
        };

        $scope.pv_conv = {
            status: false,
            val: 3
        };
        $scope.truefalse = true;
        $scope.truefalsenext = true;
        $scope.onCheckBoxChangeResult = "";
        $scope.onCheckBoxChange = function () {
            if ($scope.time_conv.status == true) {
                $scope.truefalse = false;
            }
            else {
                $scope.truefalse = true;
            }
            if ($scope.pv_conv.status == true) {
                $scope.truefalsenext = false;
            }
            else {
                $scope.truefalsenext = true;
            }
        };
        /**
         * 数据初始化
         */

        var init = function () {
            var uid = $cookieStore.get("uid");
            var site_id = $rootScope.siteId;
            var url = "/config/time_conv?type=search&query={\"uid\":\"" + uid + "\",\"site_id\":\"" + site_id + "\"}";
            $http({
                method: 'GET',
                url: url
            }).success(function (dataConfig, status) {
                if (dataConfig != null && dataConfig.length > 0) {
                    $scope.time_conv = dataConfig[0].time_conv;
                    $scope.pv_conv = dataConfig[0].pv_conv;
                    if ($scope.time_conv.status == true) {
                        $scope.truefalse = false;
                    }
                    else {
                        $scope.truefalse = true;
                    }
                    if ($scope.pv_conv.status == true) {
                        $scope.truefalsenext = false;
                    }
                    else {
                        $scope.truefalsenext = true;
                    }
                }
            });

        };
        init();
        Custom.initCheckInfo();//页面check样式js调用
        $scope.onSubmitClickListener = function () {
            $scope.urlDialog = ngDialog.open({
                template: './conf/Dialog/site_succuss.html',
                className: 'ngdialog-theme-default admin_ngdialog',
                scope: $scope
            });
            var uid = $cookieStore.get("uid");
            var site_id = $rootScope.siteId;//从conf_sites中获取
            var query = "/config/time_conv?type=search&query={\"uid\":\"" + uid + "\",\"site_id\":\"" + site_id + "\"}";
            $http({
                method: 'GET',
                url: query
            }).success(function (dataConfig, status) {
                if (dataConfig == null || dataConfig.length == 0) {//不存在配置 save
                    var entity = "{\"uid\":\"" + uid + "\",\"site_id\":\"" + site_id + "\",\"time_conv\":" + angular.toJson($scope.time_conv) + ",\"pv_conv\":" + angular.toJson($scope.pv_conv) + "}";
                    var url = "/config/time_conv?type=save&entity=" + entity;
                    $http({
                        method: 'GET',
                        url: url
                    }).success(function (dataConfig, status) {

                    });
                } else {//update
                    var updates = "{\"uid\":\"" + uid + "\",\"site_id\":\"" + site_id + "\",\"time_conv\":" + angular.toJson($scope.time_conv) + ",\"pv_conv\":" + angular.toJson($scope.pv_conv) + "}";
                    var url = "/config/time_conv?type=update&query={\"uid\":\"" + uid + "\",\"site_id\":\"" + site_id + "\"}&updates=" + updates;
                    $http({
                        method: 'GET',
                        url: url
                    }).success(function (dataConfig, status) {

                    });

                }

            });
        }
    });
});
