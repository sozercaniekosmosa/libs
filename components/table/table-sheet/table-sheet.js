import '../../../BaseHTMLElement/BaseHTMLElement.js'

// https://github.com/jspreadsheet/ce
// https://bossanova.uk/jspreadsheet/v4/examples

element('table-sheet', function () {
    // style
    // language=CSS
    this.setStyle(`
        table-sheet {
            /*width: 24px;*/
            /*height: 24px;*/
            /*border-radius: 0.1em;*/
            /*border: 1px solid #e4e4e4;*/
        }
    `);

    //behavior
    this.someMethod = () => true;
    this.data = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
    ];
    this.callbackUpdate = (instance, cell, col, row, val, label, cellName) => {
        // if (cell.innerHTML === 'Total') cell.parentNode.style.backgroundColor = '#fffaa3';
        cell.style.backgroundColor = row  % 2 === 0 ? '#ffffff' : '#f7f7f7';

    };


    // текстовый: { type: 'text', title:'Car', width:120 },
    // numeric:  { type: 'numeric', title:'Price', width:100, mask:'$ #.##,00', decimal:',' },
    // скрытый: { type: 'hidden'},
    // выпадающий список: { type: 'dropdown', title:'Make', width:200, source:[ "Alfa Romeo", "Audi", "Bmw" ],  autocomplete:true, multiple:true},
    // переключатель:  { type: 'checkbox', title:'Stock', width:80 },
    // radio
    // calendar
    // image
    // color
    // html

    // общие поля типа:
    //  title:'...', width:...

    // пример:
    // this.columns = [{type: 'text', width: 200,}];

    this.columns = [];

    //life cycle (event handlers)
    this.onConnected = () => {
        render()
    };

    const render = () => {
        if (this.data === undefined) return;

        const cfg = {
            data: this.data,
            columns: this.columns,
            updateTable: this.callbackUpdate,
            columnSorting: false,
            hideHeaders:true
        }
        jspreadsheet(this, cfg);
    }
})