
import React, { useState, useEffect, createContext, useContext } from 'react';
import {
    FaHome, FaUserTie, FaBuilding, FaClipboardList, FaCalendarAlt, FaEnvelopeOpenText,
    FaRegHandshake, FaChartBar, FaCog, FaSearch, FaBell, FaSignOutAlt, FaPlus, FaTimes,
    FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaHourglassHalf, FaUsers, FaTools, FaScroll,
    FaArrowLeft, FaFilter, FaFileExport, FaDownload, FaEdit, FaTrash, FaThumbsUp, FaThumbsDown, FaFileUpload
} from 'react-icons/fa';

// Global Context for Auth and Navigation
const AppContext = createContext();

const STATUS_COLORS = {
    'APPROVED': 'var(--status-green)',
    'COMPLETED': 'var(--status-green)',
    'IN_PROGRESS': 'var(--status-blue)',
    'ASSIGNED': 'var(--status-blue)',
    'PENDING': 'var(--status-orange)',
    'ACTION_REQUIRED': 'var(--status-orange)',
    'REJECTED': 'var(--status-red)',
    'SLA_BREACH': 'var(--status-red)',
    'BLOCKED': 'var(--status-red)',
    'EXCEPTION': 'var(--status-purple)',
    'ESCALATION': 'var(--status-purple)',
    'DRAFT': 'var(--status-grey)',
    'ARCHIVED': 'var(--status-grey)',
    'NEW': 'var(--status-teal)',
    'OFFERED': 'var(--info-color)',
};

const WORKFLOW_STAGES = {
    JOB_POSTING: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'CLOSED'],
    CANDIDATE_APPLICATION: ['NEW', 'SCREENING', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'FEEDBACK_REVIEW', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'REJECTED', 'ONBOARDED'],
    OFFER_MANAGEMENT: ['DRAFT', 'PENDING_APPROVAL', 'OFFERED', 'ACCEPTED', 'DECLINED']
};

// --- Dummy Data ---
const dummyJobPostings = [
    {
        id: 'job-101', title: 'Senior React Developer', department: 'Engineering', location: 'Remote',
        status: 'APPROVED', datePosted: '2023-10-26', applicants: 15, views: 320,
        description: 'We are seeking a highly skilled Senior React Developer with 5+ years of experience...',
        workflowStage: 'APPROVED',
        workflowHistory: [
            { stage: 'DRAFT', date: '2023-10-20', by: 'HR Manager Alice' },
            { stage: 'PENDING_APPROVAL', date: '2023-10-21', by: 'HR Manager Alice' },
            { stage: 'APPROVED', date: '2023-10-26', by: 'Admin John' }
        ],
        auditLog: [
            { timestamp: '2023-10-26 14:30', user: 'Admin John', action: 'Approved Job Posting "Senior React Developer"' },
            { timestamp: '2023-10-21 10:15', user: 'HR Manager Alice', action: 'Submitted Job Posting for Approval' }
        ]
    },
    {
        id: 'job-102', title: 'Product Manager', department: 'Product', location: 'New York, NY',
        status: 'PENDING', datePosted: '2023-11-01', applicants: 8, views: 150,
        description: 'The Product Manager will be responsible for defining product strategy...',
        workflowStage: 'PENDING_APPROVAL',
        workflowHistory: [
            { stage: 'DRAFT', date: '2023-10-28', by: 'HR Manager Bob' },
            { stage: 'PENDING_APPROVAL', date: '2023-11-01', by: 'HR Manager Bob' }
        ],
        auditLog: [
            { timestamp: '2023-11-01 09:00', user: 'HR Manager Bob', action: 'Submitted Job Posting "Product Manager" for Approval' }
        ]
    },
    {
        id: 'job-103', title: 'UX/UI Designer', department: 'Product', location: 'Remote',
        status: 'DRAFT', datePosted: '2023-11-05', applicants: 0, views: 0,
        description: 'We are looking for a creative UX/UI Designer to shape intuitive experiences...',
        workflowStage: 'DRAFT',
        workflowHistory: [
            { stage: 'DRAFT', date: '2023-11-05', by: 'HR Manager Alice' }
        ],
        auditLog: [
            { timestamp: '2023-11-05 11:00', user: 'HR Manager Alice', action: 'Created Draft Job Posting "UX/UI Designer"' }
        ]
    },
    {
        id: 'job-104', title: 'Data Scientist', department: 'Data & Analytics', location: 'Seattle, WA',
        status: 'APPROVED', datePosted: '2023-09-15', applicants: 25, views: 500,
        description: 'Join our data science team to build predictive models and insights...',
        workflowStage: 'APPROVED',
        workflowHistory: [
            { stage: 'DRAFT', date: '2023-09-10', by: 'HR Manager Bob' },
            { stage: 'PENDING_APPROVAL', date: '2023-09-12', by: 'HR Manager Bob' },
            { stage: 'APPROVED', date: '2023-09-15', by: 'Admin John' }
        ],
        auditLog: [
            { timestamp: '2023-09-15 10:00', user: 'Admin John', action: 'Approved Job Posting "Data Scientist"' }
        ]
    },
    {
        id: 'job-105', title: 'Marketing Specialist', department: 'Marketing', location: 'Remote',
        status: 'CLOSED', datePosted: '2023-08-01', applicants: 30, views: 600,
        description: 'Seeking an enthusiastic Marketing Specialist to manage digital campaigns...',
        workflowStage: 'CLOSED',
        workflowHistory: [
            { stage: 'DRAFT', date: '2023-07-20', by: 'HR Manager Alice' },
            { stage: 'PENDING_APPROVAL', date: '2023-07-25', by: 'HR Manager Alice' },
            { stage: 'APPROVED', date: '2023-08-01', by: 'Admin John' },
            { stage: 'CLOSED', date: '2023-09-10', by: 'HR Manager Alice' }
        ],
        auditLog: [
            { timestamp: '2023-09-10 16:00', user: 'HR Manager Alice', action: 'Closed Job Posting "Marketing Specialist"' }
        ]
    }
];

const dummyCandidates = [
    {
        id: 'cand-001', name: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-111-2222',
        jobId: 'job-101', jobTitle: 'Senior React Developer', status: 'INTERVIEW_SCHEDULED',
        appliedDate: '2023-10-28', expectedSalary: '120,000', resume: 'jane_doe_resume.pdf',
        lastActivity: 'Interview scheduled',
        workflowStage: 'INTERVIEW_SCHEDULED',
        workflowHistory: [
            { stage: 'NEW', date: '2023-10-28', by: 'Candidate Jane Doe' },
            { stage: 'SCREENING', date: '2023-10-29', by: 'HR Manager Alice' },
            { stage: 'INTERVIEW_SCHEDULED', date: '2023-10-30', by: 'HR Manager Alice' }
        ],
        auditLog: [
            { timestamp: '2023-10-30 11:00', user: 'HR Manager Alice', action: 'Scheduled interview for Jane Doe' }
        ]
    },
    {
        id: 'cand-002', name: 'John Smith', email: 'john.smith@example.com', phone: '555-333-4444',
        jobId: 'job-101', jobTitle: 'Senior React Developer', status: 'FEEDBACK_REVIEW',
        appliedDate: '2023-10-29', expectedSalary: '130,000', resume: 'john_smith_resume.pdf',
        lastActivity: 'Feedback submitted by Interviewer',
        workflowStage: 'FEEDBACK_REVIEW',
        workflowHistory: [
            { stage: 'NEW', date: '2023-10-29', by: 'Candidate John Smith' },
            { stage: 'SCREENING', date: '2023-10-30', by: 'HR Manager Alice' },
            { stage: 'INTERVIEW_SCHEDULED', date: '2023-10-30', by: 'HR Manager Alice' },
            { stage: 'INTERVIEWED', date: '2023-11-02', by: 'Interviewer Carol' },
            { stage: 'FEEDBACK_REVIEW', date: '2023-11-03', by: 'Interviewer Carol' }
        ],
        auditLog: [
            { timestamp: '2023-11-03 15:00', user: 'Interviewer Carol', action: 'Submitted feedback for John Smith' }
        ]
    },
    {
        id: 'cand-003', name: 'Alice Johnson', email: 'alice.j@example.com', phone: '555-555-6666',
        jobId: 'job-102', jobTitle: 'Product Manager', status: 'SCREENING',
        appliedDate: '2023-11-02', expectedSalary: '100,000', resume: 'alice_johnson_resume.pdf',
        lastActivity: 'Application under review',
        workflowStage: 'SCREENING',
        workflowHistory: [
            { stage: 'NEW', date: '2023-11-02', by: 'Candidate Alice Johnson' },
            { stage: 'SCREENING', date: '2023-11-03', by: 'HR Manager Bob' }
        ],
        auditLog: [
            { timestamp: '2023-11-03 09:30', user: 'HR Manager Bob', action: 'Reviewed application for Alice Johnson' }
        ]
    },
    {
        id: 'cand-004', name: 'Michael Brown', email: 'michael.b@example.com', phone: '555-777-8888',
        jobId: 'job-104', jobTitle: 'Data Scientist', status: 'OFFER_EXTENDED',
        appliedDate: '2023-09-20', expectedSalary: '140,000', resume: 'michael_brown_resume.pdf',
        lastActivity: 'Offer extended',
        workflowStage: 'OFFER_EXTENDED',
        workflowHistory: [
            { stage: 'NEW', date: '2023-09-20', by: 'Candidate Michael Brown' },
            { stage: 'SCREENING', date: '2023-09-21', by: 'HR Manager Bob' },
            { stage: 'INTERVIEWED', date: '2023-09-25', by: 'Interviewer David' },
            { stage: 'FEEDBACK_REVIEW', date: '2023-09-26', by: 'HR Manager Bob' },
            { stage: 'OFFER_EXTENDED', date: '2023-09-28', by: 'HR Manager Bob' }
        ],
        auditLog: [
            { timestamp: '2023-09-28 17:00', user: 'HR Manager Bob', action: 'Extended offer to Michael Brown' }
        ]
    },
    {
        id: 'cand-005', name: 'Emily White', email: 'emily.w@example.com', phone: '555-999-0000',
        jobId: 'job-101', jobTitle: 'Senior React Developer', status: 'REJECTED',
        appliedDate: '2023-10-30', expectedSalary: '110,000', resume: 'emily_white_resume.pdf',
        lastActivity: 'Application rejected',
        workflowStage: 'REJECTED',
        workflowHistory: [
            { stage: 'NEW', date: '2023-10-30', by: 'Candidate Emily White' },
            { stage: 'SCREENING', date: '2023-10-31', by: 'HR Manager Alice' },
            { stage: 'REJECTED', date: '2023-11-01', by: 'HR Manager Alice' }
        ],
        auditLog: [
            { timestamp: '2023-11-01 10:00', user: 'HR Manager Alice', action: 'Rejected application for Emily White' }
        ]
    },
    {
        id: 'cand-006', name: 'David Green', email: 'david.g@example.com', phone: '555-123-4567',
        jobId: 'job-101', jobTitle: 'Senior React Developer', status: 'NEW',
        appliedDate: '2023-11-06', expectedSalary: '125,000', resume: 'david_green_resume.pdf',
        lastActivity: 'New Application',
        workflowStage: 'NEW',
        workflowHistory: [
            { stage: 'NEW', date: '2023-11-06', by: 'Candidate David Green' }
        ],
        auditLog: [
            { timestamp: '2023-11-06 14:00', user: 'Candidate David Green', action: 'Submitted application for Senior React Developer' }
        ]
    }
];

