require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * auth
 * Date: 23.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var getBasicAuthHttpHeader = require('./tools').getBasicAuthHttpHeader;

var logger = require('project/logger');

/** @class */
var AuthProvider = function () {
    var _auth = {
        login: null,
        password: null
    };

    /**
     * 
     * @param login
     * @param password
     * @returns {AuthProvider|Client} <code>this</code>
     */
    this.setAuth = function (login, password) {
        _auth.login = login;
        _auth.password = password;

        return this;
    };

    // В качестве источника авторизации передан другой провайдер авторизации
    if (arguments[0] && arguments[0].getAuth) {
        // копируем ссылку на объект
        _auth = arguments[0].getAuth();
    }

    // Логин и пароль переданы в параметрах
    else if (arguments.length == 2
        && typeof arguments[0] === 'string'
        && typeof arguments[1] === 'string') {

        this.setAuth(arguments[0], arguments[1]);
    }

    /**
     *
     * @returns {*}
     */
    this.getAuth = function () {

        if (!_auth.login || !_auth.password) {
            var credentials = require('project/default-auth');
            if (credentials) {
                var auth = credentials.getAuth();
                this.setAuth(auth.login, auth.password);
            }
        }

        return _auth;
    };

    /**
     *
     * @returns {string|null}
     */
    this.getBasicAuthHeader = function () {
        var auth = this.getAuth();

        if (auth) {
            return getBasicAuthHttpHeader(auth.login, auth.password);
        } else {
            return null;
        }
    };

    /**
     *
     * @returns {boolean}
     */
    this.isAuth = function () {
        var auth = this.getAuth();
        return !!auth && !!auth.login && !!auth.password;
    };
};

