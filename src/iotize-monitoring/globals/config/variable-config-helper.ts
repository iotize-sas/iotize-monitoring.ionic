import { FloatConverter, NumberConverter } from "@iotize/device-client.js/client/impl";

export class VariableConfigHelper {
    static UnitSizeMap: any = {
        0: 1,
        1: 8,
        2: 16,
        3: 32
    }
    static getConverter(unitSize, signed?, lsb?, float?) {
        if (float) {
            return FloatConverter.instance32();
        } else {
            return new NumberConverter({
                signed: signed? signed: false,
                sizeOf: this.UnitSizeMap[unitSize],
                leastSignificantBitFirst: lsb? lsb: false
            })
        }
    }
}