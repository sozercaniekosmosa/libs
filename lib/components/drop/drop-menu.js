import '../../BaseHTMLElement/BaseHTMLElement.js'
import '../button/button-control.js'

//TODO: не дописан, доделать
element('drop-menu', function () {

    // style
    // language=CSS
    this.setStyle(`
        drop-menu {
        }
    `);

    this.index ??= 0;
    this._data = [];
    Object.defineProperty(this, "data", {
        set: val => {
            this._data = val;
            this.render();
        }, get: () => this._data,
    });

    this.render = () => {
        this.jsx = `
            <button-control type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">+</button-control>
            <ul class="dropdown-menu" _dropdown_menu>
                <li><a href="#" class="small" data-value="option1" tabIndex="-1"><input type="checkbox"/>&nbsp;Option 1</a></li>
                <li><a href="#" class="small" data-value="option2" tabIndex="-1"><input type="checkbox"/>&nbsp;Option 2</a></li>
                <li><a href="#" class="small" data-value="option3" tabIndex="-1"><input type="checkbox"/>&nbsp;Option 3</a></li>
                <li><a href="#" class="small" data-value="option4" tabIndex="-1"><input type="checkbox"/>&nbsp;Option 4</a></li>
                <li><a href="#" class="small" data-value="option5" tabIndex="-1"><input type="checkbox"/>&nbsp;Option 5</a></li>
                <li><a href="#" class="small" data-value="option6" tabIndex="-1"><input type="checkbox"/>&nbsp;Option 6</a></li>
            </ul>`;

        this._dropdown_menu.addEventListener('click', function ({target, currentTarget}) {
            target.blur();
            return false;
        });
    };

    this.onConnected = () => {
        this.render();
    }

});