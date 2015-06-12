/**
 * Created by ss on 2015/6/4.
 */
define(["./module"], function (ctrs) {
    "use strict";

    ctrs.controller('pagechange_update', function ($scope, $http, $rootScope, $cookieStore, $stateParams, ngDialog, $state) {


        $scope.radio_record = {
            visit_times: true,
            pv: false,
            order_conv: false
        };
        $scope.radio_conv = {
            regist: false,
            communicate: false,
            place_order: false,
            other: true
        };


        //$scope.page_schema = $stateParams.id;
        console.log( $stateParams.id);
        //UID 和site_id初始化

        $scope.record = false;
        $scope.benefitSet = false;
        $scope.pathType = false;
        $scope.changeType = false;

        $scope.showRemove = false;


        $scope.isAddPath = true;
        // 添加目标URL
        $scope.targetRemoves = [];
        $scope.targetUrlAdd = function (targets, targetRemoves) {
            if (targets.length == 4) {
                $("#addTargetUrl").html("");
            } else {
                $("#addTargetUrl").html("添加页面");
            }
            $scope.showRemove = true;
            targets.push({url: ""});
            targetRemoves.push({url: ""});
        }
        $scope.removeTargetUrl = function (targets, targetRemoves, _index) {
            targets.splice(_index + 1, 1);
            targetRemoves.splice(_index, 1);
        }
        $scope.addPaths = function (paths) {
            paths.push({
                path_name: "",//路径名称
                path_mark: false,//只有经过此路径的目标记为转化
                steps: [{
                    step_name: "",//步骤名称
                    step_urls: [{url: ""}, {url: ""}]//步骤URL 最多三个
                }]

            });
        };
        $scope.removePath = function (steps, _index) {
            steps.splice(_index, 1);
        };
        $scope.cancelAdd = "cancelAdd";
        $scope.addSteps = function (path, steps) {
            path.steps.push({
                step_name: "",//步骤名称
                step_urls: [{url: ""}, {url: ""}]//步骤URL 最多三个
            });
        };
        $scope.removeStepUrls = function (step_urls, _index) {
            step_urls.splice(_index, 1);
        };
        $scope.addStepUrls = function (step, turl) {
            //console.log(step.step_urls);
            step.step_urls.push({url: turl});
        };
        $scope.chooseRecordType = function (curType) {
            $scope.radio_record.visit_times = false;
            $scope.radio_record.pv = false;
            $scope.radio_record.order_conv = false;
            $scope.radio_record[curType] = true;
            $scope.page_schema.record_type = curType;
        };
        $scope.chooseConvType = function (curType) {
            $scope.radio_conv.regist = false;
            $scope.radio_conv.communicate = false;
            $scope.radio_conv.place_order = false;
            $scope.radio_conv.other = false;
            $scope.radio_conv[curType] = true;
            $scope.page_schema.conv_tpye = curType;
        }
        Custom.initCheckInfo();//页面check样式js调用

        /**
         * 提交
         */
        $scope.submit = function () {

            var url = "/config/page_conv?type=search&query={\"uid\":\"" + $scope.page_schema.uid + "\",\"site_id\":\"" + $scope.page_schema.site_id + "\",\"target_name\":\"" + $scope.page_schema.target_name + "\"}";

            $http({
                method: 'GET',
                url: url
            }).success(function (dataConfig, status) {
                if (dataConfig != null || dataConfig.length == 1) {//不存在配置 保存
                    //存在配置 更新
                    //console.log("update");
                    var url = "/config/page_conv?type=update&query={\"uid\":\"" + $scope.page_schema.uid + "\",\"site_id\":\"" + $scope.page_schema.site_id + "\",target_name" + $scope.page_schema.target_name + "\"}&updates=" + JSON.stringify($scope.page_schema);
                    $http({
                        method: 'GET',
                        url: url
                    }).success(function (dataConfig, status) {
                    });
                }
                $state.go('pagechange');
            });
        }

    })
});