import {rpc, loadText} from "../../utils.js";
import clientData from '../../clientData.js';

const backgroundColor = 'rgba(0,0,0,0.05)'
const backgroundColorLight = 'rgba(255, 255, 255, 0.5)'
const backgroundColorLight2 = 'rgba(0, 0, 0, 0.08)'

element('s7-control', function () {
    // style
    // language=CSS
    this.setStyle(`
        s7-control {
            font-size: 0.8em;
            display: flex;
            /* border: 1px solid #e4e4e4; */
            flex-direction: column;
            justify-content: flex-start;
            height: inherit;
            align-items: stretch;
            align-content: center;
        }

        s7-control > :not(:last-child) {
            /*margin: .5em 35%;*/
        }

        /*.s7-control__conn > :not(:last-child) {*/
        /*    margin-right: 1em;*/
        /*}*/


        .s7-control__header {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: flex-start;
            /*align-items: center;*/
        }

        s7-control > * {
            margin-top: 1em;
        }

        .s7-control__header > * {
            margin-right: 1em;
            font-size: 1em;
            text-align: center;
            /*height: 2em;*/
            border-radius: 2px;
            padding: 0 .5em;
        }

        .s7-control__label > * {
            background-color: transparent;
        }

        .s7-control__label {
            display: flex;
            margin-right: 0.5em;
            align-items: center;
            flex-direction: row;
            background-color: ${backgroundColorLight};
            border: 1px solid #bdbdbd;
            border-radius: .3em;
        }

        .s7-control__ip {
            width: 140px;
            border: 0;
            text-align-last: end;
            padding-right: .5em;
        }

        .s7-control__rack {
            width: 90px;
            border: 0;
            text-align-last: end;
        }

        .s7-control__slot {
            width: 90px;
            border: 0;
            text-align-last: end;
        }

        .s7-control__threads {
            width: 90px;
            border: 0;
            text-align-last: end;
        }

        .s7-control__all {
            width: 20px;
        }

        .s7-control__empty {
            width: 20px;
        }

        .s7-control__button {
            padding: 0 1em;
            line-height: 2em;
            background-color: ${backgroundColorLight2};
        }

        config-s7-control {
            background-color: ${backgroundColor};
            border: 1px solid #ccc;
        }

        .config-s7-control__chb {
            margin-left: 1em;
        }

        log-message {
            height: 100px;
            background-color: ${backgroundColor};
            font-size: 1.2em;
            border: 1px solid #ccc;
            border-radius: .3em;
        }

        drop-file {
            background-color: #dadada;
            border: 1px solid #b9b9b9;
            color: #4f4c62;
            padding: 0.5em 1em;
            display: flex;
            justify-content: center;
            border-radius: 0.3em;
            min-height: 1.5em;
            margin: 1em 35%;
        }

        .fbi {
            padding: 3px;
            display: flex;
            width: 23px;
            height: 17px;
        }

        .fbi-wrap {
            width: ${'-webkit-fill-available'};
            flex-direction: column;
            flex-wrap: wrap;
            justify-content: center;
        }

        .fbi-nowrap {
            width: ${'-webkit-fill-available'};
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: center;
        }

        .fbi > i {
            display: block;
            background-color: #999;
            min-height: 2px;
            min-width: 2px;
            border-radius: 1px;
            margin: 1px;
        }
    `);

    //behavior
    this.changeModeView = (mode) => {
        switch (mode) {
            case 0:
                this._cfg.style.flexWrap = 'wrap';
                break
            case 1:
                this._cfg.style.flexWrap = 'nowrap';
                break
        }
    }
    this.upload = () => {

        let data = {};
        try {
            data = {
                settings: {
                    host: this['_host'].value,
                    rack: this['_rack'].value,
                    slot: this['_slot'].value,
                    threads: this['_threads'].value,
                }, data: this['_cfg'].getMap()

            }
            console.log(data)
            rpc({
                method: 'method', taskID: 'setData', data, // clbMessage: console.log,
                clbError: (e, ws) => {
                    xlog('Ошибка: ' + ws.url)
                }
            });
        } catch (e) {
            xlog('Ошибка данных')
        }
    }

    this.findNumberAtEnd = (str) => {
        const regex = /\d+$/;
        const match = str.match(regex);

        if (match) {
            return parseInt(match[0]);
        } else {
            return false;
        }
    }

    this.callbackData = (data) => {
        let obj = this['_cfg'].parseDataBlocks(data);

        for (const key in obj) {
            let numb = this.findNumberAtEnd(key)
            if (numb !== false) obj[key].index = numb;
        }

        this['_cfg'].setValue(obj);
    };
    this.selectAll = () => {
        const arrNode = [...document.querySelectorAll('input[type=checkbox]')]
        arrNode.forEach(node => {
            if (node.checked) node.checked = false
            node.click()
        })
    };
    this.selectNone = () => {
        const arrNode = [...document.querySelectorAll('input[type=checkbox]')]
        arrNode.forEach(node => {
            if (!node.checked) node.checked = true
            node.click()
        })
    };

    this.onConnected = () => {
        // language=JSX format=false
        // language=JSX format=false
        // language=JSX
        this.jsx = `<div class="s7-control__header">
            <div class="s7-control__label">
                IP:&nbsp<input class="s7-control__ip" placeholder="адрес" value="${location.host}" type="text"
                               _host/>
            </div>
            <div class="s7-control__label">
                Rack:&nbsp<input class="s7-control__rack" placeholder="rack-номер" min="0" max="1000" value="0"
                                 type="number" _rack/>
            </div>
            <div class="s7-control__label">
                Slot:&nbsp<input class="s7-control__slot" placeholder="номер слота" min="0" max="1000" value="0"
                                 type="number" _slot/>
            </div>
            <div class="s7-control__label">
                Потоков:&nbsp<input class="s7-control__threads" placeholder="количество" min="1" max="12" value="1"
                                    type="number"
                                    _threads/>
            </div>

            <button-group>
                <button-control class="s7-control__button" onclick={() => this.changeModeView(1)}>
                    <i class="fbi fbi-nowrap"><i></i><i></i><i></i><i></i></i>
                </button-control>
                <button-control class="s7-control__button" onclick={() => this.changeModeView(0)}>
                    <i class="fbi fbi-wrap"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></i>
                </button-control>
            </button-group>
            <button-group>
                <button-control class="s7-control__button s7-control__all" onclick={this['selectAll']}>✅
                </button-control>
                <button-control class="s7-control__button s7-control__empty" onclick={this['selectNone']}>🟩
                </button-control>
            </button-group>
            <button-group>
                <button-control class="s7-control__button" onclick={this.upload}>💾</button-control>
            </button-group>
        </div>
        <config-s7-control _cfg></config-s7-control>
        <log-message/>
        <drop-file data={this['callbackData']}>переместите файл с данными сюда</drop-file>`;

        if (document.location.hostname === 'localhost') { // для тестирования
            loadText('./data/10real_50bool_500word.db').then(data => this.callbackData(data))
        } else {// боевой
            clientData['subscribe']({
                taskID: 'getData', data: ['getData'], callbackClose: () => {
                    xwarn('Соединение закрыто')
                }, callbackError: () => {
                    xerr('Ошибка: сервер не отвечает')
                }
            });

            clientData.data.onData('getData', {
                clbInit: (val, path) => {
                    console.log(path, val)

                    let settings = val.settings
                    this['_host'].value = settings.host;
                    this['_rack'].value = settings.rack;
                    this['_slot'].value = settings.slot;
                    this['_threads'].value = settings.threads;
                    this['_cfg'].setValue(val.data)

                }, clbAssign: (val, path) => {
                    xlog('= ' + val)
                }, // clbError: (val) => {
                //     xlog('Срвер инф: ' + val)
                // },
                clbMessage: ({type, value}) => {
                    console.log(type, value)
                    switch (type) {
                        case 'log':
                            xlog(value)
                            break;
                        case 'warn':
                            xwarn(value)
                            break;
                        case 'err':
                            xerr(value)
                            break;
                    }
                }
            });
        }

        // let val = {
        //     "settings": {"host": "192.168.0.177", "rack": "0", "slot": "1"},
        //     "data": {
        //         "DB1": {
        //             "tags": [{"name": "zz", "offset": 0, "type": "Real", "enabled": false}, {
        //                 "name": "Static_1",
        //                 "offset": 1,
        //                 "type": "Bool",
        //                 "enabled": true
        //             }, {"name": "yyy", "offset": 2, "type": "Int", "enabled": false}, {
        //                 "name": "ttt",
        //                 "offset": 3,
        //                 "type": "Int",
        //                 "enabled": true
        //             }], "index": "1"
        //         }
        //     }
        // }
        //
        // setTimeout(() => {
        //     let settings = val.settings
        //     this._host.value = settings.host;
        //     this._rack.value = settings.rack;
        //     this._slot.value = settings.slot;
        //     this._cfg.setValue(val.data)
        // }, 1000);

    };
});