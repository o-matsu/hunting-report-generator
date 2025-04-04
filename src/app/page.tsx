"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { ControllerRenderProps } from "react-hook-form"
import handleGenerate from "./generate"
import { Gender, DisposalMethod } from './generate';


// Update the form schema to include the photo fields
const formSchema = z.object({
  submissionDate: z.date().optional(),
  capturerName: z.string().optional(),
  animalGender: z.nativeEnum(Gender).optional(),
  captureDate: z.date().optional(),
  captureLocation: z.string().optional(),
  diagramNumber: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Diagram number must be a valid number"
  }).optional(),
  disposalMethod: z.nativeEnum(DisposalMethod).optional(),
  firstPhoto: z.string({
    required_error: "1枚目の写真をアップロードしてください"
  }).min(1, { message: "1枚目の写真をアップロードしてください" }),
  secondPhoto: z.string({
    required_error: "2枚目の写真をアップロードしてください"
  }).min(1, { message: "2枚目の写真をアップロードしてください" })
})

type FormValues = z.infer<typeof formSchema>
export type { FormValues }

type FieldProps<T extends keyof FormValues> = {
  field: ControllerRenderProps<FormValues, T>
}

// LocalStorageのキー
const FORM_STORAGE_KEY = 'hunting-report-form'

// 保存対象のフィールド
type StoredFormValues = Omit<FormValues, 'firstPhoto' | 'secondPhoto'>

