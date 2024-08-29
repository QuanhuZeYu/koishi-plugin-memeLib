"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemeGenerator = void 0;
const index_1 = require("./memeGenerator/petpet/index");
const Petpet = index_1.Petpet.genPetpetGif;
const index_2 = __importDefault(require("./tools/index"));
exports.MemeGenerator = { Petpet, tools: index_2.default };
