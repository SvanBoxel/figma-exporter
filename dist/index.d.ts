export interface FigmaImage {
    url: string;
    imageFormat?: string;
    fileName?: string;
}
/**
 * Node returned by Figma.
 */
export interface FigmaNode {
    id: string;
    name: string;
    images?: FigmaImage[];
}
/**
 * List of nodes that you care about in the document.
 */
export interface FilterOptions {
    /**
     * Names of nodes to filter
     */
    readonly name?: string[];
    /**
     * IDs of nodes to filter
     */
    readonly id?: string[];
}
export declare type exportFormatOptions = import('figma-js').exportFormatOptions;
declare class FigmaExporter {
    key: string;
    data: FigmaNode[];
    client: import('figma-js').ClientInterface;
    constructor(token: string, key: string);
    collectNodes(filter?: Partial<FilterOptions>): Promise<FigmaNode[]>;
    clearNodes(): FigmaNode[];
    getNodeImageUrls(format: exportFormatOptions): Promise<FigmaNode[]>;
    writeImages(dir?: string): Promise<FigmaNode[]>;
    private writeSingleImage;
}
export default FigmaExporter;
