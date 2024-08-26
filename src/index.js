"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemeGenerator = void 0;
const index_1 = require("./memeGenerator/petpet/index");
const Petpet = index_1.Petpet.genPetpetGif;
const tools_1 = require("./tools");
exports.MemeGenerator = { Petpet, tools: tools_1.tools };
