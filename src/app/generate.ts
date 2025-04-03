import { Template, Font } from '@pdfme/common';
import { text, image, ellipse } from '@pdfme/schemas';
import { generate } from '@pdfme/generator';
import * as templateFile from './template.json';
import type { FormValues } from './page';

export enum Gender {
  Male = "Male",
  Female = "Female",
}

// Gender enumに対応するテンプレート名を定義
export const GenderTemplate = {
  [Gender.Male]: 'gender-male',
  [Gender.Female]: 'gender-female',
} as const;

export enum DisposalMethod {
  Burial = "Burial",
  Incineration = "Incineration",
  PersonalConsumption = "Personal consumption",
  ProcessingFacility = "Transport to a wild meat processing facility",
}

// DisposalMethod enumに対応するテンプレート名を定義
export const DisposalMethodTemplate = {
  [DisposalMethod.Burial]: 'disposal-burial',
  [DisposalMethod.Incineration]: 'disposal-incineration',
  [DisposalMethod.PersonalConsumption]: 'disposal-personal',
  [DisposalMethod.ProcessingFacility]: 'disposal-facility',
} as const;

const font: Font = {
  NotoSerifJP: {
    data: 'https://6e94-124-246-225-93.ngrok-free.app/NotoSerifJP-Regular.ttf',
    fallback: true,
  },
};

const originalTemplate: Template = templateFile as Template;

// 日付から日本語の曜日を取得する関数
const getJapaneseDayOfWeek = (date: Date): string => {
  const dayOfWeek = date.getDay();
  return ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek];
};

const handleGenerate = (values: FormValues) => {
  console.log(values);
  const template: Template = {
    ...originalTemplate,
    schemas: [
      originalTemplate.schemas[0].filter((schema) => {
        // gender- で始まるスキーマの処理
        if (schema.name.startsWith('gender-')) {
          return schema.name === GenderTemplate[values.animalGender];
        }

        // disposal- で始まるスキーマの処理
        if (schema.name.startsWith('disposal-')) {
          return schema.name === DisposalMethodTemplate[values.disposalMethod];
        }

        // その他のスキーマはそのまま残す
        return true;
      }),
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
      capture_day_of_week: getJapaneseDayOfWeek(values.captureDate),
      location: values.captureLocation,
      location_number: values.diagramNumber,
      picture_before: values.firstPhoto?.base64,
      picture_after: values.secondPhoto?.base64,
    },
  ];

  generate({ template, inputs, plugins: { text, image, ellipse }, options: { font } }).then((pdf) => {
    const blob = new Blob([pdf], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = `capture-report-${values.submissionDate.toISOString().split('T')[0]}.pdf`;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // URL.revokeObjectURL(url);
  });
}

export default handleGenerate;
