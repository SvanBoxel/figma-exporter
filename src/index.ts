const https = require('https');
const fs = require('fs');

const Figma = require('figma-js');
const sanitize = require('sanitize-filename');

declare namespace Figma {
  interface Client {
    user: import('figma-js').ClientInterface;
  }
}

type figmaNodeT = {
  id: string;
  name: string;
  imageUrl?: string;
  imageFormat?: string;
  fileName?: string;
};

type filterT = {
  name: string[];
  id: string[];
};

const validNodeTypes = ['PAGE', 'CANVAS', 'FRAME'];
const defaultOutputFolder = './figma-export';

class FigmaExporter {
  public key: string;
  public data: figmaNodeT[];
  private client: import('figma-js').ClientInterface;

  constructor(token: string, key: string) {
    this.key = key;
    this.data = [];
    this.client = Figma.Client({
      personalAccessToken: token
    });
  }

  public async collectNodes(filter: filterT = { name: [], id: [] }): Promise<figmaNodeT[]> {
    const { data } = await this.client.file(this.key);
    const reduceFn = (arr, cur = filteredNodes) => {
      const search = filter.name.includes(cur.name) || filter.id.includes(cur.id);
      if (search && validNodeTypes.includes(cur.type)) {
        arr.push({
          id: cur.id,
          name: cur.name
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

  public async getNodeImageUrls(format: import('figma-js').exportFormatOptions): Promise<figmaNodeT[]> {
    if (!this.data.length) {
      return this.data;
    }

    const { data } = await this.client.fileImages(this.key, {
      ids: this.data.map((node) => node.id),
      format
    });

    return (this.data = this.data.map((node) => ({
      ...node,
      imageUrl: data.images[node.id],
      imageFormat: format
    })));
  }

  public async writeImages(dir: string = defaultOutputFolder): Promise<figmaNodeT[]> {
    return new Promise(async (resolve, reject) => {
      await Promise.all(this.data.map((node) => this.writeSingleImage(node, dir)));

      fs.writeFile(`${dir}/data.json`, JSON.stringify(this.data), 'utf8', (err) => {
        if (err) reject(err);
        resolve(this.data)
      })
    });
  }

  private writeSingleImage(node: figmaNodeT, dir: string): Promise<figmaNodeT[]> {
    !fs.existsSync(dir) && fs.mkdirSync(dir);
    const fileName = `${sanitize(node.name)}.${node.imageFormat}`;

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(`${dir}/${fileName}`);
      https.get(node.imageUrl, (response) => {
        response.pipe(file);
        this.data.find(({ id }) => id === node.id).fileName = fileName;
        file.on('finish', () => resolve());
        file.on('error', (err: any) => reject(err));
      });
    });
  }
}

module.exports = FigmaExporter;
