'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, DollarSign, FileText, CheckCircle, Clock, Building2, X } from 'lucide-react'

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

interface StatusDetailModalProps {
  isOpen: boolean
  onClose: () => void
  statusId: string | null
  applications: JobApplication[]
  onStatusChange: (applicationId: string, newStatus: string) => void
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

const statusConfigs = {
  applied: {
    title: 'Applied Applications',
    statuses: ['APPLIED'],
    description: 'Applications that have been submitted but no response yet'
  },
  interviews: {
    title: 'Interview Stage',
    statuses: ['INITIAL_CALL', 'FIRST_INTERVIEW', 'SECOND_INTERVIEW', 'THIRD_INTERVIEW'],
    description: 'Applications in the interview process'
  },
  negotiations: {
    title: 'Negotiations',
    statuses: ['NEGOTIATIONS'],
    description: 'Applications in the negotiation stage'
  }
}

export function StatusDetailModal({ 
  isOpen, 
  onClose, 
  statusId, 
  applications, 
  onStatusChange 
}: StatusDetailModalProps) {
  if (!statusId || !statusConfigs[statusId as keyof typeof statusConfigs]) {
    return null
  }

  const config = statusConfigs[statusId as keyof typeof statusConfigs]
  const filteredApplications = applications.filter(app => 
    config.statuses.includes(app.status)
  )

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{config.title}</DialogTitle>
              <p className="text-gray-600 mt-1">{config.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredApplications.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </CardContent>
            </Card>
            
            {config.statuses.includes('INITIAL_CALL') && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {filteredApplications.filter(app => app.status === 'INITIAL_CALL').length}
                  </div>
                  <div className="text-sm text-gray-600">Initial Call</div>
                </CardContent>
              </Card>
            )}
            
            {config.statuses.includes('FIRST_INTERVIEW') && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredApplications.filter(app => app.status === 'FIRST_INTERVIEW').length}
                  </div>
                  <div className="text-sm text-gray-600">First Interview</div>
                </CardContent>
              </Card>
            )}
            
            {config.statuses.includes('SECOND_INTERVIEW') && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredApplications.filter(app => app.status === 'SECOND_INTERVIEW').length}
                  </div>
                  <div className="text-sm text-gray-600">Second Interview</div>
                </CardContent>
              </Card>
            )}
            
            {config.statuses.includes('THIRD_INTERVIEW') && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredApplications.filter(app => app.status === 'THIRD_INTERVIEW').length}
                  </div>
                  <div className="text-sm text-gray-600">Third Interview</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Applications List */}
          <div className="grid gap-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-5 h-5 text-gray-600" />
                        <CardTitle className="text-lg">{application.company}</CardTitle>
                      </div>
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
                    </div>
                  </div>
                  
                  {application.pay && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                      <DollarSign className="w-4 h-4" />
                      {application.pay}
                    </div>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* Applied Date */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Applied:</span>
                      <span className="font-medium">{formatDate(application.appliedDate)}</span>
                    </div>

                    {/* Status-specific dates and completion */}
                    {application.status === 'INITIAL_CALL' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Initial Call:</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon('initial_call', application.initialCallCompleted)}
                          <span className="font-medium">{formatDate(application.initialCallDate)}</span>
                        </div>
                      </div>
                    )}

                    {application.status === 'FIRST_INTERVIEW' && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Initial Call:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon('initial_call', application.initialCallCompleted)}
                            <span className="font-medium">{formatDate(application.initialCallDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">First Interview:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon('first_interview', application.firstInterviewCompleted)}
                            <span className="font-medium">{formatDate(application.firstInterviewDate)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {application.status === 'SECOND_INTERVIEW' && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">First Interview:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon('first_interview', application.firstInterviewCompleted)}
                            <span className="font-medium">{formatDate(application.firstInterviewDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Second Interview:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon('second_interview', application.secondInterviewCompleted)}
                            <span className="font-medium">{formatDate(application.secondInterviewDate)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {application.status === 'THIRD_INTERVIEW' && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Second Interview:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon('second_interview', application.secondInterviewCompleted)}
                            <span className="font-medium">{formatDate(application.secondInterviewDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Third Interview:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon('third_interview', application.thirdInterviewCompleted)}
                            <span className="font-medium">{formatDate(application.thirdInterviewDate)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {application.status === 'NEGOTIATIONS' && (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Third Interview:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon('third_interview', application.thirdInterviewCompleted)}
                            <span className="font-medium">{formatDate(application.thirdInterviewDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Negotiations:</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon('negotiations', application.negotiationsCompleted)}
                            <span className="font-medium">{formatDate(application.negotiationsDate)}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* File attachments */}
                    <div className="pt-3 border-t">
                      <div className="flex gap-4 text-sm">
                        {application.resumeFile && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <FileText className="w-4 h-4" />
                            <span>Resume</span>
                          </div>
                        )}
                        {application.coverLetterFile && (
                          <div className="flex items-center gap-1 text-green-600">
                            <FileText className="w-4 h-4" />
                            <span>Cover Letter</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes */}
                    {application.notes && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          <strong>Notes:</strong> {application.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications in this stage</h3>
              <p className="text-gray-600">Applications will appear here when they reach this stage.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}