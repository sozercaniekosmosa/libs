element('inventory-panel', function () {
    // style
    // language=CSS
    this.setStyle(`
        inventory-panel {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.4em;
            min-height: 40px;
            border: 1px solid #8b8b8b;
            border-radius: 4px;
            padding: 3px;
            align-items: center;
            background-color: #d3dade;
            width: -webkit-fill-available;
        }

        inventory-panel > * {
            width: 40px;
            height: 40px;
        }

        inventory-panel .selected {
            box-shadow: inset 0 0 4px 3px #6533df;
        }

        inventory-panel > :not(.selected):hover {
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

    };
});