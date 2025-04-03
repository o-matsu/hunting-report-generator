'use client';

import { Template, Font } from '@pdfme/common';
// import { text, barcodes, image } from '@pdfme/schemas';
import { generate } from '@pdfme/generator';
import * as templateFile from './template.json';

const font: Font = {
  NotoSerifJP: {
    data: 'http://localhost:3000/NotoSerifJP-Regular.ttf',
    fallback: true,
  },
};

const template: Template = templateFile as Template;

export default function Home() {
  const inputs = [
    {
      submission_year: '1991',
      submission_month: '5',
      submission_day: '1',
      name: 'へのへのもへじ',
    },
  ];

  generate({ template, inputs, options: { font } }).then((pdf) => {
    console.log(pdf);
    const blob = new Blob([pdf], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  });
  return (
    <div>
      <h1>Hello World</h1>
      {/* <button onClick={handleGenerate}>Generate</button> */}
    </div>
  );
}