module.exports = AuthProvider;
},{"./tools":66,"project/default-auth":"u3XsFq","project/logger":"Z19TnT"}],2:[function(require,module,exports){
/**
 * Client
 * Date: 25.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _                           = require('lodash')
    , stampit                   = require('stampit')
    , Query                     = require('./../rest-clients/ms-xml/query')
    , operators                 = require('./../rest-clients/ms-xml/query/operators')
    , authProviderBehavior      = require('./../../authProviderBehavior')
    , providerAccessorBehavior  = require('./../../providerAccessorBehavior');

/**
 * @lends Client.prototype
 */
var clientMethods = {
    // Ms
    from:   require('./methods/from'),
    load:   require('./methods/load'),
    first:  require('./methods/first'),
    total:  require('./methods/total'),
    save:   require('./methods/save'),

    // Stock
    stock:  require('./methods/stock'),
    //stockByConsignment: require('...'),
    //stockForGood: require('...'),
    //slotReport: require('...'),

    // MutualSettlement
    //mutualSettlement: require('...'),
    //customerMutualSettlement: require('...')

    // Query
    createQuery: Query.createQuery,

    // LazyLoader
    createLazyLoader:   require('./lazy-loader'),
    
    // Helpers
};

/**
 * @class Client
 */
var Client = stampit()

    // Options
    .state({
        options: {
            filterLimit: 50,
            allowNotFilterOperators: false
        }
    })

    // Auth
    .enclose(authProviderBehavior)

    // Providers accessor
    .enclose(providerAccessorBehavior)

    // Rest client accessor (RestClientsAccessor)
    //
    //.enclose(restClientsAccessor)

    // Methods
    //
    .methods(clientMethods)
    .methods(operators);

module.exports = Client;
},{"./../../authProviderBehavior":1,"./../../providerAccessorBehavior":64,"./../rest-clients/ms-xml/query":30,"./../rest-clients/ms-xml/query/operators":38,"./lazy-loader":12,"./methods/first":15,"./methods/from":16,"./methods/load":17,"./methods/save":18,"./methods/stock":19,"./methods/total":20,"lodash":"EBUqFC","stampit":"gaBrea"}],3:[function(require,module,exports){
/**
 * batch
 * Date: 13.05.2014
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
    , stampit = require('stampit');


function batch () {

    var that = this,
        _batches = {};

    this.batch = {

        addUuids: function (batchName, uuids) {
            var curBatch = this.get(batchName);

            if (curBatch) {
                _.forEach(that.entityHash.filterNotExist(uuids), function (uuid) {
                    //TODO Перебор по массиву идет два раза. Можно оптимизировать.
                    if (_.indexOf(curBatch, uuid, true) == -1) {
                        curBatch.splice(_.sortedIndex(curBatch, uuid), 0, uuid);
                    }
                });
            }
        },

        take: function (batchName) {
            if (_batches[batchName]) {
                var batch = _batches[batchName];
                _batches[batchName] = null;
                return batch;
            } else {
                return null;
            }
        },

        get: function (name) {
            if (arguments.length === 0)
                return _batches;

            if (_batches[name])
                return _batches[name];
            else
                return (_batches[name] = []);
        },

        isExsist: function (batchName) {
            return (_batches[batchName] && _batches[batchName].length > 0);
        }
    }

}

module.exports = batch;
},{"lodash":"EBUqFC","stampit":"gaBrea"}],4:[function(require,module,exports){


module.exports = {
    
    slot:       require('./slot'),

    state:      require('./state'),
    
    sourceSlot: require('./slot'),
    
    payments:   require('./payments')

};
},{"./payments":5,"./slot":6,"./state":7}],5:[function(require,module,exports){
/**
 * slot
 * Date: 29.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash');

function fetchPayments(type, uuids, containerEntity) {
    var client = this.client;

    // ...
    throw new Error('fetchPayments not implemented')

}

module.exports = fetchPayments;
},{"lodash":"EBUqFC"}],6:[function(require,module,exports){
/**
 * slot
 * Date: 29.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash');

function fetchSlots(type, uuids, path, batchName, batches, containerEntity) {
    var client = this.client,
        that = this;
    
    var query = client.from('warehouse');
    
    var warehouseUuid = (type == 'sourceSlot' ?
        containerEntity.sourceStoreUuid :
        containerEntity.targetStoreUuid);
    
    var warehouses = warehouseUuid ?
        [client.load('warehouse', warehouseUuid)] :
        client.from('warehouse').load();
    
    var slots = _.reduce(warehouses, function(slots, warehouse) {
        that.entityHash.add(this.mapLazyLoader(warehouse, path, batches, warehouse));
        if (warehouse.slots) slots = slots.concat(warehouse.slots);
        return slots;
    }, []);
    
    if (typeof uuids === 'string') {
        //TODO Добавляем без привязки LazyLoader'а (не критично для slot)
        that.entityHash.add(slots);
        return that.entityHash.get(uuids);
    }
    else if (uuids instanceof Array) {
        // Возвращаем все ячейки (выше они будут добавелны в Hash и привязан LazyLoader)
        // TODO Нужно учитывать, что фактически возвращаем не то, что запрошено 
        return slots;
    }
}

module.exports = fetchSlots;
},{"lodash":"EBUqFC"}],7:[function(require,module,exports){
/**
 * state
 * Date: 14.06.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , tools = require('project/tools');


function fetchState(type, uuids, path, batchName, batches, containerEntity) {
    var client = this.client,
        that = this;

    var query = client.from('workflow');

    if (containerEntity)
        query.filter('name', tools.getUriTypeName(containerEntity));

    var workflowCollection = query.load();

    var states = _.reduce(workflowCollection, function(states, workflow) {
        that.entityHash.add(workflow);
        if (workflow.state) states = states.concat(workflow.state);
        return states;
    }, []);

    //TODO Нет четкого понимания когда и где привязывается LazyLoader к загруженным св-вам. Привязываем где попало, что создает путаницу (сложно понимать код)
    if (typeof uuids === 'string') {
        //TODO Добавляем без привязки LazyLoader'а (не критично для slot)
        that.entityHash.add(states); // Массив с одним элементом
        return that.entityHash.get(uuids);
    }
    else if (uuids instanceof Array) {
        // Возвращаем все ячейки (выше они будут добавелны в Hash и привязан LazyLoader) //TODO А где именно? Не очевидно.
        // TODO Нужно учитывать, что фактически возвращаем не то, что запрошено
        return states;
    }

}

module.exports = fetchState;
},{"lodash":"EBUqFC","project/tools":61}],8:[function(require,module,exports){
/**
 * defProperty
 * Date: 29.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash');


/**
 * Создает совойство, при обращении к которому происходит ленивая загрузка сущности(ей)
 * 
 * @param {object} entity Объект к которому привязывается свойство
 * @param {string} propertyName Имя создаваемого свойства
 * @param {string | Array.<string>} uuids Идентификатор или массив идентификаторов
 * @param {string} path Путь к текущему совойству
 * @param {Array} batches Массив определителей свойств для списка групповой загрузки
 * @param {object} containerEntity Базовый объект МойСклад (напр. CustomerOrder) который содержит текущее свойство propertyName
 */
function defProperty (entity, propertyName, uuids, path, batches, containerEntity) {
    if (!uuids) return;

    //console.log(path); //TODO DEBUG

    var batchName = _.find(batches, function(batchItem) {
        //noinspection JSReferencingMutableVariableFromClosure
        //TODO !!! Нужно быть точно уверенным что в пачку могут попасть uuid только сущностей одного типа
        return path.slice(-batchItem.length) == batchItem; 
    });

    if (batchName) this.batch.addUuids(batchName, uuids);

    var that = this;
    //TODO !!! Функционал getTypeOfProperty нужно перемесить в customFetch
    //TODO Возможно получение Demands решить аналогично через customFetch, а не через batch
    Object.defineProperty(entity, propertyName, {
        get: function () {
            var type = that.getTypeOfProperty(propertyName, entity);
            return that.getEntities(type, uuids, path, batchName, batches, containerEntity);
        },
        enumerable: false,  //TODO false ?
        configurable: true
    });
}

module.exports = defProperty;
},{"lodash":"EBUqFC"}],9:[function(require,module,exports){
/**
 * entityHash
 * Date: 13.05.2014
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
    , stampit = require('stampit');


function entityHash () {

    var _entityHash = {};

    this.entityHash = {

        add: function (entities) {
            if (entities instanceof Array) {
                return _.map(entities, function (entity) {
                    return _entityHash[entity.uuid] = entity;
                });

            } else {
                return _entityHash[entities.uuid] = entities;
            }
        },

        get: function (uuids) {
            if (uuids instanceof Array) {
                return _.map(uuids, function (uuid) {
                    //Не проверяем на отсутствие сущности в Hash
                    return _entityHash[uuid];
                });

            } else {
                return _entityHash[uuids];
            }
        },

        exist: function (uuid) {
            //TODO Если будет необходимость, то возможно реализовать вариант проверки по массиву uuid
            return !!_entityHash[uuid];
        },

        getHash: function () {
            return _entityHash;
        },

        filterNotExist: function (uuids) {
            if (uuids instanceof Array) {
                return _.filter(uuids, function (uuid) {
                    //Не проверяем на отсутствие сущности в Hash
                    return !_entityHash[uuid];
                });
            } else {
                return _entityHash[uuids] ? null : [uuids];
            }
        }
    };

}

module.exports = entityHash;
},{"lodash":"EBUqFC","stampit":"gaBrea"}],10:[function(require,module,exports){
/**
 * getEntities
 * Date: 29.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , customFetch = require('./customFetch');


function getEntities (type, uuids, path, batchName, batches, containerEntity) {
    var client = this.client,
        entity, entities;

    var that = this;

    // Используем альтернативный способ получения сущностей (напр. для Slot)
    if (type in customFetch) {
        return customFetch[type].apply(this, arguments);

    } else {

        if (this.batch.isExsist(batchName)) {

            var batchUuids = this.batch.take(batchName);

            if (batchUuids.length == 1) {
                // Загружаем без фильтра (возможно, так быстрее)
                entities = [client.load(type, batchUuids[0])];

            } else {
                entities = client.from(type).select({
                    uuid: client.anyOf(batchUuids)
                }).load();
            }

            _.forEach(entities, function (entityItem) {
                that.entityHash.add(
                    that.mapLazyLoader(entityItem, path, batches, entityItem)
                );
            });
        }

        if (typeof uuids === 'string' && !this.entityHash.exist(uuids)) {
            entity = client.load(type, uuids);
            return this.entityHash.add(this.mapLazyLoader(entity, path, batches, entity));
        }

        // В данном случае обрабатываются только единичные сущности или массивы идентификаторов
        // (напр. "demandsUuid"), которые загружаются через batch.
        // Поэтому, полагаем, что всё что нужно уже присутствует в entityHash.
        return this.entityHash.get(uuids);
    }
}

module.exports = getEntities;
},{"./customFetch":4,"lodash":"EBUqFC"}],11:[function(require,module,exports){
/**
 * getTypeOfProperty
 * Date: 29.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var propMap = require('./nameToTypeMap');


function getTypeOfProperty(propertyName, entity) {
    if (propMap[propertyName])
        return propMap[propertyName];

    else if (entity.TYPE_NAME && propMap[entity.TYPE_NAME] && propMap[entity.TYPE_NAME][propertyName])
        return propMap[entity.TYPE_NAME][propertyName];

    else
        return propertyName;
}

module.exports = getTypeOfProperty;
},{"./nameToTypeMap":14}],12:[function(require,module,exports){
/**
 * LazyLoader
 * Date: 15.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , stampit = require('stampit');


var LazyLoader = stampit()

    .enclose(require('./batch'))

    .enclose(require('./entityHash'))

    .methods({
        getEntities:        require('./getEntities'),
        getTypeOfProperty:  require('./getTypeOfProperty'),
        mapLazyLoader:      require('./mapLazyLoader'),
        defProperty:        require('./defProperty')
    });

var createLazyLoader = function () {
    var lazyLoader = LazyLoader
        //.state({ client: this }) // не корректно
        .create();

    lazyLoader.client = this;
    
    //noinspection JSUnusedGlobalSymbols
    return {
        attach: function (obj, batches) {

            if (typeof obj !== 'object')
                throw new Error('attach: obj argument must be an object');

            if (!(batches instanceof Array))
                throw new Error('attach: batches argument must be an array');

            lazyLoader.mapLazyLoader(
                obj,                                            // Сущность в корой будет созданы "ленивые" свойства на основе uuid связей
                obj.TYPE_NAME || 'object',                      // Путь к текущему элементу
                batches,                                        // Определители свойств коллекций, для которых необходима пакетная загрузка
                (obj.TYPE_NAME && !(obj instanceof Array)) ?    // Сущность контейнер/containerEntity (текущий объект)
                    obj :
                    null
            );

            return obj;
        }
    }
};

module.exports = createLazyLoader;
},{"./batch":3,"./defProperty":8,"./entityHash":9,"./getEntities":10,"./getTypeOfProperty":11,"./mapLazyLoader":13,"lodash":"EBUqFC","stampit":"gaBrea"}],13:[function(require,module,exports){
/**
 * mapLazyLoader
 * Date: 29.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , tools = require('project/tools');


/**
 * Рекурсивно создает свойства согласно ссылкам на связанные объекты
 *
 * @param {object} entity Объект или узел внутри объекта
 * @param {string|null} path Путь к обрабатываемому узлу ( напр. "prop1.prop2")
 * @param {array|null} batches
 * @param {object} containerEntity Базовый объект МойСклад (напр. CustomerOrder) который содержит текущее свойство propertyName
 * @returns {*}
 * @private
 *
 */
function mapLazyLoader (entity, path, batches, containerEntity) {
    var curPath, propertyName;
    path = path || '';

    var bindingMethods = [];

    // Привязываем проверку типа
    if ('TYPE_NAME' in entity)
        bindingMethods.push('instanceOf');

    // Привязываем универсальный метод доступа к позициям документа (если применимо)
    if (tools.instanceOf(entity, 'operationWithPositions'))
        bindingMethods.push('getPositions');

    // Привязываем методы для работы с атрибутами
    if (entity.attribute)
        bindingMethods.push('getAttribute');

    _.each(bindingMethods, function (propName) {
        entity[propName] = tools[propName].bind(tools, entity);
    });

    //TODO Нужно составить подробный алгоритм для каждого случая ..
    // .. возможно сделать два цикла по ключам объекта и по массиву
    for (var key in entity) {
        var subEntity = entity[key];

        if (subEntity && entity.hasOwnProperty(key) && !(subEntity instanceof Date)) {

            // key - имя cвойства объекта
            if (isNaN(key)) { // TODO Правильно ли сделана проверка на число?

                // напр. ".goodUuid", ".demandsUuid[]"
                if (key.substring(key.length - 4) == 'Uuid') {

                    // demandsUuid -> demands
                    propertyName = key.substring(0, key.length - 4);
                    curPath = path + '.' + propertyName;

                    // напр. "demandsUuid" .. то при обращении нужно загрузить все сущности по массиву идентификаторов
                    if (subEntity instanceof Array) {
                        (batches = batches || []).push(curPath);
                    }

                    this.defProperty(entity, propertyName, subEntity, curPath, batches, containerEntity);
                }

                // напр. ".customerOrderPosition[]"
                else if (subEntity instanceof Array) {
                    this.mapLazyLoader(subEntity, path, batches, containerEntity);
                }
            }

            // [[]]
            else if (subEntity instanceof Array) {
                this.mapLazyLoader(subEntity, path + '.object', batches, containerEntity);
            }

            // key - индекс объекта в массиве
            else if (typeof subEntity === 'object') {
                var typeName = subEntity.TYPE_NAME ? subEntity.TYPE_NAME.split('.')[1] : null;
                this.mapLazyLoader(subEntity,
                        path + '.' + (typeName || 'object'), batches,
                        containerEntity || (subEntity.TYPE_NAME ? subEntity : null));
            }
        }
    }
    return entity;
}

module.exports = mapLazyLoader;
},{"lodash":"EBUqFC","project/tools":61}],14:[function(require,module,exports){
module.exports={
    "moysklad.customerOrder": {
        "sourceAgent": "company",
        "targetAgent": "myCompany",
        "sourceStore": "warehouse"
    },

    "moysklad.contract": {
        "ownCompany": "myCompany"
    },

    "demands": "demand"
}
},{}],15:[function(require,module,exports){
/**
 * first
 * Date: 14.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _               = require('lodash')
  , callbackAdapter = require('../../../tools/index').callbackAdapter;

/**
 * First. Возвращает первую сущность из списка сущностей согласно запросу.
 *
 * @param {String} type Тип сущности
 * @param {Object} query Объект запроса для фильтрации сущностей
 * @param {Function=} callback
 * @returns {Object}
 */
var first = function (type, query, callback) {
    //TODO Ensure
    var _restClient = this.getProvider('ms-xml'),
        _obj = null,
        _queryParametersList;

    function _firstFromParts (paramsIndex, callback) {
        var _params = _queryParametersList[paramsIndex];

        if (_params && ('count' in _params ? _params.count !== 0 : true)) {

            _restClient.get(type, _.extend({}, _params, { count: 1 }), function (err, data) {
                if (err) return callback(err);

                if (data.obj.length > 0) {
                    return callback(null, data.obj[0]);

                } else {
                    _firstFromParts(++paramsIndex, callback)
                }
            });

        } else {
            return callback(null, null);
        }
    }

    // query
    if (typeof query == 'object' && 'getQueryParameters' in query) {
        _queryParametersList = query.getQueryParameters(this.options.filterLimit);
    }

    // .. ошибка
    else {
        return callbackAdapter(new TypeError('Incorrect query parameter'), null, callback);
    }

    _firstFromParts(0, function (err, data) {
        _obj = callbackAdapter(err, data, callback);
    });

    return _obj;
};

module.exports = first;
},{"../../../tools/index":66,"lodash":"EBUqFC"}],16:[function(require,module,exports){
/**
 * from
 * Date: 23.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , Query = require('./../../rest-clients/ms-xml/query/index').Query;

//TODO Оформить синонимы как подмассив
var bindingMethods = [ 'load', 'first', 'total' ];

/**
 * Возвращает запрос привязанный к указанному типу сущности.
 * Используется для более лаконичной записи зароса ввиде цепочки методов.
 *
 * @param type
 */
var from = function (type) {
    //TODO Ensure

    Query.enclose(function () {
        this.getType = function () {
            return type;
        }
    });

    var that = this;

    // set client methods to query (i.e. query.load)
    _.each(bindingMethods, function (methodName) {
        Query.enclose(function () {
            this[methodName] = function () {
                var args = Array.prototype.slice(arguments);
                return that[methodName].apply(that, [type, this].concat(args));
            }
        });
    });

    return Query.create();
};

module.exports = from;
},{"./../../rest-clients/ms-xml/query/index":30,"lodash":"EBUqFC"}],17:[function(require,module,exports){
/**
 * load
 * Date: 24.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var callbackAdapter = require('../../../tools/index').callbackAdapter
  , _ = require('lodash');

//noinspection JSValidateJSDoc,JSCommentMatchesSignature
/**
 * Load. Получает сущность по идентификатору или список сущностей согласно запросу.
 *
 * @param {String} type Тип сущности
 * @param {String|Object} query Идентификатор сущности или запрос для фильтрации
 * @param {Boolean=} [options.fileContent] Опции
 * @param {Function=} [callback]
 * @returns {Object|Object[]}
 */
var load = function (type, query) {
    //TODO Ensure
    var args = _.toArray(arguments)
      , callback = typeof args.slice(-1)[0] === 'function' ? args.slice(-1)[0] : null
      , _queryParametersList
      , _restClient = this.getProvider('ms-xml')
      , _obj = null;

    function loadPartial(paramsIndex, paging, cumulativeTotal, resultCollection, callback) {

        if (_queryParametersList[paramsIndex] && ('count' in paging ? paging.count !== 0 : true)) {
            var _params = _.extend({}, _queryParametersList[paramsIndex], paging);

            _restClient.get(type, _params, function (err, data) {
                if (err) return callback(err);

                var _collection = data.obj,
                    _length     = _collection.length,
                    _total      = _collection.total;

                if (paging.start) paging.start - _total > 0 ?
                    paging.start -= _total :
                    paging.start = 0;

                if (paging.count) paging.count - _length > 0 ?
                    paging.count -= _length :
                    paging.count = 0;

                cumulativeTotal += _total;
                resultCollection = resultCollection.concat(_collection);

                loadPartial(++paramsIndex, paging, cumulativeTotal, resultCollection, callback);
            });

        } else {
            //TODO Уточнить
            resultCollection.total = cumulativeTotal; // -1 когда нет данных о total
            callback(null, resultCollection);
        }
    }

    //TODO Обработать [ uuid ] массив идентификаторов (преобразовать в query)

    // uuid ..
    if (typeof query == 'string') {
        var params = { uuid: query };
        // options (fileContent)
        if (args[2] && 'fileContent' in args[2]) params.fileContent = args[2].fileContent;

        _restClient.get(type, params, function (err, data) {
            _obj = callbackAdapter(err, data.obj, callback);
        });
    }

    // .. или query
    else if (typeof query == 'object' && 'getQueryParameters' in query) {
        _queryParametersList = query.getQueryParameters(this.options.filterLimit);

        var paging = {};
        if (_queryParametersList[0].start) paging.start = _queryParametersList[0].start;
        if (_queryParametersList[0].count) paging.count = _queryParametersList[0].count;

        loadPartial(0, paging, 0, [], function (err, data) {
            _obj = callbackAdapter(err, data, callback);
        });
    }

    // .. ошибка
    else {
        return callbackAdapter(new TypeError('Incorrect query parameter'), null, callback);
    }

    return _obj;
};

module.exports = load;
},{"../../../tools/index":66,"lodash":"EBUqFC"}],18:[function(require,module,exports){
/**
 * save
 * Date: 15.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _               = require('lodash')
  , callbackAdapter = require('../../../tools/index').callbackAdapter;

//TODO Ограничение на кол-во сохраняемых объектов в коллекции (проверить)

/**
 * Save. Сохраняет сущность или список сущностей.
 *
 * @param {String} [type] Тип сущности (если не указан производится попытка получить тип из свойства объекта TYPE_NAME)
 * @param {Object} ent Сущность или список сущностей
 * @param {Function=} callback
 * @returns {Object} Созданная/сохраненная сущность
 */
var save = function () {
    //TODO Ensure
    var args        = _.toArray(arguments)
      , callback    = typeof args.slice(-1)[0] === 'function' ? args.slice(-1)[0] : null;

    var restClient  = this.getProvider('ms-xml'),
        obj = null;

    var putArgs = args.slice(0, args.length);

    putArgs.push(function (err, data) {
        obj = callbackAdapter(err, data.obj, callback);
    });

    restClient.put.apply(restClient, putArgs);

    return obj;
};

module.exports = save;
},{"../../../tools/index":66,"lodash":"EBUqFC"}],19:[function(require,module,exports){
/**
 * stock
 * Date: 19.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , callbackAdapter = require('../../../tools/index').callbackAdapter;


var stock = function () {
    var args        = _.toArray(arguments)
      , callback    = typeof args.slice(-1)[0] === 'function' ? args.slice(-1)[0] : null
      , options     = typeof args[0] === 'object' ? args[0] : {}
      , _restClient = this.getProvider('stock-json')
      , _obj        = null;

    _restClient.stock(options, function (err, data) {
        _obj = callbackAdapter(err, data.obj, callback);
    });

    return _obj;
};

module.exports = stock;
},{"../../../tools/index":66,"lodash":"EBUqFC"}],20:[function(require,module,exports){
/**
 * total
 * Date: 14.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _               = require('lodash')
  , callbackAdapter = require('../../../tools/index').callbackAdapter;

/**
 * First. Получает сущность по идентификатору или список сущностей согласно запросу.
 * @param {String} type Тип сущности
 * @param {Object} query Объект запроса для фильтрации сущностей
 * @param {Function=} callback
 * @returns {Number}
 */
var total = function (type, query, callback) {
    //TODO Ensure
    var _restClient = this.getProvider('ms-xml'),
        _total = null,
        _queryParametersList;

    function _totalFromParts(paramsIndex, cumulativeTotal, callback) {

        if (_queryParametersList[paramsIndex]) {
            var _params = _.extend({}, _queryParametersList[paramsIndex], { count: 0, start: 0 });

            _restClient.get(type, _params, function (err, data) {
                if (err) return callback(err);

                cumulativeTotal += data.obj.total;

                _totalFromParts(++paramsIndex, cumulativeTotal, callback);
            });

        } else {
            callback(null, cumulativeTotal);
        }
    }

    // query
    if (typeof query == 'object' && 'getQueryParameters' in query) {
        _queryParametersList = query.getQueryParameters();

        _totalFromParts(0, 0, function (err, data) {
            _total = callbackAdapter(err, data, callback);
        });
    }

    // .. error
    else {
        return callbackAdapter(new TypeError('Incorrect query parameter'), null, callback);
    }

    return _total;
};

module.exports = total;
},{"../../../tools/index":66,"lodash":"EBUqFC"}],"1wiUUs":[function(require,module,exports){
/**
 * MoyskladClient
 * Date: 11.01.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var client = require('./client')
  , logger = require('project/logger');


module.exports = {

    createClient: function () {
        //logger.time('createClient');
        return client.apply(this, [null].concat(Array.prototype.slice.call(arguments, 0)));
        //logger.timeEnd('createClient');
    }
};
},{"./client":2,"project/logger":"Z19TnT"}],"moysklad-client":[function(require,module,exports){
module.exports=require('1wiUUs');
},{}],23:[function(require,module,exports){
module.exports={
    "baseUrl": "https://online.moysklad.ru/exchange"
}
},{}],24:[function(require,module,exports){
/**
 * index
 * Date: 24.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var stampit = require('stampit');

var msXmlClient = stampit()

    // Authable
    .enclose(require('./../../../authProviderBehavior'))

    // Methods
    //
    .methods({

        // add client methods
        get:    require('./methods/get'),
        put:    require('./methods/put'),
        del:    require('./methods/del'),
        fetch:  require('./methods/fetch'),

        // Tools
        getObjectTypeName: function (className) {
            if (className.indexOf('.') != -1) className = className.split('.')[1];
            return className.charAt(0).toUpperCase() + className.substring(1);
        }
    });

module.exports = msXmlClient;
},{"./../../../authProviderBehavior":1,"./methods/del":25,"./methods/fetch":26,"./methods/get":27,"./methods/put":28,"stampit":"gaBrea"}],25:[function(require,module,exports){
/**
 * del
 * Date: 24.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash');


module.exports = function (type, data, callback) {
    var _fetchOptions = {
            path: '/' + this.getObjectTypeName(type)
        };

    if (data instanceof Array) {
        // POST /{type}/list/delete
        _fetchOptions.path += '/list/delete';
        _fetchOptions.method = 'POST';

        _fetchOptions.payload = {
            name: {
                localPart: 'collection'
            },
            value: {
                items: _.map(data, function (item) {
                    return {
                        name: {
                            localPart: 'String'
                        },
                        value: item
                    };
                })
            }
        };

    } else {
        // PUT /{type}/{id}
        _fetchOptions.path += '/' + data;
        _fetchOptions.method = 'DELETE';

    }

    this.fetch(_fetchOptions, callback);
}
},{"lodash":"EBUqFC"}],26:[function(require,module,exports){
/**
 * fetch
 * Date: 27.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _                           = require('lodash')
  , client_properties           = require('./../../client-properties')
  , fetchProviderRespHandler    = require('./../providerResponseHandler')
  , endPoint                    = client_properties.baseUrl + '/rest/ms/xml';


var fetch = function (options, callback) {
    var that = this;

    var _fetchProvider  = require('project/fetch')
      , _marshaller     = require('project/marshaller').create()
      , _log            = require('project/logger');

    var fetchOptions = _.extend({
        // default
        contentType: 'application/xml',
        headers: {}
    }, {
        // parameters
        method: options.method,
        url: endPoint + options.path
    });

    if (this.isAuth())
        fetchOptions.headers.Authorization = this.getBasicAuthHeader();

    if (options.payload)
        fetchOptions.payload = _marshaller.marshalString(options.payload);

    _log.time('Fetch from service time');
    _fetchProvider.fetch(fetchOptions, function (err, result) {
        _log.timeEnd('Fetch from service time');
        return fetchProviderRespHandler(err, result, callback);
    });
};

module.exports = fetch;
},{"./../../client-properties":23,"./../providerResponseHandler":29,"lodash":"EBUqFC","project/fetch":"hhHkL+","project/logger":"Z19TnT","project/marshaller":55}],27:[function(require,module,exports){
/**
 * get
 * Date: 24.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash');

module.exports = function (type, params, callback) {
    var _path = '/' + this.getObjectTypeName(type);

    if (params.uuid && typeof params.uuid === 'string') {
        // GET /{type}/{id}
        _path += '/' + params.uuid;
        if (params.fileContent) _path += '/?fileContent=true';

    } else {
        // GET /{type}/list
        _path += '/list';
        if (Object.keys(params).length > 0) {
            _path += '/?' + _.map(params, function (value, key) {
                return key + '=' + encodeURIComponent(value);
            }).join('&');
        }
    }

    this.fetch({ method: 'GET', path: _path }, callback);
};
},{"lodash":"EBUqFC"}],28:[function(require,module,exports){
/**
 * put
 * Date: 24.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash');

/**
 *
 * @param {String} [type] Тип сущности (если не указан производится попытка получить тип из свойства объекта TYPE_NAME)
 * @param {Object|Array.<Object>} data
 * @param {Function} callback
 */
var put = function () {
    //TODO Ensure
    var args            = _.toArray(arguments)
      , type            = typeof args[0] == 'string' && typeof args[1] == 'object' ? args[0] : null
      , data            = type ? args[1] : args[0]
      , callback        = typeof args.slice(-1)[0] === 'function' ? args.slice(-1)[0] : null
      ;

    if (!type && (data instanceof Array) && data.length > 0) {
        type = data[0].TYPE_NAME;
    }

    if (type && type.indexOf('.') != -1)
        type = type.split('.')[1]; // moysklad.{type}

    var _fetchOptions = {
        method: 'PUT',
        path: '/' + this.getObjectTypeName(type),
        payload: {
            name: {}
        }
    };

    if (data instanceof Array) {
        // PUT /{type} + /list/update

        _fetchOptions.path += '/list/update';

        _fetchOptions.payload = {
            name: {
                localPart: 'collection'
            },
            value: {
                items: _.map(data, function (item) {
                    //TODO Ensure localPart type
                    return {
                        name: {
                            //TODO Нужна ли выбрка или подставить то, что выведено выше
                            localPart: type ? type : item.TYPE_NAME.split('.')[1]
                        },
                        value: item
                    };
                })
            }
        };

    } else if (typeof data == 'object') {
        // PUT /{type}
        _fetchOptions.payload = {
            name: {
                localPart: type ? type : data.TYPE_NAME.split('.')[1]
            },
            value: data
        };
        //TODO Ensure localPart type
        if (!_fetchOptions.payload.name.localPart)
            return callback(new TypeError('Type information not specified'));

    } else {
        return callback(new TypeError('Incorrect data parameter'));
    }

    this.fetch(_fetchOptions, callback);
};

module.exports = put;
},{"lodash":"EBUqFC"}],29:[function(require,module,exports){
/**
 * providerResponseHandler
 * Date: 23.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _               = require('lodash')
  , callbackAdapter = require('../../../tools').callbackAdapter;


var providerResponseHandler = function (err, result, callback) {
    var data;

var _log            = require('project/logger'),
    _unmarshaller   = require('project/unmarshaller').create();

    if (!err) {
        _log.info('request.url - ' + result.request.url);
        _log.info('response.responseCode - ' + result.response.responseCode);
        _log.info('response.contentText.length - ' + result.response.contentText.length);

        switch (result.response.responseCode) {

            // ошибка пришла ввиде XML сериализуем и обработаем ниже
            case 500:
                break;

            // ошибка авторизации
            case 401:
                return callbackAdapter(
                    new Error('Request requires HTTP authentication'), result, callback);

            // корректный ответ сервера (работаем с ним дальше)
            case 200:
                break;

            // любой другой код ответа - ошибка
            default:
                //TODO Надо парсить Html ответа и выделять описание ошибки
                _log.log('Ответ сервера: \n' + result.response.contentText);
                return callbackAdapter(
                    new Error('Server response error ' + result.response.responseCode), result, callback);
        }

        if (result.response.contentText.length > 0) {

            _log.time('Response unmarshalling time');

            data = result.response.contentXml ?
                _unmarshaller.unmarshalDocument(result.response.contentXml) :
                _unmarshaller.unmarshalString(result.response.contentText);

            _log.timeEnd('Response unmarshalling time');

            result.type = data.name.localPart;

            if (result.type == 'error') return callbackAdapter(new Error(data.value.message));

            if (result.type == 'collection') {
                result.obj = _.pluck(data.value.items, 'value');
                _.extend(result.obj, {
                    total:      data.value.total,
                    start:      data.value.start,
                    count:      data.value.count,
                    TYPE_NAME:  data.value.TYPE_NAME
                });
            } else {
                result.obj = data.value;
            }
        }
    }

    return callbackAdapter(err, result, callback);
};

module.exports = providerResponseHandler;
},{"../../../tools":66,"lodash":"EBUqFC","project/logger":"Z19TnT","project/unmarshaller":63}],30:[function(require,module,exports){
/**
 * index
 * Date: 22.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var Query = require('./query');

module.exports = {

    //TODO Можно передать и список других запросов для объединения в один. Почему нет.
    createQuery: function (queryObj) {
        var query = Query.create();
        return queryObj ? query.appendFilter(queryObj) : query;
    },

    Query: Query
};


},{"./query":40}],31:[function(require,module,exports){
/**
 * Created by mvv on 17.05.14.
 */

var filter = function (key, value) {
    var filterObj = {};
    filterObj[key] = value;
    this.appendFilter(filterObj);

    return this;
};

module.exports = filter;
},{}],32:[function(require,module,exports){
/**
 * getQueryParameters
 * Date: 22.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
    , moment = require('moment')
    , Ensure = require('../../../../../tools/index').Ensure;

//TODO Описать параметры и скорректировать наименование
/**
 *  Сворачивает фильтр в объект ключ-значение
 */
function _flattenFilter(obj, path, filter) {

    filter = filter || {};

    _.forOwn(obj, function (value, key) {
        var curPath = (path ? path + '.' : '') + key;

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            filter[curPath] = [ '=' + value ];

        } else if (value instanceof Array) {
            filter[curPath] = _.map(value, function (item) { return '=' + item; });

        } else if (value instanceof Date) {
            filter[curPath] = [ '=' + moment(value).format('YYYYMMDDHHmmss') ];

        } else if (moment.isMoment(value)) {
            filter[curPath] = [ '=' + value.format('YYYYMMDDHHmmss') ];

        } else if (value.type === 'QueryOperatorResult' && value.filter) {
            filter[curPath] = value.filter;

        } else if (value instanceof Object) {
            _flattenFilter(value, curPath, filter);

        } else {
            throw new TypeError('Incorrect key value [' + curPath + '] in filter object.');
        }
    });

    return filter;
}

function _splitFiltersAccordingLimit(filters, limit) {
    var splitedFilters = [];

    _.forEach(filters, function (filter) {
        _.forOwn(filter, function (filterValues, filterKey) {
            if (filterValues.length > limit) {
                var start = 0,
                    filterParts = [];

                while (start < filterValues.length) {
                    filterParts.push(filterValues.slice(start, start + limit));
                    start += limit;
                }

                _.forEach(filterParts, function (filterPart) {
                    var clonedFilter = _.clone(filter);
                    clonedFilter[filterKey] = filterPart;
                    splitedFilters.push(clonedFilter);
                });

                return false;
            }
        });
    });

    return splitedFilters.length > 0 ? _splitFiltersAccordingLimit(splitedFilters, limit) : filters;
}


/**
 * Возвращает параметры для формирования строки запроса текущего Query
 * @returns {{}}
 */
var getQueryParameters = function (filterLimit) {
    //TODO Проверка входного значения
    filterLimit = filterLimit > 0 ? filterLimit : 50;

    var queryParams = this.getParameters(),
        queryParamsVariations = [],
        flattenedFilter,
        flattenedFilterVariations;

    flattenedFilter = _flattenFilter(this.getFilter());
    flattenedFilterVariations = _splitFiltersAccordingLimit([ flattenedFilter ], filterLimit);

    _.forEach(flattenedFilterVariations, function (filter) {
        var filterItems = [];
        _.forOwn(filter, function (filterValues, filterKey) {
            _.forEach(filterValues, function (filterValue) {
                filterItems.push(filterKey + filterValue);
            })
        });

        var clonedParams = _.clone(queryParams);
        if (filterItems.length > 0) clonedParams.filter = filterItems.join(';');
        queryParamsVariations.push(clonedParams);
    });

    return queryParamsVariations;
};

module.exports = getQueryParameters;
},{"../../../../../tools/index":66,"lodash":"EBUqFC","moment":"2V8r5n"}],33:[function(require,module,exports){
/**
 * count
 * Date: 22.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var Is = require('../../../../../tools/index').Is;

var addPaging = function (method, args) {
    if (Is.args(args, 'number')) {
        this.setParameter(method, args[0]);
    } else if (args.length == 0) {
        return this.getParameter(method);
    } else {
        throw new Error(method + ': incorrect parameter [' + obj + '], number expected');
    }
    return this;
};

module.exports = {

    start: function () {
        return addPaging.call(this, 'start', arguments);
    },

    count: function () {
        return addPaging.call(this, 'count', arguments);
    }

};
},{"../../../../../tools/index":66}],34:[function(require,module,exports){
/**
 * select
 * Date: 21.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var Is = require('../../../../../tools/index').Is;

module.exports = function () {

    // Query
    if ('getFilter' in  arguments[0]) {
        this.appendFilter(arguments[0].getFilter());
        return this;

    // Object
    } else if (Is.args(arguments, Object)) {
        this.appendFilter(arguments[0]);
        return this;

    // null
    } else if (arguments.length == 1 && arguments[0] === null) {
        this.resetFilter();
        return this;

    } else if (arguments.length == 0) {
        return this.getFilter();
    }

    throw new TypeError('filter: incorrect parameter');
};
},{"../../../../../tools/index":66}],35:[function(require,module,exports){
/**
 * showArchived
 * Date: 22.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var Is = require('../../../../../tools/index').Is;

module.exports = function () {

    if (Is.args(arguments, 'boolean')) {
        this.setParameter('showArchived', arguments[0]);

    } else if (arguments.length == 0) {
        return this.getParameter('showArchived');

    } else {
        throw new Error('showArchived: incorrect parameters ' + obj.toString());
    }

    return this;
};

},{"../../../../../tools/index":66}],36:[function(require,module,exports){
/**
 * sort
 * Date: 22.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var Is = require('../../../../../tools/index').Is;

module.exports = function () {

    if (Is.args(arguments, 'string')) {
        this.setParameter('sort', arguments[0]);

    } else if (Is.args(arguments, 'string', 'string')) {
        this.setParameters({
            sort: arguments[0],
            sortMode: arguments[1]
        });

    } else if (arguments.length == 0) {
        return this.getParameter('sort');

    } else {
        throw new Error('sort: incorrect parameters ' + obj);
    }

    return this;
};

},{"../../../../../tools/index":66}],37:[function(require,module,exports){
/**
 * sortMode
 * Date: 22.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var Is = require('../../../../../tools/index').Is;

module.exports = function () {

    if (Is.args(arguments, 'string')) {
        this.setParameter('sortMode', arguments[0]);

    } else if (arguments.length == 0) {
        return this.getParameter('sortMode');

    } else {
        throw new Error('sortMode: incorrect parameters ' + obj);
    }

    return this;
};

},{"../../../../../tools/index":66}],38:[function(require,module,exports){
/**
 * operators
 * Date: 17.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , moment = require('moment');

function convertValue(value) {

    //TODO Подумать правильно ли я проверяю типы?
    if (typeof value === 'string' || typeof value === 'number') {
        return value;

    /*} else if (value instanceof Array) {
        return value;*/

    } else if (value instanceof Date) {
        return moment(value).format('YYYYMMDDHHmmss');

    } else if (moment.isMoment(value)) {
        return value.format('YYYYMMDDHHmmss');

    } else if (typeof value === 'undefined' || value === 'null') {
        throw new TypeError('Null or undefined parameter in query operator');

    } else {
        throw new TypeError('Incorrect parameter in query operator');
    }
}

