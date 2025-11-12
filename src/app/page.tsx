'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ApplicationForm } from '@/components/application-form'
import { ApplicationDetailModal } from '@/components/application-detail-modal'
import { StatusDetailModal } from '@/components/status-detail-modal'
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Building2, 
  FileText, 
  CheckCircle, 
  Clock,
  Search,
  Filter,
  Briefcase,
  Users,
  Handshake,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react'

interface JobApplication {
  id: string
  company: string
  position: string
  pay?: string
  status: string
  appliedDate?: string
  initialCallDate?: string
  initialCallCompleted: boolean
  firstInterviewDate?: string
  firstInterviewCompleted: boolean
  secondInterviewDate?: string
  secondInterviewCompleted: boolean
  thirdInterviewDate?: string
  thirdInterviewCompleted: boolean
  negotiationsDate?: string
  negotiationsCompleted: boolean
  resumeFile?: string
  coverLetterFile?: string
  notes?: string
  createdAt: string
  updatedAt: string
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

const kanbanColumns = [
  {
    id: 'applied',
    title: 'Applied',
    statuses: ['APPLIED'],
    icon: Briefcase,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'interviews',
    title: 'Interviews',
    statuses: ['INITIAL_CALL', 'FIRST_INTERVIEW', 'SECOND_INTERVIEW', 'THIRD_INTERVIEW'],
    icon: Users,
    color: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'negotiations',
    title: 'Negotiations',
    statuses: ['NEGOTIATIONS'],
    icon: Handshake,
    color: 'bg-green-50 border-green-200'
  }
]

export default function JobApplicationTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showHiddenApplications, setShowHiddenApplications] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications')
        if (response.ok) {
          const data = await response.json()
          setApplications(data)
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const handleAddApplication = async (formData: any) => {
    try {
      const applicationData = {
        company: formData.company,
        position: formData.position,
        pay: formData.pay || null,
        status: formData.status,
        appliedDate: formData.appliedDate ? formData.appliedDate.toISOString().split('T')[0] : null,
        initialCallDate: formData.initialCallDate ? formData.initialCallDate.toISOString().split('T')[0] : null,
        initialCallCompleted: formData.initialCallCompleted || false,
        firstInterviewDate: formData.firstInterviewDate ? formData.firstInterviewDate.toISOString().split('T')[0] : null,
        firstInterviewCompleted: formData.firstInterviewCompleted || false,
        secondInterviewDate: formData.secondInterviewDate ? formData.secondInterviewDate.toISOString().split('T')[0] : null,
        secondInterviewCompleted: formData.secondInterviewCompleted || false,
        thirdInterviewDate: formData.thirdInterviewDate ? formData.thirdInterviewDate.toISOString().split('T')[0] : null,
        thirdInterviewCompleted: formData.thirdInterviewCompleted || false,
        negotiationsDate: formData.negotiationsDate ? formData.negotiationsDate.toISOString().split('T')[0] : null,
        negotiationsCompleted: formData.negotiationsCompleted || false,
        notes: formData.notes || null,
        resumeFile: formData.resumeFile?.name || null,
        coverLetterFile: formData.coverLetterFile?.name || null
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      })

      if (response.ok) {
        const newApplication = await response.json()
        setApplications(prev => [newApplication, ...prev])
      } else {
        console.error('Failed to create application')
      }
    } catch (error) {
      console.error('Error creating application:', error)
    }
  }

  const handleApplicationUpdate = async (applicationId: string, updates: any) => {
    try {
      // Ensure company and position are included in updates to satisfy API validation
      const application = applications.find(app => app.id === applicationId)
      const updateData = {
        company: application?.company || updates.company,
        position: application?.position || updates.position,
        ...updates
      }
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        const updatedApplication = await response.json()
        setApplications(prev => prev.map(app => 
          app.id === applicationId ? updatedApplication : app
        ))
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(updatedApplication)
        }
      } else {
        console.error('Failed to update application')
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      console.log('=== STATUS CHANGE START ===')
      console.log('Application ID:', applicationId)
      console.log('New Status:', newStatus)
      
      const application = applications.find(app => app.id === applicationId)
      if (!application) {
        console.error('Application not found:', applicationId)
        return
      }
      
      console.log('Current application status:', application.status)

      const updateData: any = {
        status: newStatus,
        company: application.company,
        position: application.position
      }
      
      // Update relevant date based on new status
      const today = new Date().toISOString().split('T')[0]
      
      switch (newStatus) {
        case 'APPLIED':
          updateData.appliedDate = today
          break
        case 'INITIAL_CALL':
          updateData.initialCallDate = today
          updateData.initialCallCompleted = false
          break
        case 'FIRST_INTERVIEW':
          updateData.firstInterviewDate = today
          updateData.firstInterviewCompleted = false
          break
        case 'SECOND_INTERVIEW':
          updateData.secondInterviewDate = today
          updateData.secondInterviewCompleted = false
          break
        case 'THIRD_INTERVIEW':
          updateData.thirdInterviewDate = today
          updateData.thirdInterviewCompleted = false
          break
        case 'NEGOTIATIONS':
          updateData.negotiationsDate = today
          updateData.negotiationsCompleted = false
          break
      }

      console.log('Update data:', updateData)
      
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      console.log('API Response status:', response.status)

      if (response.ok) {
        const updatedApplication = await response.json()
        console.log('API Response data:', updatedApplication)
        
        // Update the applications state to trigger re-render
        setApplications(prev => {
          const newApps = prev.map(app => 
            app.id === applicationId ? updatedApplication : app
          )
          console.log('Updated application in state:', newApps.find(a => a.id === applicationId))
          return newApps
        })
        
        console.log('=== STATUS CHANGE SUCCESS ===')
      } else {
        const errorText = await response.text()
        console.error('Failed to update application status:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Simple Status Select using native HTML select
  const SimpleStatusSelect = ({ applicationId, currentStatus, onStatusChange }: {
    applicationId: string
    currentStatus: string
    onStatusChange: (id: string, status: string) => void
  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newStatus = e.target.value
      console.log('Native select changed:', applicationId, newStatus)
      onStatusChange(applicationId, newStatus)
    }

    return (
      <select
        value={currentStatus}
        onChange={handleChange}
        className="text-xs w-32 px-2 py-1 border rounded bg-white"
      >
        <option value="NOT_APPLIED">Not Applied</option>
        <option value="APPLIED">Applied</option>
        <option value="INITIAL_CALL">Initial Call</option>
        <option value="FIRST_INTERVIEW">First Interview</option>
        <option value="SECOND_INTERVIEW">Second Interview</option>
        <option value="THIRD_INTERVIEW">Third Interview</option>
        <option value="NEGOTIATIONS">Negotiations</option>
        <option value="NOT_ACCEPTED">Not Accepted</option>
        <option value="LOST">Lost</option>
      </select>
    )
  }

  const getApplicationsForColumn = (statuses: string[]) => {
    return applications.filter(app => 
      statuses.includes(app.status) && 
      (showHiddenApplications || (!['NOT_ACCEPTED', 'LOST'].includes(app.status)))
    )
  }

  const getHiddenApplications = () => {
    return applications.filter(app => ['NOT_ACCEPTED', 'LOST'].includes(app.status))
  }

  const getStatusStats = () => {
    const visibleApplications = showHiddenApplications ? applications : applications.filter(app => !['NOT_ACCEPTED', 'LOST'].includes(app.status))
    
    const stats = {
      applied: visibleApplications.filter(app => app.status === 'APPLIED').length,
      interviews: visibleApplications.filter(app => 
        ['INITIAL_CALL', 'FIRST_INTERVIEW', 'SECOND_INTERVIEW', 'THIRD_INTERVIEW'].includes(app.status)
      ).length,
      negotiations: visibleApplications.filter(app => app.status === 'NEGOTIATIONS').length
    }
    return stats
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const stats = getStatusStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Application Tracker</h1>
              <p className="text-gray-600 mt-1">Track your job search progress</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowHiddenApplications(!showHiddenApplications)}
                className="flex items-center gap-2"
              >
                {showHiddenApplications ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hide Lost
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Show Lost ({getHiddenApplications().length})
                  </>
                )}
              </Button>
              <ApplicationForm onSubmit={handleAddApplication} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Applied</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.applied}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Negotiations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.negotiations}</p>
                </div>
                <Handshake className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {kanbanColumns.map((column) => {
            const Icon = column.icon
            const columnApplications = getApplicationsForColumn(column.statuses)
            
            return (
              <Card key={column.id} className={`${column.color} border-2`}>
                <CardHeader 
                  className="cursor-pointer hover:bg-opacity-50 transition-colors"
                  onClick={() => setSelectedStatus(column.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <CardTitle className="text-lg">{column.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white">
                        {columnApplications.length}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {columnApplications.map((application) => (
                    <Card key={application.id} className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{application.company}</h4>
                            <p className="text-sm text-gray-600">{application.position}</p>
                          </div>
                          
                          <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                            {statusLabels[application.status as keyof typeof statusLabels]}
                          </Badge>
                          
                          {application.pay && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <DollarSign className="w-3 h-3" />
                              {application.pay}
                            </div>
                          )}
                          
                          {/* Show relevant date */}
                          {(() => {
                            let dateToShow = ''
                            switch (application.status) {
                              case 'APPLIED':
                                dateToShow = formatDate(application.appliedDate)
                                break
                              case 'INITIAL_CALL':
                                dateToShow = formatDate(application.initialCallDate)
                                break
                              case 'FIRST_INTERVIEW':
                                dateToShow = formatDate(application.firstInterviewDate)
                                break
                              case 'SECOND_INTERVIEW':
                                dateToShow = formatDate(application.secondInterviewDate)
                                break
                              case 'THIRD_INTERVIEW':
                                dateToShow = formatDate(application.thirdInterviewDate)
                                break
                              case 'NEGOTIATIONS':
                                dateToShow = formatDate(application.negotiationsDate)
                                break
                            }
                            
                            return dateToShow ? (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="w-3 h-3" />
                                {dateToShow}
                              </div>
                            ) : null
                          })()}
                          
                          {/* Action buttons */}
                          <div className="pt-2 border-t flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplication(application)}
                              className="flex-1"
                            >
                              View Details
                            </Button>
                            <SimpleStatusSelect
                              applicationId={application.id}
                              currentStatus={application.status}
                              onStatusChange={handleStatusChange}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {columnApplications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No applications in this stage</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Other Applications (Not Applied, Not Accepted, Lost) */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Applications</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {['NOT_APPLIED'].map((status) => {
              const statusApplications = applications.filter(app => app.status === status)
              if (statusApplications.length === 0) return null
              
              return (
                <Card key={status} className="bg-gray-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {statusLabels[status as keyof typeof statusLabels]}
                      </CardTitle>
                      <Badge variant="outline">{statusApplications.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {statusApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="font-medium text-sm">{application.company}</p>
                          <p className="text-xs text-gray-600">{application.position}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedApplication(application)}
                          >
                            View
                          </Button>
                          <SimpleStatusSelect
                            applicationId={application.id}
                            currentStatus={application.status}
                            onStatusChange={handleStatusChange}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Hidden Applications Section */}
        {showHiddenApplications && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hidden Applications</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {['NOT_ACCEPTED', 'LOST'].map((status) => {
                const statusApplications = applications.filter(app => app.status === status)
                if (statusApplications.length === 0) return null
                
                return (
                  <Card key={status} className="bg-red-50 border-red-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-red-800">
                          {statusLabels[status as keyof typeof statusLabels]}
                        </CardTitle>
                        <Badge variant="destructive">{statusApplications.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {statusApplications.map((application) => (
                        <div key={application.id} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <p className="font-medium text-sm">{application.company}</p>
                            <p className="text-xs text-gray-600">{application.position}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplication(application)}
                            >
                              View
                            </Button>
                            <SimpleStatusSelect
                              applicationId={application.id}
                              currentStatus={application.status}
                              onStatusChange={handleStatusChange}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {applications.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your job applications by adding your first one.</p>
            <ApplicationForm 
              trigger={
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Your First Application
                </Button>
              } 
              onSubmit={handleAddApplication}
            />
          </div>
        )}
      </main>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        application={selectedApplication}
        onStatusChange={handleStatusChange}
        onApplicationUpdate={handleApplicationUpdate}
      />

      {/* Status Detail Modal */}
      <StatusDetailModal
        isOpen={!!selectedStatus}
        onClose={() => setSelectedStatus(null)}
        statusId={selectedStatus}
        applications={applications}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}