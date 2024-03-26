import jsx from './jsx.js'

// window.__uri_inc = 0;
// HTMLElement.prototype.genURI = function (prefix = 'uri') {
//     return prefix + (new Date()).getTime() + window.__uri_inc++;
// }
// HTMLElement.prototype.getURI = function (prefix = 'uri') {
//     return this.className.split(' ').find(it => ~it.indexOf(prefix)); //TODO: возможно нужно оптимизировать ч/з обчный цикл (classList)
// }
// HTMLElement.prototype.setURI = function (uri) {
//     return this.classList.add(uri);
// }
// HTMLElement.prototype.isClass = function (className) {
//     return this.classList.contains(uri);
// }

const isFunction = functionToCheck => functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';

const ATTRIBUTES = new Set(['align', 'alt', 'bgcolor', 'border', 'char', 'charoff', 'charset', 'cite', 'compact', 'disabled',
    'height', 'href', 'hspace', 'longdesc', 'name', 'size', 'src', 'target', 'type', 'valign', /*'value',*/ 'vspace', 'width', 'readonly']);

function getHtmlStr(html) {
    const template = document.createElement('template'), content = template.content;
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return content.childNodes.length ? content.childNodes : [content.firstChild];
}

let global = {};//единая для всех глобальная область храниения

export default class BaseHTMLElement extends HTMLElement {
    id = {};
    isVisible = true;

    constructor() {
        super();
        this.global = global;

        document.addEventListener('visibilitychange', () => {
            this.isVisible = !document.hidden;
            if (!document.hidden)
                this.onVisible && this.onVisible()
            else
                this.onHidden && this.onHidden()
        }, false);
    }

    error(str) {
        throw `${this.tagName} ${str}`
    }

    setStyle(strStyle, cssObjectID = this.tagName) {
        let destNode = document.head;
        let node = destNode.querySelector('.' + cssObjectID);
        strStyle = strStyle.replaceAll(/[\r\n]| {2}/g, '')
        if (!node)
            destNode.append(getHtmlStr(`<style class='${cssObjectID}'>${strStyle}</style>`)[0]);
        else
            node.innerHTML = strStyle;

        return node;
    }

    setStyleShadow(strStyle, cssObjectID = this.tagName) {
        let destNode = this;
        let node = destNode.querySelector('.' + cssObjectID);
        strStyle = strStyle.replaceAll(/[\r\n]| {2}/g, '')
        if (!node)
            destNode.append(getHtmlStr(`<style class='${cssObjectID}'>${strStyle}</style>`)[0]);
        else
            node.innerHTML = strStyle;

        return node;
    }

    traverse(arr, dest) {
        let el;
        arr = Array.isArray(arr) ? arr : [arr]
        for (let i = 0; i < arr.length; i++) {
            const it = arr[i];
            if (typeof it === 'string') dest.innerHTML = it;
            const {children, props, type} = it;

            if (type) {
                el = document.createElement(type)
                // dest.append(el);
            }
            if (props) {
                let arrKeys = Object.entries(props);
                for (const [key, val] of arrKeys) {
                    if (key.startsWith('_')) {
                        this[key] = el;
                        // if (this[key] === undefined)
                        //     this[key] = el;
                        // else if (Array.isArray(this[key])) {
                        //     this[key].push(el)
                        // } else {
                        //     this[key] = [this[key], el];
                        // }
                    } else if (key.startsWith('on')) {
                        const eventName = key.toLocaleLowerCase().substring('on'.length);
                        el.addEventListener(eventName, val);
                    } else if (key.startsWith('class')) {
                        el.className = val;
                    } else if (key === 'destination') {
                        isFunction(val) && this.arrPreChild && [...this.arrPreChild].forEach((node, i) => val(node, i))
                        this.destination = el;
                    } else if (key === 'id') {
                        el.id = val;
                    } else if (key.startsWith('style')) {
                        el.style.cssText = val;
                    } else if (ATTRIBUTES.has(key)) {
                        el.setAttribute(key, val)
                    } else {
                        el[key] = val;
                    }
                }
            }
            if (children) {
                this.traverse(children, el);
            }
            el && dest.append(el)
        }
    }

    set jsx(html) {
        this.arrPreChild = [...this.children];
        const obj = jsx(html, {clbEval: expr => eval(expr)})
        this.traverse(obj, this);
        // const shadow = this.attachShadow({mode: 'open'});
        // this.traverse(obj, shadow);
        this.destination && this.destination.append(...this.arrPreChild)
    }

