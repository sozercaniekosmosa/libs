import {debounce} from "../../utils.js";

const backgroundColor = '#ffffff5c'
const backgroundColorHover = '#00000010'
const colorFontType = '#00000080'

element('config-s7-control', function () {

    // style
    // language=CSS
    this.setStyle(`
        config-s7-control {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            padding: 1em;
            /*margin: 0 35%;*/
            /*background-color: rgba(0,0,0,0.03);*/
            border: 1px solid #ccc;
            border-radius: .3em;
            overflow: auto;
            flex: 1;
            align-self: stretch;
        }

        .config-s7-control__db-item {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            margin-right: 3em;
        }

        .config-s7-control__type {
            /*font-weight: bold;*/
            color: ${colorFontType};
        }

        .config-s7-control__db-name:hover {
            background-color: ${backgroundColorHover};
        }

        .config-s7-control__db-name {
            font-weight: bold;
            cursor: default;
        }

        .config-s7-control__db-header {
            display: flex;
            align-items: center;
        }

        .config-s7-control__db-index {
            font-weight: bold;
            cursor: default;
            /*width: 2px;*/
            margin-left: .5em;
            padding: 0 .3em;
            /*border: 1px solid #e9e9e9;*/
            border: none;
            color: #414141;
            border-radius: 4px;
            background-color:${backgroundColor}
        }

        .config-s7-control__arr-name:hover {
            background-color: ${backgroundColorHover};
        }

        .config-s7-control__arr-name {
            cursor: default;
            display: flex;
            flex-direction: row;
        }
        .config-s7-control__arr-name>input {
            margin-top: 1px;
        }

        .config-s7-control__arr-item {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            cursor: default;
        }

        .config-s7-control__arr-item:hover {
            background-color: ${backgroundColorHover};
        }

        button-control {
            background-color: #dadada;
            border: 1px solid #b9b9b9;
            color: #4f4c62;
        }
    `);

    this.setValue = (arrRes) => {
        this.innerHTML = '<spinner-process _wait/>'
        setTimeout(() => this._setValue(arrRes), 200)
    }

    let groupUpdate = debounce((node) => {
        let nodeGroup = node.closest('.container-hide-control__element')
        if (nodeGroup === null) return;

        let quantity = nodeGroup.childElementCount - 1;
        let quantityChecked = [...nodeGroup.querySelectorAll('.config-s7-control__chb:checked')].length
        let nodeCheckboxGroup = nodeGroup.querySelector('.config-s7-control__arr-name > input');
        nodeCheckboxGroup.checked = quantityChecked === quantity;
    }, 200);

    const change = (e) => {
        let node = e.target ?? e;

        if (!node.nameDB) {
            if (node['path'] === undefined) return;
            let d = this.list;
            node['path'].split('.').forEach(k => d = d?.[k]);
            d.enabled = node.checked;
        } else {
            this.list[node.nameDB].index = node.value;
        }

        groupUpdate(node);
    };

    this.groupSelect = (e) => {
        const isChecked = e.target.checked;
        const arrNode = [...e.target.parentElement.parentElement.querySelectorAll('input[type=checkbox]')]
        arrNode.forEach(node => {
            if (isChecked !== node.checked) node.click()
        })
    }

    this._setValue = (list) => {

        let arrRes = Object.entries(list);
        arrRes.sort((a, b) => a[0].localeCompare(b[0]));
        // debugger
        this.innerHTML = '';
        this.map = [];
        this.mapSelected = new Set();
        window.mapSelected = this.mapSelected;
        let jsx = '';
        this.list = list;
        for (let i = 0; i < arrRes.length; i++) {
            const [nameDB, db] = arrRes[i];
            let {index, tags} = db;
            this.nameDB = nameDB;
            let html = '';
            for (let j = 0; j < tags.length; j++) {
                const {name, type, size, enabled, offset, values} = tags[j];
                if (size) { //is array
                    const generalСheck = values.every(it => it.enabled);
                    // language=JSX
                    html += `<container-hide-control hide>
                        <div class="config-s7-control__arr-name">
                            <input type="checkbox" onchange={this.groupSelect} ${generalСheck ? 'checked' : ''}/>
                            <div>${name}:</div>
                            <div class="config-s7-control__type">${type} (${size})</div>
                        </div>`
                    for (let k = 0; k < size; k++) {
                        // language=JSX
                        html +=
                            `<div class="config-s7-control__arr-item">
                                <input class="config-s7-control__chb" type="checkbox"
                                       path="${nameDB}.tags.${j}.values.${k}"
                                       ${values[k].enabled ? 'checked' : ''}/>
                                <div>${k}</div>
                            </div>`

                        this.map.push(`${nameDB}.${name}.${k}`)
                    }
                    html += `</container-hide-control>`
                } else {
                    // language=JSX
                    html +=
                        `<div class="config-s7-control__arr-item">
                            <input type="checkbox" path="${nameDB}.tags.${j}" ${enabled ? 'checked' : ''}/>
                            <div>${name}:</div>
                            <div class="config-s7-control__type">${type}</div>
                        </div>`
                    this.map.push(`${nameDB}.${name}`)
                }
            }

            // language=JSX
            jsx +=
                `<div class="config-s7-control__db-item">
                    <div class="config-s7-control__db-header">
                        <div class="config-s7-control__db-name">${nameDB}</div>
                        <input class="config-s7-control__db-index" type="number" min="0" max="9999"
                               value="${index ?? i}"
                               nameDB="${nameDB}" oninput={this.onInputIndex}/>
                    </div>
                    <div>${html}</div>
                </div>`;
        }
        this.jsx = jsx;
        // setTimeout(() => this.querySelectorAll('input')[1].click(), 500)
        // setTimeout(() => this.querySelectorAll('input')[12].click(), 500)
        this.addEventListener('change', change)

        setTimeout(() => this.querySelectorAll('input[type=number]').forEach(node => {
            node.style.width = node.value.toString().length + 1 + 'em'
        }), 100)
    };

    this.onInputIndex = ({target}) => {
        target.style.width = target.value.toString().length + 1 + 'em';
    };

    this.getMap = () => this.list;

    this.onConnected = () => {
    };

    this.parseDataBlocks = parseDataBlocks;

});

