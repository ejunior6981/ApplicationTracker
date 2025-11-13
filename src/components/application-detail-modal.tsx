'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
 Calendar as CalendarIcon, 
  Clock, 
  CheckCircle, 
  Building2, 
  User, 
  Mail, 
 Phone, 
  FileText,
  Plus,
  Edit,
  Save,
  X,
  Trash2,
  MessageSquare,
  Briefcase,
  DollarSign
} from 'lucide-react'
import { format } from 'date-fns'

interface JobApplication {
  id: string
  company: string
  position: string
  pay?: string
 status: string
 appliedDate?: string
  initialCallDate?: string
  initialCallCompleted: boolean
 initialCallNotes?: string
  firstInterviewDate?: string
 firstInterviewCompleted: boolean
  firstInterviewNotes?: string
 secondInterviewDate?: string
  secondInterviewCompleted: boolean
 secondInterviewNotes?: string
  thirdInterviewDate?: string
  thirdInterviewCompleted: boolean
  thirdInterviewNotes?: string
 negotiationsDate?: string
  negotiationsCompleted: boolean
  negotiationsNotes?: string
  resumeFile?: string
  coverLetterFile?: string
  notes?: string
 createdAt: string
 updatedAt: string
 contacts?: Contact[]
 timelineEvents?: TimelineEvent[]
}

