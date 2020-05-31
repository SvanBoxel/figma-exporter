declare const https: any;
declare const fs: any;
declare const Figma: any;
declare const sanitize: any;
declare type figmaNodeT = {
    id: string;
    name: string;
    imageUrl?: string;
    imageFormat?: string;
    fileName?: string;
};
declare type filterT = {
    name: string[];
    id: string[];
};
declare const validNodeTypes: string[];
declare const defaultOutputFolder = "./figma-export";
declare class FigmaExporter {
    key: string;
    data: figmaNodeT[];
    client: import('figma-js').ClientInterface;
    constructor(token: string, key: string);
    collectNodes(filter?: filterT): Promise<figmaNodeT[]>;
    getNodeImageUrls(format: import('figma-js').exportFormatOptions): Promise<figmaNodeT[]>;
    writeImages(dir?: string): Promise<figmaNodeT[]>;
    private writeSingleImage;
}