module.exports = {

    //
    anyOf: function (values) {
        return {
            type: 'QueryOperatorResult',
            filter: _.map(values, function (value) {
                return '=' + convertValue(value);
            })
        };
    },

    // Алиас для anyOf в терминалогии MongoDB
    $in: this.anyOf,

    //
    between: function (value1, value2) {
        return {
            type: 'QueryOperatorResult',
            filter: [ '>' + convertValue(value1), '<' + convertValue(value2) ]
        };
    },

    //
    greaterThen: function (value) {
        return {
            type: 'QueryOperatorResult',
            filter: [ '>' + convertValue(value) ]
        };
    },

    $gt: this.greaterThen,

    //
    greaterThanOrEqualTo: function (value) {
        return {
            type: 'QueryOperatorResult',
            filter: [ '>=' + convertValue(value) ]
        };
    },

    $gte: this.greaterThanOrEqualTo,

    //
    lessThan: function (value) {
        return {
            type: 'QueryOperatorResult',
            filter: [ '<' + convertValue(value) ]
        };
    },

    $lt: this.lessThan,

    //
    lessThanOrEqualTo: function (value) {
        return {
            type: 'QueryOperatorResult',
            filter: [ '<=' + convertValue(value) ]
        };
    },

    $lte: this.lessThanOrEqualTo

};
},{"lodash":"EBUqFC","moment":"2V8r5n"}],39:[function(require,module,exports){
/**
 * query.filter
 * Date: 22.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
    , Is = require('../../../../tools/index').Is;

module.exports = function () {
    var _filter = {};

    this.getFilter = function (name) {
        return _filter;
    };

    this.setFilter = function (value) {
        //TODO Ensure Object
        _filter = value;
        return this;
    };

    this.resetFilter = function () {
        _filter = {};
        return this;
    };

    this.appendFilter = function (value) {
        if (Is.object(value)) {
            //TODO Необходимо реализовать логинку наложения условий при объединении фильров
            _filter = _.merge(_filter, value);
        } else {
            throw new TypeError('addFilter: incorrect parameter [' + value + '], object required');
        }
        return this;
    };
};
},{"../../../../tools/index":66,"lodash":"EBUqFC"}],40:[function(require,module,exports){
/**
 * Query
 * Date: 21.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var stampit = require('stampit');


module.exports = stampit()

    // Properties
    //
    .enclose(require('./query.params.js')) // _params
    .enclose(require('./query.filter.js')) // _filter

    // Methods
    //
    .methods({
        getQueryParameters: require('./methods/getQueryParameters'),
        start:              require('./methods/paging').start,
        count:              require('./methods/paging').count,
        filter:             require('./methods/filter'),
        select:             require('./methods/select'),
        showArchived:       require('./methods/showArchived'),
        sort:               require('./methods/sort'),
        sortMode:           require('./methods/sortMode')
    });
},{"./methods/filter":31,"./methods/getQueryParameters":32,"./methods/paging":33,"./methods/select":34,"./methods/showArchived":35,"./methods/sort":36,"./methods/sortMode":37,"./query.filter.js":39,"./query.params.js":41,"stampit":"gaBrea"}],41:[function(require,module,exports){
/**
 * query.params
 * Date: 22.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
    , Is = require('../../../../tools').Is;

module.exports = function () {
    var _params = {};

    //TODO Проверить входные
    this.getParameter = function (name) {
        return _params[name];
    };

    this.getParameters = function () {
        return _params;
    };

    this.setParameter = function (name, value) {
        //TODO Ensure Object
        _params[name] = value;
    };

    this.setParameters = function (parameters) {
        //TODO Ensure Object
        _.extend(_params, parameters);
    }
};
},{"../../../../tools":66,"lodash":"EBUqFC"}],42:[function(require,module,exports){
/**
 * stock
 * Date: 19.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var stampit = require('stampit');

var stockJsonClient = stampit()

    // Authable
    .enclose(require('./../../../authProviderBehavior'))

    // Methods
    //
    .methods({

        // add client methods
        stock: require('./methods/stock'),
        fetch:  require('./methods/fetch')

    });

module.exports = stockJsonClient;
},{"./../../../authProviderBehavior":1,"./methods/fetch":43,"./methods/stock":44,"stampit":"gaBrea"}],43:[function(require,module,exports){
/**
 * stock
 * Date: 19.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
    , client_properties = require('./../../client-properties')
    , fetchProviderRespHandler = require('./../providerResponseHandler')
    , endPoint = client_properties.baseUrl + '/rest';

//TODO Этот метод во многом повторяет аналогичный fetch из ms-xml (вероятно нужно объединитьв один)
var fetch = function () {

    // override prototype method
    this.fetch = function (options, callback) {

        var _fetchProvider  = require('project/fetch'),
            _log            = require('project/logger');

        var fetchOptions = _.extend({
            // default
            contentType: 'application/json',
            headers: {}
        }, {
            // parameters
            method: 'GET',
            url: endPoint + '/' + options.service + '/json' + options.path
        });

        if (this.isAuth())
            fetchOptions.headers.Authorization = this.getBasicAuthHeader();

        _log.time('Fetch from ' + options.service + ' service time');
        _fetchProvider.fetch(fetchOptions, function (err, result) {
            _log.timeEnd('Fetch from ' + options.service + ' service time');
            return fetchProviderRespHandler(err, result, callback);
        });
    }
};

module.exports = fetch;
},{"./../../client-properties":23,"./../providerResponseHandler":45,"lodash":"EBUqFC","project/fetch":"hhHkL+","project/logger":"Z19TnT"}],44:[function(require,module,exports){
/**
 * stock
 * Date: 24.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
    , moment = require('moment');

var stock = function (options, callback) {
    options = options || {};

    //TODO Преобразовывать локальное время во время сервера
    if (options.moment) {
        options.moment = moment(options.moment).format('YYYYMMDDHHmmss');
    }

    //TODO Перенести формирование строки запроса в провайдер?
    if (_.keys(options).length > 0) {
        options.path = '/?' + _.map(options, function (value, key) {
            return key + '=' + encodeURIComponent(value);
        }).join('&');
    }

    options.service = 'stock';

    this.fetch(options, callback);
};

module.exports = stock;
},{"lodash":"EBUqFC","moment":"2V8r5n"}],45:[function(require,module,exports){
/**
 * providerResponseHandler
 * Date: 23.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
    , callbackAdapter = require('../../../tools').callbackAdapter;

//TODO Часть кода providerResponseHandler'ов не оправданно дублируется .. >
var providerResponseHandler = function (err, result, callback) {
    var _log = require('project/logger');

    // .. этот кусок общий для всех
    if (!err) {
        _log.info('request.url - ' + result.request.url);
        _log.info('response.responseCode - ' + result.response.responseCode);
        _log.info('response.contentText.length - ' + result.response.contentText.length);

        switch (result.response.responseCode) {

            //TODO Прописать все ошибки stock сервисов
            //TODO Есть ли общие для всех ошибки (нужно ли выделять)?

            // ошибка пришла ввиде XML сериализуем и обработаем ниже
            case 500:
                return callbackAdapter(
                    new Error('Server error 500'), result, callback);

            // ошибка авторизации
            case 401:
                return callbackAdapter(
                    new Error('Request requires HTTP authentication'), result, callback);

            // корректный ответ сервера (работаем с ним дальше)
            case 200:
                break;

            // любой другой код ответа - ошибка
            default:
                //TODO ??? Надо парсить Html ответа и выделять описание ошибки
                _log.log('Ответ сервера: \n' + result.response.contentText);
                return callbackAdapter(
                    new Error('Server response error ' + result.response.responseCode), result, callback);
        }

        if (result.response.contentText.length > 0) {
            _log.time('Response JSON parse time');

            result.obj = JSON.parse(result.response.contentText);

            _log.timeEnd('Response JSON parse time');
        }
    }

    return callbackAdapter(err, result, callback);
};

module.exports = providerResponseHandler;
},{"../../../tools":66,"lodash":"EBUqFC","project/logger":"Z19TnT"}],"u3XsFq":[function(require,module,exports){
/**
 * default Google Script auth
 * Date: 23.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var userProperties = PropertiesService.getUserProperties();

module.exports = {

    getAuth: function () {

        var login       = userProperties.getProperty('MOYSKLAD_LOGIN')
          , password    = userProperties.getProperty('MOYSKLAD_PASSWORD');

        if (login && password) {
            return {
                login: login,
                password: password
            }
        }

        else {
            return null;
        }
    },

    setDefaultAuth: function (login, password) {

        userProperties.setProperties({
            'MOYSKLAD_LOGIN':       login,
            'MOYSKLAD_PASSWORD':    password
        });
    }

};
},{}],"project/default-auth":[function(require,module,exports){
module.exports=require('u3XsFq');
},{}],"project/fetch":[function(require,module,exports){
module.exports=require('hhHkL+');
},{}],"hhHkL+":[function(require,module,exports){
/**
 * Google Script Http request provider factory
 * Date: 11.01.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
    , callbackAdapter = require('./../../../tools/callbackAdapter');

var fetch = {

    fetch: function (options, callback) {

        var _options = {
            //contentType: 'application/x-www-form-urlencoded',
            //method: 'GET',
            muteHttpExceptions: true
        };
        _.extend(_options, options);

        var response, httpResponse, err;

        try {
            httpResponse = UrlFetchApp.fetch(_options.url, _options);
        }
        catch (e) {
            err = e;
        }

        if (!err) {
            response = {
                headers         : httpResponse.getAllHeaders(),
                contentText     : httpResponse.getContentText(),
                responseCode    : httpResponse.getResponseCode()
            };
        }

        var result = {
            response: response,
            request: _options
        };

        return callbackAdapter(err, result, callback);
    }
};

module.exports = fetch;
},{"./../../../tools/callbackAdapter":65,"lodash":"EBUqFC"}],50:[function(require,module,exports){
/**
 * Context
 * Date: 28.03.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

module.exports = {
    create: function () {
        var map = require('project/mapping'),
            Jsonix = require('project/jsonix').Jsonix;

        return new Jsonix.Context([map]);
    }
};
},{"project/jsonix":51,"project/mapping":54}],51:[function(require,module,exports){
/**
 * Jsonix (node.js context)
 * Date: 13.01.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */


module.exports = require('../../../../vendor/jsonix');
},{"../../../../vendor/jsonix":"kw5LsE"}],"project/logger":[function(require,module,exports){
module.exports=require('Z19TnT');
},{}],"Z19TnT":[function(require,module,exports){
/**
 * Logger (Google Script context)
 * Date: 11.01.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var gsLog = Logger.log,
    profilers = {};

function log(msg) {
    gsLog.apply(Logger, arguments);
}

module.exports = {
    log: log,
    info: log,
    debug: log,
    time: function (name) {
        profilers[name] = +(new Date());
    },
    timeEnd: function (name) {
        if (profilers[name]) {
            var end = +(new Date());
            this.log(name + ': ' + ((new Date() - profilers[name])) + 'ms');
        }
    }
};
},{}],54:[function(require,module,exports){
/**
 * object mapping data factory
 * Date: 14.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

//TODO mapping объект, по хорошему, должен возвращатся внутри массива, т.к. возможно несколько пространств имен
// .. но так, как пока не предвидится что-то кроме "moysklad", оставим так.

module.exports = require('../../../../res/mapping');
},{"../../../../res/mapping":"xUxYGE"}],55:[function(require,module,exports){
/**
 * marshaller factory
 * Date: 14.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

module.exports = {
    create: function () {

        var context = require('project/jsonix/context').create();

        return context.createMarshaller();   // JSON to XML
    }
};
},{"project/jsonix/context":50}],56:[function(require,module,exports){
/**
 * getAttribute
 * Date: 20.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash');

/**
 * Возвращает атрибут объекта. Если атрибут не определен, то пустой объект
 * (функция getValue привязывается, в том числе, и к пустому объекту)
 *
 * @param entity
 * @param metadataUuid
 * @returns {{}}
 */
var getAttribute = function (entity, metadataUuid) {
    var attribute = {},
        that = this;

    if (entity && entity.attribute) {
        attribute = _.find(entity.attribute, { metadataUuid: metadataUuid });
    }

    attribute.getValue = function () {
        return that.getAttributeValue(attribute);
    };

    return attribute;
};

module.exports = getAttribute;
},{"lodash":"EBUqFC"}],57:[function(require,module,exports){
/**
 * getAttribute
 * Date: 01.06.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , getType = require('./getType');

var attributeValue = getType('attributeValue');

var attributeFields = _.map(attributeValue.propertyInfos, 'name');

/*var attributeFields = [
    'valueText',
    'valueString',
    'doubleValue',
    'longValue',
    'booleanValue',
    'timeValue',
    'entityValueUuid',
    'agentValueUuid',
    'goodValueUuid',
    'placeValueUuid',
    'consignmentValueUuid',
    'contractValueUuid',
    'projectValueUuid',
    'employeeValueUuid'
];*/

/**
 * Получение значения аттрибута по metadataUuid
 * (осуществляется методом перебора возможных полей без дополнительной загрузки метаданных)
 * @param entity Сущность с аттрибутами
 * @param metadataUuid Идентификатор метаданных аттрибута
 * @returns {*}
 */
var getAttributeValue = function (attribute) {
    var attributeValue;

    if (attribute) {
        _.forEach(attributeFields, function (fieldName) {
            if (fieldName in attribute)
                attributeValue = attribute[fieldName];
        })
    }

    return attributeValue;

};

module.exports = getAttributeValue;
},{"./getType":59,"lodash":"EBUqFC"}],58:[function(require,module,exports){
/**
 * getPositions
 * Возвращает свойство с массивом позиций для указанного документа (полезно для унификации
 * доступа к позициям документа, т.к. для разных типов объектов наименование свойств с позициями различно)
 *
 * Date: 02.06.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , map = require('project/mapping')
  , instanceOf = require('./instanceOf');

/**
 * Возвращает свойство с массивом позиций для указанного документа
 *
 * @param entity Сущность с аттрибутами
 * @returns Array
 */
var getPositions = function (entity) {

    if (instanceOf(entity, 'operationWithPositions')) {

        return _.find(entity, function (value, key) {
            return instanceOf(key, 'motion');
        })
    }

    return null;
};

module.exports = getPositions;
},{"./instanceOf":62,"lodash":"EBUqFC","project/mapping":54}],59:[function(require,module,exports){
/**
 * getType
 * Date: 14.06.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , typeInfos;


var typeInfosScopeMap = {};

var getType = function(typeName) {
    typeInfos = typeInfos || require('project/mapping').typeInfos;

    if (!typeInfosScopeMap[typeName]) {
        var type = _.find(typeInfos, { localName: typeName });
        if (type) {
            typeInfosScopeMap[typeName] = type;
            if (type.baseTypeInfo) {
                type.baseTypeInfo = getType(type.baseTypeInfo.split('.')[1])
            }
        }
    }
    return typeInfosScopeMap[typeName];
};

module.exports = getType;
},{"lodash":"EBUqFC","project/mapping":54}],60:[function(require,module,exports){
/**
 * getTypeName
 * Date: 14.06.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

/**
 * Возвращает тип объекта с большой буквы
 * (напр. "moysklad.customerOrder" -> "CustomerOrder")
 * @param {Object|String} obj Объект МойСклад или строка наименование класса
 * @returns {String|null}
 */
var getUriTypeName = function (obj) {
    var typeName;

    if (typeof obj === 'object' && obj.TYPE_NAME) {
        typeName = obj.TYPE_NAME.split('.')[1];

    } else if (typeof obj === 'string') {
        typeName = obj;
    }

    if (typeName)
        return typeName.charAt(0).toUpperCase() + typeName.substring(1);

    return null;
};

module.exports = getUriTypeName;
},{}],61:[function(require,module,exports){
/**
 * index
 * Date: 14.06.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

module.exports = {

    getUriTypeName:     require('./getUriTypeName'),
    getAttribute:       require('./getAttribute'),
    getAttributeValue:  require('./getAttributeValue'),
    getPositions:       require('./getPositions'),
    getType:            require('./getType'),
    instanceOf:         require('./instanceOf')

};
},{"./getAttribute":56,"./getAttributeValue":57,"./getPositions":58,"./getType":59,"./getUriTypeName":60,"./instanceOf":62}],62:[function(require,module,exports){
/**
 * instanceOf
 * Date: 29.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash')
  , getType = require('./getType');


var isInstanceOf = function (entityType, superType) {
    var type = getType(entityType);
    if (type) 
        return type.localName == superType ?
            true :
            (type.baseTypeInfo ? isInstanceOf(type.baseTypeInfo.localName, superType) : false);
    else 
        return false;
};

/**
 *
 * @param {Object | String} entity
 * @param {String} typeName
 */
var instanceOf = function (entity, typeName) {

    var entityType = entity.TYPE_NAME ? entity.TYPE_NAME : entity;

    if (typeof entityType === 'string') {
        // moysklad.{type}
        entityType = entityType.indexOf('.') != -1 ?
            entityType.split('.')[1] : entityType;

        return isInstanceOf(entityType, typeName);
    }

    return null;
};

module.exports = instanceOf;
},{"./getType":59,"lodash":"EBUqFC"}],63:[function(require,module,exports){
/**
 * unmarshaller factory
 * Date: 14.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

module.exports = {
    create: function () {
        var context = require('project/jsonix/context').create();
        return context.createUnmarshaller();   // XML to JSON
    }
};
},{"project/jsonix/context":50}],64:[function(require,module,exports){
/**
 * providerAccessor
 * Date: 03.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _providersConstructors = {
    // Получаю модули не динамически, иначе сборщик не увидит модуль
    'ms-xml': require('./moysklad-client/rest-clients/ms-xml'),
    'stock-json': require('./moysklad-client/rest-clients/stock-json')
} ;

var requireProviderCtor = function (name) {
    return _providersConstructors[name];
};

/** @class */
var ProviderAccessor = function () {
    var _providers = {};

    this.getProvider = function (name) {

        if (!_providers[name]) {
            var providerCtor = requireProviderCtor(name);

            if (typeof providerCtor == 'function')
                _providers[name] = providerCtor.create(null, this);

            /*else if (typeof providerCtor == 'object')
             providers[name] = providerCtor;*/

            else
            //TODO Нужна ли ошибка при отсутствии провайдера?
            //throw new Error('Provider [' + name + '] not found.');
                return null;
        }

        return _providers[name];
    };

    this.addProvider = function (name, provider) {

        if (name && provider) _providers[name] = provider;
        return this;
    }
};

module.exports = ProviderAccessor;
},{"./moysklad-client/rest-clients/ms-xml":24,"./moysklad-client/rest-clients/stock-json":42}],65:[function(require,module,exports){
/**
 * callbackAdapter
 * Date: 03.04.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var callbackAdapter = function (err, data, callback) {
    if (callback) {
        return callback(err, data);

    } else {
        if (err)
            throw err;
        else
            return data;
    }
};

module.exports = callbackAdapter;

},{}],66:[function(require,module,exports){
/**
 * Common Tools
 * Date: 11.01.14
 * Vitaliy V. Makeev (w.makeev@gmail.com)
 */

var _ = require('lodash');

//TODO Разнести по отдельным модулям

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

var Base64 = {

    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    //метод для кодировки в base64 на javascript
    encode: function (input) {
        var Base64 = this;
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },

    //метод для раскодировки из base64
    decode: function (input) {
        var Base64 = this;
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },

    // метод для кодировки в utf8
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;

    },

    //метод для раскодировки из urf8
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c, c2, c3; // mvv: c1 not used
        c = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }

};

