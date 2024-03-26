import {loadText, rpc} from "../../utils.js";

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

        .s7-control__header {
            display: flex;
            margin: 1em 35%;
        }

        .s7-control__btn:first-child {
            margin-left: 0;
        }

        .s7-control__btn {
            width: auto;
            padding: 0.5em 1em;
            margin-left: 1em;
            flex: 1;
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
    `);

    //behavior
    this.someMethod = () => true;
    this.upload = () => {

        let data = '';
        try {
            data = this._cfg.getMap();
            console.log(data)
            rpc({
                method: 'method', taskID: 'uploadData',
                data: {data},
                // clbMessage: console.log,
                clbError: (e, ws) => {
                    this._pop.log('Ошибка: ' + ws.url)
                }
            });
        } catch (e) {
            this._pop.log('Ошибка данных')
            return
        }
    }
    this.callbackData = (data) => {
        let arrRes = this._cfg.parseDataBlocks(data);
        this._cfg.setValue(arrRes);
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
        //language=JSX
        this.jsx = `
            <div class="s7-control__header">
                <button-control class="s7-control__btn" onclick={this.upload}>Сохранить</button-control>
                <button-control class="s7-control__btn" onclick={this.selectAll}>Все</button-control>
                <button-control class="s7-control__btn" onclick={this.selectNone}>Очистить</button-control>
            </div>
            <config-s7-control _cfg></config-s7-control>
            <drop-file data={this.callbackData}>перетащите файл с данными сюда</drop-file>
            <popup-message _pop/>`;

        // loadText('../data/DB_100.db').then(data => {
        //     let arrRes = this._cfg.parseDataBlocks(data);
        //     this._cfg.setValue(arrRes);
        // })
    };
});