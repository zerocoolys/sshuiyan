var express = require('express');
var url = require('url');
var date = require('../utils/date');
var dateFormat = require('../utils/dateFormat')();
var resutil = require('../utils/responseutils');
var datautils = require('../utils/datautils');
var es_request = require('../services/es_request');
var initial = require('../services/visitors/initialData');
var map = require('../utils/map');

var api = express.Router();

api.get('/charts', function (req, res) {

    var query = url.parse(req.url, true).query, quotas = [], type = query['type'], dimension = query.dimension, filter = null, topN = [], userType = query.userType;
    var filter_f = query.filter;
    var topN_f = query.topN == undefined ? null : query.topN
    if (topN_f) {
        topN = topN_f.split(",");
    } else {
        topN.push(0);
    }
    if (filter_f) {
        filter = JSON.parse(filter_f);
    }
    if (type.indexOf(",") > -1)for (var i = 0; i < type.split(",").length; i++) {
        quotas.push(type.split(",")[i]);
    }
    else
        quotas.push(type);
    var start = Number(query['start']);//
    var end = Number(query['end']);//
    var indexes = date.createIndexes(start, end, "visitor-");

    var period = date.period(start, end);
    var interval = 1;
    if (Number(query['int'])) {
        if (Number(query['int']) == 1) {
            interval = 1;
        }else{
            interval=Number(query['int']);
        }
    }
    else {
        if((end-start)==0){
            interval=3600000;
        }else{
            interval=86400000;
        }
        //interval = date.interval(start, end, Number(query['int']));
    }

    if (!userType) {
        userType = 1;
    }
    if (dimension == "one") {
        interval = null;
        dimension = null;
    }

    es_request.search(req.es, indexes, userType, quotas, dimension, topN, filter, period[0], period[1], interval, function (result) {
        datautils.send(res, JSON.stringify(result));
    });
});
api.get('/halfhour', function (req, res) {
    var query = url.parse(req.url, true).query, quotas = [], type = query['type'], topN = [], userType = query.userType;
    var start = Number(query['start']);//
    var end = Number(query['end']);//
    var indexes = date.createIndexes(start, end, "access-");
    var topN_f = query.topN == undefined ? null : query.topN
    if (topN_f) {
        topN = topN_f.split(",");
    } else {
        topN.push(0);
    }
    if (type.indexOf(",") > -1)for (var i = 0; i < type.split(",").length; i++) {
        quotas.push(type.split(",")[i]);
    }
    else {
        quotas.push(type);
    }
    if (!userType) {
        userType = 1;
    }

    es_request.search(req.es, indexes, userType, quotas, null, topN, null, new Date().getTime() - 1800000, new Date().getTime(), 0, function (result) {
        datautils.send(res, JSON.stringify(result));
    });
});
api.get('/map', function (req, res) {
    var query = url.parse(req.url, true).query, quotas = [], type = query['type'], dimension = query.dimension, topN = [], userType = query.userType;
    var topN_f = query.topN == undefined ? null : query.topN
    if (topN_f) {
        topN = topN_f.split(",");
    } else {
        topN.push(0)
    }
    var filter = query.filter == undefined ? null : JSON.parse(query.filter);
    if (type.indexOf(",") > -1)for (var i = 0; i < type.split(",").length; i++) {
        quotas.push(type.split(",")[i]);
    }
    else {
        quotas.push(type);
    }
    if (!userType) {
        userType = 1;
    }
    var start = Number(query['start']);//0
    var end = Number(query['end']);
    var indexes = date.createIndexes(start, end, "visitor-");

    var period = date.period(start, end);
    var interval = date.interval(start, end, Number(query['int']));
    es_request.search(req.es, indexes, userType, quotas, dimension, topN, filter, period[0], period[1], interval, function (result) {
        datautils.send(res, JSON.stringify(result));
    });
});
api.get('/pie', function (req, res) {
    var query = url.parse(req.url, true).query;
    var quotas = [];
    var type = query['type'];
    var dimension = query.dimension;
    var topN = [];
    var topN_f = query.topN == undefined ? null : query.topN;
    var userType = query.userType;
    if (topN_f) {
        topN = topN_f.split(",");
    } else {
        topN.push(0)
    }
    if (type.indexOf(",") > -1)for (var i = 0; i < type.split(",").length; i++) {
        quotas.push(type.split(",")[i]);
    }
    else {
        quotas.push(type);
    }
    if (!userType) {
        userType = 1;
    }
    var start = Number(query['start']);
    var end = Number(query['end']);
    var indexes = date.createIndexes(start, end, "access-");

    var period = date.period(start, end);
    var interval = date.interval(start, end, Number(query['int']));

    es_request.search(req.es, indexes, userType, quotas, dimension, topN, null, period[0], period[1], interval, function (result) {
        datautils.send(res, JSON.stringify(result));
    });

});

