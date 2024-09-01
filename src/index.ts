import { Petpet as petpet } from "./memeGenerator/petpet/index";
import hug from './memeGenerator/hug'
import  tools  from "./tools/_index";
import path from "path";
import { readConfig } from "./tools/logger";
export const MY_PLUGIN_DIR = path.join(__dirname);
readConfig()

export const MemeGenerator = { tools,petpet,hug }