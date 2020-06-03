import https from 'https';
import fs from 'fs';

import * as Figma from 'figma-js';
import sanitize from 'sanitize-filename';
import { request } from 'http';

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

const validNodeTypes = ['PAGE', 'CANVAS', 'FRAME'];
const defaultOutputFolder = './figma-export';

class FigmaExporter {
  public key: string;
  public data: FigmaNode[];
  public client: import('figma-js').ClientInterface;

  constructor(token: string, key: string) {
    this.key = key;
    this.data = [];
    this.client = Figma.Client({
      personalAccessToken: token
    });
  }

  public async collectNodes(filter: Partial<FilterOptions> = { name: [], id: [] }): Promise<FigmaNode[]> {
    const { data } = await this.client.file(this.key);
    const reduceFn = (arr, cur = filteredNodes) => {
      const search = filter.name?.includes(cur.name) || filter.id?.includes(cur.id);
      if (search && validNodeTypes.includes(cur.type)) {
        arr.push({
          id: cur.id,
          name: cur.name,
          images: []
        });
      }

      if (cur.children && cur.children.length) {
        arr.push(...cur.children.reduce(reduceFn, []));
      }

      return arr;
    };

    const filteredNodes = data.document.children.reduce(reduceFn, []) || [];

    this.data.push(...filteredNodes);
    return this.data;
  }

  public clearNodes(): FigmaNode[] {
    this.data = [];
    return this.data;
  }

  public async getNodeImageUrls(format: exportFormatOptions): Promise<FigmaNode[]> {
    if (!this.data.length) {
      return this.data;
    }

    const { data } = await this.client.fileImages(this.key, {
      ids: this.data.map((node) => node.id),
      format
    });

    return (this.data = this.data.map((node) => ({
      ...node,
      images: [
        ...node.images,
        {
          url: data.images[node.id],
          imageFormat: format
        }
      ]
    })));
  }

  public async writeImages(dir: string = defaultOutputFolder): Promise<FigmaNode[]> {
    const requests = this.data.reduce((arr, cur: FigmaNode) => {
      cur.images.forEach((image) => {
        arr.push(this.writeSingleImage(image, cur, dir));
      });
      return arr;
    }, []);

    return new Promise(async (resolve, reject) => {
      await Promise.all(requests);

      fs.writeFile(`${dir}/data.json`, JSON.stringify(this.data), 'utf8', (err) => {
        if (err) reject(err);
        resolve(this.data);
      });
    });
  }

  private writeSingleImage(image: FigmaImage, node: FigmaNode, dir: string): Promise<FigmaNode[]> {
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    const fileName = `${sanitize(node.name)}.${image.imageFormat}`;

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(`${dir}/${fileName}`);
      https.get(image.url, (response) => {
        response.pipe(file);
        this.data.find(({ id }) => id === node.id).images.find(({ url }) => url === image.url).fileName = fileName;
        file.on('finish', () => resolve());
        file.on('error', (err: any) => reject(err));
      });
    });
  }
}

export default FigmaExporter;
