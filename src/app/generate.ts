import { Template, Font } from "@pdfme/common";
import { text, image, ellipse } from "@pdfme/schemas";
import { generate } from "@pdfme/generator";
import * as templateFile from "./template.json";
import type { FormValues } from "./page";

export enum Gender {
  Male = "Male",
  Female = "Female",
}

// Gender enumに対応するテンプレート名を定義
export const GenderTemplate = {
  [Gender.Male]: "gender-male",
  [Gender.Female]: "gender-female",
} as const;

export enum DisposalMethod {
  Burial = "Burial",
  Incineration = "Incineration",
  PersonalConsumption = "Personal consumption",
  ProcessingFacility = "Transport to a wild meat processing facility",
}

// DisposalMethod enumに対応するテンプレート名を定義
export const DisposalMethodTemplate = {
  [DisposalMethod.Burial]: "disposal-burial",
  [DisposalMethod.Incineration]: "disposal-incineration",
  [DisposalMethod.PersonalConsumption]: "disposal-personal",
  [DisposalMethod.ProcessingFacility]: "disposal-facility",
} as const;

const originalTemplate: Template = templateFile as Template;

// 日付から日本語の曜日を取得する関数
const getJapaneseDayOfWeek = (date: Date | undefined): string => {
  if (date === undefined) return "";
  const dayOfWeek = date.getDay();
  return ["日", "月", "火", "水", "木", "金", "土"][dayOfWeek];
};

const handleGenerate = async (values: FormValues): Promise<string> => {
  try {
    console.log(values);

    // フォントファイルを取得
    const fontResponse = await fetch("/NotoSerifJP-Regular.ttf");
    const fontData = await fontResponse.arrayBuffer();

    const font: Font = {
      NotoSerifJP: {
        data: fontData,
        fallback: true,
      },
    };

    const template: Template = {
      ...originalTemplate,
      schemas: [
        originalTemplate.schemas[0].filter((schema) => {
          // gender- で始まるスキーマの処理
          if (schema.name.startsWith("gender-")) {
            // animalGenderが未定義の場合はスキーマを除外
            if (!values.animalGender) return false;
            return schema.name === GenderTemplate[values.animalGender];
          }

          // disposal- で始まるスキーマの処理
          if (schema.name.startsWith("disposal-")) {
            // disposalMethodが未定義の場合はスキーマを除外
            if (!values.disposalMethod) return false;
            return schema.name === DisposalMethodTemplate[values.disposalMethod];
          }

          // その他のスキーマはそのまま残す
          return true;
        }),
        originalTemplate.schemas[1],
      ],
    };
    const inputs = [
      {
        submission_year: values.submissionDate?.getFullYear().toString() ?? "",
        submission_month: values.submissionDate
          ? (values.submissionDate.getMonth() + 1).toString()
          : "",
        submission_day: values.submissionDate?.getDate().toString() ?? "",
        name: values.capturerName ?? "",
        capture_year: values.captureDate?.getFullYear().toString() ?? "",
        capture_month: values.captureDate
          ? (values.captureDate.getMonth() + 1).toString()
          : "",
        capture_day: values.captureDate?.getDate().toString() ?? "",
        capture_day_of_week: getJapaneseDayOfWeek(values.captureDate),
        location: values.captureLocation ?? "",
        location_number: values.diagramNumber ?? "",
        picture_before: values.firstPhoto,
        picture_after: values.secondPhoto,
      },
    ];

    // PDF生成を先に完了させる
    const pdf = await generate({
      template,
      inputs,
      plugins: { text, image, ellipse },
      options: { font },
    });

    // PDFをBlobとして作成してURLを返す
    const blob = new Blob([pdf], { type: "application/pdf" });
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

export default handleGenerate;
