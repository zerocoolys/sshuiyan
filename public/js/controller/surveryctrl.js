/**
 * Created by john on 2015/3/30.
 */
app.controller('SurveryCtrl', function ($scope, $http) {
    $scope.gridOptions = {
        enableScrollbars :false,
        enableHorizontalScrollbar:0,
        enableVerticalScrollbar:0,
        columnDefs : [
            { name:'消费',enableCellEdit: true },
            { name:'展现量'},
            { name:'点击量'},
            { name:'访问次数'},
            { name:'页面转化' },
            { name:'事件转化'},
            { name:'跳出率' },
            { name:'跳出率'}
        ]
    };

/*    $http.get('/data/500_complex.json')
        .success(function(data) {
            $scope.gridOptions.data = data;
        });*/
    var select = $scope.select = {};

    //数组对象用来给ng-options遍历
    select.optionsData = [{
        title : "www.perfect.com"
    },{
        title : "www.perfect.com"
    },{
        title : "www.perfect.com"
    },{
        title : "www.perfect.com"
    }];
});

app.controller('UconcentCtrl', function ($scope, $http) {
    $scope.gridOptions = {
        enableScrollbars :false,
        enableHorizontalScrollbar:0,
        enableVerticalScrollbar:0,
        columnDefs :[
            { name: '全部推广方式-推广账户' },
            { name: '消费' },
            { name: '页面转化'}
        ]

    };
});
app.controller('EconcentCtrl', function ($scope, $http) {
     $scope.gridOptions = {
      enableScrollbars :false,
         enableHorizontalScrollbar:0,
         enableVerticalScrollbar:0,
       columnDefs :[
        { name: '全部推广方式-设备'  },
        { name: '消费' },
        { name: '页面转化'}
    ]
    };
});
app.controller('SearchCtrl', function ($scope, $http) {
    $scope.gridOptions = {
        enableScrollbars :false,
        enableHorizontalScrollbar:0,
        enableVerticalScrollbar:0,
        columnDefs :[
            { name: '推广方式'  },
            { name: '点击量' },
            { name: '消费'},
            { name: '浏览量(PV)'  },
            { name: '跳出率' },
            { name: '平均访问时长'  },
            { name: '转化次数' },
        ]
    };
});