const dummyInterviews = [
    {
        id: 'int-001', candidateId: 'cand-001', candidateName: 'Jane Doe',
        jobTitle: 'Senior React Developer', interviewerId: 'user-carol', interviewerName: 'Interviewer Carol',
        date: '2023-11-07', time: '10:00 AM', type: 'Technical', status: 'SCHEDULED',
        feedbackStatus: 'PENDING',
        location: 'Google Meet Link',
        auditLog: [
            { timestamp: '2023-10-30 11:00', user: 'HR Manager Alice', action: 'Scheduled interview for Jane Doe with Carol' }
        ]
    },
    {
        id: 'int-002', candidateId: 'cand-002', candidateName: 'John Smith',
        jobTitle: 'Senior React Developer', interviewerId: 'user-carol', interviewerName: 'Interviewer Carol',
        date: '2023-11-02', time: '02:00 PM', type: 'Technical', status: 'COMPLETED',
        feedbackStatus: 'SUBMITTED',
        location: 'Zoom Meeting',
        feedback: "John showed strong technical skills, good problem-solving. Cultural fit seems good.",
        rating: 4,
        auditLog: [
            { timestamp: '2023-11-02 14:00', user: 'Interviewer Carol', action: 'Completed interview for John Smith' },
            { timestamp: '2023-11-03 15:00', user: 'Interviewer Carol', action: 'Submitted feedback for John Smith' }
        ]
    },
    {
        id: 'int-003', candidateId: 'cand-004', candidateName: 'Michael Brown',
        jobTitle: 'Data Scientist', interviewerId: 'user-david', interviewerName: 'Interviewer David',
        date: '2023-09-25', time: '11:00 AM', type: 'Behavioral', status: 'COMPLETED',
        feedbackStatus: 'SUBMITTED',
        location: 'In-person at Office',
        feedback: "Michael demonstrated strong leadership and communication. Very experienced.",
        rating: 5,
        auditLog: [
            { timestamp: '2023-09-25 11:00', user: 'Interviewer David', action: 'Completed interview for Michael Brown' },
            { timestamp: '2023-09-26 09:00', user: 'Interviewer David', action: 'Submitted feedback for Michael Brown' }
        ]
    },
    {
        id: 'int-004', candidateId: 'cand-003', candidateName: 'Alice Johnson',
        jobTitle: 'Product Manager', interviewerId: 'user-carol', interviewerName: 'Interviewer Carol',
        date: '2023-11-09', time: '03:00 PM', type: 'Hiring Manager', status: 'SCHEDULED',
        feedbackStatus: 'PENDING',
        location: 'MS Teams',
        auditLog: [
            { timestamp: '2023-11-03 10:00', user: 'HR Manager Bob', action: 'Scheduled interview for Alice Johnson with Carol' }
        ]
    }
];

const dummyOffers = [
    {
        id: 'offer-001', candidateId: 'cand-004', candidateName: 'Michael Brown',
        jobId: 'job-104', jobTitle: 'Data Scientist', status: 'OFFERED',
        salary: '140,000', bonus: '10,000', startDate: '2024-01-15',
        offerDate: '2023-09-28', expiryDate: '2023-10-05',
        workflowStage: 'OFFERED',
        workflowHistory: [
            { stage: 'DRAFT', date: '2023-09-26', by: 'HR Manager Bob' },
            { stage: 'PENDING_APPROVAL', date: '2023-09-27', by: 'HR Manager Bob' },
            { stage: 'OFFERED', date: '2023-09-28', by: 'Admin John' }
        ],
        auditLog: [
            { timestamp: '2023-09-28 17:00', user: 'HR Manager Bob', action: 'Extended offer to Michael Brown' }
        ]
    },
    {
        id: 'offer-002', candidateId: 'cand-002', candidateName: 'John Smith',
        jobId: 'job-101', jobTitle: 'Senior React Developer', status: 'DRAFT',
        salary: '135,000', bonus: '5,000', startDate: '2024-02-01',
        offerDate: null, expiryDate: null,
        workflowStage: 'DRAFT',
        workflowHistory: [
            { stage: 'DRAFT', date: '2023-11-04', by: 'HR Manager Alice' }
        ],
        auditLog: [
            { timestamp: '2023-11-04 10:00', user: 'HR Manager Alice', action: 'Created draft offer for John Smith' }
        ]
    }
];

const dummyUsers = {
    'admin@hiresmart.com': { role: 'Admin', name: 'Admin John' },
    'alice@hiresmart.com': { role: 'HR Manager', name: 'HR Manager Alice' },
    'bob@hiresmart.com': { role: 'HR Manager', name: 'HR Manager Bob' },
    'carol@hiresmart.com': { role: 'Interviewer', name: 'Interviewer Carol' },
    'david@hiresmart.com': { role: 'Interviewer', name: 'Interviewer David' },
    'jane.doe@example.com': { role: 'Candidate', name: 'Jane Doe' },
};

// --- RBAC & Permissions ---
const ROLES = {
    ADMIN: 'Admin',
    HR_MANAGER: 'HR Manager',
    INTERVIEWER: 'Interviewer',
    CANDIDATE: 'Candidate'
};

const PERMISSIONS = {
    [ROLES.ADMIN]: {
        dashboards: ['AdminDashboard'],
        jobPostings: { view: true, create: true, edit: true, delete: true, approve: true, close: true, manageAll: true },
        candidateApplications: { view: true, create: true, edit: true, manageAll: true, advancedScreening: true, extendOffer: true },
        interviews: { view: true, schedule: true, edit: true, manageAll: true },
        offers: { view: true, create: true, edit: true, approve: true, manageAll: true },
        reports: { view: true, export: true },
        users: { view: true, manage: true },
        auditLogs: { view: true }
    },
    [ROLES.HR_MANAGER]: {
        dashboards: ['HRManagerDashboard'],
        jobPostings: { view: true, create: true, edit: true, close: true }, // Can edit their own, submit for approval
        candidateApplications: { view: true, create: true, edit: true, screening: true, scheduleInterview: true, extendOffer: true },
        interviews: { view: true, schedule: true, edit: true },
        offers: { view: true, create: true, edit: true }, // Can create/edit, submit for approval
        reports: { view: true, export: true },
        auditLogs: { view: true } // Limited view to relevant logs
    },
    [ROLES.INTERVIEWER]: {
        dashboards: ['InterviewerDashboard'],
        jobPostings: { view: true }, // View details of assigned jobs
        candidateApplications: { view: true }, // View details of candidates they need to interview
        interviews: { view: true, submitFeedback: true, reschedule: true }, // View assigned interviews, submit feedback
        offers: { view: false },
        reports: { view: false },
        auditLogs: { view: false }
    },
    [ROLES.CANDIDATE]: {
        dashboards: ['CandidateDashboard'],
        jobPostings: { view: true }, // View jobs they applied to
        candidateApplications: { view: true, edit: true }, // View their own application, submit docs
        interviews: { view: true, reschedule: true }, // View their own interview schedule
        offers: { view: true, acceptDecline: true }, // View and act on their own offers
        reports: { view: false },
        auditLogs: { view: false } // View limited activity log for their application
    }
};

const checkPermission = (role, resource, action = 'view') => {
    if (!role || !PERMISSIONS[role]) return false;
    const resourcePermissions = PERMISSIONS[role][resource];
    if (!resourcePermissions) return false;
    return resourcePermissions[action] === true;
};

// --- Reusable Components ---

