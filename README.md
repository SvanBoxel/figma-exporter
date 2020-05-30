# Figma Exporter
< Build shields >

> NodeJS library that helps with exporting Figma project. 

## Install

```bash
npm i <name>
```

## Usage
1. Before you get started, [generate a Figma access token](https://www.figma.com/developers/api#access-tokens). This will be used to authenticate with the Figma API and get access to the files you want to export. 

2. You will also need your file id so the module now which to run the export on.
![figma file id](https://user-images.githubusercontent.com/24505883/83338620-6e8a4080-a2c6-11ea-8891-38b0a1f0c981.png)

```js
const FigmaExporter = require('figma-exportor')
const client = new FigmaExporter("<your_figma_token>", "<file_id>");
```

3. Then, declare the list of [Figma nodes](https://www.figma.com/plugin-docs/api/nodes/) in your project you want to export. The module accepts both node names and node ids. The example below will collect information about 6 Figma nodes:

```js
const filter = { 
    name: [
      'Onboarding', 
      'Footer'
    ],
    id: [
      '1:24',
      '31:25',
      '1:100',
      '1:47'
    ]
};

let nodes = await client.collectNodes(filter)

```

This outputs the following format: 
```js
[
  { id: '1:419', name: 'Onboarding' },
  { id: '31:7299', name: 'Footer' },
  { id: '1:24', name: 'Header' },
  ...
]
```

4. Then, you can request the image urls in a format of your liking. Supported formats are `jpg`, `png`, `svg` `pdf`;

```js
let images = await client.getNodeImageUrls('png')
```

This outputs the following format:

```js
[
  {
    id: '1:419',
    name: 'Onboarding',
    imageUrl: '<url>',
    imageFormat: 'png'
  },
  {
    id: '31:7299',
    name: 'Footer',
    imageUrl: '<url>',
    imageFormat: 'png'
  },
  ...
]
```

5. Finally, write the images and metadata (`data.json`) to a folder. The default folder for this is `./figma-export`.

```js
let result = await client.writeImages('./data');
```

This outputs the following format, which corresponds to the data that is written to `data.json`:

```js
[
  {
    id: '1:419',
    name: 'Onboarding',
    imageUrl: '<url>',
    imageFormat: 'png',
    fileName: 'Onboarding.png'
  },
  {
    id: '31:7299',
    name: 'Footer',
    imageUrl: '<url>',
    imageFormat: 'png',
    fileName: 'Footer.png'
  },
  ...
```

Full example that export `Splashscreen` and `Contact`:
```js
const FigmaExporter = require('figma-exportor')
const client = new FigmaExporter("<your_figma_token>", "<file_id>");
const filter = { 
    name: [
        'Splashscreen',
        'Contact' 
    ]
}
const nodes = await client.collectNodes(filter);
const nodesWithImages = await client.getNodeImageUrls('svg');
const result = await client.writeImages();

```

## Development

## License
