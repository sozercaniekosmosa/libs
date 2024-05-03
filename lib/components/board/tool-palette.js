element('tool-palette', function () {
    // style
    // language=CSS
    this.setStyle(`
        tool-palette {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1em;
            width: -webkit-fill-available;
        }

        tool-palette > * {
            width: 40px;
            height: 40px;
            /*border: 1px solid #e4e4e4;*/
        }

        tool-palette .selected {
            /* outline: 2px solid #6533df; */
            /* outline-offset: -2px; */
            box-shadow: inset 0 0 4px 3px #6533df;
        }

        tool-palette > :not(.selected):hover {
            /*outline: 2px solid #c8b7ff;*/
            /*outline-offset: -2px;*/
            box-shadow: inset 0 0 14px 0 #c8b7ff;
        }
    `);

    this.addEventListener('click', e => {
        [...this.children].forEach(node => node.classList.remove('selected'))
        e.target.classList.add('selected')
        EventBus.dispatchEvent('selcted-tool', e.target.dataset.index)
    })

    this.addItem = (index) => {
        const node = document.createElement('div');
        node.dataset.index = index
        node.style.backgroundImage = `url("${this.mapTile.dirSvg + this.mapTile.list[index].name + '.svg'}")`
        this.appendChild(node);
        return node
    }

    this.onConnected = () => {
        for (let i = 0; i < this.mapTile.list.length; i++) {
            this.addItem(i);
        }
    };
});