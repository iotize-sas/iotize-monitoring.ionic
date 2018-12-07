export class NFCHelper {
    static bytesToBleMACAddress (bytes: number[]): string {
        const byteArray = bytes.slice(1).reverse();
        return Array.from(byteArray, function(byte) {
            return ('0' + (byte & 0xFF).toString(16).toUpperCase()).slice(-2);
          }).join(':');
    }
    static bytesToASCII (bytes: number[]): string {
        return String.fromCharCode(...bytes.slice(1));
    }
}