element('tile-item', function () {
    // style
    // language=CSS
    this.setStyle(`
        tile-item {
            width: 45px;
            height: 45px;
            border-radius: 0.1em;
            border: 1px solid #1a0623;
            /*transition:all .2s ease-out;*/
        }

        @keyframes blink {
            0% {
                opacity: .8;
            }
            50% {
                opacity: 0;
            }
            100% {
                opacity: .8;
            }

        }

        tile-item .player {
            animation: blink 1s ease-in-out infinite;
            pointer-events: none;
            /* margin: 0.1em; */
            height: 100%;
            width: 100%;
            background-size: cover;
            /*opacity: 0.5;*/
            /* background-color: #00ccc0; */
            background-image: url("./res/SVG/player.svg");
            /* border: 4px solid black; */
            /* border-radius: 50%; */
        }
    `);

    //behavior
    this.changeTile = (index) => {
        if (!this.mapTile) return
        this.dataset.index = index;
        this.dataset.angle = 0;
        const name = this.mapTile.list[index].name
        let dir = this.mapTile.dirSvg;

        if (name === 'empty') {
            this.style.backgroundImage = 'none'
            this.style.transform = 'none'
            this.innerHTML = ''
        } else if (name === 'start') {
            this.style.backgroundImage = `url("${dir + name + '.svg'}")`
            this.innerHTML = '<div class="player"></div>'
            this.dataset.player = true;
        } else {
            this.style.backgroundImage = `url("${dir + name + '.svg'}")`
            this.innerHTML = ''
        }
    };

    //life cycle (event handlers)
    this.onConnected = () => {
        this.mapTile = this.parentElement.mapTile;
        if (!this.dataset.index) this.changeTile(0)
    };
    this.onDisconnected = () => true;
    this.onAdopted = () => true;
    this.onAttribute = () => true;
    this.onVisible = () => true;
    this.onHidden = () => true;
    this.onHideDelayed(() => console.log('Компонент скрылся секунду назад'), 1000);
});