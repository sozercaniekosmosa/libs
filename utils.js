//How to use
// const storage = new IndexedDBStorage('myDB', 'myStore');
// storage.set('myKey', 'myValue').then(() => {
//      storage.get('myKey').then(console.log);  // Выведет: 'myValue'
// });

export class IndexedDBStorage {
    constructor(dbName, storeName) {
        this.dbName = dbName;
        this.storeName = storeName;
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(this.storeName);
            };
        });
    }

    async get(key) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.get(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    async set(key, value) {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.put(value, key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }
}

//TODO: deprecated
export const prepareProperty = (props, list) => {
    let res = [];
    const itemHandling = it =>
        Object.entries(it).map(([key, val]) => {
            const arrList = list?.[key]
            if (arrList) { //droplist
                let options = {};
                const arr = list[key]
                for (let i = 0; i < arr.length; i++)
                    options[arr[i]] = arr[i];
                return {key, val: val ?? '', options: {options}};
            } else {
                return {key, val};
            }
        })

    if (Array.isArray(props)) {
        let arr = [];
        props.forEach(it => arr.push(itemHandling(it)));
        arr.forEach(item => {
            res.push(...(item));
            res.push({type: 'sep'});
        });
    } else {
        res = itemHandling(props);
    }

    return res;
}

export function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

export class EventEmitter {
    #ee = {};

    constructor() {
        this.#ee = document.createElement('event-emitter');
    }

    on(event, callback) {
        this.#ee.addEventListener(event, e => callback(e.detail));
    }

    removeListener(event, callback) {
        this.#ee.removeEventListener(event, callback);
    }

    emit(event, data = {}) {
        this.#ee.dispatchEvent(new CustomEvent(event, {detail: data}));
    }
}

export const sendRequest = async (req) => await fetch(req);
export const sendRequestJSON = async (strData) => {
    try {
        let data = await fetch(strData);
        const obj = await data.json();
        return obj;
    } catch (e) {
        console.log(e);
    }
}

export function sendPostReq(method, data, clb) {
    const request = new XMLHttpRequest();
    request.open('POST', '/rpc');
    request.send(JSON.stringify({method, data}));
    request.onload = () => clb(request.response);
}

export function sendData({host, port, protocol = 'json', clbOpen, clbMessage, clbClose, clbError}) {
    let ws = host || port ? new WebSocket(`ws://${host}:${port}`, protocol) : new WebSocket('ws://' + location.host, 'json');

    ws.onopen = () => {
        try {
            if (clbOpen) {
                const objSend = clbOpen();
                if (objSend) {
                    const dataBin = protocolHandler(protocol, objSend);
                    ws.send(dataBin, err => err && clbError && clbError(err));
                }
            }
            console.log('WebSocket соединение открыто')
        } catch (e) {
        }
    };

    ws.onmessage = (raw) => {
        // console.log('Данные пришли');
        try {
            const objData = protocolHandler(protocol, raw);
            clbMessage && clbMessage(objData, ws);
        } catch (e) {
            console.log(e)
        }
    };
    ws.onclose = (e) => {

        try {
            if (e.wasClean) {
                console.log('Соединение закрыто чисто');
                clbClose && clbClose(e);
            } else {
                console.log('Обрыв соединения'); // например, "убит" процесс сервера
                clbError && clbError(err, ws);
            }
            console.log('Код: ' + e.code + ' причина: ' + e.reason);
            // ws.terminate();
        } catch (err) {
            // clbClose && clbClose(err);
            clbError && clbError(err, ws);
        }
    };
    ws.onerror = err => {
        console.log('Ошибка ' + err.message);
        clbError && clbError(err, ws);
    };

    return ws;
}

export function protocolHandler(protocol = 'json', data) {
    let isReceive = !!data.currentTarget;
    switch (protocol) {
        case 'json':
            if (isReceive) {
                return JSON.parse(data.data);
            } else {
                return JSON.stringify(data);
            }
        case 'fflate':
            if (isReceive) {
                // let bin = fflate.decompressSync(data);
                // let str = textDecoder.decode(bin);
                // return JSON.parse(str);
            } else {
                // let str = JSON.stringify(data)
                // let bin = fflate.strToU8(str);
                // return fflate.compressSync(bin, {level: 6, mem: 8});
            }
        default:
            break;
    }
}

export const rpc = ({
                        host,
                        port,
                        protocol = 'json',
                        method = 'method',
                        data,
                        clbMessage,
                        taskID,
                        clbError,
                        clientData
                    } = {}) => {
    const ccid = getCookie('CapsuleClientId')
    return sendData({
        host, port, protocol,
        clbOpen: () => ({task: 'rpc', method, data, taskID, ccid}),
        clbMessage: (ojbData, ws) => {
            clientData && (clientData.data.data[taskID] = ojbData.data)
            clbMessage && clbMessage(ojbData.data)
            ws.close()
        },
        clbError: (err, ws) => {
            clbError && clbError(err, ws)
            ws.close()
        }
    })
}


/**
 * Создает worker на лету:
 * // demo
 * const add = (...nums) => nums.reduce((a, b) => a + b);
 * // call
 * console.log('result: ', await add.callAsWorker(null, 1, 2, 3));
 *
 * @param args of function
 * @returns {Promise<unknown>}
 */
Function.prototype.callAsWorker = function (...args) {
    return new Promise((resolve, reject) => {
        const code = `self.onmessage = e => self.postMessage((${this.toString()}).call(...e.data));`,
            blob = new Blob([code], {type: "text/javascript"}),
            worker = new Worker(window.URL.createObjectURL(blob));
        worker.onmessage = e => (resolve(e.data), worker.terminate());
        worker.onerror = e => (reject(e.message), worker.terminate());
        worker.postMessage(args);
    });
}

/**
 * rotate SVG element
 * @param svgNode that being rotating
 * @param centerX
 * @param centerY
 * @param angle
 */
export function rotateSVG(svgNode, centerX, centerY, angle) {
    var rotationTransform = svgNode.createSVGTransform();
    rotationTransform.setRotate(angle, centerX, centerY);
    svgNode.transform.baseVal.appendItem(rotationTransform);
}

let lastX = 0, lastY = 0, deltaX, deltaY;
document.addEventListener('mousemove', function (event) {
    deltaX = event.clientX - lastX;
    deltaY = event.clientY - lastY;
    // console.log(`Delta X: ${deltaX}, Delta Y: ${deltaY}`);
    lastX = event.clientX;
    lastY = event.clientY;
});

export let getDeltaMouseMove = () => ({0: deltaX, 1: deltaY, x: deltaX, y: deltaY});

export const lerp = (x, y, a) => x * (1 - a) + y * a;
export const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
export const invlerp = (x, y, a) => clamp((a - x) / (y - x));
export const range = (a1, b1, a2, b2, val) => lerp(a2, b2, invlerp(a1, b1, val)); // range(0,20000, 0,100, 50) // 10000

export function saveTextAsFile(text, filename) {
    const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
}

export async function loadBinary(url) {
    const resp = await fetch(url);
    return await resp.arrayBuffer();
}

export async function loadText(url) {
    const resp = await fetch(url);
    return await resp.text();
}

export async function loadJSON(url) {
    const resp = await fetch(url);
    return await resp.json();
}

export function utf8ToAscii(str) {
    const enc = new TextEncoder('utf-8');
    const u8s = enc.encode(str);

    return Array.from(u8s).map(v => String.fromCharCode(v)).join('');
}

export function saveUnitArrayAsFile(filename, encoded) {
    // var uriEncoded = encodeURIComponent(String.fromCharCode.apply(null, encoded));
    var hexStr = "";
    for (var i = 0; i < encoded.length; i++) {
        var s = encoded[i].toString(16);
        if (s.length == 1) s = '0' + s;
        hexStr += '%' + s;
    }
    var uriContent = 'data:application/octet-stream,' + hexStr;
    var pom = document.createElement('a');
    pom.setAttribute('href', uriContent);
    pom.setAttribute('download', filename);
    document.body.appendChild(pom);
    pom.click();
    document.body.removeChild(pom);
}

export const createTable = (cols, rows, clb, classTable) => {
    // Создаем div для таблицы
    let table = document.createElement('div');
    classTable & table.classList.add(classTable)
    table.style.display = 'table';

    for (var i = 0; i < rows; i++) {
        // Создаем div для строки
        var row = document.createElement('div');
        row.style.display = 'table-row';

        for (var j = 0; j < cols; j++) {
            var cell = document.createElement('div');
            cell.style.display = 'table-cell';
            clb({table, row, cell, x: i, y: j, index: i * cols + j});

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    return table;
}

export const setStyle = (strStyle, cssObjectID = generateUID('st')) => {
    let destNode = document.head;
    let node = destNode.querySelector('.' + cssObjectID);
    strStyle = strStyle.replaceAll(/[\r\n]| {2}/g, '')
    if (!node)
        destNode.append(getHtmlStr(`<style class='${cssObjectID}'>${strStyle}</style>`)[0]);
    else
        node.innerHTML = strStyle;

    return node;
}

export function getHtmlStr(html) {
    const template = document.createElement('template'), content = template.content;
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return content.childNodes.length ? content.childNodes : [content.firstChild];
}

/**
 * Вызывает callback на каждй новой точке (Алгоритм Брезенхема)
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param callback(x,y)
 * @returns {*}
 */
export function getLinePoints(x1, y1, x2, y2, callback) {
    var dx = Math.abs(x2 - x1);
    var dy = Math.abs(y2 - y1);
    var sx = (x1 < x2) ? 1 : -1;
    var sy = (y1 < y2) ? 1 : -1;
    var err = dx - dy;

    while (true) {
        callback(x1, y1)

        if (x1 === x2 && y1 === y2) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

const base64Language = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const toShortString = (value, language = base64Language) => {
    const len = language.length;
    let acc = "";
    while (value > 0) {
        const index = value % len;
        acc += language.charAt(index);
        value /= len;
    }
    return acc.split('').reverse().join('').replace(/^0+/g, '');
};
let __id = 0;
export const generateUID = (pre = '') => pre + toShortString((new Date().getTime()) + Math.ceil(Math.random() * 100) + (__id++))

export const getHashCyrb53 = function (str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export const getHashCyrb53Arr = function (arr, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < arr.length; i++) {
        ch = arr[i];
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

let revokes = new WeakMap();

export const removeProxy = function (obj) {
    let [originalObj, revoke] = revokes.get(obj);
    revoke();
    return originalObj;
}

export const onProxy = function (obj, clb) {
    const makeHandler = (path = '') => ({
        get(target, key) {
            return typeof target[key] === 'object' && target[key] !== null
                ? new Proxy(target[key], makeHandler(path + (Array.isArray(target) ? `[${key}]` : '.' + key)))
                : Reflect.get(...arguments);
            // return Reflect.get(...arguments);
        },
        set(target, key, val) {
            if (target[key] === val) return false;
            clb && clb(target, key, val, path);
            return Reflect.set(...arguments);
        }
    });

    let {proxy, revoke} = Proxy.revocable(obj, makeHandler());
    revokes.set(proxy, [obj, revoke]);
    return proxy;
}

export const isEmpty = obj => Object.keys(obj).length === 0;

export const meval = function (js, scope) {
    return new Function(`with (this) { return (${js}); }`).call(scope);
}

export const getID = (host, port = '', tid, ccid = '') => `${host}:${port}${tid ?? ''}${ccid ?? ''}`;

export const DataEvents = class {
    TYPE_ROOT = 'r'
    TYPE_INIT = 'i'
    TYPE_ASSIGN = '='
    TYPE_OBJ_ASSIGN = '*'
    TYPE_ADD = '+'
    TYPE_REMOVE = '-'
    TYPE_ERROR = '!'
    TYPE_WAIT = 'w'
    TYPE_OPTIONS = 'o'
    TYPE_MESSAGE = 'm'

    data = {};
    arrChange = [];
    eventEmitter;

    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;

        //TODO: изменения по времени и по объему
        const loop = () => {
            if (this.arrChange.length) {
                this.eventEmitter && this.eventEmitter.emit('data-changed', this.arrChange);
                this.arrChange = [];
            }
            setTimeout(loop, 1000);
            // setTimeout(loop, 0);
        }
        loop();
    }

    isTypeDiff = (a, b) => !!(Array.isArray(a) ^ Array.isArray(b))
    isTypeArrBoth = (a, b) => Array.isArray(a) && Array.isArray(b)
    addChange = (type, path, val) => this.arrChange.push([type, val, path]);

    getData(dataSet) {
        if (dataSet)
            this.data = dataSet;
        else
            return this.data;
    }

    mergeData(path = '', src, greedy = false, concat = false) {

        let dest = this.data;

        if (typeof dest !== 'object') throw 'dest is not an object!';

        let pathArr = [], key;

        if (path.length) {
            pathArr = path.split('.');
            key = pathArr[pathArr.length - 1];
            for (let i = 0; i < pathArr.length - 1; i++) {
                const k = pathArr[i];
                dest = dest?.[k] ? dest[k] : Number.isInteger(+k) ? (dest[k] = []) : (dest[k] = {});
            }
        }

        if (typeof src !== 'object') {// изменение значения
            dest[key] = src;
            this.addChange(this.TYPE_ASSIGN, path, src);
        } else if (concat && this.isTypeArrBoth(dest[key], src)) {// объединение массивов
            dest[key] = [...dest[key], ...src];
            this.addChange(this.TYPE_ADD, path, src);
        } else if (this.isTypeDiff(dest[key], src)) {// изменение значения
            dest[key] = src;
            const type = typeof src === 'object' ? this.TYPE_OBJ_ASSIGN : this.TYPE_ASSIGN;
            this.addChange(type, path, JSON.parse(JSON.stringify(src)));
        } else {
            this.#merge(dest[key] ?? dest, src, greedy, concat, pathArr);
        }
    }

    #merge(dest, src, greedy = false, concat = false, pathArr = []) {
        const arrKeySrc = Object.keys(src);
        greedy && Object.keys(dest).forEach(key => {// удаление
            if (!arrKeySrc.includes(key)) {
                delete dest[key];
                this.addChange(this.TYPE_REMOVE, pathArr.join('.'));
            }
        });

        for (const key of arrKeySrc) {
            const [valSrc, valDest] = [src[key], dest[key]];
            pathArr.push(key);

            if (valSrc === null) continue;


            if (valDest === undefined) {// добавление
                dest[key] = valSrc;
                this.addChange(this.TYPE_ASSIGN, pathArr.join('.'), dest[key]);
            } else if (this.isTypeDiff(valDest, valSrc)) {// замена
                dest[key] = valSrc;
                const type = typeof src === 'object' ? this.TYPE_OBJ_ASSIGN : this.TYPE_ASSIGN;
                this.addChange(type, pathArr.join('.'), dest[key]);
            } else if (concat && this.isTypeArrBoth(valDest, valSrc)) {// массивы объеденены
                dest[key] = [...dest[key], ...valSrc];
                this.addChange(this.TYPE_ADD, pathArr.join('.'), dest[key]);
            } else if (typeof valSrc === 'object') {
                this.#merge(valDest, valSrc, greedy, concat, pathArr);
            } else if (valDest !== valSrc) {// изменено значение
                dest[key] = valSrc;
                this.addChange(this.TYPE_ASSIGN, pathArr.join('.'), dest[key]);
                pathArr.pop();
            } else {
                pathArr.pop();
            }
        }

        pathArr.pop();
    }

    #createObjectDimension = (obj, pathArr) => {
        let key = pathArr.pop();
        pathArr.forEach(key => obj = obj?.[key] ? obj[key] : Number.isInteger(+key) ? (obj[key] = []) : (obj[key] = {}))
        return {obj, key};
    }

    applyData(key = '', data, isRoot) {
        const tmpKey = isRoot ? '' : (key.length ? key + '.' : key);
        data.forEach(([type, val, path], i) => {
            if (type === this.TYPE_ROOT) {
                this.data = val;
                this.eventEmitter.emit(key, data[i]);
            } else if (type === this.TYPE_INIT) {
                this.data[key] ??= [];
                const index = path ? path : i; // если будет путь(всегда один индекс) тогда используем его

                this.data[key][index] = val;
                this.eventEmitter.emit(key, data[index]);
            } else if (type === this.TYPE_ERROR) {
                this.eventEmitter.emit(key, [...data[i]]);
            } else if (type === this.TYPE_MESSAGE) {
                this.eventEmitter.emit(key, [...data[i]]);
            } else if (type === this.TYPE_WAIT) {
                this.eventEmitter.emit(key, [...data[i]]);
            } else if (type === this.TYPE_OPTIONS) {
                this.eventEmitter.emit(key, [...data[i]]);
            } else {
                const {obj, key: keySrc} = this.#createObjectDimension(this.data, (tmpKey + path).split('.'));
                obj[keySrc] = val;
                this.addChange(type, tmpKey + path, val);
                this.eventEmitter.emit(key, [...data[i], obj, keySrc]);
            }
            // this.eventEmitter.emit(key, data[i]);//TODO: тут наверное нужно будет для ускорения сделать на прямую без системы событий
        });
        // this.eventEmitter.emit(key, data);//оптимизировал тк задвоение цикла нахер!!!
    }

    filterApply(arrChanged, arrFilter) {
        if (!arrFilter) return arrChanged ? arrChanged : [[this.TYPE_ROOT, this.data]]; // полная cdata
        let tmpArr = [];
        if (arrChanged) {// частички
            arrChanged.forEach(([type, val, path]) => path && arrFilter.forEach((src, j) => path.includes(src) && tmpArr.push([type, val, j + path.substring(src.length)])))
            return tmpArr.length ? tmpArr : undefined;
        }
        arrFilter.forEach(it => {// инициализация
            let d = this.data;
            it.split('.').forEach(k => d = d?.[k]);
            if (d !== undefined) tmpArr.push([this.TYPE_INIT, d]);
        })
        return tmpArr;
    }

    onData(eventName, {clbInit, clbAssign, clbAdd, clbRemove, clbObjAssign, clbError, clbWait, clbOpt, clbMessage}) {
        this.eventEmitter.on(eventName, ([type, val, path, obj, key]) => {//TODO: и тут возможно нужно будет для ускорения сделать напрямую без системы событий
            switch (type) {
                case this.TYPE_ROOT:
                    clbInit && clbInit(val);
                    break;
                case this.TYPE_INIT:
                    clbInit && clbInit(val);
                    break;
                case this.TYPE_ASSIGN:
                    clbAssign && clbAssign(val, path, obj, key);
                    break;
                case this.TYPE_OBJ_ASSIGN:
                    clbObjAssign && clbObjAssign(val, path, obj, key);
                    break;
                case this.TYPE_ADD:
                    clbAdd && clbAdd(val, path, obj, key);
                    break;
                case this.TYPE_REMOVE:
                    clbRemove && clbRemove(val, path, obj, key);
                    break;
                case this.TYPE_ERROR:
                    clbError && clbError(val);
                    break;
                case this.TYPE_MESSAGE:
                    clbMessage && clbMessage(val);
                    break;
                case this.TYPE_WAIT:
                    clbWait && clbWait(val);
                    break;
                case this.TYPE_OPTIONS:
                    clbOpt && clbOpt(val);
                    break;
            }
        });
    }
}

export const getObjectByPath = (obj, pathArr) => {
    for (let i = 0; i < pathArr.length - 1; i++) {
        const k = pathArr[i];
        if (obj?.[k]) {
            obj = obj[k];
        } else {
            return undefined;
        }
    }
    return {obj, key: pathArr[pathArr.length - 1]};
}

export const createObjectDimension = (obj, pathArr) => {
    for (let i = 0; i < pathArr.length - 1; i++) {
        const k = pathArr[i];
        obj = obj?.[k] ? obj[k] : Number.isInteger(+k) ? (obj[k] = []) : (obj[k] = {});
    }
    return {obj, key: pathArr[pathArr.length - 1]};
}

export const isFunction = functionToCheck => functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';

export const addYear = (y) => new Date(new Date().setFullYear(new Date().getFullYear() + y));
export const addMonth = (m) => new Date(new Date().setMonth(new Date().getMonth() + m));
export const addDay = (d) => new Date(new Date().setDate(new Date().getDate() + d));
export const addHour = (h) => new Date(new Date().setHours(new Date().getHours() + h));
export const addMinute = (m) => new Date(new Date().setMinutes(new Date().getMinutes() + m));
export const addSecond = (s) => new Date(new Date().setSeconds(new Date().getSeconds() + s));

const addZero = (numb) => numb < 10 ? '0' + numb : numb

export const formatTime = (date) => {
    let hh = addZero(date.getHours());
    let min = addZero(date.getMinutes());
    let ss = addZero(date.getSeconds());
    let fff = date.getMilliseconds();

    return `${hh}:${min}:${ss}${fff !== 0 ? '.' + fff : ''}`;
}

export const formatDate = (date) => {
    let dd = addZero(date.getDate());
    let mm = addZero(date.getMonth() + 1);
    let yyyy = date.getFullYear();

    return `${dd}.${mm}.${yyyy}`;
}
export const formatDateTime = (date = new Date(), dateTimeFormat = 'dd.mm.yyyy hh:MM:ss') => {

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formatMap = {
        'dd': day,
        'mm': month,
        'yyyy': year,
        'hh': hours,
        'MM': minutes,
        'ss': seconds
    };

    return dateTimeFormat.replace(/dd|mm|yyyy|hh|MM|ss/g, match => formatMap[match]);
}


export const getRandomRange = (min, max, fix = 2) => {
    return (Math.random() * (max - min) + min).toFixed(fix);
}

/**
 * Wrapper для функции (clb), которая будет вызвана не раньше чем через ms мс. после
 * последнего вызова если в момент тишины с момента последнего вызова будет произведен
 * еще вызов то реальный вызов будет не раньше чем через ms мс. после него
 * @param clb
 * @param ms
 * @returns {(function(): void)|*}
 */
export const debounce = (func, ms) => {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), ms);
    };
};

/**
 * Wrapper для функции (clb), которую нельзя вызвать чаще чем tm
 * @param clb
 * @param ms
 * @returns {(function(...[*]): void)|*}
 */
export const throttle = (clb, ms) => {

    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {

        if (isThrottled) { // (2)
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        clb.apply(this, arguments); // (1)

        isThrottled = true;

        setTimeout(function () {
            isThrottled = false; // (3)
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}


export const createExcelFile = async () => {
    // динамически импортируем
    await import( "./utils-lib/exceljs.min.js")

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Me';
    workbook.lastModifiedBy = 'Her';
    workbook.created = new Date(1985, 8, 30);
    workbook.modified = new Date();
    workbook.lastPrinted = new Date(2016, 9, 27);
    workbook.properties.date1904 = true;
    workbook.calcProperties.fullCalcOnLoad = true;
    workbook.views = [
        {
            x: 0, y: 0, width: 10000, height: 20000,
            firstSheet: 0, activeTab: 1, visibility: 'visible'
        }
    ]
// const sheet = workbook.addWorksheet('My Sheet');
// create a sheet with red tab colour
    workbook.addWorksheet('My Sheet', {
        properties: {tabColor: {argb: 'ff00ff00'}}, //optional param
        views: [
            {showGridLines: false},//optional param
            {state: 'frozen', xSplit: 1, ySplit: 1}//optional param
        ],
        headerFooter: {firstHeader: "Hello Exceljs", firstFooter: "Hello World"},//optional param
        pageSetup: {paperSize: 9, orientation: 'landscape'}//optional param
    });


    let worksheet = workbook.getWorksheet(1);
    // Modify/Add individual cell
    let cell = worksheet.getCell('C1');
    cell.value = 'привет';

    const buffer = await workbook.xlsx.writeBuffer()
    // console.log(buffer)
    saveUnitArrayAsFile('test.xlsx', buffer)
}