export default function CaptureForm() {
  const [firstPhotoPreview, setFirstPhotoPreview] = useState<string | null>(null)
  const [secondPhotoPreview, setSecondPhotoPreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // フォームの初期値を設定
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submissionDate: new Date(),
      captureDate: new Date(),
      capturerName: "",
      captureLocation: "",
      diagramNumber: "",
      animalGender: undefined,
      disposalMethod: undefined,
    },
  })

  // LocalStorageから値を復元
  useEffect(() => {
    const storedValues = localStorage.getItem(FORM_STORAGE_KEY)
    if (storedValues) {
      try {
        const values = JSON.parse(storedValues) as StoredFormValues

        // 日付文字列をDate型に変換し、enumの文字列を適切な型に変換
        const formValues = {
          ...values,
          submissionDate: values.submissionDate ? new Date(values.submissionDate) : undefined,
          captureDate: values.captureDate ? new Date(values.captureDate) : undefined,
          // enumの文字列を適切な型に変換
          animalGender: values.animalGender ? values.animalGender as Gender : undefined,
          disposalMethod: values.disposalMethod ? values.disposalMethod as DisposalMethod : undefined,
        }
        console.log(formValues);
        console.log(Object.values(Gender).includes(formValues.animalGender as Gender));

        // フォームの値を個別に設定
        Object.entries(formValues).forEach(([key, value]) => {
          if (value !== undefined) {
            form.setValue(key as keyof StoredFormValues, value);
          }
        });

        setIsLoaded(true);

      } catch (error) {
        console.error('Failed to restore form values:', error)
      }
    } else {
      setIsLoaded(true);
    }
  }, [form])

  // フォームの値をLocalStorageに保存
  const saveFormValues = (values: FormValues) => {
    try {
      const valuesToStore: StoredFormValues = {
        submissionDate: values.submissionDate,
        captureDate: values.captureDate,
        capturerName: values.capturerName,
        animalGender: values.animalGender,
        captureLocation: values.captureLocation,
        diagramNumber: values.diagramNumber,
        disposalMethod: values.disposalMethod,
      }
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(valuesToStore))
    } catch (error) {
      console.error('Failed to save form values:', error)
    }
  }

  async function onSubmit(values: FormValues) {
    setIsGenerating(true)
    try {
      // フォームの値を保存
      saveFormValues(values)
      // PDFを生成して現在のタブで開く
      const url = await handleGenerate(values)
      window.location.href = url
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('PDFの生成に失敗しました。')
      setIsGenerating(false)
    }
  }

  const processImage = (
    file: File,
    setPreview: (preview: string) => void,
    fieldName: "firstPhoto" | "secondPhoto"
  ): void => {
    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setPreview(base64);
          form.setValue(fieldName, base64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to process image:', error);
    }
  };

  const handleFirstPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImage(file, setFirstPhotoPreview, "firstPhoto");
    }
  }

  const handleSecondPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImage(file, setSecondPhotoPreview, "secondPhoto");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-10">
        <Card className="max-w-3xl mx-auto shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl md:text-3xl font-bold pb-4 border-b">茅野市 有害鳥獣捕獲実績報告書</CardTitle>
            <CardDescription className="pt-4">報告書の内容を入力してください。</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="submissionDate"
                    render={({ field }: FieldProps<"submissionDate">) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>提出日</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(field.value, "yyyy/MM/dd") : <span>日付を選択</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capturerName"
                    render={({ field }: FieldProps<"capturerName">) => (
                      <FormItem>
                        <FormLabel>捕獲者名</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="名前を入力"
                            {...field}
                            autoComplete="capturer-name"
                            name="capturer-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="animalGender"
                    render={({ field }: FieldProps<"animalGender">) => (
                      <FormItem>
                        <FormLabel>性別</FormLabel>
                        <Select
                          key={isLoaded ? field.value : 'loading'}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="性別を選択" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={Gender.Male}>オス</SelectItem>
                            <SelectItem value={Gender.Female}>メス</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="captureDate"
                    render={({ field }: FieldProps<"captureDate">) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>捕獲日</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(field.value, "yyyy/MM/dd") : <span>日付を選択</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="captureLocation"
                    render={({ field }: FieldProps<"captureLocation">) => (
                      <FormItem>
                        <FormLabel>捕獲場所</FormLabel>
                        <FormControl>
                          <div className="relative flex rounded-md border">
                            <span className="inline-flex items-center px-3 rounded-l-md border-r bg-gray-50 text-gray-500 whitespace-nowrap">茅野市</span>
                            <Input
                              placeholder="場所を入力"
                              className="rounded-l-none border-0"
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                              autoComplete="capture-location"
                              name="capture-location"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diagramNumber"
                    render={({ field }: FieldProps<"diagramNumber">) => (
                      <FormItem>
                        <FormLabel>図面番号</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="図面番号を入力"
                            {...field}
                            autoComplete="diagram-number"
                            name="diagram-number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="disposalMethod"
                    render={({ field }: FieldProps<"disposalMethod">) => (
                      <FormItem>
                        <FormLabel>処分方法</FormLabel>
                        <Select
                          key={isLoaded ? field.value : 'loading'}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="処分方法を選択" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={DisposalMethod.Burial}>埋設</SelectItem>
                            <SelectItem value={DisposalMethod.Incineration}>焼却</SelectItem>
                            <SelectItem value={DisposalMethod.PersonalConsumption}>自家消費</SelectItem>
                            <SelectItem value={DisposalMethod.ProcessingFacility}>獣肉処理施設</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Photo upload section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstPhoto"
                    render={() => (
                      <FormItem>
                        <FormLabel>写真1枚目</FormLabel>
                        <FormControl>
                          <div className="border rounded-md p-4">
                            <div className="flex items-center justify-center border-2 border-dashed rounded-md h-48 relative">
                              {firstPhotoPreview ? (
                                <img
                                  src={firstPhotoPreview || "/placeholder.svg"}
                                  alt="1枚目のプレビュー"
                                  className="h-full object-contain"
                                />
                              ) : (
                                <div className="text-center">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">クリックして1枚目の写真をアップロード</p>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFirstPhotoChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="secondPhoto"
                    render={() => (
                      <FormItem>
                        <FormLabel>写真2枚目</FormLabel>
                        <FormControl>
                          <div className="border rounded-md p-4">
                            <div className="flex items-center justify-center border-2 border-dashed rounded-md h-48 relative">
                              {secondPhotoPreview ? (
                                <img
                                  src={secondPhotoPreview || "/placeholder.svg"}
                                  alt="2枚目のプレビュー"
                                  className="h-full object-contain"
                                />
                              ) : (
                                <div className="text-center">
                                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                  <p className="mt-2 text-sm text-gray-500">クリックして2枚目の写真をアップロード</p>
                                </div>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleSecondPhotoChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isGenerating}>
                  報告書を生成
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