// ================================= baizz ================================
// 推广概况
api.get('/survey/1', function (req, res) {
    var query = url.parse(req.url, true).query;

    var type = query['type'];
    var startOffset = Number(query['start']);
    var endOffset = Number(query['end']);
    var indexes = date.createIndexes(startOffset, endOffset, "visitor-");

    // 指标数组
    var quotas = ["pv", "vc", "pageConversion", "outRate", "avgTime", "eventConversion", "arrivedRate"];

    es_request.search(req.es, indexes, type, quotas, null, [0], null, null, null, null, function (result) {
        datautils.send(res, result);
    });
    /* {
     var period = date.period(startOffset, endOffset);
     var interval = date.interval(startOffset, endOffset);

     es_request.search(req.es, indexes, type, quotas, "period", [0], null, period[0], period[1], interval, function (result) {
     datautils.send(res, JSON.stringify(result));
     });
     }*/

});

// device query
api.get('/survey/2', function (req, res) {
    var query = url.parse(req.url, true).query;

    var type = query['type'];
    var startOffset = Number(query['start']);
    var endOffset = Number(query['end']);
    var indexes = date.createIndexes(startOffset, endOffset, "visitor-");
    var filters = JSON.parse(query['filter']);

    // 指标数组
    var quotas = ["pv", "vc", "pageConversion", "outRate", "avgTime", "arrivedRate"];

    es_request.search(req.es, indexes, type, quotas, null, [0], filters, null, null, null, function (result) {
        datautils.send(res, result);
    });

});

// region query
api.get('/survey/3', function (req, res) {
    var query = url.parse(req.url, true).query;

    var type = query['type'];
    var startOffset = Number(query['start']);
    var endOffset = Number(query['end']);
    var indexes = date.createIndexes(startOffset, endOffset, "visitor-");

    // 指标数组
    var quotas = ["pv", "vc", "pageConversion", "outRate", "avgTime", "arrivedRate"];

    es_request.search(req.es, indexes, type, quotas, "region", [0], null, null, null, null, function (result) {
        datautils.send(res, result);
    });

});
// 推广方式

// 搜索推广
// ========================================================================