    objectHTML(obj) {
        this.traverse(obj, this);
    }

    static get setDataobservedAttributes() {
        return [/* массив имён атрибутов для отслеживания их изменений */];
    }

    connectedCallback() {
        if (!this?.timestamp) {
            this.timestamp = new Date().getTime();
            this.onConnectedInit && this.onConnectedInit(this); // браузер вызывает этот метод ОДИН РАЗ при добавлении элемента в документ в момент инициализации
        }
        this.onConnected && this.onConnected(this);// браузер вызывает этот метод при добавлении элемента в документ

        // window.EventBus.dispatchEvent('connected')
    }

    disconnectedCallback() {// браузер вызывает этот метод при удалении элемента из документа
        this.onDisconnected && this.onDisconnected(this);
    }

    attributeChangedCallback(name, oldValue, newValue) {// вызывается при изменении одного из перечисленных атрибутов
        this.onAttribute && this.onAttribute(name, oldValue, newValue);
    }

    adoptedCallback() {// вызывается, когда элемент перемещается в новый документ (происходит в document.adoptNode, используется очень редко)
        this.onAdopted && this.onAdopted();
    }

    /**
     * Обработчик события когда компонент становится не видимым на экране с задержкой перед вызовом
     * @param clb - обработчик
     * @param ms - время задержки перед вызовом (1000 мс)
     */
    onHideDelayed = (clb, ms = 1000) => {
        let timerID;
        this.onHidden = () => {
            timerID && clearTimeout(timerID)
            timerID = setTimeout(clb, ms);
        }
    };

    // #base64Language = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // #toShortString = (value, language = this.#base64Language) => {
    //     const len = language.length;
    //     let acc = "";
    //     while (value > 0) {
    //         const index = value % len;
    //         acc += language.charAt(index);
    //         value /= len;
    //     }
    //     return acc.split('').reverse().join('').replace(/^0+/g, '');
    // };
    //
    // #__id = 0;
    // getUID = (pre = '') => pre + this.#toShortString((new Date().getTime()) + Math.ceil(Math.random() * 100) + (this.#__id++))

}

// EventBus.dispatchEvent('evb-key', {event, combine, nodeFocus}))
class EventBus {
    constructor() {
        this.bus = document.createElement('eventbus');
    }

    addEventListener(event, callback) {
        this.bus.addEventListener(event, e => callback(e.detail));
    }

    removeEventListener(event, callback) {
        this.bus.removeEventListener(event, callback);
    }

    dispatchEvent(event, data = {}) {
        this.bus.dispatchEvent(new CustomEvent(event, {detail: data}));
    }
}

window.EventBus = new EventBus;

window.element = (elementName, callback) => {

    class _ extends BaseHTMLElement {
        constructor() {
            super();
            callback.call(this);
        }
    }

    customElements.define(elementName, _);
}

// How to use:
// window.createKeyHandler(window, ({event, combine, nodeFocus}) => EventBus.dispatchEvent('evb-key', {event, combine, nodeFocus}));
//-----------------------------------------------------
let last_keys = {};
let keys = {};
let keyCodes = {};
let combs = {};
let keys01 = {};
let keys10 = {};

let resetKeyState = () => {
    keys = {};
    keyCodes = {};
    combs = {};
    keys01 = {};
    keys10 = {};
    last_keys = {};
}
window.createKeyHandler = (nodeSrcEvent, callback) => {
    let last_keys = {};
    let keys = {};
    let keyCodes = {};
    let combs = {};
    let keys01 = {};
    let keys10 = {};

    let isKey = (keyCombination) => {
        let arrKey = keyCombination.toLowerCase().replaceAll('-', '').split(' ');
        let isPressed
        isPressed = arrKey.every(it => keyCodes[it]);
        if (isPressed && !combs[keyCombination]) return combs[keyCombination] = true;
        if (!isPressed && combs[keyCombination]) combs[keyCombination] = false;
        // console.log(keyCodes)
        return false;
    }

    const keyHandler = (e) => {
        let {altKey, ctrlKey, key, code, shiftKey, type} = e;
        // console.log(altKey, ctrlKey, key, code, shiftKey, type)
        const altKeyName = shiftKey ? 'shift' : ctrlKey ? 'control' : altKey ? 'alt' : false;
        if (altKeyName) keys[altKeyName.toLowerCase()] = type === 'keydown';
        key = key.toLowerCase();

        if (key) {
            if (keys[key] !== undefined) if (          //все залипло если (undefined ВАЖЕН!)
                (keys[key] && type === 'keydown') ||   //если такая кнопка уже нажата
                key === 'escape' ||                    // по ESC все сбрасываем
                Object.values(keys[key]).reduce((acc, it) => (it & 1) + acc, 0) > 3//нажатых более 3-х
            ) resetKeyState();

            keys01[key] = (last_keys[key] === 'keyup' || last_keys[key] === undefined) && type === 'keydown';
            keys10[key] = (last_keys[key] === 'keydown' || last_keys[key] === undefined) && type === 'keyup';

            keys[key] = type === 'keydown';
            keyCodes[code.toLowerCase()] = type === 'keydown';

            last_keys[key] = type;
        }

        if (keys01[key] || keys10[key]) {
            callback && callback({event: e, combine: isKey, nodeFocus: document.activeElement, keys});
        }
    }
    nodeSrcEvent.addEventListener('keyup', keyHandler, true);
    nodeSrcEvent.addEventListener('keydown', keyHandler, true);
}

