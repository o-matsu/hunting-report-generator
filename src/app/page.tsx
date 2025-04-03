"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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
    message: "Diagram number must be a valid number.",
  }).optional(),
  disposalMethod: z.nativeEnum(DisposalMethod).optional(),
  firstPhoto: z.object({
    file: z.instanceof(File),
    base64: z.string(),
  }).required(),
  secondPhoto: z.object({
    file: z.instanceof(File),
    base64: z.string(),
  }).required(),
})

type FormValues = z.infer<typeof formSchema>
export type { FormValues }

type FieldProps<T extends keyof FormValues> = {
  field: ControllerRenderProps<FormValues, T>
}

export default function CaptureForm() {
  const [firstPhotoPreview, setFirstPhotoPreview] = useState<string | null>(null)
  const [secondPhotoPreview, setSecondPhotoPreview] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submissionDate: new Date(),
      captureDate: new Date(),
      capturerName: "",
      captureLocation: "",
      diagramNumber: "",
    },
  })

  function onSubmit(values: FormValues) {
    handleGenerate(values)
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
          // 最大幅・高さを800pxに設定
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          // アスペクト比を保持しながらリサイズ
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
          // 画質を0.8に設定してJPEG形式で出力
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          setPreview(base64);
          form.setValue(fieldName, { file, base64 });
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
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>有害鳥獣捕獲実績報告書</CardTitle>
          <CardDescription>報告書の情報を入力してください。</CardDescription>
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
                              {field.value ? format(field.value, "PPP") : <span>日付を選択</span>}
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
                        <Input placeholder="名前を入力" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              {field.value ? format(field.value, "PPP") : <span>日付を選択</span>}
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
                        <Input placeholder="場所を入力" {...field} />
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
                        <Input type="number" placeholder="図面番号を入力" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  render={({ field }: FieldProps<"firstPhoto">) => (
                    <FormItem>
                      <FormLabel>写真1枚目</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-4">
                          <div className="flex items-center justify-center border-2 border-dashed rounded-md h-48 mb-4 relative">
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
                              onChange={(e) => {
                                handleFirstPhotoChange(e)
                                field.onChange(e.target.files?.[0] || null)
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <FormDescription>1枚目の写真をアップロードしてください。</FormDescription>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondPhoto"
                  render={({ field }: FieldProps<"secondPhoto">) => (
                    <FormItem>
                      <FormLabel>写真2枚目</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-4">
                          <div className="flex items-center justify-center border-2 border-dashed rounded-md h-48 mb-4 relative">
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
                              onChange={(e) => {
                                handleSecondPhotoChange(e)
                                field.onChange(e.target.files?.[0] || null)
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                          <FormDescription>2枚目の写真をアップロードしてください。</FormDescription>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                報告書を生成
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