// ================================= SubDong ================================
/*********************自定义指标通用*************************/
api.get('/indextable', function (req, res) {
    var query = url.parse(req.url, true).query;
    var _promotion = query["promotion"];
    var _startTime = Number(query["start"]);//开始时间
    var _endTime = Number(query["end"]);//结束时间
    var _indic = query["indic"].split(",");//统计指标
    var _lati = query["dimension"] == "null" ? null : query["dimension"];//统计纬度
    var _type = query["type"];
    var _formartInfo = query["formartInfo"];

    var _filter = query["filerInfo"] != null && query["filerInfo"] != 'null' ? JSON.parse(query["filerInfo"]) : query["filerInfo"] == 'null' ? null : query["filerInfo"];//过滤器
    var indexes = date.createIndexes(_startTime, _endTime, "visitor-");//indexs

    var period = date.period(_startTime, _endTime); //时间段
    var interval = _promotion == "undefined" || _promotion == undefined ? date.interval(_startTime, _endTime) : null; //时间分割
    es_request.search(req.es, indexes, _type, _indic, _lati, [0], _filter, _promotion == "undefined" || _promotion == undefined ? period[0] : null, _promotion == "undefined" || _promotion == undefined ? period[1] : null, _formartInfo == "hour" ? 1 : interval, function (data) {
        if (_formartInfo != "hour") {
            var result = [];
            var vidx = 0;
            var maps = {}
            var valueData = ["arrivedRate", "outRate", "nuvRate", "ct", "period", "se", "pm", "rf", "ja", "ck"];
            data.forEach(function (info, x) {
                for (var i = 0; i < info.key.length; i++) {
                    var infoKey = info.key[i];
                    var obj = maps[infoKey];
                    if (!obj) {
                        obj = {};
                        switch (_lati) {
                            case "ct":
                                obj[_lati] = infoKey == 0 ? "新访客" : "老访客";
                                break;
                            case "rf_type":
                                obj[_lati] = infoKey == 1 ? "直接访问" : infoKey == 2 ? "搜索引擎" : "外部链接";
                                break;
                            case "period":
                                if (_formartInfo == "day") {
                                    obj[_lati] = infoKey.substring(0, 10);
                                } else {
                                    obj[_lati] = infoKey.substring(infoKey.indexOf(" "), infoKey.length - 3) + " - " + infoKey.substring(infoKey.indexOf(" "), infoKey.length - 5) + "59";
                                }
                                break;
                            case "se":
                                obj[_lati] = (infoKey == "-" ? "直接访问" : infoKey);
                                break;
                            case "pm":
                                obj[_lati] = (infoKey == 0 ? "计算机端" : "移动端");
                                break;
                            case "rf":
                                obj[_lati] = (infoKey == "-" ? "直接访问" : infoKey);
                                break;
                            case "ja":
                                obj[_lati] = (infoKey == "1" ? "支持" : "不支持");
                                break;
                            case "ck":
                                obj[_lati] = (infoKey == "1" ? "支持" : "不支持");
                                break;
                            default :
                                obj[_lati] = infoKey;
                                break;
                        }
                    }
                    if (info.label == "avgTime") {
                        obj[info.label] = new Date(info.quota[i]).format("hh:mm:ss")
                    } else {
                        obj[info.label] = info.quota[i] + (valueData.indexOf(info.label) != -1 ? "%" : "");
                    }
                    maps[infoKey] = obj;
                }
                vidx++;
            });
            for (var key in maps) {
                if (key != null) {
                    result.push(maps[key]);
                }
            }
            datautils.send(res, result);
        } else {
            datautils.send(res, JSON.stringify(data));
        }

    })
});
/**
 * 实时访问
 */
api.get('/realTimeAccess', function (req, res) {
    var query = url.parse(req.url, true).query;
    var _type = query["type"];
    var _filters = query["filerInfo"] != null && query["filerInfo"] != 'null' ? JSON.parse(query["filerInfo"]) : query["filerInfo"] == 'null' ? null : query["filerInfo"];//过滤器;
    var indexes = date.createIndexes(0, 0, "visitor-");
    es_request.realTimeSearch(req.es, indexes, _type, _filters, function (data) {
        var resultArray = new Array();
        data.forEach(function (item, i) {
            if (item._source.city != "-") {
                var result = {};
                result["city"] = item._source.city == "-" ? "国外" : item._source.city;
                var newDate = new Date(item._source.utime[0]).toString();
                result["utime"] = newDate.substring(newDate.indexOf(":") - 3, newDate.indexOf("G") - 1);
                result["source"] = item._source.rf + "," + (item._source.se != "-" ? item._source.se : item._source.rf);
                result["tt"] = item._source.tt;
                result["ip"] = item._source.remote;
                result["utimeAll"] = new Date(item._source.utime[item._source.utime.length - 1] - item._source.utime[0]).format("hh:mm:ss");
                result["pageNumber"] = item._source.loc.length
                resultArray.push(result)
            }
        });
        datautils.send(res, resultArray);
    });
});
/**
 * 实时访问 HTML数据
 */