//exports.fetch = require('project/fetch');

exports.Base64 = Base64;

exports.getBasicAuthHttpHeader = function (login, password) {

    // TODO Надо подумать как лучше переключать функции в зависимости от среды исполнения
    return "Basic " + Base64.encode(login + ":" + password);

};

exports.callbackAdapter = require('./callbackAdapter');

exports.Is = {
    'args': function () {
        var args = arguments[0],
            condition = Array.prototype.slice.call(arguments, -(arguments.length - 1));

        if (args.length == condition.length) {
            for (var i = 0, l = args.length; i < l; i++) {
                if (typeof condition[i] === 'string') {
                    if (typeof args[i] !== condition[i]) return false;

                } else if (condition[i] && condition[i].isMoment && typeof condition[i].isMoment === 'function') {
                    if (!condition[i].isMoment(args[i])) return false;

                } else {
                    if (!(args[i] instanceof condition[i])) return false;
                }
            }
            return true;
        }
        return false;
    },
    'exists': function (value) {
        return (typeof value !== 'undefined' && value !== null);
    },
    'object': function (value) {
        return typeof value === 'object';
    },
    'numberNotNaN': function (value) {
        return (typeof value === 'number') && !isNaN(value);
    },
    'integer': function (value) {
        return _.isNumber(value) && ((value % 1) === 0);
    },
    'uuid': function (value) {
        return UUID_REGEX.test(value);
    }
};

