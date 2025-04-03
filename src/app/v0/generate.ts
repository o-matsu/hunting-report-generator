import { Template, Font } from '@pdfme/common';
import { text, image, ellipse } from '@pdfme/schemas';
import { generate } from '@pdfme/generator';
import * as templateFile from '../template.json';
import type { FormValues } from './page';

const font: Font = {
  NotoSerifJP: {
    data: 'http://localhost:3000/NotoSerifJP-Regular.ttf',
    fallback: true,
  },
};

const originalTemplate: Template = templateFile as Template;

const handleGenerate = (values: FormValues) => {
  console.log(values);
  const template: Template = {
    ...originalTemplate,
    schemas: [
      originalTemplate.schemas[0].filter((schema) => schema.name !== 'sex_male'),
      originalTemplate.schemas[1]
    ]
  };
  const inputs = [
    {
      submission_year: values.submissionDate.getFullYear().toString(),
      submission_month: (values.submissionDate.getMonth() + 1).toString(),
      submission_day: values.submissionDate.getDate().toString(),
      name: values.capturerName,
      capture_year: values.captureDate.getFullYear().toString(),
      capture_month: (values.captureDate.getMonth() + 1).toString(),
      capture_day: values.captureDate.getDate().toString(),
      location: values.captureLocation,
      location_number: values.diagramNumber,
      picture_before: values.firstPhoto?.base64,
      picture_after: values.secondPhoto?.base64,
    },
  ];

  generate({ template, inputs, plugins: { text, image, ellipse }, options: { font } }).then((pdf) => {
    const blob = new Blob([pdf], { type: 'application/pdf' });
    // window.open(URL.createObjectURL(blob));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `capture-report-${values.submissionDate.toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
}

export default handleGenerate;