api.get('/realTimeHtml', function (req, res) {
    var query = url.parse(req.url, true).query;
    var _type = query["type"];
    var _filters = query["filerInfo"] != null && query["filerInfo"] != 'null' ? JSON.parse(query["filerInfo"]) : query["filerInfo"] == 'null' ? null : query["filerInfo"];//过滤器;
    var indexes = date.createIndexes(0, 0, "visitor-");
    es_request.realTimeSearch(req.es, indexes, _type, _filters, function (data) {
        data.forEach(function (item, i) {
            es_request.search(req.es, indexes, _type, ["vc"], null, [0], [{"vid": [item._source.vid]}], null, null, null, function (datainfo) {
                var utimeHtml = "";
                var vtimeHtml = "";
                var urlHtml = "";
                item._source.utime.forEach(function (utime, i) {
                    var newDate = new Date(utime).toString();
                    utimeHtml = utimeHtml + "<li><span>" + newDate.substring(newDate.indexOf(":") - 3, newDate.indexOf("G") - 1);
                    +"</span></li>"
                });
                item.record.forEach(function (vtime, i) {
                    vtimeHtml = vtimeHtml + "<li><span>" + vtime.vtime + "</span></li>"
                    urlHtml = urlHtml + "<li><span><a href='" + vtime.loc + "' target='_blank'>" + vtime.loc + "</a></span></li>"
                });
                var classInfo;
                item._source.os.indexOf("Windows") != -1 ? classInfo = "windows" : "";
                item._source.os.indexOf("Windows") != -1 ? classInfo = "mac" : "";
                item._source.os.indexOf("Windows") != -1 ? classInfo = "liunx" : "";


                var result = "<div class='trendbox'>" +
                    "<div class='trend_top'><div class='trend_left'><div class='left_top'><div class='trend_img'><img class=" + classInfo + "></div><div class='trend_text'>" +
                    "<ul><li>操作系统：<span>" + item._source.os + "</span></li><li>网络服务商：<span>" + item._source.isp + "</span></li><li>屏幕分辨率：<span>" + item._source.sr + "</span></li>" +
                    "<li>屏幕颜色:<span>" + item._source.sc + "</span></li></ul></div></div><div class='left_under'><div class='trend_img'><img src='../images/google.png'></div><div class='trend_text'>" +
                    "<ul><li>浏览器：<span>" + item._source.br + "</span></li><li>Flash版本：<span>" + item._source.fl + "</span></li><li>是否支持Cookie：<span>" + (item._source.ck == '1' ? " 支持" : " 不支持" ) + "</span></li>" +
                    "<li>是否支持JAVA:<span>" + (item._source.ja == "0" ? " 支持" : " 不支持") + "</span></li></ul></div></div></div><div class='trend_right'>" +
                    "<ul><li>访问类型：<span>" + (item._source.ct == 0 ? " 新访客" : " 老访客") + "</span></li>" +
                    "<li>当天访问频次：<span>" + datainfo[0].quota[0] + "</span></li>" +
                    "<li>上一次访问时间：<span>" + (item.last != "首次访问" ? new Date(parseInt(item.last)).LocalFormat("yyyy-MM-dd hh:mm:ss") : item.last) + "</span></li>" +
                    "<li>本次来路:<span>" + (item._source.se == "-" ? " 直接访问" : "<a href='" + item._source.rf + "' target='_blank'>" + item._source.se + "( 搜索词:" + item._source.kw + ")</a>") + "</span></li>" +
                    "<li>入口页面：<span><a href='" + item._source.loc[0] + "' target='_blank'>" + item._source.loc[0] + "</a></span></li>" +
                    "<li>最后停留在:<span><a href='" + item._source.loc[item._source.loc.length - 1] + "' target='_blank'>" + item._source.loc[item._source.loc.length - 1] + "</a></span></li></ul>" +
                    "</div></div><div class='trendunder'><b>访问路径：</b>" +
                    "<ul><li>打开时间</li>" + utimeHtml + "</ul>" +
                    "<ul><li>停留时长</li>" + vtimeHtml + "</ul>" +
                    "<ul><li>页面地址</li>" + urlHtml + "</ul></div></div>";
                var returnData = {"htmlData": result};

                datautils.send(res, returnData);
            });
        });
    });
});

