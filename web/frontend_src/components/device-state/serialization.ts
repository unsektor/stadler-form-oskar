import {DeviceState} from "./default";


export interface DeviceStateFormatInterface {
    toNumber(deviceState: DeviceState): number;
    fromNumber(number: number): DeviceState;
}

export class NineBitsDeviceStateFormat implements DeviceStateFormatInterface {
    public toNumber(deviceState: DeviceState): number {
        // bits sequence (from the beginning):
        // hygrostat(3), speed(1), filter(1), dimmer(1), fan(1), water(1), power(1)

        if (!deviceState.power) {
            return 0b0;
        }

        if (!deviceState.water) {
            return 0b01;
        }

        let data: number = 0b11;  // 0b11 = 0b1 | 0b10
        data |= <number><unknown>deviceState.fan << 2;
        // data |= this.dimmer << 3;
        data |= <number><unknown>(deviceState.dimmer > 0) << 3;  // are lights on ? no matter what dimmer mode is.
        data |= <number><unknown>deviceState.filter << 4;  // is filter okay ?
        data |= deviceState.speed - 1 << 5;  // 0 - first speed, 1 - second speed. don't allocate 2 bits, speed is never = 0, when fan = 1
        data |= deviceState.hygrostat - 1 << 6;  // 0 - first, 1 - second, ...
        return data;
    }

     public fromNumber(number: number): DeviceState {
         let deviceState: DeviceState = {
             power: false,
             water: true,
             fan: false,
             dimmer: 0,
             filter: false,
             speed: 0,
             hygrostat: 0,
         }

        // bits sequence (from the beginning):
        // hygrostat(3), speed(1), filter(1), dimmer(1), fan(1), water(1), power(1)

         deviceState.power  = <boolean><unknown>(number & 1);
         deviceState.water  = <boolean><unknown>(number & 1 << 1);
         deviceState.fan    = <boolean><unknown>(number & 1 << 2);
         deviceState.dimmer = number & 1 << 3;
         deviceState.filter = <boolean><unknown>(number & 1 << 4);
         deviceState.speed  = (number & 1 << 5) + 1;
         deviceState.hygrostat = (number & 1 << 6) + 1;

         return deviceState;
     }
}