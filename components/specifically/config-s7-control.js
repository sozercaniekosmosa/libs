element('config-s7-control', function () {

    // style
    // language=CSS
    this.setStyle(`
        config-s7-control {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            padding: 1em;
            margin: 0 35%;
            background-color: #ececec;
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
        }

        .config-s7-control__type {
            font-weight: bold;
            color: #a7acbd;
        }

        .config-s7-control__db-name:hover {
            background-color: #d9d9d9;
        }

        .config-s7-control__db-name {
            font-weight: bold;
            cursor: default;
        }

        .config-s7-control__arr-name:hover {
            background-color: #d9d9d9;
        }

        .config-s7-control__arr-name {
            cursor: default;
            display: flex;
            flex-direction: row;
        }

        .config-s7-control__arr-item {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            cursor: default;
        }

        .config-s7-control__arr-item:hover {
            background-color: #d9d9d9;
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

    const change = (e) => {
        let node = e.target ?? e;
        if (node.index === undefined) return;
        let select = this.map[node.index]
        this.mapSelected[node.checked ? 'add' : 'delete'](select)

        console.log(select, this.mapSelected)
    };

    this.groupSelect = (e) => {
        const isChecked = e.target.checked;
        const arrNode = [...e.target.parentElement.parentElement.querySelectorAll('input[type=checkbox]')]
        arrNode.forEach(node => {
            if (node.index === undefined) return;
            if (isChecked !== node.checked) node.click()
        })
    }

    this._setValue = (arrRes) => {
        console.info(arrRes)
        this.innerHTML = '';
        this.map = [];
        this.mapSelected = new Set();
        let jsx = '';
        for (let i = 0; i < arrRes.length; i++) {
            const {name: nameDB, struct: arrStruct} = arrRes[i];
            let struct = '';
            for (let j = 0; j < arrStruct.length; j++) {
                const {name, type, size} = arrStruct[j];
                if (size) { //is array
                    // language=JSX
                    struct += `<container-hide-control hide>
                        <div class="config-s7-control__arr-name">
                            <input type="checkbox" onchange={this.groupSelect}/>
                            <div>${name}:</div>
                            <div class="config-s7-control__type">${type} (${size})</div>
                        </div>`
                    for (let k = 0; k < size; k++) {
                        // language=JSX
                        struct +=
                            `<div class="config-s7-control__arr-item"><input type="checkbox" index=${this.map.length}/>
                                <div>${k}</div>
                            </div>`

                        this.map.push(`${nameDB}.${name}.${k}`)
                    }
                    struct += `</container-hide-control>`
                } else {
                    // language=JSX
                    struct +=
                        `<div class="config-s7-control__arr-item"><input type="checkbox" index=${this.map.length}/>
                            <div>${name}:</div>
                            <div class="config-s7-control__type">${type}</div>
                        </div>`
                    this.map.push(`${nameDB}.${name}`)
                }
            }

            // language=JSX
            jsx += `<div class="config-s7-control__db-item">
                <div class="config-s7-control__db-name">${nameDB}</div>
                <div>${struct}</div>
            </div>`;

        }
        this.jsx = jsx;

        this.addEventListener('change', change)
    };

    this.getMap = () => [...this.mapSelected.values()];

    this.onConnected = () => {
    };

    this.parseDataBlocks = parseDataBlocks;

});

function noramalizeString(str) {
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
    let arrRes = [];

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
        let struct = [];

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
            struct.push({name, type, size})
        }

        arrRes.push({name, struct})
    }
    return arrRes;
}