const lenVector = (x, y) => Math.sqrt(x * x + y * y);
let mouse = {
    type: '',
    leftButton: false, middleButton: false, rightButton: false, over: false,
    dx: 0, dy: 0, x: 0, y: 0,
    sx: 0, sy: 0,//start
    ex: 0, ey: 0,//end
    left: 0, top: 0, right: 0, bottom: 0,
    delta: 0, //mouse wheel
    rsx: 0, rsy: 0 //relation
};

window.createMouseHandler = (srcEvent, callback) => {
    const mouseHandler = (e) => {
        let parent = e.target.parentElement;
        let bounds = parent ? parent.getBoundingClientRect() : {left: 0, top: 0};


        let {clientX, clientY, target, type} = e;
        let rx = clientX - e.currentTarget.offsetLeft;
        let ry = clientY - e.currentTarget.offsetTop;
        if (type === 'wheel') mouse = {...mouse, ...{type, delta: Math.sign(e.deltaY)}}
        if (type === 'mousedown')
            mouse = {
                ...mouse, ...{
                    type,
                    leftButton: e.button === 0,
                    middleButton: e.button === 1,
                    rightButton: e.button === 2,
                    overPress: false, overRelease: target,
                    sx: clientX, sy: clientY,
                    rsx: rx, rsy: ry,
                    dragstart: false,
                    dragend: false,
                    dragging: false
                },
            };
        if (type === 'mouseup') {
            let distance = lenVector(clientX - mouse.sx, clientY - mouse.sy);
            if (e.button === 0) mouse.leftButton = false;
            if (e.button === 1) mouse.middleButton = false;
            if (e.button === 2) mouse.rightButton = false;
            mouse = {
                ...mouse, ...{
                    type,
                    overPress: target, overRelease: false,
                    ex: clientX, ey: clientY,
                    rex: rx, rey: ry,
                    distance,
                    dragstart: false,
                    dragend: mouse.dragging,
                    dragging: false
                },
            };
        }
        if (type === 'mousemove') {
            let dist = mouse.leftButton && lenVector(clientX - mouse.sx, clientY - mouse.sy);
            mouse = {
                ...mouse, ...{
                    type,
                    x: clientX, y: clientY,
                    rx, ry,
                    dx: clientX - mouse.x, dy: clientY - mouse.y,
                    left: mouse.sx, top: mouse.sy,
                    right: mouse.x, bottom: mouse.y,
                    dragstart: dist > 3 && dist <= 5,
                    dragging: mouse.leftButton ? dist > 5 : false,
                    dragend: mouse.dragend ? false : mouse.dragend,
                },
            }
        }
        callback && callback({event: e, mouse: mouse, target});
    }

    srcEvent.addEventListener('click', (e) => mouseHandler(e), true);
    srcEvent.addEventListener('mousedown', (e) => mouseHandler(e), true);
    srcEvent.addEventListener('mouseup', (e) => mouseHandler(e), true);
    srcEvent.addEventListener('mousemove', (e) => mouseHandler(e), true);
    srcEvent.addEventListener('contextmenu', (e) => mouseHandler(e), true);
    srcEvent.addEventListener('dblclick', (e) => mouseHandler(e), true);
    srcEvent.addEventListener('wheel', (e) => mouseHandler(e), true);
}