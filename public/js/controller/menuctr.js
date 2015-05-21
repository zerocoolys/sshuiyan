/**
 * Created by john on 2015/3/25.
 */

define(["./module"], function (ctrs) {
    'use strict';

    ctrs.controller('menuctr', function ($scope, $location) {
        $scope.oneAtATime = true;
        // 项目导航模块。用于页面刷新时，当前选中模块index的获取
        $scope.array = ["index", "extension", "trend", "source", "page", "visitor", "value"];
        $scope.selectRestaurant = function (row) {
            $scope.selectedRow = row;
        };
        var menu = $location.path();
        $scope.menuClass = function (menu, hrefs, i) {
            if ("" === menu) {
                return 0;
            }
            if (menu.indexOf(hrefs[i]) != -1 || i > hrefs.length) {
                return i;
            }
            return $scope.menuClass(menu, hrefs, i + 1);
        }

        $scope.selectedRow = $scope.menuClass(menu, $scope.array, 0);

        $scope.groups = [
            {
                title: '趋向分析 ',
                content: 'Dynamic Group Body - 1',
                template: "<h3>Hello, Directive</h3>"
            },
            {
                title: 'Dynamic Group Header - 2',
                content: 'Dynamic Group Body - 2'
            }
        ];

        $scope.items = ['Item 1', 'Item 2', 'Item 3'];

        $scope.addItem = function () {
            var newItemNo = $scope.items.length + 1;
            $scope.items.push('Item ' + newItemNo);
        };
        $scope.currentMenu = "menuFirst";
        $scope.selectMenu = function (menu) {
            $scope.currentMenu = menu;
        }

        $scope.expanders = [
            {
                title: '网站概览',
                icon: 'glyphicon glyphicon-th-large',
                stype: 0,
                sref: '#index',
                current: 'current'
            }, {
                title: '百度推广',
                icon: 'glyphicon glyphicon-asterisk',
                stype: 1,
                sref: 'extension',
                child: [{
                    text: '推广概况',
                    sref: '#extension/survey'
                }, {
                    text: '推广方式',
                    sref: '#extension/way'
                }, {
                    text: '搜索推广',
                    sref: '#extension/search'
                }, {
                    text: '网盟推广',
                    sref: '#extension/alliance'
                }, {
                    text: '推广URL速度',
                    sref: '#extension/urlspeed'
                }]
            }, {
                title: '趋向分析',
                icon: 'glyphicon glyphicon-stats',
                stype: 1,
                sref: 'trend',
                child: [{
                    text: '实时访客',
                    sref: '#trend/realtime'
                }, {
                    text: '今日统计',
                    sref: '#trend/today'
                }, {
                    text: '昨日统计',
                    sref: '#trend/yesterday'
                }, {
                    text: '最近30天',
                    sref: '#trend/month'
                }]
            }, {
                title: '来源分析',
                icon: 'glyphicon glyphicon-globe',
                stype: 1,
                sref: 'source',
                child: [{
                    text: '全部来源',
                    sref: '#source/source'
                }, {
                    text: '搜索引擎',
                    sref: '#source/searchengine'
                }, {
                    text: '搜索词',
                    sref: '#source/searchterm'
                }, {
                    text: '外部链接',
                    sref: '#source/externallinks'
                }]
            }, {
                title: '页面分析',
                icon: 'glyphicon glyphicon-blackboard',
                stype: 1,
                sref: 'page',
                child: [{
                    text: '受访页面',
                    sref: '#page/indexoverview'
                }, {
                    text: '入口页面',
                    sref: '#page/entrancepage'
                }, {
                    text: '页面标题',
                    sref: '#page/pagetitle'
                }, {
                    text: '离站链接',
                    sref: '#page/offsitelinks'
                }]
            }, {
                title: '访客分析',
                icon: 'glyphicon glyphicon-signal',
                stype: 1,
                sref: 'visitor',
                child: [{
                    text: '访客地图',
                    sref: '#visitor/provincemap'
                }, {
                    text: '设备环境',
                    sref: '#visitor/equipment'
                }, {
                    text: '新老访客',
                    sref: '#visitor/novisitors'
                }, {
                    text: '访客特征',
                    sref: '#visitor/visitorfeature'
                }]
            }, {
                title: '价值透析',
                icon: 'glyphicon glyphicon-yen',
                stype: 1,
                sref: 'value',
                child: [{
                    text: '流量地图',
                    sref: '#value/exchange'
                }, {
                    text: '频道流转',
                    sref: '#value/trafficmap'
                }]
            }
        ];
    });

    /*********nav-select*********/
    ctrs.controller('ngSelect', function ($scope, $cookieStore, $window, $rootScope) {
        $scope.clear = function () {
            $scope.siteselect.selected = undefined;
        };


        var username = $cookieStore.get('uname');
        console.log(username);
        var users = [];
        username.forEach(function (i) {
            users.push({name: i.name, id: i.id});
        });


        var usites = $cookieStore.get('usites');
        var sites = [];
        usites.forEach(function (item, i) {
            sites.push({
                name: item.site_name,
                id: item.site_id
            })
        });
        $rootScope.default = sites[0].name;     // default site
        $rootScope.defaultType = sites[0].id;   // default site trackId

        $scope.userSelect = {};
        $scope.userSelectes = users;
        $scope.siteselect = {};
        $scope.siteselects = sites;

        $scope.changeUrl = function (select) {
            $rootScope.userType = select.type;
        }
    })
});
