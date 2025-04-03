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

// Update the form schema to include the photo fields
const formSchema = z.object({
  submissionDate: z.date({
    required_error: "Submission date is required",
  }),
  capturerName: z.string().min(2, {
    message: "Capturer name must be at least 2 characters.",
  }),
  animalGender: z.nativeEnum(Gender, {
    required_error: "Please select the gender of the animal.",
  }),
  captureDate: z.date({
    required_error: "Capture date is required",
  }),
  captureLocation: z.string().min(2, {
    message: "Capture location must be at least 2 characters.",
  }),
  diagramNumber: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Diagram number must be a valid number.",
  }),
  disposalMethod: z.nativeEnum(DisposalMethod, {
    required_error: "Please select a disposal method.",
  }),
  firstPhoto: z.object({
    file: z.instanceof(File),
    base64: z.string(),
  }).optional(),
  secondPhoto: z.object({
    file: z.instanceof(File),
    base64: z.string(),
  }).optional(),
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

  const handleFirstPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFirstPhotoPreview(base64)
        form.setValue('firstPhoto', { file, base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSecondPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setSecondPhotoPreview(base64)
        form.setValue('secondPhoto', { file, base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Animal Capture Report</CardTitle>
          <CardDescription>Enter the required information to generate a capture report.</CardDescription>
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
                      <FormLabel>Submission Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                      <FormLabel>Capturer&apos;s Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
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
                      <FormLabel>Animal Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Gender.Male}>{Gender.Male}</SelectItem>
                          <SelectItem value={Gender.Female}>{Gender.Female}</SelectItem>
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
                      <FormLabel>Capture Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                      <FormLabel>Capture Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
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
                      <FormLabel>Diagram Number</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter diagram number" {...field} />
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
                      <FormLabel>Disposal Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DisposalMethod.Burial}>{DisposalMethod.Burial}</SelectItem>
                          <SelectItem value={DisposalMethod.Incineration}>{DisposalMethod.Incineration}</SelectItem>
                          <SelectItem value={DisposalMethod.PersonalConsumption}>{DisposalMethod.PersonalConsumption}</SelectItem>
                          <SelectItem value={DisposalMethod.ProcessingFacility}>{DisposalMethod.ProcessingFacility}</SelectItem>
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
                      <FormLabel>First Photo</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-4">
                          <div className="flex items-center justify-center border-2 border-dashed rounded-md h-48 mb-4 relative">
                            {firstPhotoPreview ? (
                              <img
                                src={firstPhotoPreview || "/placeholder.svg"}
                                alt="First photo preview"
                                className="h-full object-contain"
                              />
                            ) : (
                              <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">Click to upload first photo</p>
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
                          <FormDescription>Upload the first photo of the captured animal.</FormDescription>
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
                      <FormLabel>Second Photo</FormLabel>
                      <FormControl>
                        <div className="border rounded-md p-4">
                          <div className="flex items-center justify-center border-2 border-dashed rounded-md h-48 mb-4 relative">
                            {secondPhotoPreview ? (
                              <img
                                src={secondPhotoPreview || "/placeholder.svg"}
                                alt="Second photo preview"
                                className="h-full object-contain"
                              />
                            ) : (
                              <div className="text-center">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">Click to upload second photo</p>
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
                          <FormDescription>Upload the second photo of the captured animal.</FormDescription>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                Generate Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

