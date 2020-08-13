const NoFail = 1;
const Easy = 2;
const NoVideo = 4;
const Hidden = 8;
const HardRock = 16;
const SuddenDeath = 32;
const DoubleTime = 64;
const Relax = 128;
const HalfTime = 256;
const Nightcore = 512;
const Flashlight = 1024;
const Autoplay = 2048;
const SpunOut = 4096;
const Relax2 = 8192;
const Perfect = 16384;
const Key4 = 32768;
const Key5 = 65536;
const Key6 = 131072;
const Key7 = 262144;
const Key8 = 524288;
const keyMod = 1015808;
const FadeIn = 1048576;
const Random = 2097152;
const LastMod = 4194304;
const Key9 = 16777216;
const Key10 = 33554432;
const Key1 = 67108864;
const Key3 = 134217728;
const Key2 = 268435456;
const SCOREV2 = 536870912;

module.exports = {

    stringlifyMods: (m) => {
        let r = '';
        let hasNightcore = false, hasPF = false;
        if (m & NoFail) {
            r += 'NF';
        }
        if (m & Easy) {
            r += 'EZ';
        }
        if (m & NoVideo) {
            r += 'NV';
        }
        if (m & Hidden) {
            r += 'HD';
        }
        if (m & HardRock) {
            r += 'HR';
        }
        if (m & Nightcore) {
            r += 'NC';
            hasNightcore = true;
        }
        if (!hasNightcore && (m & DoubleTime)) {
            r += 'DT';
        }
        if (m & Perfect) {
            r += 'PF';
            hasPF = true;
        }
        if (m & Relax) {
            r += 'RX';
        }
        if (m & HalfTime) {
            r += 'HT';
        }
        if (m & Flashlight) {
            r += 'FL';
        }
        if (m & Autoplay) {
            r += 'AP';
        }
        if (m & SpunOut) {
            r += 'SO';
        }
        if (m & Relax2) {
            r += 'AP';
        }
        if (!hasPF && (m & SuddenDeath)) {
            r += 'SD';
        }
        if (m & Key4) {
            r += '4K';
        }
        if (m & Key5) {
            r += '5K';
        }
        if (m & Key6) {
            r += '6K';
        }
        if (m & Key7) {
            r += '7K';
        }
        if (m & Key8) {
            r += '8K';
        }
        if (m & keyMod) {
            r += '';
        }
        if (m & FadeIn) {
            r += 'FD';
        }
        if (m & Random) {
            r += 'RD';
        }
        if (m & LastMod) {
            r += 'CN';
        }
        if (m & Key9) {
            r += '9K';
        }
        if (m & Key10) {
            r += '10K';
        }
        if (m & Key1) {
            r += '1K';
        }
        if (m & Key3) {
            r += '3K';
        }
        if (m & Key2) {
            r += '2K';
        }
        if (m & SCOREV2) {
            r += 'V2';
        }
        if (r.length > 0) {
            return '+'+r;
        } else {
            return '';
        }
    },

    formatNumber: (num) =>{
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    },

    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}