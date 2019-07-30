module.exports = class ShotzException extends Error {
    constructor(type, message, status = 500) {
        super(message);
        this.type = type;
        this.status = status;
    }
}