import {range} from "../../utils.js";
import Synthesizer from "./synthesizer.js";



let pathSF2 = './libs/components/sound/sf2/';
let pathMidi = './libs/components/sound/mid/';
let arrUrlSF2 = ['HedsoundGMTfix.sf2', 'Ephesus_GM_Version_1_00.sf2', 'FatBoy-v0.789.sf2', 'OPLLandOPLL2DrumFix2.sf2', 'GenieVoice_GM64Pro_2.0_-_All_Sets.sf2', 'eawpats.sf2', 'GeneralUser_GS_SoftSynth_v144.sf2', 'Growtopia.sf2', 'Boyband.sf2', 'Kiara_Klarinet.sf2', 'VintageDreamsWaves-v2.sf2', 'OnuteFont-Mini.sf2']
let arrUrlMidi = ['Pirates of the Caribbean - He is a Pirate (1).mid', 'Star Wars - The Imperial March.mid', 'Under-The-Sea.mid', 'DuckTales MIDI Intro.mid', 'output.mid']


element('player-control', function () {

    // style
    // language=CSS
    this.setStyle(`
        player-control {
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
        }
    `);

    Object.assign(this, new Synthesizer());

    this.range = range;
    this.arrUrlSF2 = arrUrlSF2;
    this.arrUrlMidi = arrUrlMidi;
    this.pathSF2 = pathSF2;
    this.pathMidi = pathMidi;

    this.onConnected = async () => {
        this.innerHTML = '<spinner-process/>'

        this.innerHTML = ''
        // language=JSX
        this.jsx = `
            <drop-list data={this.arrUrlSF2} index="3" onchange={async e => {
                const index = e.target.selectedIndex - 1
                if (~index) await this.loadResource({urlSF: this.pathSF2 + this.arrUrlSF2[index]});
            }}/>
            <drop-list data={this.arrUrlMidi} index="3" onchange={async e => {
                const index = e.target.selectedIndex - 1
                if (~index) await this.loadResource({urlMel: this.pathMidi + this.arrUrlMidi[index]});
            }}/>
            <button-control onclick={async e => {
                this.play();
                this.update();
            }}>►</button-control>
            <button-control onclick={e => this.stop()}>Х</button-control>
            <slider-control change={val => this.seek(val)}
                            label={(val, min, max) => ((min + max === 0) ? 0 : Math.trunc(this.range(min, max, 0, 100, val))) + '%'}
                            value="0" _seeker/>
            <slider-control change={val => this.temp(val)} value="0" max="500" step="10" _tempo/>
            <slider-control change={val => this.volume(val)} value="0" max="10" step=".1" _gain/>
            <slider-control change={val => this.pitch(0, val)}
                            label={(val, min, max) => (Math.trunc(this.range(min, max, -100, 100, val))) + '%'}
                            max="16384" min="0" value="8192"
                            step="1638.4" _pitch/>`;
    };

    this.update = async () => {
        this._gain.setValue(await this.getGain());
        this._tempo.setValue(await this.getBpm());
        this._seeker.setValue(await this.getCurrentTick());
        this._seeker.setMax(await this.getTotalTicks());

        setTimeout(this.update, 200);
    };

});