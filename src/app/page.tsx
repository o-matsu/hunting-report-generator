'use client';

import { Template, Font } from '@pdfme/common';
import { text, image, ellipse } from '@pdfme/schemas';
import { generate } from '@pdfme/generator';
import * as templateFile from './template.json';

const font: Font = {
  NotoSerifJP: {
    data: 'http://localhost:3000/NotoSerifJP-Regular.ttf',
    fallback: true,
  },
};

const originalTemplate: Template = templateFile as Template;

export default function Home() {
  const handleGenerate = () => {
    const template: Template = {
      ...originalTemplate,
      schemas: [
        originalTemplate.schemas[0].filter((schema) => schema.name !== 'sex_male'),
        originalTemplate.schemas[1]
      ]
    };
    const inputs = [
      {
        submission_year: '1991',
        submission_month: '5',
        submission_day: '1',
        name: '松下 亮介',
      },
    ];

    generate({ template, inputs, plugins: { text, image, ellipse }, options: { font } }).then((pdf) => {
      console.log(pdf);
      const blob = new Blob([pdf], { type: 'application/pdf' });
      window.open(URL.createObjectURL(blob));
    });
  }

  return (
    <div>
      <h1>Hello World</h1>
      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
}