const StatusBadge = ({ status }) => {
    const color = STATUS_COLORS[status] || 'var(--status-grey)';
    return (
        <span className={`status-badge ${status}`} style={{ backgroundColor: color }}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};

const Card = ({ title, status, metadata, onClick, children, headerColor }) => {
    const cardStatusClass = status ? `data-status="${status}"` : '';
    const headerBg = headerColor || STATUS_COLORS[status] || 'var(--primary-color)';

    return (
        <div className="card" onClick={onClick} {...{ [cardStatusClass.split('=')[0]]: cardStatusClass.split('=')[1] ? cardStatusClass.split('=')[1].replace(/"/g, '') : '' }}>
            <div className="card-header" style={{ backgroundColor: headerBg }}>
                <span>{title}</span>
                {status && <StatusBadge status={status} />}
            </div>
            <div className="card-content">
                {children}
            </div>
            {metadata && (
                <div className="card-footer">
                    <span>{metadata.date}</span>
                    <span>{metadata.info}</span>
                </div>
            )}
        </div>
    );
};

const WorkflowTracker = ({ currentStage, workflowStages, slaStatus, role }) => {
    if (!checkPermission(role, 'workflowTracker', 'view')) return null;

    return (
        <div className="workflow-tracker">
            {workflowStages.map((stage, index) => {
                const isCompleted = workflowStages.indexOf(currentStage) > workflowStages.indexOf(stage);
                const isCurrent = currentStage === stage;
                const isSlaBreach = (slaStatus === 'BREACHED' && isCurrent); // Simplified for demo

                return (
                    <div
                        key={stage}
                        className={`workflow-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isSlaBreach ? 'sla-breach' : ''}`}
                    >
                        <span className="workflow-step-label">{stage.replace(/_/g, ' ')}</span>
                        {isCurrent && slaStatus && <span className="workflow-step-sla">SLA: {slaStatus}</span>}
                    </div>
                );
            })}
        </div>
    );
};

const AuditLog = ({ logs, role }) => {
    if (!checkPermission(role, 'auditLogs', 'view')) return null;
    return (
        <div className="audit-log">
            <h3>Audit Log</h3>
            <ul>
                {logs.map((log, index) => (
                    <li key={index}>
                        <strong>{log.timestamp}</strong> - {log.user}: {log.action}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ToastNotification = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
                    <span className="toast-icon">
                        {toast.type === 'success' && <FaCheckCircle />}
                        {toast.type === 'error' && <FaExclamationTriangle />}
                        {toast.type === 'info' && <FaInfoCircle />}
                        {toast.type === 'warning' && <FaExclamationTriangle />}
                    </span>
                    <span className="toast-message">{toast.message}</span>
                    <button onClick={() => removeToast(toast.id)} className="modal-close-btn" style={{ fontSize: '16px' }}><FaTimes /></button>
                </div>
            ))}
        </div>
    );
};

const Modal = ({ isOpen, onClose, title, children }) => {
    const modalClass = isOpen ? 'modal-overlay open' : 'modal-overlay';
    return (
        <div className={modalClass} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="modal-close-btn"><FaTimes /></button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Forms ---

const JobForm = ({ job, onClose, onSave, role }) => {
    const [formData, setFormData] = useState(job || {
        title: '', department: '', location: '', description: '', status: 'DRAFT'
    });
    const isEdit = !!job?.id;
    const canEdit = checkPermission(role, 'jobPostings', 'edit') || checkPermission(role, 'jobPostings', 'create');
    const isApprovedOrClosed = formData.status === 'APPROVED' || formData.status === 'CLOSED';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canEdit) {
            alert("You don't have permission to perform this action.");
            return;
        }
        // Basic validation
        if (!formData.title || !formData.department || !formData.location || !formData.description) {
            alert('Please fill in all mandatory fields.');
            return;
        }
        onSave(formData);
        onClose();
    };

    if (!canEdit && isEdit) return <p>You do not have permission to view or edit this form.</p>;
    if (!canEdit && !isEdit) return <p>You do not have permission to create job postings.</p>;

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="title">Job Title <span style={{ color: 'red' }}>*</span></label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required disabled={isApprovedOrClosed} />
            </div>
            <div className="form-group">
                <label htmlFor="department">Department <span style={{ color: 'red' }}>*</span></label>
                <input type="text" id="department" name="department" value={formData.department} onChange={handleChange} required disabled={isApprovedOrClosed} />
            </div>
            <div className="form-group">
                <label htmlFor="location">Location <span style={{ color: 'red' }}>*</span></label>
                <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required disabled={isApprovedOrClosed} />
            </div>
            <div className="form-group">
                <label htmlFor="description">Description <span style={{ color: 'red' }}>*</span></label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="5" required disabled={isApprovedOrClosed}></textarea>
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isApprovedOrClosed}>Save Job</button>
                {isEdit && formData.status === 'DRAFT' && checkPermission(role, 'jobPostings', 'approve') && ( // Simplified: Admin can move to approved directly
                    <button type="button" className="btn btn-approve" onClick={() => onSave({ ...formData, status: 'APPROVED' })}>Approve</button>
                )}
                {isEdit && formData.status === 'APPROVED' && checkPermission(role, 'jobPostings', 'close') && (
                    <button type="button" className="btn btn-danger" onClick={() => onSave({ ...formData, status: 'CLOSED' })}>Close Job</button>
                )}
            </div>
        </form>
    );
};

const CandidateForm = ({ candidate, onClose, onSave, role }) => {
    const [formData, setFormData] = useState(candidate || {
        name: '', email: '', phone: '', jobId: '', jobTitle: '', expectedSalary: '', resume: null, status: 'NEW'
    });
    const isEdit = !!candidate?.id;
    const canEdit = checkPermission(role, 'candidateApplications', 'edit') || checkPermission(role, 'candidateApplications', 'create');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canEdit) { alert("You don't have permission to perform this action."); return; }
        if (!formData.name || !formData.email || !formData.jobId || (isEdit && !formData.resume)) {
            alert('Please fill in all mandatory fields and upload a resume if creating.');
            return;
        }
        // In a real app, formData.resume would be uploaded to a storage service.
        onSave(formData);
        onClose();
    };

    if (!canEdit && isEdit) return <p>You do not have permission to view or edit this form.</p>;
    if (!canEdit && !isEdit) return <p>You do not have permission to create candidate applications.</p>;

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Full Name <span style={{ color: 'red' }}>*</span></label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email <span style={{ color: 'red' }}>*</span></label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label htmlFor="jobId">Job Posting <span style={{ color: 'red' }}>*</span></label>
                <select id="jobId" name="jobId" value={formData.jobId} onChange={handleChange} required>
                    <option value="">Select Job</option>
                    {dummyJobPostings.filter(job => job.status === 'APPROVED').map(job => (
                        <option key={job.id} value={job.id}>{job.title} ({job.department})</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="expectedSalary">Expected Salary</label>
                <input type="text" id="expectedSalary" name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label htmlFor="resume">Resume/CV <span style={{ color: 'red' }}>*</span></label>
                {formData.resume && typeof formData.resume === 'string' && <p>Current: {formData.resume}</p>}
                <input type="file" id="resume" name="resume" onChange={handleFileChange} required={!isEdit || !formData.resume} />
                <small>Max file size: 5MB (PDF, DOCX)</small>
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Application</button>
            </div>
        </form>
    );
};

const InterviewForm = ({ interview, onClose, onSave, role, candidates, interviewers }) => {
    const [formData, setFormData] = useState(interview || {
        candidateId: '', candidateName: '', jobId: '', jobTitle: '', interviewerId: '', interviewerName: '',
        date: '', time: '', type: 'Technical', status: 'SCHEDULED', feedback: '', rating: null
    });
    const isEdit = !!interview?.id;
    const canEdit = checkPermission(role, 'interviews', 'schedule');
    const canSubmitFeedback = checkPermission(role, 'interviews', 'submitFeedback');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canEdit && !canSubmitFeedback) { alert("You don't have permission to perform this action."); return; }
        if (!formData.candidateId || !formData.interviewerId || !formData.date || !formData.time || !formData.type) {
            alert('Please fill in all mandatory fields.');
            return;
        }
        onSave(formData);
        onClose();
    };

    const selectedCandidate = candidates.find(c => c.id === formData.candidateId);
    useEffect(() => {
        if (selectedCandidate) {
            setFormData(prev => ({
                ...prev,
                candidateName: selectedCandidate.name,
                jobId: selectedCandidate.jobId,
                jobTitle: selectedCandidate.jobTitle
            }));
        }
    }, [formData.candidateId, selectedCandidate]);

    if (!canEdit && !canSubmitFeedback) return <p>You do not have permission to view or interact with this form.</p>;

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="candidateId">Candidate <span style={{ color: 'red' }}>*</span></label>
                <select id="candidateId" name="candidateId" value={formData.candidateId} onChange={handleChange} required disabled={isEdit}>
                    <option value="">Select Candidate</option>
                    {candidates.map(cand => (
                        <option key={cand.id} value={cand.id}>{cand.name} ({cand.jobTitle})</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="interviewerId">Interviewer <span style={{ color: 'red' }}>*</span></label>
                <select id="interviewerId" name="interviewerId" value={formData.interviewerId} onChange={handleChange} required disabled={isEdit}>
                    <option value="">Select Interviewer</option>
                    {Object.values(dummyUsers).filter(u => u.role === ROLES.INTERVIEWER).map(u => (
                        <option key={u.name} value={`user-${u.name.split(' ')[1].toLowerCase()}`}>{u.name}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="date">Date <span style={{ color: 'red' }}>*</span></label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required disabled={isEdit && formData.status !== 'SCHEDULED'} />
            </div>
            <div className="form-group">
                <label htmlFor="time">Time <span style={{ color: 'red' }}>*</span></label>
                <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required disabled={isEdit && formData.status !== 'SCHEDULED'} />
            </div>
            <div className="form-group">
                <label htmlFor="type">Interview Type <span style={{ color: 'red' }}>*</span></label>
                <select id="type" name="type" value={formData.type} onChange={handleChange} required disabled={isEdit && formData.status !== 'SCHEDULED'}>
                    <option value="Technical">Technical</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="Hiring Manager">Hiring Manager</option>
                    <option value="Final Round">Final Round</option>
                </select>
            </div>
            {isEdit && formData.status === 'COMPLETED' && canSubmitFeedback && (
                <>
                    <div className="form-group">
                        <label htmlFor="feedback">Feedback</label>
                        <textarea id="feedback" name="feedback" value={formData.feedback} onChange={handleChange} rows="4"></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="rating">Rating (1-5)</label>
                        <input type="number" id="rating" name="rating" value={formData.rating || ''} onChange={handleChange} min="1" max="5" />
                    </div>
                </>
            )}
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                {canEdit && <button type="submit" className="btn btn-primary">Save Interview</button>}
                {isEdit && formData.status === 'SCHEDULED' && canSubmitFeedback && (
                    <button type="button" className="btn btn-approve" onClick={() => onSave({ ...formData, status: 'COMPLETED', feedbackStatus: 'SUBMITTED' })}>Submit Feedback</button>
                )}
            </div>
        </form>
    );
};

const OfferForm = ({ offer, onClose, onSave, role, candidates, jobPostings }) => {
    const [formData, setFormData] = useState(offer || {
        candidateId: '', candidateName: '', jobId: '', jobTitle: '', salary: '', bonus: '', startDate: '',
        offerDate: '', expiryDate: '', status: 'DRAFT'
    });
    const isEdit = !!offer?.id;
    const canCreateEdit = checkPermission(role, 'offers', 'create'); // Simplified for both create/edit by HR
    const canApprove = checkPermission(role, 'offers', 'approve');
    const canAcceptDecline = checkPermission(role, 'offers', 'acceptDecline'); // For Candidate role

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canCreateEdit && !canAcceptDecline) { alert("You don't have permission to perform this action."); return; }
        if (!formData.candidateId || !formData.jobId || !formData.salary || !formData.startDate) {
            alert('Please fill in all mandatory fields.');
            return;
        }
        onSave(formData);
        onClose();
    };

    const selectedCandidate = candidates.find(c => c.id === formData.candidateId);
    const selectedJob = jobPostings.find(j => j.id === formData.jobId);

    useEffect(() => {
        if (selectedCandidate && selectedJob) {
            setFormData(prev => ({
                ...prev,
                candidateName: selectedCandidate.name,
                jobTitle: selectedJob.title
            }));
        }
    }, [formData.candidateId, formData.jobId, selectedCandidate, selectedJob]);

    const isOfferActive = formData.status === 'OFFERED';
    const isOfferFinal = formData.status === 'ACCEPTED' || formData.status === 'DECLINED';
    const disableFields = (isOfferActive && !canAcceptDecline) || isOfferFinal || !canCreateEdit;

    if (!canCreateEdit && !canAcceptDecline) return <p>You do not have permission to view or interact with this form.</p>;

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="candidateId">Candidate <span style={{ color: 'red' }}>*</span></label>
                <select id="candidateId" name="candidateId" value={formData.candidateId} onChange={handleChange} required disabled={isEdit || !canCreateEdit}>
                    <option value="">Select Candidate</option>
                    {candidates.filter(c => c.status === 'OFFER_EXTENDED' || c.id === formData.candidateId).map(cand => (
                        <option key={cand.id} value={cand.id}>{cand.name} ({cand.jobTitle})</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="jobId">Job Posting <span style={{ color: 'red' }}>*</span></label>
                <select id="jobId" name="jobId" value={formData.jobId} onChange={handleChange} required disabled={isEdit || !canCreateEdit}>
                    <option value="">Select Job</option>
                    {jobPostings.filter(j => j.status === 'APPROVED' || j.id === formData.jobId).map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="salary">Salary <span style={{ color: 'red' }}>*</span></label>
                <input type="text" id="salary" name="salary" value={formData.salary} onChange={handleChange} required disabled={disableFields} />
            </div>
            <div className="form-group">
                <label htmlFor="bonus">Bonus</label>
                <input type="text" id="bonus" name="bonus" value={formData.bonus} onChange={handleChange} disabled={disableFields} />
            </div>
            <div className="form-group">
                <label htmlFor="startDate">Start Date <span style={{ color: 'red' }}>*</span></label>
                <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required disabled={disableFields} />
            </div>
            <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input type="date" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleChange} disabled={disableFields} />
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                {canCreateEdit && !isOfferFinal && <button type="submit" className="btn btn-primary">Save Offer</button>}
                {canApprove && formData.status === 'DRAFT' && <button type="button" className="btn btn-approve" onClick={() => onSave({ ...formData, status: 'OFFERED', offerDate: new Date().toISOString().split('T')[0] })}>Approve & Extend Offer</button>}
                {canAcceptDecline && isOfferActive && (
                    <>
                        <button type="button" className="btn btn-approve" onClick={() => onSave({ ...formData, status: 'ACCEPTED' })}>Accept Offer</button>
                        <button type="button" className="btn btn-danger" onClick={() => onSave({ ...formData, status: 'DECLINED' })}>Decline Offer</button>
                    </>
                )}
            </div>
        </form>
    );
};

// --- Full-Screen Detail Pages ---

const JobDetailScreen = ({ job, goBack, currentUser, onSaveJob }) => {
    const { role } = currentUser;
    if (!checkPermission(role, 'jobPostings', 'view')) {
        return <div className="full-screen-page"><h2>Access Denied</h2><p>You do not have permission to view this page.</p><button className="btn btn-secondary" onClick={goBack}>Back</button></div>;
    }

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const handleSave = (updatedJob) => {
        onSaveJob(updatedJob);
        setIsEditModalOpen(false);
    };

    return (
        <div className="full-screen-page">
            <div className="full-screen-header">
                <h2><FaBuilding /> {job.title} <StatusBadge status={job.status} /></h2>
                <div>
                    {checkPermission(role, 'jobPostings', 'edit') && (job.status === 'DRAFT' || job.status === 'PENDING') && (
                        <button className="btn btn-primary" onClick={() => setIsEditModalOpen(true)}><FaEdit /> Edit Job</button>
                    )}
                    <button className="btn btn-secondary" onClick={goBack} style={{ marginLeft: 'var(--spacing-md)' }}><FaArrowLeft /> Back</button>
                </div>
            </div>

            <div className="detail-section">
                <h3>Job Details</h3>
                <div className="detail-grid">
                    <div className="detail-item"><strong>Department</strong><span>{job.department}</span></div>
                    <div className="detail-item"><strong>Location</strong><span>{job.location}</span></div>
                    <div className="detail-item"><strong>Date Posted</strong><span>{job.datePosted}</span></div>
                    <div className="detail-item"><strong>Applicants</strong><span>{job.applicants}</span></div>
                    <div className="detail-item"><strong>Views</strong><span>{job.views}</span></div>
                </div>
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                    <strong>Description</strong>
                    <p>{job.description}</p>
                </div>
            </div>

            <div className="detail-section">
                <h3>Workflow Progress</h3>
                <WorkflowTracker
                    currentStage={job.workflowStage}
                    workflowStages={WORKFLOW_STAGES.JOB_POSTING}
                    slaStatus={job.status === 'PENDING_APPROVAL' ? 'IN_TIME' : 'NOT_APPLICABLE'} // Simplified SLA
                    role={role}
                />
            </div>

            {checkPermission(role, 'auditLogs', 'view') && (
                <div className="detail-section">
                    <AuditLog logs={job.auditLog || []} role={role} />
                </div>
            )}

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Job Posting: ${job.title}`}>
                <JobForm job={job} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} role={role} />
            </Modal>
        </div>
    );
};

const CandidateDetailScreen = ({ candidate, goBack, currentUser, onSaveCandidate, onScheduleInterview, onExtendOffer }) => {
    const { role } = currentUser;
    if (!checkPermission(role, 'candidateApplications', 'view')) {
        return <div className="full-screen-page"><h2>Access Denied</h2><p>You do not have permission to view this page.</p><button className="btn btn-secondary" onClick={goBack}>Back</button></div>;
    }

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

    const handleSaveCandidate = (updatedCandidate) => {
        onSaveCandidate(updatedCandidate);
        setIsEditModalOpen(false);
    };

    const handleScheduleInterview = (newInterview) => {
        onScheduleInterview(newInterview);
        setIsInterviewModalOpen(false);
    };

    const handleExtendOffer = (newOffer) => {
        onExtendOffer(newOffer);
        setIsOfferModalOpen(false);
    };

    return (
        <div className="full-screen-page">
            <div className="full-screen-header">
                <h2><FaUserTie /> {candidate.name} <StatusBadge status={candidate.status} /></h2>
                <div>
                    {checkPermission(role, 'candidateApplications', 'edit') && (
                        <button className="btn btn-primary" onClick={() => setIsEditModalOpen(true)}><FaEdit /> Edit Application</button>
                    )}
                    {checkPermission(role, 'candidateApplications', 'scheduleInterview') && (candidate.status === 'SCREENING' || candidate.status === 'INTERVIEWED') && (
                        <button className="btn btn-primary" onClick={() => setIsInterviewModalOpen(true)} style={{ marginLeft: 'var(--spacing-md)' }}><FaCalendarAlt /> Schedule Interview</button>
                    )}
                    {checkPermission(role, 'candidateApplications', 'extendOffer') && (candidate.status === 'FEEDBACK_REVIEW' || candidate.status === 'INTERVIEWED') && (
                        <button className="btn btn-approve" onClick={() => setIsOfferModalOpen(true)} style={{ marginLeft: 'var(--spacing-md)' }}><FaRegHandshake /> Extend Offer</button>
                    )}
                    <button className="btn btn-secondary" onClick={goBack} style={{ marginLeft: 'var(--spacing-md)' }}><FaArrowLeft /> Back</button>
                </div>
            </div>

            <div className="detail-section">
                <h3>Candidate Details</h3>
                <div className="detail-grid">
                    <div className="detail-item"><strong>Email</strong><span>{candidate.email}</span></div>
                    <div className="detail-item"><strong>Phone</strong><span>{candidate.phone}</span></div>
                    <div className="detail-item"><strong>Applied For</strong><span>{candidate.jobTitle} ({candidate.jobId})</span></div>
                    <div className="detail-item"><strong>Applied Date</strong><span>{candidate.appliedDate}</span></div>
                    <div className="detail-item"><strong>Expected Salary</strong><span>${candidate.expectedSalary}</span></div>
                    <div className="detail-item"><strong>Resume</strong><a href="#" onClick={() => alert('Viewing ' + candidate.resume)}><FaDownload /> {candidate.resume}</a></div>
                </div>
            </div>

            <div className="detail-section">
                <h3>Application Workflow</h3>
                <WorkflowTracker
                    currentStage={candidate.workflowStage}
                    workflowStages={WORKFLOW_STAGES.CANDIDATE_APPLICATION}
                    slaStatus={candidate.status === 'SCREENING' ? 'IN_TIME' : 'NOT_APPLICABLE'} // Simplified SLA
                    role={role}
                />
            </div>

            {checkPermission(role, 'interviews', 'view') && (
                <div className="detail-section">
                    <h3>Interviews</h3>
                    {dummyInterviews.filter(i => i.candidateId === candidate.id).length > 0 ? (
                        <div className="card-grid">
                            {dummyInterviews.filter(i => i.candidateId === candidate.id).map(interview => (
                                <Card
                                    key={interview.id}
                                    title={`${interview.type} Interview`}
                                    status={interview.status === 'SCHEDULED' ? 'PENDING' : 'COMPLETED'}
                                    metadata={{ date: interview.date, info: `Interviewer: ${interview.interviewerName}` }}
                                    onClick={() => onScheduleInterview(interview)}
                                >
                                    <p>Time: {interview.time}</p>
                                    <p>Location: {interview.location}</p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FaCalendarAlt />
                            <h3>No Interviews Scheduled</h3>
                            <p>This candidate does not have any interviews scheduled yet.</p>
                            {checkPermission(role, 'candidateApplications', 'scheduleInterview') && (
                                <button className="btn btn-primary" onClick={() => setIsInterviewModalOpen(true)}><FaPlus /> Schedule First Interview</button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {checkPermission(role, 'auditLogs', 'view') && (
                <div className="detail-section">
                    <AuditLog logs={candidate.auditLog || []} role={role} />
                </div>
            )}

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Application: ${candidate.name}`}>
                <CandidateForm candidate={candidate} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveCandidate} role={role} />
            </Modal>
            <Modal isOpen={isInterviewModalOpen} onClose={() => setIsInterviewModalOpen(false)} title={`Schedule Interview for ${candidate.name}`}>
                <InterviewForm
                    interview={{ candidateId: candidate.id, candidateName: candidate.name, jobId: candidate.jobId, jobTitle: candidate.jobTitle }}
                    onClose={() => setIsInterviewModalOpen(false)}
                    onSave={handleScheduleInterview}
                    role={role}
                    candidates={dummyCandidates}
                    interviewers={Object.values(dummyUsers).filter(u => u.role === ROLES.INTERVIEWER)}
                />
            </Modal>
            <Modal isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} title={`Extend Offer to ${candidate.name}`}>
                <OfferForm
                    offer={{ candidateId: candidate.id, candidateName: candidate.name, jobId: candidate.jobId, jobTitle: candidate.jobTitle, status: 'DRAFT' }}
                    onClose={() => setIsOfferModalOpen(false)}
                    onSave={handleExtendOffer}
                    role={role}
                    candidates={dummyCandidates}
                    jobPostings={dummyJobPostings}
                />
            </Modal>
        </div>
    );
};

const InterviewDetailScreen = ({ interview, goBack, currentUser, onSaveInterview }) => {
    const { role } = currentUser;
    if (!checkPermission(role, 'interviews', 'view')) {
        return <div className="full-screen-page"><h2>Access Denied</h2><p>You do not have permission to view this page.</p><button className="btn btn-secondary" onClick={goBack}>Back</button></div>;
    }

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const handleSave = (updatedInterview) => {
        onSaveInterview(updatedInterview);
        setIsEditModalOpen(false);
    };

    const canSubmitFeedback = checkPermission(role, 'interviews', 'submitFeedback') && interview.status === 'SCHEDULED' && currentUser.name === interview.interviewerName;
    const canEdit = checkPermission(role, 'interviews', 'edit') || (checkPermission(role, 'interviews', 'reschedule') && currentUser.name === interview.interviewerName); // Can reschedule if assigned
    const canViewFeedback = checkPermission(role, 'interviews', 'view');

    return (
        <div className="full-screen-page">
            <div className="full-screen-header">
                <h2><FaCalendarAlt /> {interview.type} Interview with {interview.candidateName} <StatusBadge status={interview.status} /></h2>
                <div>
                    {(canEdit || canSubmitFeedback) && (
                        <button className="btn btn-primary" onClick={() => setIsEditModalOpen(true)}><FaEdit /> {canSubmitFeedback ? 'Submit Feedback' : 'Edit Interview'}</button>
                    )}
                    <button className="btn btn-secondary" onClick={goBack} style={{ marginLeft: 'var(--spacing-md)' }}><FaArrowLeft /> Back</button>
                </div>
            </div>

            <div className="detail-section">
                <h3>Interview Details</h3>
                <div className="detail-grid">
                    <div className="detail-item"><strong>Candidate</strong><span>{interview.candidateName}</span></div>
                    <div className="detail-item"><strong>Job Title</strong><span>{interview.jobTitle}</span></div>
                    <div className="detail-item"><strong>Interviewer</strong><span>{interview.interviewerName}</span></div>
                    <div className="detail-item"><strong>Date</strong><span>{interview.date}</span></div>
                    <div className="detail-item"><strong>Time</strong><span>{interview.time}</span></div>
                    <div className="detail-item"><strong>Type</strong><span>{interview.type}</span></div>
                    <div className="detail-item"><strong>Location</strong><span>{interview.location}</span></div>
                    <div className="detail-item"><strong>Feedback Status</strong><span>{interview.feedbackStatus}</span></div>
                </div>
            </div>

            {interview.status === 'COMPLETED' && canViewFeedback && interview.feedback && (
                <div className="detail-section">
                    <h3>Interviewer Feedback</h3>
                    <p>{interview.feedback}</p>
                    <p><strong>Rating:</strong> {interview.rating}/5</p>
                </div>
            )}

            {checkPermission(role, 'auditLogs', 'view') && (
                <div className="detail-section">
                    <AuditLog logs={interview.auditLog || []} role={role} />
                </div>
            )}

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Manage Interview: ${interview.candidateName}`}>
                <InterviewForm
                    interview={interview}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSave}
                    role={role}
                    candidates={dummyCandidates}
                    interviewers={Object.values(dummyUsers).filter(u => u.role === ROLES.INTERVIEWER)}
                />
            </Modal>
        </div>
    );
};

const OfferDetailScreen = ({ offer, goBack, currentUser, onSaveOffer }) => {
    const { role } = currentUser;
    if (!checkPermission(role, 'offers', 'view')) {
        return <div className="full-screen-page"><h2>Access Denied</h2><p>You do not have permission to view this page.</p><button className="btn btn-secondary" onClick={goBack}>Back</button></div>;
    }

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const handleSave = (updatedOffer) => {
        onSaveOffer(updatedOffer);
        setIsEditModalOpen(false);
    };

    const canActOnOffer = (checkPermission(role, 'offers', 'edit') && offer.status !== 'ACCEPTED' && offer.status !== 'DECLINED') ||
                           (checkPermission(role, 'offers', 'approve') && offer.status === 'DRAFT') ||
                           (checkPermission(role, 'offers', 'acceptDecline') && offer.status === 'OFFERED' && currentUser.name === offer.candidateName);

    return (
        <div className="full-screen-page">
            <div className="full-screen-header">
                <h2><FaRegHandshake /> Offer for {offer.candidateName} <StatusBadge status={offer.status} /></h2>
                <div>
                    {canActOnOffer && (
                        <button className="btn btn-primary" onClick={() => setIsEditModalOpen(true)}><FaEdit /> Manage Offer</button>
                    )}
                    <button className="btn btn-secondary" onClick={goBack} style={{ marginLeft: 'var(--spacing-md)' }}><FaArrowLeft /> Back</button>
                </div>
            </div>

            <div className="detail-section">
                <h3>Offer Details</h3>
                <div className="detail-grid">
                    <div className="detail-item"><strong>Candidate</strong><span>{offer.candidateName}</span></div>
                    <div className="detail-item"><strong>Job Title</strong><span>{offer.jobTitle}</span></div>
                    <div className="detail-item"><strong>Salary</strong><span>${offer.salary}</span></div>
                    <div className="detail-item"><strong>Bonus</strong><span>${offer.bonus || 'N/A'}</span></div>
                    <div className="detail-item"><strong>Start Date</strong><span>{offer.startDate}</span></div>
                    <div className="detail-item"><strong>Offer Date</strong><span>{offer.offerDate || 'N/A'}</span></div>
                    <div className="detail-item"><strong>Expiry Date</strong><span>{offer.expiryDate || 'N/A'}</span></div>
                </div>
            </div>

            <div className="detail-section">
                <h3>Offer Workflow</h3>
                <WorkflowTracker
                    currentStage={offer.workflowStage}
                    workflowStages={WORKFLOW_STAGES.OFFER_MANAGEMENT}
                    slaStatus={offer.status === 'PENDING_APPROVAL' ? 'BREACHED' : 'NOT_APPLICABLE'} // Simplified SLA
                    role={role}
                />
            </div>

            {checkPermission(role, 'auditLogs', 'view') && (
                <div className="detail-section">
                    <AuditLog logs={offer.auditLog || []} role={role} />
                </div>
            )}

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Manage Offer: ${offer.candidateName}`}>
                <OfferForm
                    offer={offer}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={handleSave}
                    role={role}
                    candidates={dummyCandidates}
                    jobPostings={dummyJobPostings}
                />
            </Modal>
        </div>
    );
};

// --- List Screens ---

const JobPostingsList = () => {
    const { navigate, currentUser, jobs, setJobs, addToast, currentScreen } = useContext(AppContext);
    const { role } = currentUser;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (!checkPermission(role, 'jobPostings', 'view')) {
        return <div className="main-screen empty-state"> <FaTools /> <h3>Access Denied</h3> <p>You do not have permission to view job postings.</p></div>;
    }

    const handleCreateJob = (newJob) => {
        const jobId = `job-${Date.now().toString().slice(-5)}`;
        const newRecord = {
            ...newJob,
            id: jobId,
            datePosted: newJob.datePosted || new Date().toISOString().split('T')[0],
            applicants: 0, views: 0,
            workflowStage: newJob.status === 'APPROVED' ? 'APPROVED' : 'DRAFT',
            workflowHistory: [{ stage: newJob.status === 'APPROVED' ? 'APPROVED' : 'DRAFT', date: new Date().toISOString().split('T')[0], by: currentUser.name }],
            auditLog: [{ timestamp: new Date().toLocaleString(), user: currentUser.name, action: `Created new Job Posting "${newJob.title}"` }]
        };
        setJobs(prev => [...prev, newRecord]);
        addToast('success', `Job "${newRecord.title}" created successfully!`);
        navigate('JobDetail', { id: newRecord.id });
    };

    const filteredJobs = jobs.filter(job => {
        if (role === ROLES.CANDIDATE) return job.status === 'APPROVED'; // Candidates only see approved jobs
        // Other roles see all jobs
        return true;
    });

    return (
        <div className="main-screen">
            <div className="dashboard-section-header">
                <h2>Job Postings</h2>
                {checkPermission(role, 'jobPostings', 'create') && (
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}><FaPlus /> Create New Job</button>
                )}
            </div>
            {filteredJobs.length > 0 ? (
                <div className="card-grid">
                    {filteredJobs.map(job => (
                        <Card
                            key={job.id}
                            title={job.title}
                            status={job.status}
                            metadata={{ date: `Posted: ${job.datePosted}`, info: `${job.applicants} Applicants` }}
                            onClick={() => navigate('JobDetail', { id: job.id })}
                        >
                            <p><strong>Department:</strong> {job.department}</p>
                            <p><strong>Location:</strong> {job.location}</p>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <FaClipboardList />
                    <h3>No Job Postings Found</h3>
                    <p>There are no job postings available or matching your current filters.</p>
                    {checkPermission(role, 'jobPostings', 'create') && (
                        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}><FaPlus /> Create First Job Posting</button>
                    )}
                </div>
            )}

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Job Posting">
                <JobForm onClose={() => setIsCreateModalOpen(false)} onSave={handleCreateJob} role={role} />
            </Modal>
        </div>
    );
};

const CandidateApplicationsList = () => {
    const { navigate, currentUser, candidates, setCandidates, addToast } = useContext(AppContext);
    const { role } = currentUser;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (!checkPermission(role, 'candidateApplications', 'view')) {
        return <div className="main-screen empty-state"> <FaUsers /> <h3>Access Denied</h3> <p>You do not have permission to view candidate applications.</p></div>;
    }

    const handleCreateCandidate = (newCandidate) => {
        const candidateId = `cand-${Date.now().toString().slice(-5)}`;
        const selectedJob = dummyJobPostings.find(job => job.id === newCandidate.jobId);
        const newRecord = {
            ...newCandidate,
            id: candidateId,
            appliedDate: newCandidate.appliedDate || new Date().toISOString().split('T')[0],
            jobTitle: selectedJob ? selectedJob.title : 'N/A',
            lastActivity: 'New Application',
            workflowStage: 'NEW',
            workflowHistory: [{ stage: 'NEW', date: new Date().toISOString().split('T')[0], by: currentUser.name }],
            auditLog: [{ timestamp: new Date().toLocaleString(), user: currentUser.name, action: `Submitted application for "${newCandidate.jobTitle}"` }]
        };
        setCandidates(prev => [...prev, newRecord]);
        addToast('success', `Application for ${newRecord.name} submitted successfully!`);
        navigate('CandidateDetail', { id: newRecord.id });
    };

    const filteredCandidates = candidates.filter(candidate => {
        if (role === ROLES.CANDIDATE) return candidate.email === currentUser.email; // Candidate only sees their own
        if (role === ROLES.INTERVIEWER) {
            // Interviewer only sees candidates they need to interview or have interviewed
            return dummyInterviews.some(i => i.candidateId === candidate.id && i.interviewerId === currentUser.id);
        }
        return true; // Admin/HR see all
    });

    return (
        <div className="main-screen">
            <div className="dashboard-section-header">
                <h2>Candidate Applications</h2>
                {checkPermission(role, 'candidateApplications', 'create') && (
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}><FaPlus /> Add New Candidate</button>
                )}
            </div>
            {filteredCandidates.length > 0 ? (
                <div className="card-grid">
                    {filteredCandidates.map(candidate => (
                        <Card
                            key={candidate.id}
                            title={candidate.name}
                            status={candidate.status}
                            metadata={{ date: `Applied: ${candidate.appliedDate}`, info: `Job: ${candidate.jobTitle}` }}
                            onClick={() => navigate('CandidateDetail', { id: candidate.id })}
                        >
                            <p><strong>Email:</strong> {candidate.email}</p>
                            <p><strong>Last Activity:</strong> {candidate.lastActivity}</p>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <FaUsers />
                    <h3>No Applications Found</h3>
                    <p>There are no candidate applications available or matching your current filters.</p>
                    {checkPermission(role, 'candidateApplications', 'create') && (
                        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}><FaPlus /> Add First Candidate Application</button>
                    )}
                </div>
            )}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New Candidate Application">
                <CandidateForm onClose={() => setIsCreateModalOpen(false)} onSave={handleCreateCandidate} role={role} />
            </Modal>
        </div>
    );
};

const InterviewsList = () => {
    const { navigate, currentUser, interviews, setInterviews, candidates, addToast } = useContext(AppContext);
    const { role } = currentUser;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (!checkPermission(role, 'interviews', 'view')) {
        return <div className="main-screen empty-state"> <FaCalendarAlt /> <h3>Access Denied</h3> <p>You do not have permission to view interviews.</p></div>;
    }

    const handleScheduleInterview = (newInterview) => {
        const interviewId = `int-${Date.now().toString().slice(-5)}`;
        const newRecord = {
            ...newInterview,
            id: interviewId,
            feedbackStatus: 'PENDING',
            auditLog: [{ timestamp: new Date().toLocaleString(), user: currentUser.name, action: `Scheduled new interview for ${newInterview.candidateName}` }]
        };
        setInterviews(prev => [...prev, newRecord]);
        addToast('success', `Interview for ${newRecord.candidateName} scheduled successfully!`);
        navigate('InterviewDetail', { id: newRecord.id });
    };

    const filteredInterviews = interviews.filter(interview => {
        if (role === ROLES.INTERVIEWER) return interview.interviewerName === currentUser.name;
        if (role === ROLES.CANDIDATE) return interview.candidateName === currentUser.name;
        return true;
    });

    return (
        <div className="main-screen">
            <div className="dashboard-section-header">
                <h2>Interviews</h2>
                {checkPermission(role, 'interviews', 'schedule') && (
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}><FaPlus /> Schedule Interview</button>
                )}
            </div>
            {filteredInterviews.length > 0 ? (
                <div className="card-grid">
                    {filteredInterviews.map(interview => (
                        <Card
                            key={interview.id}
                            title={`${interview.type} Interview`}
                            status={interview.status === 'SCHEDULED' ? 'PENDING' : 'COMPLETED'}
                            metadata={{ date: `${interview.date} ${interview.time}`, info: `Candidate: ${interview.candidateName}` }}
                            onClick={() => navigate('InterviewDetail', { id: interview.id })}
                        >
                            <p><strong>Interviewer:</strong> {interview.interviewerName}</p>
                            <p><strong>Job:</strong> {interview.jobTitle}</p>
                            <p><strong>Feedback:</strong> {interview.feedbackStatus}</p>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <FaCalendarAlt />
                    <h3>No Interviews Scheduled</h3>
                    <p>There are no interviews available or scheduled for you.</p>
                    {checkPermission(role, 'interviews', 'schedule') && (
                        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}><FaPlus /> Schedule First Interview</button>
                    )}
                </div>
            )}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Schedule New Interview">
                <InterviewForm
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleScheduleInterview}
                    role={role}
                    candidates={candidates}
                    interviewers={Object.values(dummyUsers).filter(u => u.role === ROLES.INTERVIEWER)}
                />
            </Modal>
        </div>
    );
};

const OffersList = () => {
    const { navigate, currentUser, offers, setOffers, candidates, jobs, addToast } = useContext(AppContext);
    const { role } = currentUser;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    if (!checkPermission(role, 'offers', 'view')) {
        return <div className="main-screen empty-state"> <FaRegHandshake /> <h3>Access Denied</h3> <p>You do not have permission to view offers.</p></div>;
    }

    const handleCreateOffer = (newOffer) => {
        const offerId = `offer-${Date.now().toString().slice(-5)}`;
        const newRecord = {
            ...newOffer,
            id: offerId,
            workflowStage: 'DRAFT',
            workflowHistory: [{ stage: 'DRAFT', date: new Date().toISOString().split('T')[0], by: currentUser.name }],
            auditLog: [{ timestamp: new Date().toLocaleString(), user: currentUser.name, action: `Created draft offer for ${newOffer.candidateName}` }]
        };
        setOffers(prev => [...prev, newRecord]);
        addToast('success', `Draft offer for ${newRecord.candidateName} created successfully!`);
        navigate('OfferDetail', { id: newRecord.id });
    };

    const filteredOffers = offers.filter(offer => {
        if (role === ROLES.CANDIDATE) return offer.candidateName === currentUser.name;
        return true;
    });

    return (
        <div className="main-screen">
            <div className="dashboard-section-header">
                <h2>Offers</h2>
                {checkPermission(role, 'offers', 'create') && (
                    <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}><FaPlus /> Create New Offer</button>
                )}
            </div>
            {filteredOffers.length > 0 ? (
                <div className="card-grid">
                    {filteredOffers.map(offer => (
                        <Card
                            key={offer.id}
                            title={`Offer for ${offer.candidateName}`}
                            status={offer.status}
                            metadata={{ date: `Offered: ${offer.offerDate || 'N/A'}`, info: `Job: ${offer.jobTitle}` }}
                            onClick={() => navigate('OfferDetail', { id: offer.id })}
                        >
                            <p><strong>Salary:</strong> ${offer.salary}</p>
                            <p><strong>Start Date:</strong> {offer.startDate}</p>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <FaRegHandshake />
                    <h3>No Offers Found</h3>
                    <p>There are no offers available or matching your current filters.</p>
                    {checkPermission(role, 'offers', 'create') && (
                        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}><FaPlus /> Create First Offer</button>
                    )}
                </div>
            )}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Offer">
                <OfferForm
                    onClose={() => setIsCreateModalOpen(false)}
                    onSave={handleCreateOffer}
                    role={role}
                    candidates={candidates}
                    jobPostings={jobs}
                />
            </Modal>
        </div>
    );
};

// --- Dashboards ---

const AdminDashboard = () => {
    const { currentUser, jobs, candidates, offers, interviews, navigate } = useContext(AppContext);
    const { role } = currentUser;
    if (!checkPermission(role, 'dashboards', 'AdminDashboard')) {
        return <div className="main-screen empty-state"> <FaChartBar /> <h3>Access Denied</h3> <p>You do not have permission to view this dashboard.</p></div>;
    }

    // KPIs for Admin
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'APPROVED').length;
    const totalApplicants = candidates.length;
    const offersExtended = offers.filter(o => o.status === 'OFFERED').length;
    const offersAccepted = offers.filter(o => o.status === 'ACCEPTED').length;
    const pendingInterviews = interviews.filter(i => i.status === 'SCHEDULED').length;

    return (
        <div className="main-screen">
            <h1>Admin Dashboard</h1>
            <div className="dashboard-grid">
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{totalJobs}</span>
                    <span className="kpi-label">Total Job Postings</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{activeJobs}</span>
                    <span className="kpi-label">Active Job Postings</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{totalApplicants}</span>
                    <span className="kpi-label">Total Applicants</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{offersExtended}</span>
                    <span className="kpi-label">Offers Extended</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{offersAccepted}</span>
                    <span className="kpi-label">Offers Accepted</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{pendingInterviews}</span>
                    <span className="kpi-label">Pending Interviews</span>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h3>Job Status Distribution</h3>
                        <button className="btn btn-secondary" onClick={() => alert('Export chart')}><FaFileExport /></button>
                    </div>
                    <div className="chart-placeholder">Donut Chart: Job Statuses</div>
                </div>
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h3>Applications per Month</h3>
                        <button className="btn btn-secondary" onClick={() => alert('Export chart')}><FaFileExport /></button>
                    </div>
                    <div className="chart-placeholder">Line Chart: Applications Trend</div>
                </div>
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h3>Time to Hire (Days)</h3>
                        <button className="btn btn-secondary" onClick={() => alert('Export chart')}><FaFileExport /></button>
                    </div>
                    <div className="chart-placeholder">Gauge Chart: Avg Time to Hire</div>
                </div>
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h3>Offers vs. Rejections</h3>
                        <button className="btn btn-secondary" onClick={() => alert('Export chart')}><FaFileExport /></button>
                    </div>
                    <div className="chart-placeholder">Bar Chart: Offers Accepted/Declined</div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h3>Recent Job Activity</h3>
                    <button className="btn btn-secondary" onClick={() => navigate('JobPostingsList')}>View All</button>
                </div>
                <div className="card-grid">
                    {jobs.slice(0, 3).map(job => (
                        <Card
                            key={job.id}
                            title={job.title}
                            status={job.status}
                            metadata={{ date: `Posted: ${job.datePosted}`, info: `${job.applicants} Applicants` }}
                            onClick={() => navigate('JobDetail', { id: job.id })}
                        >
                            <p><strong>Department:</strong> {job.department}</p>
                            <p><strong>Location:</strong> {job.location}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

const HRManagerDashboard = () => {
    const { currentUser, jobs, candidates, offers, interviews, navigate } = useContext(AppContext);
    const { role } = currentUser;
    if (!checkPermission(role, 'dashboards', 'HRManagerDashboard')) {
        return <div className="main-screen empty-state"> <FaChartBar /> <h3>Access Denied</h3> <p>You do not have permission to view this dashboard.</p></div>;
    }

    // KPIs for HR Manager
    const myJobs = jobs.filter(j => j.auditLog?.[0]?.user === currentUser.name || j.workflowHistory?.[0]?.by === currentUser.name).length;
    const pendingApprovalJobs = jobs.filter(j => j.status === 'PENDING').length;
    const newApplicants = candidates.filter(c => c.status === 'NEW').length;
    const candidatesInScreening = candidates.filter(c => c.status === 'SCREENING').length;
    const scheduledInterviews = interviews.filter(i => i.status === 'SCHEDULED').length;
    const pendingOfferApprovals = offers.filter(o => o.status === 'DRAFT').length;

    return (
        <div className="main-screen">
            <h1>HR Manager Dashboard</h1>
            <div className="dashboard-grid">
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{myJobs}</span>
                    <span className="kpi-label">My Job Postings</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{pendingApprovalJobs}</span>
                    <span className="kpi-label">Jobs Pending Approval</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{newApplicants}</span>
                    <span className="kpi-label">New Applicants</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{candidatesInScreening}</span>
                    <span className="kpi-label">Candidates in Screening</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{scheduledInterviews}</span>
                    <span className="kpi-label">Scheduled Interviews</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{pendingOfferApprovals}</span>
                    <span className="kpi-label">Offers Pending Approval</span>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h3>My Active Job Postings</h3>
                    <button className="btn btn-secondary" onClick={() => navigate('JobPostingsList')}>View All</button>
                </div>
                <div className="card-grid">
                    {jobs.filter(job => job.status === 'APPROVED' && (job.auditLog?.[0]?.user === currentUser.name || job.workflowHistory?.[0]?.by === currentUser.name)).slice(0, 3).map(job => (
                        <Card
                            key={job.id}
                            title={job.title}
                            status={job.status}
                            metadata={{ date: `Posted: ${job.datePosted}`, info: `${job.applicants} Applicants` }}
                            onClick={() => navigate('JobDetail', { id: job.id })}
                        >
                            <p><strong>Department:</strong> {job.department}</p>
                            <p><strong>Location:</strong> {job.location}</p>
                        </Card>
                    ))}
                </div>
            </div>
            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h3>Candidates Awaiting Action</h3>
                    <button className="btn btn-secondary" onClick={() => navigate('CandidateApplicationsList')}>View All</button>
                </div>
                <div className="card-grid">
                    {candidates.filter(c => c.status === 'NEW' || c.status === 'SCREENING' || c.status === 'FEEDBACK_REVIEW').slice(0, 3).map(candidate => (
                        <Card
                            key={candidate.id}
                            title={candidate.name}
                            status={candidate.status}
                            metadata={{ date: `Applied: ${candidate.appliedDate}`, info: `Job: ${candidate.jobTitle}` }}
                            onClick={() => navigate('CandidateDetail', { id: candidate.id })}
                        >
                            <p><strong>Email:</strong> {candidate.email}</p>
                            <p><strong>Last Activity:</strong> {candidate.lastActivity}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

const InterviewerDashboard = () => {
    const { currentUser, interviews, navigate } = useContext(AppContext);
    const { role } = currentUser;
    if (!checkPermission(role, 'dashboards', 'InterviewerDashboard')) {
        return <div className="main-screen empty-state"> <FaChartBar /> <h3>Access Denied</h3> <p>You do not have permission to view this dashboard.</p></div>;
    }

    // KPIs for Interviewer
    const myScheduledInterviews = interviews.filter(i => i.interviewerName === currentUser.name && i.status === 'SCHEDULED').length;
    const feedbackPending = interviews.filter(i => i.interviewerName === currentUser.name && i.status === 'COMPLETED' && i.feedbackStatus === 'PENDING').length;
    const completedInterviews = interviews.filter(i => i.interviewerName === currentUser.name && i.status === 'COMPLETED').length;

    return (
        <div className="main-screen">
            <h1>Interviewer Dashboard</h1>
            <div className="dashboard-grid">
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{myScheduledInterviews}</span>
                    <span className="kpi-label">Scheduled Interviews</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{feedbackPending}</span>
                    <span className="kpi-label">Feedback Pending</span>
                </div>
                <div className="dashboard-kpi-card">
                    <span className="kpi-value">{completedInterviews}</span>
                    <span className="kpi-label">Interviews Completed</span>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h3>My Upcoming Interviews</h3>
                    <button className="btn btn-secondary" onClick={() => navigate('InterviewsList')}>View All</button>
                </div>
                <div className="card-grid">
                    {interviews.filter(i => i.interviewerName === currentUser.name && i.status === 'SCHEDULED').sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 3).map(interview => (
                        <Card
                            key={interview.id}
                            title={`${interview.type} with ${interview.candidateName}`}
                            status={interview.status === 'SCHEDULED' ? 'PENDING' : 'COMPLETED'}
                            metadata={{ date: `${interview.date} ${interview.time}`, info: `Job: ${interview.jobTitle}` }}
                            onClick={() => navigate('InterviewDetail', { id: interview.id })}
                        >
                            <p><strong>Location:</strong> {interview.location}</p>
                        </Card>
                    ))}
                </div>
            </div>
            <div className="dashboard-section">
                <div className="dashboard-section-header">
                    <h3>Interviews Awaiting Feedback</h3>
                    <button className="btn btn-secondary" onClick={() => navigate('InterviewsList')}>View All</button>
                </div>
                <div className="card-grid">
                    {interviews.filter(i => i.interviewerName === currentUser.name && i.status === 'COMPLETED' && i.feedbackStatus === 'PENDING').slice(0, 3).map(interview => (
                        <Card
                            key={interview.id}
                            title={`Feedback for ${interview.candidateName}`}
                            status={'ACTION_REQUIRED'}
                            headerColor={'var(--status-orange)'}
                            metadata={{ date: `Completed: ${interview.date}`, info: `Job: ${interview.jobTitle}` }}
                            onClick={() => navigate('InterviewDetail', { id: interview.id })}
                        >
                            <p><strong>Type:</strong> {interview.type}</p>
                            <p>Please submit feedback for this interview.</p>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CandidateDashboard = () => {
    const { currentUser, candidates, offers, interviews, navigate } = useContext(AppContext);
    const { role } = currentUser;
    if (!checkPermission(role, 'dashboards', 'CandidateDashboard')) {
        return <div className="main-screen empty-state"> <FaChartBar /> <h3>Access Denied</h3> <p>You do not have permission to view this dashboard.</p></div>;
    }

    const myApplication = candidates.find(c => c.email === currentUser.email);
    const myOffers = offers.filter(o => o.candidateName === currentUser.name);
    const myInterviews = interviews.filter(i => i.candidateName === currentUser.name);

    return (
        <div className="main-screen">
            <h1>Candidate Dashboard</h1>
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h3>My Application Status</h3>
                        <button className="btn btn-secondary" onClick={() => myApplication && navigate('CandidateDetail', { id: myApplication.id })}>View Details</button>
                    </div>
                    {myApplication ? (
                        <Card
                            title={myApplication.jobTitle}
                            status={myApplication.status}
                            metadata={{ date: `Applied: ${myApplication.appliedDate}`, info: `Last Activity: ${myApplication.lastActivity}` }}
                            onClick={() => navigate('CandidateDetail', { id: myApplication.id })}
                        >
                            <p><strong>Status:</strong> {myApplication.status.replace(/_/g, ' ')}</p>
                            <p><strong>Email:</strong> {myApplication.email}</p>
                        </Card>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                            <FaUserTie />
                            <h3>No Active Application</h3>
                            <p>You haven't submitted any applications yet.</p>
                            <button className="btn btn-primary" onClick={() => navigate('JobPostingsList')}><FaPlus /> Apply for a Job</button>
                        </div>
                    )}
                </div>

                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h3>My Interviews</h3>
                        <button className="btn btn-secondary" onClick={() => navigate('InterviewsList')}>View All</button>
                    </div>
                    {myInterviews.length > 0 ? (
                        <div className="card-grid">
                            {myInterviews.slice(0, 3).map(interview => (
                                <Card
                                    key={interview.id}
                                    title={`${interview.type} Interview`}
                                    status={interview.status === 'SCHEDULED' ? 'PENDING' : 'COMPLETED'}
                                    metadata={{ date: `${interview.date} ${interview.time}`, info: `Interviewer: ${interview.interviewerName}` }}
                                    onClick={() => navigate('InterviewDetail', { id: interview.id })}
                                >
                                    <p><strong>Location:</strong> {interview.location}</p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                            <FaCalendarAlt />
                            <h3>No Interviews Scheduled</h3>
                            <p>Check back later for updates on your interview schedule.</p>
                        </div>
                    )}
                </div>

                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h3>My Offers</h3>
                        <button className="btn btn-secondary" onClick={() => navigate('OffersList')}>View All</button>
                    </div>
                    {myOffers.length > 0 ? (
                        <div className="card-grid">
                            {myOffers.slice(0, 3).map(offer => (
                                <Card
                                    key={offer.id}
                                    title={`Offer for ${offer.jobTitle}`}
                                    status={offer.status}
                                    metadata={{ date: `Offered: ${offer.offerDate || 'N/A'}`, info: `Salary: $${offer.salary}` }}
                                    onClick={() => navigate('OfferDetail', { id: offer.id })}
                                >
                                    <p><strong>Start Date:</strong> {offer.startDate}</p>
                                    <p><strong>Status:</strong> {offer.status.replace(/_/g, ' ')}</p>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                            <FaRegHandshake />
                            <h3>No Offers Received</h3>
                            <p>Good luck with your applications!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- Main App Component ---
const App = () => {
    const [currentUser, setCurrentUser] = useState(null); // { role: 'Admin', name: 'Admin John', email: 'admin@hiresmart.com', id: 'user-john' }
    const [screenHistory, setScreenHistory] = useState([]); // [{ name: 'Dashboard', params: {} }]
    const [currentScreen, setCurrentScreen] = useState({ name: 'Dashboard', params: {} });
    const [jobs, setJobs] = useState(dummyJobPostings);
    const [candidates, setCandidates] = useState(dummyCandidates);
    const [interviews, setInterviews] = useState(dummyInterviews);
    const [offers, setOffers] = useState(dummyOffers);
    const [toasts, setToasts] = useState([]);

    const addToast = (type, message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message, show: false }]);
        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, show: true } : t));
        }, 50); // Small delay to trigger transition
        setTimeout(() => removeToast(id), 5000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, show: false } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300); // Allow transition to finish
    };

    const navigate = (screenName, params = {}) => {
        setScreenHistory(prev => [...prev, currentScreen]);
        setCurrentScreen({ name: screenName, params });
    };

    const goBack = () => {
        if (screenHistory.length > 0) {
            const previousScreen = screenHistory[screenHistory.length - 1];
            setScreenHistory(prev => prev.slice(0, -1));
            setCurrentScreen(previousScreen);
        } else {
            // Fallback to Dashboard if no history
            setCurrentScreen({ name: 'Dashboard', params: {} });
        }
    };

    const handleLogin = (email) => {
        const user = dummyUsers[email];
        if (user) {
            setCurrentUser({ ...user, email, id: `user-${user.name.split(' ')[1].toLowerCase()}` });
            setCurrentScreen({ name: 'Dashboard', params: {} });
            setScreenHistory([]); // Clear history on login
            addToast('success', `Welcome, ${user.name}!`);
        } else {
            addToast('error', 'Invalid email or role selection.');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setCurrentScreen({ name: 'Login', params: {} });
        setScreenHistory([]);
        addToast('info', 'You have been logged out.');
    };

    const handleSaveJob = (updatedJob) => {
        setJobs(prev => {
            const index = prev.findIndex(j => j.id === updatedJob.id);
            if (index !== -1) {
                const newAuditEntry = { timestamp: new Date().toLocaleString(), user: currentUser.name, action: `Updated Job Posting "${updatedJob.title}"` };
                const updatedAuditLog = [...(prev[index].auditLog || []), newAuditEntry];
                const newWorkflowEntry = updatedJob.workflowStage !== prev[index].workflowStage
                    ? { stage: updatedJob.workflowStage, date: new Date().toISOString().split('T')[0], by: currentUser.name }
                    : null;
                const updatedWorkflowHistory = newWorkflowEntry ? [...(prev[index].workflowHistory || []), newWorkflowEntry] : (prev[index].workflowHistory || []);

                const newJobs = [...prev];
                newJobs[index] = { ...updatedJob, auditLog: updatedAuditLog, workflowHistory: updatedWorkflowHistory };
                addToast('success', `Job "${updatedJob.title}" updated.`);
                return newJobs;
            }
            return prev;
        });
        setCurrentScreen({ name: 'JobDetail', params: { id: updatedJob.id } }); // Re-render detail screen
    };

    const handleSaveCandidate = (updatedCandidate) => {
        setCandidates(prev => {
            const index = prev.findIndex(c => c.id === updatedCandidate.id);
            if (index !== -1) {
                const newAuditEntry = { timestamp: new Date().toLocaleString(), user: currentUser.name, action: `Updated Candidate Application for "${updatedCandidate.name}"` };
                const updatedAuditLog = [...(prev[index].auditLog || []), newAuditEntry];
                const newWorkflowEntry = updatedCandidate.workflowStage !== prev[index].workflowStage
                    ? { stage: updatedCandidate.workflowStage, date: new Date().toISOString().split('T')[0], by: currentUser.name }
                    : null;
                const updatedWorkflowHistory = newWorkflowEntry ? [...(prev[index].workflowHistory || []), newWorkflowEntry] : (prev[index].workflowHistory || []);

                const newCandidates = [...prev];
                newCandidates[index] = { ...updatedCandidate, auditLog: updatedAuditLog, workflowHistory: updatedWorkflowHistory };
                addToast('success', `Application for ${updatedCandidate.name} updated.`);
                return newCandidates;
            }
            return prev;
        });
        setCurrentScreen({ name: 'CandidateDetail', params: { id: updatedCandidate.id } });
    };

    const handleSaveInterview = (updatedInterview) => {
        setInterviews(prev => {
            const index = prev.findIndex(i => i.id === updatedInterview.id);
            if (index !== -1) {
                const newAuditEntry = { timestamp: new Date().toLocaleString(), user: currentUser.name, action: `Updated Interview for "${updatedInterview.candidateName}"` };
                const updatedAuditLog = [...(prev[index].auditLog || []), newAuditEntry];

                const newInterviews = [...prev];
                newInterviews[index] = { ...updatedInterview, auditLog: updatedAuditLog };
                addToast('success', `Interview for ${updatedInterview.candidateName} updated.`);
                return newInterviews;
            }
            return prev;
        });
        setCurrentScreen({ name: 'InterviewDetail', params: { id: updatedInterview.id } });
    };

    const handleSaveOffer = (updatedOffer) => {
        setOffers(prev => {
            const index = prev.findIndex(o => o.id === updatedOffer.id);
            if (index !== -1) {
                const newAuditEntry = { timestamp: new Date().toLocaleString(), user: currentUser.name, action: `Updated Offer for "${updatedOffer.candidateName}"` };
                const updatedAuditLog = [...(prev[index].auditLog || []), newAuditEntry];
                const newWorkflowEntry = updatedOffer.workflowStage !== prev[index].workflowStage
                    ? { stage: updatedOffer.workflowStage, date: new Date().toISOString().split('T')[0], by: currentUser.name }
                    : null;
                const updatedWorkflowHistory = newWorkflowEntry ? [...(prev[index].workflowHistory || []), newWorkflowEntry] : (prev[index].workflowHistory || []);

                const newOffers = [...prev];
                newOffers[index] = { ...updatedOffer, auditLog: updatedAuditLog, workflowHistory: updatedWorkflowHistory };
                addToast('success', `Offer for ${updatedOffer.candidateName} updated.`);
                return newOffers;
            }
            return prev;
        });
        setCurrentScreen({ name: 'OfferDetail', params: { id: updatedOffer.id } });
    };

    // Derived values for current screen content
    const currentDetailItem = currentScreen.params?.id
        ? (currentScreen.name === 'JobDetail' ? jobs.find(j => j.id === currentScreen.params.id) :
           currentScreen.name === 'CandidateDetail' ? candidates.find(c => c.id === currentScreen.params.id) :
           currentScreen.name === 'InterviewDetail' ? interviews.find(i => i.id === currentScreen.params.id) :
           currentScreen.name === 'OfferDetail' ? offers.find(o => o.id === currentScreen.params.id) : null)
        : null;

    // Default to Login screen if no user
    if (!currentUser) {
        return (
            <div className="login-screen">
                <ToastNotification toasts={toasts} removeToast={removeToast} />
                <div className="login-form-container">
                    <h2>HireSmart Login</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const email = e.target.email.value;
                        handleLogin(email);
                    }}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" placeholder="e.g., admin@hiresmart.com" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role-select">Select Role (for demo)</label>
                            <select id="role-select" name="role-select" onChange={(e) => { /* No direct role selection, just email based */ }}>
                                {Object.keys(dummyUsers).map(email => (
                                    <option key={email} value={email}>{dummyUsers[email].name} ({dummyUsers[email].role})</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                </div>
            </div>
        );
    }

    const navItems = [
        { name: 'Dashboard', icon: <FaHome />, roles: [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.INTERVIEWER, ROLES.CANDIDATE] },
        { name: 'JobPostingsList', label: 'Job Postings', icon: <FaBuilding />, roles: [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.INTERVIEWER, ROLES.CANDIDATE] },
        { name: 'CandidateApplicationsList', label: 'Candidates', icon: <FaUsers />, roles: [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.INTERVIEWER, ROLES.CANDIDATE] },
        { name: 'InterviewsList', label: 'Interviews', icon: <FaCalendarAlt />, roles: [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.INTERVIEWER, ROLES.CANDIDATE] },
        { name: 'OffersList', label: 'Offers', icon: <FaRegHandshake />, roles: [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.CANDIDATE] },
        { name: 'Reports', icon: <FaChartBar />, roles: [ROLES.ADMIN, ROLES.HR_MANAGER] },
        { name: 'Settings', icon: <FaCog />, roles: [ROLES.ADMIN] },
    ];

    const contextValue = {
        currentUser, navigate, goBack, jobs, setJobs, candidates, setCandidates,
        interviews, setInterviews, offers, setOffers, addToast,
        currentScreen // Pass currentScreen to components if needed for conditional rendering within them
    };

    const renderScreen = () => {
        if (!currentUser || !currentUser.role) return <div className="main-screen empty-state">Please log in to continue.</div>;

        switch (currentScreen.name) {
            case 'Dashboard':
                switch (currentUser.role) {
                    case ROLES.ADMIN: return <AdminDashboard />;
                    case ROLES.HR_MANAGER: return <HRManagerDashboard />;
                    case ROLES.INTERVIEWER: return <InterviewerDashboard />;
                    case ROLES.CANDIDATE: return <CandidateDashboard />;
                    default: return <div className="main-screen empty-state">Welcome, {currentUser.name}!</div>;
                }
            case 'JobPostingsList': return <JobPostingsList />;
            case 'CandidateApplicationsList': return <CandidateApplicationsList />;
            case 'InterviewsList': return <InterviewsList />;
            case 'OffersList': return <OffersList />;
            case 'JobDetail': return currentDetailItem ? <JobDetailScreen job={currentDetailItem} goBack={goBack} currentUser={currentUser} onSaveJob={handleSaveJob} /> : <div className="main-screen empty-state">Job not found.</div>;
            case 'CandidateDetail': return currentDetailItem ? <CandidateDetailScreen candidate={currentDetailItem} goBack={goBack} currentUser={currentUser} onSaveCandidate={handleSaveCandidate} onScheduleInterview={handleSaveInterview} onExtendOffer={handleSaveOffer} /> : <div className="main-screen empty-state">Candidate not found.</div>;
            case 'InterviewDetail': return currentDetailItem ? <InterviewDetailScreen interview={currentDetailItem} goBack={goBack} currentUser={currentUser} onSaveInterview={handleSaveInterview} /> : <div className="main-screen empty-state">Interview not found.</div>;
            case 'OfferDetail': return currentDetailItem ? <OfferDetailScreen offer={currentDetailItem} goBack={goBack} currentUser={currentUser} onSaveOffer={handleSaveOffer} /> : <div className="main-screen empty-state">Offer not found.</div>;
            case 'Reports': return <div className="main-screen empty-state"><FaChartBar /><h3>Reports Section</h3><p>Detailed reports and analytics will be displayed here.</p><button className="btn btn-secondary" onClick={goBack}>Back</button></div>;
            case 'Settings': return <div className="main-screen empty-state"><FaCog /><h3>Settings</h3><p>User preferences and system configurations.</p><button className="btn btn-secondary" onClick={goBack}>Back</button></div>;
            default: return <div className="main-screen empty-state">Page not found.</div>;
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="app">
                <header className="header">
                    <div className="header-left">
                        {screenHistory.length > 0 && currentScreen.name !== 'Dashboard' && (
                            <button className="btn btn-secondary" onClick={goBack} style={{ marginRight: 'var(--spacing-md)' }}><FaArrowLeft /></button>
                        )}
                        <div className="header-breadcrumbs">
                            <span>HireSmart</span>
                            {screenHistory.map((screen, index) => (
                                <React.Fragment key={index}>
                                    <span>/</span>
                                    <a href="#" onClick={() => navigate(screen.name, screen.params)}>{screen.label || screen.name.replace(/([A-Z])/g, ' $1').trim()}</a>
                                </React.Fragment>
                            ))}
                            {currentScreen.name && currentScreen.name !== 'Dashboard' && (
                                <>
                                    <span>/</span>
                                    <span>{currentScreen.label || currentScreen.name.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </>
                            )}
                        </div>
                        <div className="global-search">
                            <FaSearch />
                            <input type="text" placeholder="Global Search..." onChange={(e) => console.log('Global Search:', e.target.value)} />
                        </div>
                    </div>
                    <div className="header-right">
                        <FaBell style={{ fontSize: 'var(--font-size-lg)', cursor: 'pointer', color: 'var(--primary-dark)' }} />
                        <div className="user-info">
                            <div className="user-avatar">{currentUser.name.split(' ').map(n => n[0]).join('')}</div>
                            <span>{currentUser.name}</span>
                            <button className="btn" onClick={handleLogout}><FaSignOutAlt /></button>
                        </div>
                    </div>
                </header>

                <div className="app-content">
                    <nav className="sidebar">
                        <div className="sidebar-header">
                            <h2>HireSmart</h2>
                        </div>
                        <ul className="sidebar-nav">
                            {navItems.map(item =>
                                item.roles.includes(currentUser.role) && (
                                    <li key={item.name}>
                                        <a
                                            href="#"
                                            className={currentScreen.name === item.name || (currentScreen.name.includes(item.name.replace('List', '')) && item.name.includes('List')) ? 'active' : ''}
                                            onClick={() => navigate(item.name, {})}
                                        >
                                            {item.icon}
                                            {item.label || item.name.replace(/([A-Z])/g, ' $1').trim()}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </nav>

                    <main className="main-screen">
                        {renderScreen()}
                    </main>
                </div>
                <ToastNotification toasts={toasts} removeToast={removeToast} />
            </div>
        </AppContext.Provider>
    );
};

export default App;