interface Contact {
  id: string
  applicationId: string
  name: string
  email?: string
  phone?: string
  position?: string
  department?: string
  notes?: string
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

interface TimelineEvent {
  id: string
  applicationId: string
  type: string
  title: string
  description?: string
  eventDate: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

interface ApplicationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  application: JobApplication | null
  onStatusChange: (applicationId: string, newStatus: string) => void
  onApplicationUpdate: (applicationId: string, updates: any) => void
}

const statusColors = {
  NOT_APPLIED: 'bg-gray-100 text-gray-800',
  APPLIED: 'bg-blue-100 text-blue-800',
  INITIAL_CALL: 'bg-purple-100 text-purple-800',
  FIRST_INTERVIEW: 'bg-yellow-100 text-yellow-800',
  SECOND_INTERVIEW: 'bg-orange-100 text-orange-800',
  THIRD_INTERVIEW: 'bg-red-100 text-red-800',
  NEGOTIATIONS: 'bg-green-100 text-green-800',
  NOT_ACCEPTED: 'bg-red-100 text-red-800',
  LOST: 'bg-gray-100 text-gray-800'
}

const statusLabels = {
  NOT_APPLIED: 'Not Applied',
  APPLIED: 'Applied',
  INITIAL_CALL: 'Initial Call',
  FIRST_INTERVIEW: 'First Interview',
  SECOND_INTERVIEW: 'Second Interview',
  THIRD_INTERVIEW: 'Third Interview',
  NEGOTIATIONS: 'Negotiations',
  NOT_ACCEPTED: 'Not Accepted',
  LOST: 'Lost'
}

const timelineEventConfig = {
  APPLICATION_SUBMITTED: { icon: FileText, color: 'text-blue-600', label: 'Application Submitted' },
  INITIAL_CALL_SCHEDULED: { icon: CalendarIcon, color: 'text-purple-600', label: 'Initial Call Scheduled' },
 INITIAL_CALL_COMPLETED: { icon: CheckCircle, color: 'text-green-600', label: 'Initial Call Completed' },
 FIRST_INTERVIEW_SCHEDULED: { icon: CalendarIcon, color: 'text-yellow-600', label: 'First Interview Scheduled' },
  FIRST_INTERVIEW_COMPLETED: { icon: CheckCircle, color: 'text-green-600', label: 'First Interview Completed' },
 SECOND_INTERVIEW_SCHEDULED: { icon: CalendarIcon, color: 'text-orange-600', label: 'Second Interview Scheduled' },
 SECOND_INTERVIEW_COMPLETED: { icon: CheckCircle, color: 'text-green-600', label: 'Second Interview Completed' },
 THIRD_INTERVIEW_SCHEDULED: { icon: CalendarIcon, color: 'text-red-600', label: 'Third Interview Scheduled' },
  THIRD_INTERVIEW_COMPLETED: { icon: CheckCircle, color: 'text-green-600', label: 'Third Interview Completed' },
 NEGOTIATIONS_STARTED: { icon: DollarSign, color: 'text-green-600', label: 'Negotiations Started' },
  NEGOTIATIONS_COMPLETED: { icon: CheckCircle, color: 'text-green-600', label: 'Negotiations Completed' },
  OFFER_RECEIVED: { icon: Briefcase, color: 'text-blue-600', label: 'Offer Received' },
 OFFER_ACCEPTED: { icon: CheckCircle, color: 'text-green-600', label: 'Offer Accepted' },
 OFFER_DECLINED: { icon: X, color: 'text-red-600', label: 'Offer Declined' },
 REJECTION_RECEIVED: { icon: X, color: 'text-red-600', label: 'Rejection Received' },
  FOLLOW_UP_SENT: { icon: MessageSquare, color: 'text-gray-600', label: 'Follow-up Sent' },
 NOTE_ADDED: { icon: FileText, color: 'text-gray-600', label: 'Note Added' },
  CONTACT_ADDED: { icon: User, color: 'text-gray-600', label: 'Contact Added' },
  STATUS_CHANGED: { icon: Briefcase, color: 'text-purple-600', label: 'Status Changed' }
}

export function ApplicationDetailModal({ 
  isOpen, 
  onClose, 
  application, 
  onStatusChange,
  onApplicationUpdate 
}: ApplicationDetailModalProps) {
  const [activeTab, setActiveTab] = useState('timeline')
  const [editingDates, setEditingDates] = useState(false)
  const [dateEdits, setDateEdits] = useState<any>({})
  const [newContact, setNewContact] = useState<Partial<Contact>>({})
  const [addingContact, setAddingContact] = useState(false)
  const [newEvent, setNewEvent] = useState<Partial<TimelineEvent>>({})
  const [addingEvent, setAddingEvent] = useState(false)
  const [deletingTimelineEvent, setDeletingTimelineEvent] = useState<string | null>(null)
  const [deletingApplication, setDeletingApplication] = useState(false)

  useEffect(() => {
    if (application) {
      setDateEdits({
        appliedDate: application.appliedDate ? new Date(application.appliedDate) : null,
        initialCallDate: application.initialCallDate ? new Date(application.initialCallDate) : null,
        firstInterviewDate: application.firstInterviewDate ? new Date(application.firstInterviewDate) : null,
        secondInterviewDate: application.secondInterviewDate ? new Date(application.secondInterviewDate) : null,
        thirdInterviewDate: application.thirdInterviewDate ? new Date(application.thirdInterviewDate) : null,
        negotiationsDate: application.negotiationsDate ? new Date(application.negotiationsDate) : null,
      })
    }
  }, [application])

  if (!application) return null

  const handleSaveDates = async () => {
    const updates = {
      company: application.company,
      position: application.position,
      appliedDate: dateEdits.appliedDate?.toISOString().split('T')[0],
      initialCallDate: dateEdits.initialCallDate?.toISOString().split('T')[0],
      initialCallCompleted: application.initialCallCompleted,
      initialCallNotes: application.initialCallNotes,
      firstInterviewDate: dateEdits.firstInterviewDate?.toISOString().split('T')[0],
      firstInterviewCompleted: application.firstInterviewCompleted,
      firstInterviewNotes: application.firstInterviewNotes,
      secondInterviewDate: dateEdits.secondInterviewDate?.toISOString().split('T')[0],
      secondInterviewCompleted: application.secondInterviewCompleted,
      secondInterviewNotes: application.secondInterviewNotes,
      thirdInterviewDate: dateEdits.thirdInterviewDate?.toISOString().split('T')[0],
      thirdInterviewCompleted: application.thirdInterviewCompleted,
      thirdInterviewNotes: application.thirdInterviewNotes,
      negotiationsDate: dateEdits.negotiationsDate?.toISOString().split('T')[0],
      negotiationsCompleted: application.negotiationsCompleted,
      negotiationsNotes: application.negotiationsNotes,
    }

    onApplicationUpdate(application.id, updates)
    setEditingDates(false)
  }

  const handleAddContact = async () => {
    if (!newContact.name) return

    const contact = {
      name: newContact.name,
      email: newContact.email || null,
      phone: newContact.phone || null,
      position: newContact.position || null,
      department: newContact.department || null,
      notes: newContact.notes || null,
      isPrimary: newContact.isPrimary || false
    }

    // TODO: API call to add contact
    console.log('Adding contact:', contact)
    
    setNewContact({})
    setAddingContact(false)
  }

  const handleAddEvent = async () => {
    if (!newEvent.type || !newEvent.title) return

    const event = {
      type: newEvent.type,
      title: newEvent.title,
      description: newEvent.description || null,
      eventDate: newEvent.eventDate || new Date().toISOString(),
      isCompleted: newEvent.isCompleted || false
    }

    // TODO: API call to add timeline event
    console.log('Adding timeline event:', event)
    
    setNewEvent({})
    setAddingEvent(false)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

 const getTimelineEvents = () => {
    const events: TimelineEvent[] = application.timelineEvents || []
    
    // Add system-generated events based on application data
    // Use a special prefix to ensure uniqueness from database-stored events
    if (application.appliedDate) {
      const systemEventId = `${application.id}-system-applied`
      // Only add if this system event doesn't already exist
      if (!events.some(event => event.id === systemEventId)) {
        events.push({
          id: systemEventId,
          applicationId: application.id,
          type: 'APPLICATION_SUBMITTED',
          title: 'Application Submitted',
          eventDate: application.appliedDate,
          isCompleted: true,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt
        })
      }
    }

    if (application.initialCallDate) {
      const scheduledEventId = `${application.id}-system-initial-call-scheduled`
      // Only add if this system event doesn't already exist
      if (!events.some(event => event.id === scheduledEventId)) {
        events.push({
          id: scheduledEventId,
          applicationId: application.id,
          type: 'INITIAL_CALL_SCHEDULED',
          title: 'Initial Call Scheduled',
          eventDate: application.initialCallDate,
          isCompleted: application.initialCallCompleted,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt
        })
      }

      if (application.initialCallCompleted) {
        const completedEventId = `${application.id}-system-initial-call-completed`
        // Only add if this system event doesn't already exist
        if (!events.some(event => event.id === completedEventId)) {
          events.push({
            id: completedEventId,
            applicationId: application.id,
            type: 'INITIAL_CALL_COMPLETED',
            title: 'Initial Call Completed',
            eventDate: application.initialCallDate,
            isCompleted: true,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt
          })
        }
      }
    }

    if (application.firstInterviewDate) {
      const scheduledEventId = `${application.id}-system-first-interview-scheduled`
      // Only add if this system event doesn't already exist
      if (!events.some(event => event.id === scheduledEventId)) {
        events.push({
          id: scheduledEventId,
          applicationId: application.id,
          type: 'FIRST_INTERVIEW_SCHEDULED',
          title: 'First Interview Scheduled',
          eventDate: application.firstInterviewDate,
          isCompleted: application.firstInterviewCompleted,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt
        })
      }

      if (application.firstInterviewCompleted) {
        const completedEventId = `${application.id}-system-first-interview-completed`
        // Only add if this system event doesn't already exist
        if (!events.some(event => event.id === completedEventId)) {
          events.push({
            id: completedEventId,
            applicationId: application.id,
            type: 'FIRST_INTERVIEW_COMPLETED',
            title: 'First Interview Completed',
            eventDate: application.firstInterviewDate,
            isCompleted: true,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt
          })
        }
      }
    }

    if (application.secondInterviewDate) {
      const scheduledEventId = `${application.id}-system-second-interview-scheduled`
      // Only add if this system event doesn't already exist
      if (!events.some(event => event.id === scheduledEventId)) {
        events.push({
          id: scheduledEventId,
          applicationId: application.id,
          type: 'SECOND_INTERVIEW_SCHEDULED',
          title: 'Second Interview Scheduled',
          eventDate: application.secondInterviewDate,
          isCompleted: application.secondInterviewCompleted,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt
        })
      }

      if (application.secondInterviewCompleted) {
        const completedEventId = `${application.id}-system-second-interview-completed`
        // Only add if this system event doesn't already exist
        if (!events.some(event => event.id === completedEventId)) {
          events.push({
            id: completedEventId,
            applicationId: application.id,
            type: 'SECOND_INTERVIEW_COMPLETED',
            title: 'Second Interview Completed',
            eventDate: application.secondInterviewDate,
            isCompleted: true,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt
          })
        }
      }
    }

    if (application.thirdInterviewDate) {
      const scheduledEventId = `${application.id}-system-third-interview-scheduled`
      // Only add if this system event doesn't already exist
      if (!events.some(event => event.id === scheduledEventId)) {
        events.push({
          id: scheduledEventId,
          applicationId: application.id,
          type: 'THIRD_INTERVIEW_SCHEDULED',
          title: 'Third Interview Scheduled',
          eventDate: application.thirdInterviewDate,
          isCompleted: application.thirdInterviewCompleted,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt
        })
      }

      if (application.thirdInterviewCompleted) {
        const completedEventId = `${application.id}-system-third-interview-completed`
        // Only add if this system event doesn't already exist
        if (!events.some(event => event.id === completedEventId)) {
          events.push({
            id: completedEventId,
            applicationId: application.id,
            type: 'THIRD_INTERVIEW_COMPLETED',
            title: 'Third Interview Completed',
            eventDate: application.thirdInterviewDate,
            isCompleted: true,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt
          })
        }
      }
    }

    if (application.negotiationsDate) {
      const startedEventId = `${application.id}-system-negotiations-started`
      // Only add if this system event doesn't already exist
      if (!events.some(event => event.id === startedEventId)) {
        events.push({
          id: startedEventId,
          applicationId: application.id,
          type: 'NEGOTIATIONS_STARTED',
          title: 'Negotiations Started',
          eventDate: application.negotiationsDate,
          isCompleted: application.negotiationsCompleted,
          createdAt: application.createdAt,
          updatedAt: application.updatedAt
        })
      }

      if (application.negotiationsCompleted) {
        const completedEventId = `${application.id}-system-negotiations-completed`
        // Only add if this system event doesn't already exist
        if (!events.some(event => event.id === completedEventId)) {
          events.push({
            id: completedEventId,
            applicationId: application.id,
            type: 'NEGOTIATIONS_COMPLETED',
            title: 'Negotiations Completed',
            eventDate: application.negotiationsDate,
            isCompleted: true,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt
          })
        }
      }
    }

    return events.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
  }

  const handleDeleteTimelineEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/timeline-events/${eventId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Update the application state to remove the deleted event
        if (application) {
          const updatedTimelineEvents = application.timelineEvents?.filter(event => event.id !== eventId)
          onApplicationUpdate(application.id, {
            ...application,
            timelineEvents: updatedTimelineEvents
          })
        }
      } else {
        console.error('Failed to delete timeline event')
      }
    } catch (error) {
      console.error('Error deleting timeline event:', error)
    } finally {
      setDeletingTimelineEvent(null)
    }
  }

