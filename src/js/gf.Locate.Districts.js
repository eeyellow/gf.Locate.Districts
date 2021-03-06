;
(function ($, window, document, undefined) {
    //'use strict';
    var pluginName = 'gfLocateDistricts'; //Plugin名稱
    var gfLocateDistricts;

    $.ajax({
        url: 'node_modules/bootstrap-select/dist/css/bootstrap-select.min.css',
        dataType: 'text',
        cache: true
    }).then(function(data){
        var style = $('<style/>',{ 'text': data });
        $('head').append(style);
    });
    $.ajax({
        url: 'node_modules/gf.locate.districts/src/css/gf.Locate.Districts.css',
        dataType: 'text',
        cache: true
    }).then(function(data){
        var style = $('<style/>',{ 'text': data });
        $('head').append(style);
    });
    //Load dependencies first
    $.when(
        $.ajax({
            url: 'node_modules/bootstrap-select/dist/js/bootstrap-select.min.js',
            dataType: 'script',
            cache: true
        })
    )
    .done(function(){
        //建構式
        gfLocateDistricts = function (element, options) {

            this.target = element; //html container
            //this.prefix = pluginName + "_" + this.target.attr('id'); //prefix，for identity
            this.opt = {};
            var initResult = this._init(options); //初始化
            if (initResult) {
                //初始化成功之後的動作
                this._style();
                this._event();
                this._subscribeEvents();

                this.target.trigger('onInitComplete');
            }
        };

        //預設參數
        gfLocateDistricts.defaults = {
            url: '',
            css: {
                'width': '100%',

                'background-color': '#e3f0db',
                'overflow-y': 'hidden',
                'overflow-x': 'hidden',
            },
            valueField: "id",
            nameField: "name",
            onClick: undefined,
            onInitComplete: undefined

        };

        //方法
        gfLocateDistricts.prototype = {
            //私有方法
            _init: function (_options) {
                //合併自訂參數與預設參數
                try {
                    this.opt = $.extend(true, {}, gfLocateDistricts.defaults, _options);
                    return true;
                } catch (ex) {
                    return false;
                }
            },
            _style: function () {
                var o = this;
                o.target.css(o.opt.css);

                var row1 = $('<div/>', { 'class': 'gfLocateDistricts-Row' });
                var lbl1 = $('<label/>', { 'class': 'gfLocateDistricts-Label', 'text': '縣市' });
                var sel1 = $('<select/>', { 'class': 'gfLocateDistricts-Select gfLocateDistricts-Select1' });
                o._getOption({}, o.opt.valueField, o.opt.nameField, sel1);
                row1.append(lbl1);
                row1.append(sel1);

                var row2 = $('<div/>', { 'class': 'gfLocateDistricts-Row' });
                var lbl2 = $('<label/>', { 'class': 'gfLocateDistricts-Label', 'text': '鄉鎮' });
                var sel2 = $('<select/>', { 'class': 'gfLocateDistricts-Select gfLocateDistricts-Select2' });
                row2.append(lbl2);
                row2.append(sel2);

                var row3 = $('<div/>', { 'class': 'gfLocateDistricts-Row' });
                var lbl3 = $('<label/>', { 'class': 'gfLocateDistricts-Label', 'text': '村里' });
                var sel3 = $('<select/>', { 'class': 'gfLocateDistricts-Select gfLocateDistricts-Select3' });
                row3.append(lbl3);
                row3.append(sel3);

                var row4 = $('<div/>', { 'class': 'gfLocateDistricts-Row' });
                var btn4 = $('<button/>', { 'class': 'gfLocateDistricts-Button', 'text': '定位' });
                row4.append(btn4);

                o.target.append(row1);
                o.target.append(row2);
                o.target.append(row3);
                o.target.append(row4);

                sel1.selectpicker({
                    title: '請選擇',
                    width: '130px',
                    dropupAuto: false
                });
                sel2.selectpicker({
                    title: '請選擇',
                    width: '130px',
                    dropupAuto: false
                });
                sel3.selectpicker({
                    title: '請選擇',
                    width: '130px',
                    dropupAuto: false
                });
            },
            _event: function () {
                var o = this;
                o.target

                    .on('changed.bs.select', '.gfLocateDistricts-Select1', function () {
                        o.target.find('.gfLocateDistricts-Select2').find('option').remove();
                        o.target.find('.gfLocateDistricts-Select3').find('option').remove();
                        o._getOption(
                            {
                                city: o.target.find('.gfLocateDistricts-Select1').selectpicker('val')
                            },
                            o.opt.valueField,
                            o.opt.nameField,
                            o.target.find('.gfLocateDistricts-Select2')
                        );
                    })
                    .on('changed.bs.select', '.gfLocateDistricts-Select2', function () {
                        o.target.find('.gfLocateDistricts-Select3').find('option').remove();
                        o._getOption(
                            {
                                city: o.target.find('.gfLocateDistricts-Select1').selectpicker('val'),
                                town: o.target.find('.gfLocateDistricts-Select2').selectpicker('val')
                            },
                            o.opt.valueField,
                            o.opt.nameField,
                            o.target.find('.gfLocateDistricts-Select3')
                        );
                    })
                    .find('.gfLocateDistricts-Button')
                        .click(function(e){
                            var data = {
                                locate: "Y"
                            };
                            var city = o.target.find('.gfLocateDistricts-Select1').selectpicker('val');
                            var town = o.target.find('.gfLocateDistricts-Select2').selectpicker('val');
                            var village = o.target.find('.gfLocateDistricts-Select3').selectpicker('val');

                            if(city != undefined && city != "請選擇"){
                                data.city = city;
                            }

                            if(town != undefined && town != "請選擇"){
                                data.town = town;
                            }

                            if(village != undefined && village != "請選擇"){
                                data.village = village;
                            }

                            o._getLatLng(data);
                        })
                        .end()
            },

            _getOption: function(_data, _valueField, _textField, _container){
                var o = this;
                var attach = "";
                if (_data.city != undefined) {
                    attach += "/" + _data.city;
                }
                if (_data.town != undefined) {
                    attach += "/" + _data.town;
                }
                if (_data.village != undefined) {
                    attach += "/" + _data.village;
                }
                $.ajax({
                    url: o.opt.url + attach,
                    type: 'GET',
                    dataType: 'JSON',
                    success: function (res) {
                        _container.selectpicker('destroy');
                        var html = "";
                        res.forEach(function(data){
                            html += "<option value=" + data[_valueField] + ">" + data[_textField] + "</option>";
                        });
                        _container.html(html).selectpicker({
                            title: '請選擇',
                            width: '130px',
                            dropupAuto: false
                        });
                    }
                })
            },
            _getLatLng: function(_data){
                var o = this;
                var attach = "";
                if (_data.city != undefined) {
                    attach += "/" + _data.city;
                }
                if (_data.town != undefined) {
                    attach += "/" + _data.town;
                }
                if (_data.village != undefined) {
                    attach += "/" + _data.village;
                }
                attach += "/geom";
                $.ajax({
                    url: o.opt.url + attach,
                    type: 'GET',
                    dataType: 'JSON',
                    success: function (res) {
                        var value = res[0][o.opt.valueField];
                        var name = res[0][o.opt.nameField];
                        var geom = JSON.parse(res[0].geom);
                        var r = {
                            "type": "Feature",
                            "properties": {
                              "name": name,
                              "value": value
                            },
                            "geometry": geom
                        };
                        o.target.trigger("onClick", r);
                    }
                })
            },
            //註冊事件接口
            _subscribeEvents: function () {
                //先解除所有事件接口
                this.target.off('onClick');
                this.target.off('onInitComplete');
                //綁定點擊事件接口
                if (typeof (this.opt.onClick) === 'function') {
                    this.target.on('onClick', this.opt.onClick);
                }
                if (typeof (this.opt.onInitComplete) === 'function') {
                    this.target.on('onInitComplete', this.opt.onInitComplete);
                }
            }



        };
    });

    //實例化，揭露方法，回傳
    $.fn[pluginName] = function (options, args) {
        var gfInstance;
        this.each(function () {
            gfInstance = new gfLocateDistricts($(this), options);
        });

        return this;
    };
})(jQuery, window, document);