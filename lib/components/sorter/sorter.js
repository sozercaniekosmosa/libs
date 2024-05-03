function getHtmlStr(html) {
    const template = document.createElement('template'), content = template.content;
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return content.childNodes.length ? content.childNodes : [content.firstChild];
}

function setStyle(strStyle, cssObjectID = this.tagName) {
    let destNode = document.head;
    let node = destNode.querySelector('.' + cssObjectID);
    strStyle = strStyle.replaceAll(/[\r\n]| {2}/g, '')
    if (!node) destNode.append(getHtmlStr(`<style class='${cssObjectID}'>${strStyle}</style>`)[0]); else node.innerHTML = strStyle;

    return node;
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
const generateUID = (pre = '') => pre + toShortString((new Date().getTime()) + Math.ceil(Math.random() * 100) + (__id++))

function toLocalPos({target, clientX, clientY}) {
    var {left, top} = target.getBoundingClientRect();
    return {x: clientX - left, y: clientY - top};
}

export default class {
    mb = false;

    constructor({clbStart = false, clbOver = false, clbEnd = false} = {}) {

        //language=CSS
        const style = `
            .dragover.center {
                position: relative;
            }

            .dragover.center::before {
                content: "";
                position: absolute;
                top: 33.33%;
                left: 33.33%;
                right: 33.33%;
                bottom: 33.33%;
                outline: 3px solid gray;
            }

            .dragover {
                outline: 3px solid gray;
                outline-offset: -3px;
            }
        `
        setStyle(style, generateUID('sorter'))

        let nodeArr = document.querySelectorAll('.sortable')
        nodeArr.forEach(node => node.setAttribute('draggable', true))

        this.nodeContainer = document.body;

        this.clbStart = clbStart;
        this.clbOver = clbOver;
        this.clbEnd = clbEnd;
        this.nodeDragging = false;
        this.isClose = false;
        this.lastIndex = 0;

        this.nodeContainer.addEventListener('mouseup', this.mouseUp.bind(this));
        this.nodeContainer.addEventListener('mousedown', this.mouseDown.bind(this));
        this.nodeContainer.addEventListener('dragstart', this.dragStart.bind(this));
        this.nodeContainer.addEventListener('dragover', this.dragOver.bind(this));
        this.nodeContainer.addEventListener('drop', this.drop.bind(this));
    }

    mouseDown(event) {
        this.mb = true;
    }

    mouseUp(event) {
        this.mb = false;
    }

    dragStart(event) {
        var target = event.target;

        if (!!this.clbStart && this.clbStart(this.nodeDragging, target, this.isLeftSide, this.isCenter)) {
            this.nodeDragging = false;
            return
        }

        this.nodeDragging = target;
        this.selectIndex = [...target.parentElement.children].findIndex(it => it === target);
    }

    dragOver(event) {
        var target = event.target;
        var {x, y} = toLocalPos(event);

        if (!this.nodeDragging) return

        event.target?.classList.remove('dragover')
        event.target?.classList.remove('center')
        this._target?.classList.remove('dragover')
        this._target?.classList.remove('center')

        let {width: w, height: h} = target.getBoundingClientRect();
        let [xl, xr, yt, yb] = [w / 4, w * 3 / 4, h / 4, h * 3 / 4];
        this.isCenter = x < xr && x > xl && y < yb && y > yt;
        this.isLeftSide = x < w / 2;

        if (event.target === this.nodeDragging) return

        if (!!this.clbOver && this.clbOver(this.nodeDragging, target, this.isLeftSide, this.isCenter)) return

        let index = [...target.parentElement.children].findIndex(it => it === target)
        this.isClose = this.selectIndex > index;

        target.classList.add('dragover')
        if (this.isCenter) {
            // if (!target.closest('.sort-add')) return;
            target.classList.add('center')
        }

        event.preventDefault();

        this._target = target;
    }

    drop(event) {
        this._target?.classList.remove('dragover')
        this._target?.classList.remove('center')

        const target = event.target

        if (target === this.nodeDragging) return

        let node;
        if (!!this.clbEnd) {
            node = this.clbEnd(this.nodeDragging, target, this.isLeftSide, this.isCenter);
        }

        if (!node) node = this.nodeDragging

        node.classList.add('sortable');
        node.setAttribute('draggable', true)


        if (this.isCenter) {
            this.integrate(target, 'append', node); //target.append(node)
        } else {
            if (this.clbEnd && node !== this.nodeDragging) this.integrate(target, this.isLeftSide ? 'before' : 'after', node); else this.integrate(target, this.isClose ? 'before' : 'after', node);
        }

        event.preventDefault();
    }

    integrate(dest, method, src) {
        dest[method](src);
    }
}
