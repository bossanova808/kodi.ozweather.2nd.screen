import "../utils/logger.js"
const log = logger('ClockComponent.js');

window.clock = () => {
    return {
        time: new Date(),
        init() {
            log.info("ClockComponent init");

            setInterval(() => {
                this.time = new Date();
            }, 1000);
        },
        // 12:34
        getTime() {
            // return this.time.toLocaleTimeString('en-AU', {
            //     timeStyle: "short",
            //     hour12: true,
            // }).replace("pm","").trim()
            return this.time.toLocaleTimeString('en-AU', {
                timeStyle: "short",
                hour12: true,
            }).replace(" ","").trim()
        },
        // 12:34pm
        getTimeLong() {
            return this.time.toLocaleTimeString('en-AU', {
                timeStyle: "medium",
                hour12: true,
            }).replace(" ","").trim()
        },
        // 12:34
        getTimeShort() {
            return this.time.toLocaleTimeString('en-AU', {
                timeStyle: "short",
                hour12: true,
            }).replace(" ","").replace("pm","").replace("am","").trim()
        },
        getSeconds() {
            return ':' + this.time.getSeconds().toLocaleString('en-AU', {
                minimumIntegerDigits: 2,
            })
        },
    }
};