function noramalizeString(str) {
    str = str.replaceAll(/\/\/.*/g, '') // remove line comments
    str = str.replaceAll(/\s/g, '')
    return str;
}

function getArrDataBlock(data) {
    let arr = data.split('DATA_BLOCK"');
    return arr.filter(it => it.length !== 0);
}

function cropStr(it, end, start = 0) {
    let substr = it.substring(start, end);
    let str = it.slice(substr.length, it.length)
    return {substr, str};
}

function parseDataBlocks(data) {

    data = noramalizeString(data);

    let arrDataBlock = getArrDataBlock(data)
    let list = {};

    for (let i = 0; i < arrDataBlock.length; i++) {
        let it = arrDataBlock[i];
        let indexName = it.indexOf('"');
        let crop = cropStr(it, indexName);
        let name = crop.substr;

        it = crop.str;

        let indexStructStart = it.indexOf('STRUCT') + 'STRUCT'.length;
        let indexStructEnd = it.indexOf('END_STRUCT', indexStructStart);

        crop = cropStr(it, indexStructEnd, indexStructStart);

        let arrStruct = crop.substr.split(';');
        let tags = [];

        for (let j = 0; j < arrStruct.length; j++) {
            let itStruct = arrStruct[j];
            if (itStruct.length === 0) continue;
            let type = '', size = 0;
            let name = itStruct.split(':')[0];
            let part = itStruct.split(':')[1];
            let indexArr = part.indexOf('Array');
            let isArray = !!(~indexArr);
            if (isArray) {
                [size, type] = part.split(']of');
                size = parseInt(size.split('..')[1]);
            } else {
                type = part;
            }
            if (size)
                tags.push({
                    name, offset: 0, type, size,
                    values: Array(size).fill({}).map((it, i) => ({offset: i, enabled: false})),
                })
            else
                tags.push({name, offset: 0, type, enabled: false})
        }

        list[name] = {tags, index: i}
    }
    return list;
}