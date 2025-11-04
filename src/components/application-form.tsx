'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Plus, CalendarIcon, Upload, X } from 'lucide-react'
import { format } from 'date-fns'

interface ApplicationFormData {
  company: string
  position: string
  pay: string
  status: string
  appliedDate?: Date
  initialCallDate?: Date
  initialCallCompleted: boolean
  firstInterviewDate?: Date
  firstInterviewCompleted: boolean
  secondInterviewDate?: Date
  secondInterviewCompleted: boolean
  thirdInterviewDate?: Date
  thirdInterviewCompleted: boolean
  negotiationsDate?: Date
  negotiationsCompleted: boolean
  notes: string
  resumeFile?: File
  coverLetterFile?: File
}

const statusOptions = [
  { value: 'NOT_APPLIED', label: 'Not Applied' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'INITIAL_CALL', label: 'Initial Call' },
  { value: 'FIRST_INTERVIEW', label: 'First Interview' },
  { value: 'SECOND_INTERVIEW', label: 'Second Interview' },
  { value: 'THIRD_INTERVIEW', label: 'Third Interview' },
  { value: 'NEGOTIATIONS', label: 'Negotiations' },
  { value: 'NOT_ACCEPTED', label: 'Not Accepted' },
  { value: 'LOST', label: 'Lost' }
]

interface ApplicationFormProps {
  onSubmit: (data: ApplicationFormData) => void
  trigger?: React.ReactNode
}

export function ApplicationForm({ onSubmit, trigger }: ApplicationFormProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<ApplicationFormData>({
    company: '',
    position: '',
    pay: '',
    status: 'NOT_APPLIED',
    initialCallCompleted: false,
    firstInterviewCompleted: false,
    secondInterviewCompleted: false,
    thirdInterviewCompleted: false,
    negotiationsCompleted: false,
    notes: ''
  })

  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      resumeFile: resumeFile || undefined,
      coverLetterFile: coverLetterFile || undefined
    })
    setOpen(false)
    // Reset form
    setFormData({
      company: '',
      position: '',
      pay: '',
      status: 'NOT_APPLIED',
      initialCallCompleted: false,
      firstInterviewCompleted: false,
      secondInterviewCompleted: false,
      thirdInterviewCompleted: false,
      negotiationsCompleted: false,
      notes: ''
    })
    setResumeFile(null)
    setCoverLetterFile(null)
  }

  const handleFileChange = (type: 'resume' | 'coverLetter', file: File) => {
    if (type === 'resume') {
      setResumeFile(file)
    } else {
      setCoverLetterFile(file)
    }
  }

  const DatePicker = ({ 
    label, 
    date, 
    onChange, 
    completed, 
    onCompletedChange 
  }: {
    label: string
    date?: Date
    onChange: (date?: Date) => void
    completed?: boolean
    onCompletedChange?: (completed: boolean) => void
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {onCompletedChange && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${label}-completed`}
              checked={completed}
              onCheckedChange={onCompletedChange}
            />
            <Label htmlFor={`${label}-completed`} className="text-sm">
              Completed
            </Label>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Application
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Application</DialogTitle>
          <DialogDescription>
            Track a new job application and its progress through the hiring process.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Job title"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pay">Pay Range</Label>
                <Input
                  id="pay"
                  value={formData.pay}
                  onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
                  placeholder="$80,000 - $100,000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Important Dates</h3>
            
            <DatePicker
              label="Applied Date"
              date={formData.appliedDate}
              onChange={(date) => setFormData({ ...formData, appliedDate: date })}
            />
            
            {formData.status === 'INITIAL_CALL' && (
              <DatePicker
                label="Initial Call"
                date={formData.initialCallDate}
                onChange={(date) => setFormData({ ...formData, initialCallDate: date })}
                completed={formData.initialCallCompleted}
                onCompletedChange={(completed) => setFormData({ ...formData, initialCallCompleted: completed })}
              />
            )}
            
            {formData.status === 'FIRST_INTERVIEW' && (
              <>
                <DatePicker
                  label="Initial Call"
                  date={formData.initialCallDate}
                  onChange={(date) => setFormData({ ...formData, initialCallDate: date })}
                  completed={formData.initialCallCompleted}
                  onCompletedChange={(completed) => setFormData({ ...formData, initialCallCompleted: completed })}
                />
                <DatePicker
                  label="First Interview"
                  date={formData.firstInterviewDate}
                  onChange={(date) => setFormData({ ...formData, firstInterviewDate: date })}
                  completed={formData.firstInterviewCompleted}
                  onCompletedChange={(completed) => setFormData({ ...formData, firstInterviewCompleted: completed })}
                />
              </>
            )}
            
            {formData.status === 'SECOND_INTERVIEW' && (
              <>
                <DatePicker
                  label="First Interview"
                  date={formData.firstInterviewDate}
                  onChange={(date) => setFormData({ ...formData, firstInterviewDate: date })}
                  completed={formData.firstInterviewCompleted}
                  onCompletedChange={(completed) => setFormData({ ...formData, firstInterviewCompleted: completed })}
                />
                <DatePicker
                  label="Second Interview"
                  date={formData.secondInterviewDate}
                  onChange={(date) => setFormData({ ...formData, secondInterviewDate: date })}
                  completed={formData.secondInterviewCompleted}
                  onCompletedChange={(completed) => setFormData({ ...formData, secondInterviewCompleted: completed })}
                />
              </>
            )}
            
            {formData.status === 'THIRD_INTERVIEW' && (
              <>
                <DatePicker
                  label="Second Interview"
                  date={formData.secondInterviewDate}
                  onChange={(date) => setFormData({ ...formData, secondInterviewDate: date })}
                  completed={formData.secondInterviewCompleted}
                  onCompletedChange={(completed) => setFormData({ ...formData, secondInterviewCompleted: completed })}
                />
                <DatePicker
                  label="Third Interview"
                  date={formData.thirdInterviewDate}
                  onChange={(date) => setFormData({ ...formData, thirdInterviewDate: date })}
                  completed={formData.thirdInterviewCompleted}
                  onCompletedChange={(completed) => setFormData({ ...formData, thirdInterviewCompleted: completed })}
                />
              </>
            )}
            
            {formData.status === 'NEGOTIATIONS' && (
              <>
                <DatePicker
                  label="Third Interview"
                  date={formData.thirdInterviewDate}
                  onChange={(date) => setFormData({ ...formData, thirdInterviewDate: date })}
                  completed={formData.thirdInterviewCompleted}
                  onCompletedChange={(completed) => setFormData({ ...formData, thirdInterviewCompleted: completed })}
                />
                <DatePicker
                  label="Negotiations"
                  date={formData.negotiationsDate}
                  onChange={(date) => setFormData({ ...formData, negotiationsDate: date })}
                  completed={formData.negotiationsCompleted}
                  onCompletedChange={(completed) => setFormData({ ...formData, negotiationsCompleted: completed })}
                />
              </>
            )}
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documents</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resume">Resume</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && handleFileChange('resume', e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="resume" className="cursor-pointer">
                    {resumeFile ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate">{resumeFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setResumeFile(null)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload resume</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    id="coverLetter"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && handleFileChange('coverLetter', e.target.files[0])}
                    className="hidden"
                  />
                  <label htmlFor="coverLetter" className="cursor-pointer">
                    {coverLetterFile ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 truncate">{coverLetterFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setCoverLetterFile(null)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload cover letter</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes about this application..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Application
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}