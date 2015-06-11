/**
 * Created by john on 2015/4/1.
 */
define(["./module"], function (ctrs) {
    "use strict";

    ctrs.controller('adtrack', function ($scope, $rootScope, $cookieStore, $http,ngDialog) {

        $scope.adtrack_model = {
            //_id: "", // mongoid
            uid: "", // user id 用户ID
            type_id: "", // es type id ( hidden in front-end) 对应ES ID
            track_id: "", // js track id 随机生成
            targetUrl: "", // 目标URL
            mediaPlatform: "", // 媒体平台
            adTypes: "",    //广告类型
            planName: "", //计划名称
            keywords: "",   //关键词
            creative: "" //创意
        };
        $scope.urlconfig = {
            "targetUrl": "",
            "mediaPlatform": "",
            "adTypes": "",
            "planName": "",
            "keywords": "",
            "creative": ""

        };

        //配置默认指标
        $rootScope.checkedArray = ["_uid","uid", "type_id", "track_id", "site_url", "site_name", "site_pause", "track_status"];
        $rootScope.gridArray = {
            paginationPageSize: 25,
            expandableRowTemplate: "<div ui-grid='row.entity.subGridOptions'></div>",
            expandableRowHeight: 360,
            enableColumnMenus: false,
            enablePaginationControls: false,
            enableSorting: true,
            enableGridMenu: false,
            enableHorizontalScrollbar: 0,
            columnDefs: [
                {name: "目标URL", displayName: "目标URL", field: "targetUrl"},
                {name: "媒体平台", displayName: "媒体平台", field: "mediaPlatform"},
                {name: "广告类型", displayName: "广告类型", field: "adTypes"},
                {name: "计划名称", displayName: "计划名称", field: "planName"},
                {name: "关键词", displayName: "关键词", field: "keywords"},
                {name: "创意", displayName: "创意", field: "creative"},
                {
                    name: "x1",
                    displayName: "",
                    cellTemplate: "<div ng-click='grid.appScope.onViewUrl(index,grid,row)'><a href=''>查看生成的URL</a></div>",
                    maxWidth: 110,
                    cellClass: 'table_admin'
                },
                {
                    name: "x2",
                    displayName: "",
                    cellTemplate: "<div ng-click='grid.appScope.onDelete(index,grid,row)'><a href='' ng-click='onDelete()'>删除</a></div>",
                    maxWidth: 80,
                    cellClass: 'table_admin'
                }
            ],
            data: [{}]
        };

        //删除按钮
        $scope.onDelete = function(index,grid,row){
            var query = "/config/adtrack?type=delete&query={\"_id\":\"" + row.entity._id +  "\"}";
            $http({
                method: 'GET',
                url: query
            }).success(function (dataConfig, status) {
                refushGridData();
            });
        };
        var refushGridData = function () {
            var uid = $cookieStore.get("uid");
            var site_id = $rootScope.userType;
            var url = "/config/adtrack?index=adtrack&type=search&query={\"uid\":\"" + uid + "\"}";
            $http({
                method: 'GET',
                url: url
            }).success(function (dataConfig, status) {
                $scope.gridArray.data = dataConfig;
            });
        };
        refushGridData();
        $scope.onViewUrl=function(index,grid,row){

            $scope.urlDialog = ngDialog.open({
                template:$rootScope.urlDialogHtml,
                className: 'ngdialog-theme-default',
                plain: true,
                scope : $scope
            });
        };
        $rootScope.urlDialogHtml = "<div class='mid_left'>生成URL<div class='mid_left_code'>   </div> </div><div class='mid_right'><button type='button' class='btn btn-default navbar-btn'>复制</button><ul type='disc'>" +
            "  <li style='color：red；'>请将生成的URL复制到你的其他媒介的推广目标URL位置</li></ul></div>";

    });
});