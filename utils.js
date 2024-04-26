//!1

// import './bundle.js'

// export const {DataEvents, getID, generateUID, throttle, debounce, getRandomRange, formatTime, formatDate, formatDateTime} = utils;


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
            } else {
                clbClose && clbClose();
                console.log('Обрыв соединения'); // например, "убит" процесс сервера
            }
            console.log('Код: ' + e.code + ' причина: ' + e.reason);
            // ws.terminate();
        } catch (err) {
            clbClose && clbClose();
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

export const rpc = ({host, port, protocol = 'json', method = 'method', data, clbMessage, taskID, clbError, clientData} = {}) => {
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

export function saveUnitArrayAsFile(encoded) {
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
    pom.setAttribute('download', 'output.mid');
    document.body.appendChild(pom);
    pom.click();
    document.body.removeChild(pom);
}

export const createTable = (columns, rows, clb) => {
    const table = document.createElement('table');
    for (let i = 0; i < rows; i++) {
        const row = table.insertRow();
        for (let j = 0; j < columns; j++)
            clb && clb({row, cell: row.insertCell(), x: j, y: i});
    }
    document.body.appendChild(table);
    return table
}