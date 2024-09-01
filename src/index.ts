import { Petpet as petpet } from "./memeGenerator/petpet/index";
import hug from './memeGenerator/hug'
import  tools  from "./tools/_index";
import path from "path";
export const MY_PLUGIN_DIR = path.join(__dirname);

export const MemeGenerator = { tools,petpet,hug }