/**************************************************************/
//访客地图
api.get('/visitormap', function (req, res) {
    var query = url.parse(req.url, true).query;
    var _type = query['type'];
    var _startTime = Number(query['start']);
    var _endTime = Number(query['end']);
    var _quotas = query["quotas"].split(",");
    var indexes = date.createIndexes(_startTime, _endTime, "visitor-");//indexs
    var period = date.period(_startTime, _endTime); //时间段
    var interval = date.interval(_startTime, _endTime); //时间分割

    es_request.search(req.es, indexes, _type, _quotas, null, [0], null, period[0], period[1], interval, function (data) {
        var result = {};
        data.forEach(function (item, i) {
            result[item.label] = item.label == "outRate" ? item.quota[0] + "%" : item.label == "avgTime" ? new Date(item.quota[0]).format("hh:mm:ss") : item.quota[0];
        });
        datautils.send(res, result);
    })
});
//访客地图 图标
api.get('/provincemap', function (req, res) {
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var _startTime = Number(query['start']);
    var _endTime = Number(query['end']);
    var areas = query['areas'];
    var property = query['property'];
    if (property == "ct") {
        var indexes = date.createIndexes(_startTime, _endTime, "visitor-");
    } else {
        var indexes = date.createIndexes(_startTime, _endTime, "visitor-");
    }
    initial.chartData(req.es, indexes, type, areas, property, function (data) {
        var result = {};
        var chart_data_array = new Array();
        var data_name = new Array();

        var areas = data.aggregations.areas.buckets;
        for (var i = 0; i < 10; i++) {
            if (areas[i] != undefined) {
                if (areas[i].key == "国外")continue;
                var chart_data = {};
                data_name.push(areas[i].key.replace("市", "").replace("省", ""));
                chart_data["name"] = areas[i].key.replace("市", "").replace("省", "");
                chart_data["value"] = areas[i].data_count.value;
                chart_data_array.push(chart_data);
            }
        }
        if (areas.length >= 10) {
            var chart_data = {};
            var other = 0;
            for (var a = 10; a < areas.length; a++) {
                other += areas[a].data_count.value
            }
            data_name.push("其他");
            chart_data["name"] = "其他";
            chart_data["value"] = other;
            chart_data_array.push(chart_data);
        }
        result["data_name"] = data_name;
        result["chart_data"] = chart_data_array;
        datautils.send(res, result);
    })
});

/**
 * summary.by wms
 */
api.get("/summary", function (req, res) {
    var query = url.parse(req.url, true).query;
    var dimension = query['dimension'];
    var type = query['type'];
    var startOffset = Number(query['start']);
    var endOffset = Number(query['end']);
    var indexes = date.createIndexes(startOffset, endOffset, "visitor-");
    var quotas = query['quotas'];
    var period = date.period(startOffset, endOffset);
    var interval = date.interval(startOffset, endOffset);
    // 指标数组
    var quotasArray = quotas.split(",");
    es_request.search(req.es, indexes, type, quotasArray, dimension, [0], null, period[0], period[1], interval, function (result) {
        datautils.send(res, JSON.stringify(result));
    });
});
/**
 * 访问来源网站TOP5.by wms
 */
api.get("/fwlywz", function (req, res) {
    var query = url.parse(req.url, true).query;
    var type = query['type'];
    var ct = query['ct'];
    var startOffset = Number(query['start']);
    var endOffset = Number(query['end']);
    var indexes = date.createIndexes(startOffset, endOffset, "access-");
    es_request.top5visit(req.es, indexes, type, ct, function (result) {//es, indexes, type, ct, callbackFn
        datautils.send(res, result);
    });
});
module.exports = api;