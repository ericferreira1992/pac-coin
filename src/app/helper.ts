export class Helper {
    public static randomInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public static hasDecimal(value: number) {
        return (value - Math.floor(value)) > 0;
    }

    public static getIntegerSide(value: number) {
        return  Math.floor(value);
    }

    public static getDecimalSide(value: number) {
        return (value - Math.floor(value));
    }

    public static isMobileDevice() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
    }
}