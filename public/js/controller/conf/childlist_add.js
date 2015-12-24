/**
 * Created by Fzk lwek on 2015/6/4.
 */
define(["./module"], function (ctrs) {
    "use strict";


    ctrs.directive('remoteValidation', function ($http) {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                elm.bind('keyup', function () {
                    var url = "/config/subdirectory_list?type=search&query={\"subdirectory_url\":\"" + scope.subdirectory.subdirectory_url + "\"}";
                    $http({method: 'GET', url: url}).
                        success(function (data, status, headers, config) {
                            if (data.length > 0) {
                                ctrl.$setValidity('remote', false);
                            } else {
                                ctrl.$setValidity('remote', true);
                            }
                        }).
                        error(function (data, status, headers, config) {
                            ctrl.$setValidity('remote', false);
                        });


                });
            }
        };
    });

    ctrs.controller('childlist_add', function ($scope, $http, $rootScope, $cookieStore, ngDialog, $state) {


        $scope.subdirectory = {};

        $scope.subdirectory.is_regular = "0";

        $scope.subdirectory.analysis_url = "";

        $scope.subdirectory.not_analysis_url = "";

        $scope.subdirectory.subdirectory_url = "";

        $scope.subdirectory.uid = $cookieStore.get("uid");

        $scope.subdirectory.root_url = $rootScope.siteId;

        $scope.subdirectory.create_date = new Date().Format("yyyy-MM-dd hh:mm:ss");


        $scope.pages = [{
            url: "",
            correcturl: true,
            errmsg:"页面或目录为空"
        }];
        $scope.no_pages = [{
            url: "",
            correcturl: true,
            errmsg:"页面或目录为空"
        }];

        $scope.ipArea = {
            "tNum": "1",//当前个数？
            "tText": "",//内容
            "count": 1,//个数
            "helpFlag": false//是否显示帮组信息
        };


        $scope.childlist_add_yes = angular.copy($scope.ipArea);
        $scope.childlist_add_no = angular.copy($scope.ipArea);

        $scope.myFocus = function (obj) {
            obj.helpFlag = true;
        };

        $scope.myBlur = function (obj) {
            obj.helpFlag = false;
        };
        $scope.addPage = function (o) {
            o.push({
                url: "",
                correcturl: true,
                errmsg:"页面或目录为空"
            });
        };
        $scope.deletePage = function (p) {
            p.pop();
        };
        $scope.onCancel = function () {
            $state.go('childlist');
        }

        $scope.checkPage = function (pages) {
            var flag = true
            var tempPage = []
            pages.forEach(function (page,index) {
                if (page.url != ""){
                    if(page.url.indexOf($rootScope.siteUrl)==-1){//非本站点
                        page.correcturl = false;
                        page.errmsg="请您输入正确且与当前网站主域名一致的URL。"
                        flag = false
                    }
                    //else if(page.url.indexOf("?")>-1){
                    //    page.correcturl = false;
                    //    page.errmsg="页面或目录包含参数"
                    //    flag = false
                    //}
                }
            })
            return flag;
        }
        $scope.null_pages = false;
        $scope.onSaveSubdirectory = function () {
            //判断正确性
            if(!$scope.checkPage($scope.pages)){
                return;
            }
            ////判断是否全空
            $scope.null_pages = true;
            var pages=  [];
            for(var index in $scope.pages){
                if($scope.pages[index].url!=undefined&&$scope.pages[index].url.trim()!=""){
                    $scope.null_pages=false;
                    pages.push({url:$scope.pages[index].url})
                }
            }
            if($scope.null_pages){//全空
                return;
            }
            ////判断是否全空
            var no_pages=  [];
            for(var index in $scope.no_pages){
                if($scope.no_pages[index].url!=undefined&&$scope.no_pages[index].url.trim()!=""){
                    no_pages.push({url:$scope.no_pages[index].url})
                }
            }
            $scope.subdirectory.analysis_url = listToStirng(pages);
            $scope.subdirectory.not_analysis_url = listToStirng(no_pages);
            var entity = JSON.stringify($scope.subdirectory);
            var url = "/config/subdirectory_list?type=save&entity=" + escape(entity);
            $http({
                method: 'GET',
                url: url
            }).success(function (dataConfig, status) {
                $scope.urlDialog = ngDialog.open({
                    preCloseCallback: function () {
                        $state.go('childlist');
                    },
                    template: '<div class="ngdialog-buttons" ><div class="ngdialog-tilte">系统提示</div><ul class="admin-ng-content"><li>保存成功</li></ul>' + '<div class="ng-button-div">\
                  <button type="button" class="ngdialog-button ng-button " ng-click="closeThisDialog(0)">确定</button></div></div>',
                    className: 'ngdialog-theme-default admin_ngdialog',
                    plain: true,
                    scope: $scope
                });

            });

        };

        var listToStirng = function (list) {
            var str = "";
            list.forEach(function (page) {
                str += page.url + ",";
            })
            str = str.substring(0, str.length - 1);
            return str;
        }

        Custom.initCheckInfo();//页面check样式js调用

    });


});