/**
 * @module gcs/io
 */
/** */

import Sketch from "../../gcs/sketch";
import {JSONExporter, JSONImporter} from "./json";
import {LatexExporter} from "./latex";

export default class IO {
    // for history
    static HISTORY_IMPORT: Importer = new JSONImporter();
    static HISTORY_EXPORT: Exporter = new JSONExporter();

    // for actions
    static DEFAULT_IMPORT: Importer = new JSONImporter();
    static DEFAULT_EXPORT: Exporter = new JSONExporter();

    //latex
    static LATEX_EXPORT: Exporter = new LatexExporter();
}

export interface Importer {
    stringToSketch(str: string): Sketch;
}

export interface Exporter {
    getFilename(): string;
    sketchToString(sketch: Sketch): string;
}