  const handleDeleteApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${application?.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onClose()
      } else {
        console.error('Failed to delete application')
      }
    } catch (error) {
      console.error('Error deleting application:', error)
    } finally {
      setDeletingApplication(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{application.company}</DialogTitle>
              <p className="text-gray-600">{application.position}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                {statusLabels[application.status as keyof typeof statusLabels]}
              </Badge>
              <Select
                value={application.status}
                onValueChange={(value) => onStatusChange(application.id, value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_APPLIED">Not Applied</SelectItem>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="INITIAL_CALL">Initial Call</SelectItem>
                  <SelectItem value="FIRST_INTERVIEW">First Interview</SelectItem>
                  <SelectItem value="SECOND_INTERVIEW">Second Interview</SelectItem>
                  <SelectItem value="THIRD_INTERVIEW">Third Interview</SelectItem>
                  <SelectItem value="NEGOTIATIONS">Negotiations</SelectItem>
                  <SelectItem value="NOT_ACCEPTED">Not Accepted</SelectItem>
                  <SelectItem value="LOST">Lost</SelectItem>
                </SelectContent>
              </Select>
              <AlertDialog open={deletingApplication}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex items-center gap-1">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the application for "{application?.company} - {application?.position}" and all associated data including contacts and timeline events. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletingApplication(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteApplication()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Application
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Timeline Events</h3>
              <Button onClick={() => setAddingEvent(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Event
              </Button>
            </div>

            {/* Add Event Form */}
            {addingEvent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Timeline Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Event Type</Label>
                      <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(timelineEventConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newEvent.title || ''}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                        placeholder="Event title"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="Event description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Event Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newEvent.eventDate ? format(new Date(newEvent.eventDate), 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={newEvent.eventDate ? new Date(newEvent.eventDate) : undefined}
                            onSelect={(date) => setNewEvent({...newEvent, eventDate: date?.toISOString()})}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center space-x-2 mt-6">
                      <Checkbox
                        id="completed"
                        checked={!!newEvent.isCompleted}
                        onCheckedChange={(checked) => setNewEvent({...newEvent, isCompleted: checked === true})}
                      />
                      <Label htmlFor="completed">Completed</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddEvent}>Add Event</Button>
                    <Button variant="outline" onClick={() => setAddingEvent(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline Events */}
            <div className="space-y-4">
              {getTimelineEvents().map((event) => {
                const config = timelineEventConfig[event.type as keyof typeof timelineEventConfig]
                const Icon = config.icon
                
                return (
                  <Card key={event.id} className={`${event.isCompleted ? 'bg-green-50' : 'bg-white'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full bg-gray-100 ${config.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{event.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {format(new Date(event.eventDate), 'MMM dd, yyyy')}
                              </span>
                              {event.isCompleted && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the timeline event "{event.title}". This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteTimelineEvent(event.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-gray-600 mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Interview Schedule</h3>
              <Button 
                onClick={() => setEditingDates(!editingDates)}
                variant={editingDates ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                {editingDates ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {editingDates ? 'Save Dates' : 'Edit Dates'}
              </Button>
            </div>

            {editingDates && (
              <div className="grid gap-4">
                {[
                  { key: 'initialCallDate', label: 'Initial Call Date' },
                  { key: 'firstInterviewDate', label: 'First Interview Date' },
                  { key: 'secondInterviewDate', label: 'Second Interview Date' },
                  { key: 'thirdInterviewDate', label: 'Third Interview Date' },
                  { key: 'negotiationsDate', label: 'Negotiations Date' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4">
                    <Label className="w-40">{label}:</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateEdits[key] ? format(dateEdits[key], 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateEdits[key]}
                          onSelect={(date) => setDateEdits({...dateEdits, [key]: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button onClick={handleSaveDates}>Save All Dates</Button>
                  <Button variant="outline" onClick={() => setEditingDates(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {!editingDates && (
              <div className="grid gap-4">
                {[
                  { key: 'initialCallDate', label: 'Initial Call', date: application.initialCallDate, completed: application.initialCallCompleted, notes: application.initialCallNotes },
                  { key: 'firstInterviewDate', label: 'First Interview', date: application.firstInterviewDate, completed: application.firstInterviewCompleted, notes: application.firstInterviewNotes },
                  { key: 'secondInterviewDate', label: 'Second Interview', date: application.secondInterviewDate, completed: application.secondInterviewCompleted, notes: application.secondInterviewNotes },
                  { key: 'thirdInterviewDate', label: 'Third Interview', date: application.thirdInterviewDate, completed: application.thirdInterviewCompleted, notes: application.thirdInterviewNotes },
                  { key: 'negotiationsDate', label: 'Negotiations', date: application.negotiationsDate, completed: application.negotiationsCompleted, notes: application.negotiationsNotes }
                ].map(({ key, label, date, completed, notes }) => (
                  <Card key={key}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{label}</h4>
                            <p className="text-sm text-gray-600">
                              {date ? formatDate(date) : 'Not scheduled'}
                            </p>
                          </div>
                          {date && completed !== undefined && (
                            <div className="flex items-center gap-2">
                              {completed ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-400" />
                              )}
                              <Badge variant={completed ? "default" : "secondary"}>
                                {completed ? 'Completed' : 'Scheduled'}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {date && completed !== undefined && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`${key}-completed`}
                                checked={!!completed}
                                onCheckedChange={(checked) => {
                                  const updates = { ...application };
                                  updates[`${key.replace('Date', 'Completed')}`] = checked === true;
                                  onApplicationUpdate(application.id, updates);
                                }}
                              />
                              <Label htmlFor={`${key}-completed`}>Mark as completed</Label>
                            </div>
                            
                            {notes && (
                              <div>
                                <Label className="text-sm font-medium">Notes</Label>
                                <p className="text-sm text-gray-600 mt-1">{notes}</p>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <Label htmlFor={`${key}-notes`} className="text-sm font-medium">
                                Add Notes
                              </Label>
                              <Textarea
                                id={`${key}-notes`}
                                placeholder="Add notes from the interview..."
                                defaultValue={notes || ''}
                                onBlur={(e) => {
                                  const updates = { ...application };
                                  updates[`${key.replace('Date', 'Notes')}`] = e.target.value;
                                  onApplicationUpdate(application.id, updates);
                                }}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Company Contacts</h3>
              <Button onClick={() => setAddingContact(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
            </div>

            {/* Add Contact Form */}
            {addingContact && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add New Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name *</Label>
                      <Input
                        value={newContact.name || ''}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                        placeholder="Contact name"
                      />
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input
                        value={newContact.position || ''}
                        onChange={(e) => setNewContact({...newContact, position: e.target.value})}
                        placeholder="Job title"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newContact.email || ''}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={newContact.phone || ''}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input
                      value={newContact.department || ''}
                      onChange={(e) => setNewContact({...newContact, department: e.target.value})}
                      placeholder="Department"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={newContact.notes || ''}
                      onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                      placeholder="Additional notes about this contact"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="primary"
                      checked={newContact.isPrimary || false}
                      onCheckedChange={(checked) => setNewContact({...newContact, isPrimary: checked === true})}
                    />
                    <Label htmlFor="primary">Primary contact</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddContact}>Add Contact</Button>
                    <Button variant="outline" onClick={() => setAddingContact(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contacts List */}
            <div className="grid gap-4">
              {(application.contacts || []).map((contact) => (
                <Card key={contact.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-gray-100">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{contact.name}</h4>
                            {contact.isPrimary && (
                              <Badge variant="default">Primary</Badge>
                            )}
                          </div>
                          {contact.position && (
                            <p className="text-sm text-gray-600">{contact.position}</p>
                          )}
                          {contact.department && (
                            <p className="text-sm text-gray-600">{contact.department}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            {contact.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                          {contact.notes && (
                            <p className="text-sm text-gray-600 mt-2">{contact.notes}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {(!application.contacts || application.contacts.length === 0) && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h4>
                <p className="text-gray-600">Add contacts to track your network at this company.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Application Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Company</Label>
                      <p className="font-medium">{application.company}</p>
                    </div>
                    <div>
                      <Label>Position</Label>
                      <p className="font-medium">{application.position}</p>
                    </div>
                  </div>
                  {application.pay && (
                    <div>
                      <Label>Pay Range</Label>
                      <p className="font-medium">{application.pay}</p>
                    </div>
                  )}
                  <div>
                    <Label>Status</Label>
                    <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                      {statusLabels[application.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  {application.notes && (
                    <div>
                      <Label>Notes</Label>
                      <p className="text-gray-600">{application.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {application.resumeFile && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Resume: {application.resumeFile}</span>
                      </div>
                    )}
                    {application.coverLetterFile && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-green-600" />
                        <span>Cover Letter: {application.coverLetterFile}</span>
                      </div>
                    )}
                    {!application.resumeFile && !application.coverLetterFile && (
                      <p className="text-gray-500">No documents uploaded</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Application Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{format(new Date(application.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{format(new Date(application.updatedAt), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
