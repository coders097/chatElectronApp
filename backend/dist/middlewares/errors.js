"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let notFoundError = (res) => {
    res.status(404).json({
        success: false,
        error: "Not Found!"
    });
};
let dataMissingError = (res) => {
    res.status(400).json({
        success: false,
        error: "Invalid Parameters!"
    });
};
let authenticationError = (res) => {
    res.status(401).json({
        success: false,
        error: "Authentication Failed!"
    });
};
let serverError = (res) => {
    res.status(500).json({
        success: false,
        error: "Server Problem!"
    });
};
let resorucePresentError = (res) => {
    res.status(409).json({
        success: false,
        error: "Already Present!"
    });
};
exports.default = {
    notFoundError,
    dataMissingError,
    authenticationError,
    serverError,
    resorucePresentError
};