//TODO Сформировать эту структуру динамически
exports.Ensure = {
    'ensure': function (value, message, test, callback) {
        var isTest = test(value);
        if (!isTest) {
            var err = new Error(message.replace('%value', value, 'gi'));
            if (_.isFunction(callback)) callback(err);
            else throw err;
        }
        return isTest;
    },
    'boolean': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], _.isBoolean, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be a boolean.', _.isBoolean, arguments[1]);
        }
    },
    'string': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], _.isString, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be a string.', _.isString, arguments[1]);
        }
    },
    'uuid': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], exports.Is.uuid, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be uuid format.', exports.Is.uuid, arguments[1]);
        }
    },
    'numberNotNaN': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], exports.Is.numberNotNaN, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be a number (not NaN).', exports.Is.numberNotNaN, arguments[1]);
        }
    },
    'numberOrNaN': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], _.isNumber, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be a number or NaN.', _.isNumber, arguments[1]);
        }
    },
    'integer': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], exports.Is.integer, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be an integer.', exports.Is.integer, arguments[1]);
        }
    },
    'date': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], _.isDate, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be a date.', _.isDate, arguments[1]);
        }
    },
    'object': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], exports.Is.object, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be an object.', exports.Is.object, arguments[1]);
        }
    },
    'array': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], _.isArray, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be an array.', _.isArray, arguments[1]);
        }
    },
    'function': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], _.isFunction, arguments[2]);
        } else {
            return this.ensure(value, 'Argument [%value] must be a function.', _.isFunction, arguments[1]);
        }
    },
    'exists': function (value) {
        if (_.isString(arguments[1])) {
            return this.ensure(value, arguments[1], exports.Is.exists, arguments[2]);
        } else {
            return this.ensure(value, 'Argument does not exist.', exports.Is.exists, arguments[1]);
        }
    }
};
},{"./callbackAdapter":65,"lodash":"EBUqFC"}]},{},["1wiUUs"])