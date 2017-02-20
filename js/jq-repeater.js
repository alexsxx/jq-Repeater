/*!
 * jq-Repeater.js
 * Version: 8.7.4
 *
 * https://github.com/alexsxx/jq-Repeater
 * Copyright 2017 Alessandro Nati
 * Released under the MIT license
 */
var jqRepeater = (function () {
    var _inst, _svdColl = [], _propsToObs = [], _isLoading = true, _isChangingProp = false;
    var _und = undefined,
        _bName = "jq-repeater",
        _tPrefx = "jq-",
        _dbled = "disabled",
        _ronly = "readonly",
        _rqed = "required",
        _cked = "checked",
        _slted = "selected",
        _shw = 'show',
        _cls = 'class',
        _hideCls = "jq-hide",
        _inputChg = "propertychange input";

    var jqRepeater = function (hideClass) {
        _hideCls = hideClass || _hideCls;

        return _inst = _inst || {
            bind: bind,
            update: upd,
            addElements: addElems,
            deleteElement: delEl,
            filterElements: filtrElems,
            resetFilters: resetFiltr,
            getCollectionElement: getColElem,
            setCollectionElement: setColElem,
            getCollection: getColObj,
            changePropertyValue: changePropVal,
            changePage: changePg
        };
    },

    any = function (a) {
        return a.length > 0;
    },

    cont = function (o, v) {
        return o.indexOf(v) > -1;
    },

    hasProp = function (o, k) {
        return o ? hasOwnProperty.call(o, k) : false;
    },

    unesc = function (cont) {
        return cont.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    },

    DOMFiltr = function (o) {
        return o.filter(function () {
            var t = $(this);
            return typeof (t.data(_bName) || t.attr(_bName)) !== typeof _und &&
                t.attr(_bName) !== false &&
                (t.parents().filter(function () {
                    var t1 = $(this);
                    return typeof (t1.data(_bName) || t1.attr(_bName)) !== typeof _und && t1.attr(_bName) !== false;
                }).length == 0);
        });
    },

    bind = function (collects, isFiltr) {
        _isLoading = true;
        $.each(DOMFiltr($('*')), function (i, val) {

            var exist = $(this).data(_bName) != _und,
                buildIdx = false,
                sObj = exist ? getsObj($(this).data(_bName).toString().substring(3)) : {},
                jqAttr = $(val).attr(_bName),
                cName = exist ? $(this).data(_bName).toString().substring(3) : jqAttr.split(' in ')[1];

            if (hasProp(collects, cName)) {
                _propsToObs = [];
                var objName = exist ? sObj.objName : jqAttr.split(' in ')[0],
                htmlToRpt = exist ? sObj.htmlContent : unesc($(val).html()),
                pagination = exist ? sObj.pagination : {},
                filter = exist ? sObj.filter : {},
                filtrCol = [];

                if (!exist) {
                    var fVal = $(val).attr(_tPrefx + 'filter');
                    if (fVal != _und)
                        if (cont(fVal, ',')) {
                            var fs = fVal.split(',');
                            for (var j = 0; j < fs.length; j++)
                                filtrCol.push({ field: fs[j].split(':')[0].trim(), control: fs[j].split(':')[1] });
                        }
                        else
                            filtrCol.push({ field: fVal.split(':')[0].trim(), control: fVal.split(':')[1] });

                    var rowsXpage = parseInt($(val).attr(_tPrefx + 'pagination-rows')),
                        pgnCont = $(val).attr(_tPrefx + 'pagination-container');

                    buildIdx = true;

                    _svdColl.push({
                        cName: cName,
                        htmlContent: htmlToRpt,
                        objName: objName,
                        collection: collects[cName],
                        currColl: collects[cName],
                        filter: filter = {
                            isMultiple: JSON.parse($(val).attr(_tPrefx + 'filter-multiple') || false),
                            controlCol: filtrCol,
                            collection: []
                        },
                        pagination: pagination = !isNaN(rowsXpage) ? { rowsXpage: rowsXpage, container: pgnCont } : _und,
                    });
                }
                else {
                    if (isFiltr == _und) {
                        sObj.currColl = sObj.collection = collects[cName];
                        sObj.filter.collection = [];
                        buildIdx = true;
                        var pgn = sObj.pagination
                        if (pgn != _und)
                            pgn._currPag = 0;
                    }
                    else
                        sObj.currColl = collects[cName];
                }

                if (buildIdx)
                    $.map(collects[cName],
                        function (el, i) {
                            el.__idx = i;
                            return el;
                        });


                $(val)
                    .data(_bName, _tPrefx + cName)
                    .removeAttr(_bName)
                    .empty()
                    .append(makeRepeatable(htmlToRpt, objName, collects[cName], cName, pagination, filter, $(val).parent(), 1));
                trgEvt('Rendered', cName, (isFiltr || false))
            }
        });

        _isLoading = false;
        trgEvt('RenderFinish');
    },

    trgEvt = function (eName) {
        $(document).trigger(eName, Array.prototype.slice.call(arguments, 1));
    },

    buildPgn = function (totPags, currPage, cName, opts) {
        opts = opts || {};
        var showBtns = opts.showButtons || true;
        var noUrl = "javascript:;";
        var fnClick = function (page) { return function () { changePg(cName, page) } };
        var $contn = $('<ul />', { 'class': (opts.class || 'pagination') }).attr('data-paginator', cName);

        for (var i = 0; i < totPags; i++)
            $contn.append($('<li>', { 'class': (i + 1) == currPage ? 'active' : '' }).append(
                    $('<a>', { html: i + 1, href: noUrl, click: (i + 1) == currPage ? _und : fnClick(i) }))
            );

        if (showBtns) {
            $contn.prepend(
                $('<li>', { 'class': currPage == 1 ? _dbled : '' })
                .append($('<a>',
                    {
                        html: (opts.previousText || "Prev"),
                        href: noUrl,
                        click: currPage == 1 ? _und : fnClick(currPage - 2)
                    }))
            );
            $contn.append(
                $('<li>', { 'class': currPage == totPags ? _dbled : '' })
                .append($('<a>',
                    {
                        html: (opts.nextText || "Next"),
                        href: noUrl,
                        click: currPage == totPags ? _und : fnClick(currPage)
                    }))
            );
        }
        return $contn;
    },

    buildFiltr = function (cName, sField, control, isMult) {
        var fnFiltr = function (val) {
            var sObj = getsObj(cName);
            if (sObj != _und && sObj.pagination != _und)
                sObj.pagination._currPag = 0;
            filtrElems(cName, sField, val, isMult);
        },
            $c = $(control);
        if ($c.is('select'))
            $c.off('change').change(function () {
                fnFiltr($(this).val());
            });
        else
            $c.off(_inputChg).on(_inputChg,
                function (e) {
                    if (e.type == 'propertychange' ? e.originalEvent.propertyName == 'value' : true)
                        fnFiltr($(this).val())
                });
    },

    recSearch = function (coll, sField, sParam, lvl) {
        if (sParam == "" || coll.length == 0)
            return coll;

        var ffs = /\{[\w;\s]+\}/.test(sField) ? sField.replace(/[\*\{\}\s]|\[\d\]/g, '').split(';') : [sField];
        var sfs = cont(sField, '*')
            ? Object.keys(coll[0]).filter(function (e) {
                return !cont(ffs, e)
            })
            : ffs;

        return $.grep(coll, function (e) {
            for (var i = 0; i < sfs.length; i++) {
                var f = sfs[i];
                var el = e;
                while (cont(f, '.')) {
                    var f1 = f.split('.');
                    el = el[f1[0]];
                    f1.shift();
                    f = f1.join('');
                    if ($.isArray(el) && any(recSearch(el, f, sParam)))
                        return true;
                }
                if ($.isArray(el[f]) ? cont(el[f], sParam) : cont((el[f] || "").toString().toLowerCase(), sParam))
                    return true
            }
            return false;
        });
    },

    resetFiltr = function (cName) {
        bind(buildObj(cName, getsObj(cName).collection));
    },

    filtrElems = function (cName, sField, sParam, isMult) {
        var sObj = getsObj(cName),
            filtrCol = recSearch(sObj.collection, sField, (sParam || "").toLowerCase(), 0),
            fObj = sObj.filter.collection,
            i = -1;

        for (i = fObj.length - 1; i > -1; i--)
            if (fObj[i].field == sField)
                break;

        if (i > -1)
            fObj[i].collection = filtrCol;
        else
            fObj.push({ field: sField, collection: filtrCol });

        var coll = filtrCol;
        if (isMult)
            for (i = 0; i < fObj.length; i++)
                if (fObj[i].field != sField)
                    coll = intersect(coll, fObj[i].collection, '__idx');

        bind(buildObj(cName, coll), true);
        trgEvt('Filtered', cName, coll.length);
    },

    intersect = function (a, b, k) {
        return $.grep(a, function (e) {
            return cont($.map(b, function (f) {
                return f[k];
            }), e[k]);
        });
    },

    changePg = function (cName, pg) {
        var sObj = getsObj(cName);
        if (sObj.pagination != _und) {
            sObj.pagination._currPag = pg;
            bind(buildObj(cName, sObj.currColl), true);
        }
    },

    buildObj = function (cName, coll) {
        var o = {};
        o[cName] = coll;
        return o;
    },

    makeRepeatable = function (rptElm, objName, collect, cName, pagination, filter, parentCnt, parentInd) {
        var sb = $('<div />');

        var collection = extend([], collect), currPag = 1, totPags = 1, rowsXpage = collection.length;

        if (pagination != _und) {
            var pgnObj = pagination;
            totPags = collection.length / pgnObj.rowsXpage;

            if (totPags % 1 != 0)
                totPags = parseInt(totPags) + 1;

            if (!hasProp(pgnObj, '_currPag'))
                pgnObj._currPag = 0;
            else
                pgnObj._currPag = pgnObj._currPag > totPags - 1
                    ? (pgnObj._currPag > 0 ? pgnObj._currPag - 1 : 0)
                    : pgnObj._currPag;

            currPag = pgnObj._currPag + 1;
            rowsXpage = pgnObj.rowsXpage;

            var $pagn = buildPgn(totPags, pgnObj._currPag + 1, cName);
            collection = collection.slice(pgnObj._currPag * pgnObj.rowsXpage,
                (pgnObj._currPag * pgnObj.rowsXpage) + pgnObj.rowsXpage);

            var $pagnCont = $(parentCnt);
            if (pgnObj.container != _und && $(pgnObj.container).length > 0)
                $pagnCont = $(pgnObj.container);

            $pagnCont.find('[data-paginator="' + cName + '"]').remove()
            if (totPags > 0)
                $pagnCont.append($pagn);
        }

        if (filter != _und)
            for (var i = 0; i < filter.controlCol.length; i++)
                buildFiltr(cName,
                    filter.controlCol[i].field,
                    filter.controlCol[i].control,
                    filter.isMultiple);

        $.each(collection,
            function (index, value) {
                var formEl = rptElm, cLen = collection.length;
                var relInd = value.__index = currPag > 1 ? (currPag - 1) * rowsXpage + index : index;

                $.each([_cked, _dbled, _ronly, _rqed], function (j, e) {
                    formEl = replVals(formEl, e, objName, value, e + "=\"" + e + "\"", "", relInd, cLen);
                });

                // select
                formEl = formEl.replace(_tPrefx + _slted + "=\"{{", _tPrefx + _slted + "=\"{~{");

                // all remaining
                formEl = replVals(formEl, "", objName, value, "", "", relInd, cLen);

                var $cont = $('<div />').append(formEl);

                // sub repeater
                DOMFiltr($cont.find('*')).each(function () {
                    var subJqAttr = $(this).attr(_bName);
                    var subObjName = subJqAttr.split(' in ')[0],
                    subcName = subJqAttr.split(' in ')[1];
                    var subItemObj = makeRepeatable(unesc($(this).html()).replace(/\{#/g, "{"),
                        subObjName,
                        value[getPropFinalName(subcName)],
                        subcName,
                        _und,
                        _und,
                        $cont,
                        index);
                    $(this).removeAttr(_bName).empty().append(subItemObj);
                });

                // events
                $cont.find('[' + _tPrefx + 'remove]').each(function () {
                    var indToRemove = parseInt($(this).attr(_tPrefx + 'remove'));
                    if (!isNaN(indToRemove) && indToRemove < rowsXpage * (totPags - 1) + collection.length)
                        $(this).click(function () {
                            delEl(cName, indToRemove);
                        });
                    else
                        console.error('Parameter error:[' + $(this).attr(_tPrefx + 'remove') + ']');
                    $(this).removeAttr(_tPrefx + 'remove');
                });

                $cont.find('[' + _tPrefx + 'render]').each(function () {
                    if (JSON.parse($(this).attr(_tPrefx + 'render')))
                        $(this).removeAttr(_tPrefx + 'render')
                    else
                        $(this).remove();
                });

                $cont.find('[' + _tPrefx + _slted + ']').each(function () {
                    var valAttr = $(this).attr(_tPrefx + _slted).replace("{~{", "{{"), evalAttr;
                    if (cont(valAttr, '$' + objName)) {
                        var fpName = cleanInput(valAttr),
                            pName = getPropFinalName(fpName)
                        addObsr(fpName, $(this), value, (index + 1) * parentInd, _slted);
                        evalAttr = findLegacyObj(fpName, value)[pName];
                    }
                    else
                        evalAttr = replVals(valAttr, "", objName, value, "", "", relInd, cLen);

                    setDOMObjProp(_slted, $(this), evalAttr);
                    $(this).removeAttr(_tPrefx + _slted);
                });

                $cont.find('[' + _tPrefx + _cls + ']').each(function () {
                    var _this = this;
                    $.each($(_this).attr(_tPrefx + _cls).split(','),
                        function (ind, val) {
                            var className = val.split(':')[0].trim(), classVal = val.split(':')[1].trim();

                            if (cont(classVal.toString(), '$' + objName)) {
                                var isNot = cont(classVal, '_!'),
                                    fpName = cleanInput(classVal),
                                    pName = getPropFinalName(fpName)
                                addObsr(fpName, $(_this), value, (index + 1) * parentInd, _cls, isNot, className);
                                boolVal = Boolean(isNot ^ Boolean(findLegacyObj(fpName, value)[pName]));
                            }
                            else
                                boolVal = JSON.parse(classVal);

                            setDOMObjProp(_cls, _this, boolVal, className);
                        });
                    $(this).removeAttr(_tPrefx + _cls);
                });

                $.each([_shw, _dbled, _rqed, _ronly, _cked], function (j, e) {
                    addBoolVals($cont, e, value, (index + 1) * parentInd, cLen, objName);
                });

                $cont.find('[' + _tPrefx + 'model]').each(function () {

                    var isNot = cont($(this).attr(_tPrefx + 'model'), '_!'),
                        fpName = cleanInput($(this).attr(_tPrefx + 'model')),
                        pName = getPropFinalName(fpName)
                    addObsr(fpName, $(this), value, (index + 1) * parentInd, 'model', isNot);

                    $(this).unbind();

                    if ($(this).is('select')) {
                        setDOMObjProp(_slted, $(this), findLegacyObj(fpName, value)[pName]);
                        $(this).change(function () {
                            findLegacyObj(fpName, value)['__' + pName] = $(this).find('option:' + _slted)
                                .val();
                        });
                    }
                    else if ($(this).is(':checkbox, :radio')) {
                        setDOMObjProp(_cked, this, Boolean(isNot ^ Boolean(findLegacyObj(fpName, value)[pName])));
                        $(this).change(function () {
                            findLegacyObj(fpName, value)['__' + pName] =
                                Boolean(isNot ^ Boolean($(this).prop('checked')));
                        });
                    }
                    else if ($(this).is('input, textarea')) {
                        setDOMObjProp('model', this, findLegacyObj(fpName, value)[pName]);
                        $(this).on(_inputChg,
                            function (e) {
                                if (e.type == 'propertychange' ? e.originalEvent.propertyName == 'value' : true)
                                    findLegacyObj(fpName, value)['__' + pName] = $(this).val();
                            });
                    }
                    else
                        setDOMObjProp('model', this, findLegacyObj(fpName, value)[pName]);

                    $(this).removeAttr(_tPrefx + 'model');
                });

                sb.append($cont.contents());
            });
        addWatcher();
        return sb.contents();
    },

    evalExpr = function (exp, ind, cLen, value) {
        exp = replBaseExpr(exp, ind, cLen);
        var repl = "";
        try {
            repl = eval(exp);
            if (repl == _und)
                throw "Parameter error";
        } catch (e) {
            console.error('Expression error[' + exp + '](' + e + ')');
        }
        return repl;
    },

    addBoolVals = function ($cont, tagAttr, value, index, cLen, objName) {
        $cont.find('[' + _tPrefx + tagAttr + ']').each(function () {
            var boolVal = false;
            if (cont($(this).attr(_tPrefx + tagAttr), '$' + objName)) {
                var isNot = cont($(this).attr(_tPrefx + tagAttr), '_!'),
                    fpName = cleanInput($(this).attr(_tPrefx + tagAttr)),
                    pName = getPropFinalName(fpName);
                addObsr(fpName, $(this), value, index, tagAttr, isNot);
                boolVal = Boolean(isNot ^ Boolean(findLegacyObj(fpName, value)[pName]));
            }
            else
                boolVal = Boolean(evalExpr($(this).attr(_tPrefx + tagAttr).replace(objName, 'value'),
                    index,
                    cLen,
                    value))

            setDOMObjProp(tagAttr, this, boolVal);
            $(this).removeAttr(_tPrefx + tagAttr);  
        });
    },

    replBaseExpr = function (v, ind, cLen) {
        // base
        return v
            .replace(/\$index/g, ind) // index
            .replace(/\$last/g, ind == cLen - 1) // last
            .replace(/\$first/g, ind == 0) // first
            .replace(/\$middle/g, ind == parseInt((cLen - 1) / 2)) // middle
            .replace(/\$even/g, ind % 2 == 0) // even
            .replace(/\$odd/g, Math.abs(ind % 2) == 1); // odd
    },

    replVals = function (formEl, tagName, objName, val, trueVal, falseVal, ind, cLen) {
        var pre = (tagName != "" ? _tPrefx + tagName + "=\"" : ""), post = (tagName != "" ? "\"" : "");
        $.each(getMatches(new RegExp(pre + "{{[a-zA-Z\u00C0-\u00FA0-9&@.%$\u20AC\\\-|+!?*\/_,()\\[\\]=:;><'` ]+}}" + post, "g"), formEl),
            function (i, v) {
                if (!cont(v, '$' + objName)) {
                    var findExpr = v.replace(pre + "{{", "").replace("}}" + post, "").replace(new RegExp(objName, 'g'), 'value'),
                        repl = "";
                    if (tagName != "")
                        repl = Boolean(evalExpr(findExpr, ind, cLen, val)) ? trueVal : falseVal;
                    else
                        repl = evalExpr(findExpr, ind, cLen, val);

                    formEl = formEl.replace(v, repl.toString());
                }
            });
        return formEl;
    },

    getMatches = function (rExpr, cont) {
        var r = [], e = "";
        while ((e = rExpr.exec(cont)) !== null)
            r.push(e.toString());
        return r;
    },

    getPropFinalName = function (fpName) {
        return fpName.split('.')[fpName.split('.').length - 1];
    },

    cleanInput = function (i, base) {
        return i.replace((base || ""), '').replace('{{', '').replace('}}', '').replace('$', '').replace('_!', '')
            .replace('"', '');
    },

    addObsr = function (pName, objToChange, value, colInd, type, isNot, optVal) {
        var item = $.grep(_propsToObs,
            function (item) {
                return item.propertyName == pName && item.collectionIndex == colInd;
            })[0];

        if (item != _und)
            item.objsToChange.push({ obj: objToChange, type: type, isNot: isNot, optVal: optVal });
        else
            _propsToObs.push({
                propertyName: pName,
                objsToChange: [{ obj: objToChange, type: type, isNot: isNot, optVal: optVal }],
                collectionIndex: colInd,
                value: value
            });
    },

    addWatcher = function () {
        $.each(_propsToObs,
            function (ind, obsProp) {
                var pName = obsProp.propertyName.split('.')[obsProp.propertyName.split('.').length - 1],
                    obj = findLegacyObj(obsProp.propertyName, obsProp.value);
                Object.defineProperty(obj,
                    '__' + pName,
                    {
                        set: function (nVal) {
                            $.each(obsProp.objsToChange,
                                function (i, item) {
                                    setDOMObjProp(item.type,
                                        item.obj,
                                        (typeof nVal === "boolean" ? item.isNot ^ nVal : nVal),
                                        item.optVal);
                                });
                            if (!_isLoading) {
                                trgEvt('ValueChanged', nVal, pName, obj, obj[pName], obj.__index);
                                obj[pName] = nVal;
                            }
                            if (_isChangingProp)
                                obj[pName] = nVal;
                        },
                        get: function () {
                            return obj[pName];
                        },
                        configurable: true
                    });
            });
    },

    setDOMObjProp = function (type, obj, val, optVal) {
        switch (type) {
            case _ronly:
            case _rqed:
            case _cked:
            case _dbled:
                $(obj).prop(type, Boolean(val));
                break;
            case _shw:
            case _cls:
                var isShow = type == _shw,
                    bVal = (isShow ? 1 : 0) ^ Boolean(val),
                    cls = isShow ? _hideCls : optVal;
                if (bVal)
                    $(obj).addClass(cls)
                else
                    $(obj).removeClass(cls);
                break;
            case _slted:
                $(obj).find('option[value="' + val + '"]').prop(_slted, true);
                break;
            case 'model':
                if ($(obj).is('select'))
                    $(obj).find('option[value=' + val + ']').prop(_slted, true);
                else if ($(obj).is(':checkbox, :radio'))
                    $(obj).prop(_cked, val);
                else if ($(obj).is('input, textarea'))
                    $(obj).val(val);
                else
                    $(obj).html(val);
                break;
        }
    },

    changePropVal = function (cName, elInd, fpName, newValue) {
        _isLoading = true, _isChangingProp = true,
            pName = getPropFinalName(fpName),
            colObj = getColElem(cName, elInd);
        findLegacyObj(fpName, colObj)['__' + pName] = newValue;
        _isLoading = false, _isChangingProp = false;
    },

    findLegacyObj = function (pName, obj) {
        var currLvl = pName.split('.').length == 2;
        if (!currLvl) {
            var arrP = pName.split('.');
            arrP.shift();
            pName = arrP.join('.');
        }
        else
            pName = pName.split('.')[1];
        for (var prop in obj) {
            if (currLvl && !isObj(prop) && prop == pName)
                return obj;
            else if (!currLvl && isObj(obj[prop]) && pName.split('.')[0] == prop)
                return findLegacyObj(pName, obj[prop]);
        }
    },

    findProp = function (pName, obj) {
        var currLvl = pName.split('.').length == 2;
        if (!currLvl) {
            var arrP = pName.split('.');
            arrP.shift();
            pName = arrP.join('.');
        }
        else
            pName = pName.split('.')[1];
        for (var p in obj) {
            if (currLvl && !isObj(p) && p == pName)
                return obj[p];
            else if (!currLvl && isObj(obj[p]) && pName.split('.')[0] == p)
                return findProp(pName, obj[p]);
        }
    },

    isObj = function (v) {
        return typeof v === 'object';
    },

    extend = function (a, b) {
        for (var i = 0; i < b.length; i++)
            a.push(b[i]);
        return a;
    },

    upd = function (cName, newColl) {
        getHtmlElem(cName).empty();
        var sObj = getsObj(cName),
            fObj = sObj.filter.collection;
        sObj.collection = newColl;
        bind(buildObj(cName,
                $.grep(newColl,
                    function (el) {
                        for (i = 0; i < fObj.length; i++)
                            if (!cont(fObj[i].collection, el))
                                return false;
                        return true;
                    })),
            true);
        trgEvt('CollectionUpdated', cName);
    },

    addElems = function (cName, newElems) {
        bind(buildObj(cName, extend(getColObj(cName), newElems)));
    },

    delEl = function (cName, ind) {
        var sObj = getsObj(cName),
            coll = sObj.collection,
            pgn = sObj.pagination;
        coll.splice(sObj.collection.indexOf(sObj.currColl[ind]), 1);
        pgn._currPag = pgn.rowsXpage * pgn._currPag > coll.length ? 0 : pgn._currPag;
        upd(cName, coll);
    },

    delPrivProps = function (obj) {
        for (var prop in obj)
            if (!isObj(obj[prop])) {
                if (prop.startsWith('__'))
                    delete obj[prop];
            }
            else
                obj[prop] = delPrivProps(obj[prop]);
        return obj;
    },

    getColObj = function (cName) {
        var ret = extend([], getsObj(cName).currColl);
        $.map(ret,
            function (i) {
                i = delPrivProps(i);
            });
        return ret;
    },

    getColElem = function (cName, ind) {
        return getColObj(cName)[ind];
    },

    setColElem = function (cName, ind, newObj) {
        getsObj(cName).collection[ind] = newObj;
    },

    getHtmlElem = function (cName) {
        return $('*').filter(function () { return $(this).data(_bName) == _tPrefx + cName; });
    },

    getsObj = function (cName) {
        return $.grep(_svdColl, function (val) { return val.cName == cName })[0];
    };

    return jqRepeater;
})();
