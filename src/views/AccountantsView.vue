<template>
  <div class="accountants-view">
    <!-- Existing template content -->
    <div class="container py-4">
      <div class="row">
        <div class="col-12 mb-4">
          <div class="header-card" :class="{ 'skeleton-loading': isLoadingPayments }">
            <template v-if="!isLoadingPayments">
              <div class="welcome-header">
                <div class="user-info">
                  <h1 class="mb-2">Fees and Admission Payments</h1>
                  <p class="lead">Manage student fees, payments, and financial records</p>
                  <!-- Optional badge for role display -->
                  <div class="role-badge mt-2" v-if="userRole">
                    <i class="fas fa-user-tag me-2"></i>
                    {{ userRole }}
                  </div>
                </div>
                <div class="avatar">
                  {{ userInitials }}
                </div>
              </div>
            </template>
            <template v-else>
              <div class="skeleton-header">
                <div class="skeleton-text skeleton-title mb-3"></div>
                <div class="skeleton-text skeleton-subtitle mb-4"></div>
                <div class="header-actions mt-3 d-flex justify-content-end">
                  <div class="skeleton-button me-2"></div>
                  <div class="skeleton-button"></div>
                </div>
              </div>
            </template>
          </div>
        </div>
        
        <!-- School Selector for Superadmin - New Position -->
        <div class="col-12 mb-4" v-if="userRole?.toLowerCase() === 'superadmin' && !isLoadingPayments">
          <div class="school-selector-card">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="fas fa-school me-3 school-icon"></i>
                <div>
                  <h3 class="mb-2">Select School</h3>
                  <p class="text-muted">Filter payment records by school</p>
                </div>
              </div>
              <!-- Add buttons here for superadmin -->
              <div class="action-buttons">
                <button class="btn btn-success me-2 action-btn" @click="openPaymentModal">
                  <i class="fas fa-plus-circle me-1"></i> Record New Payment
                </button>
                <button class="btn btn-primary action-btn" @click="openReportModal">
                  <i class="fas fa-chart-bar me-1"></i> Generate Reports
                </button>
              </div>
            </div>
            
            <!-- Replace with SchoolSelector-style component -->
            <div class="school-selector mt-3">
              <div class="form-group">
                <div class="custom-select-container">
                  <input 
                    type="text" 
                    class="form-control" 
                    v-model="schoolSearchQuery"
                    @focus="isSchoolDropdownOpen = true"
                    :placeholder="selectedSchoolName || 'Search for a school...'"
                    ref="schoolSearchInput"
                  >
                  <div v-if="isSchoolDropdownOpen" class="custom-select-dropdown">
                    <div class="custom-select-options">
                      <div 
                        v-for="school in filteredSchools" 
                        :key="school.id"
                        class="custom-select-option"
                        @click="selectSchool(school.id, school.name)"
                        :class="{ 'selected': selectedSchoolId === school.id }"
                      >
                        <i class="fas fa-school me-2"></i> {{ school.name }}
                      </div>
                      <div v-if="filteredSchools.length === 0 && schoolSearchQuery" class="no-results">
                        No schools found
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Action Card for Non-Superadmin Users -->
        <div class="col-12 mb-4" v-if="userRole?.toLowerCase() !== 'superadmin' && !isLoadingPayments">
          <div class="school-selector-card">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <i class="fas fa-sliders-h me-3 school-icon"></i>
                <div>
                  <h3 class="mb-2">Payment Actions</h3>
                  <p class="text-muted">Record and manage payment data</p>
                </div>
              </div>
              <!-- Add buttons here for non-superadmin -->
              <div class="action-buttons">
                <button class="btn btn-success me-2 action-btn" @click="openPaymentModal">
                  <i class="fas fa-plus-circle me-1"></i> Record New Payment
                </button>
                <button class="btn btn-primary action-btn" @click="openReportModal">
                  <i class="fas fa-chart-bar me-1"></i> Generate Reports
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Advanced Payments Table -->
        <div class="col-12">
          <div class="card payments-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h2 v-if="!isLoadingPayments">
                Payment Records
              </h2>
              <div v-else class="skeleton-text skeleton-lg"></div>
              <div class="d-flex align-items-center gap-3" v-if="!isLoadingPayments">
                <div class="search-container">
                  <input 
                    type="text" 
                    class="form-control search-input" 
                    placeholder="Search payments..." 
                    v-model="searchQuery"
                  >
                  <i class="fas fa-search search-icon"></i>
                  <button 
                    v-if="searchQuery.trim()" 
                    class="search-clear-btn"
                    @click="searchQuery = ''"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="filter-container">
                  
                  <div class="filter-options">
                    <button 
                      class="filter-pill" 
                      :class="{ active: filterType === 'all' }" 
                      @click="filterBy('all')"
                    >
                      All
                    </button>
                    <button 
                      class="filter-pill" 
                      :class="{ active: filterType === 'cash' }" 
                      @click="filterBy('cash')"
                    >
                      Cash
                    </button>
                    <button 
                      class="filter-pill" 
                      :class="{ active: filterType === 'momo' }" 
                      @click="filterBy('momo')"
                    >
                      Mobile Money
                    </button>
                    <button 
                      class="filter-pill" 
                      :class="{ active: filterType === 'bank' }" 
                      @click="filterBy('bank')"
                    >
                      Bank Transfer
                    </button>
                    <button 
                      class="filter-pill clear-pill" 
                      @click="resetFilters"
                      v-if="filterType !== 'all'"
                    >
                      <i class="fas fa-times-circle me-1"></i>Clear
                    </button>
                  </div>
                </div>
                <!-- Remove school filter from here as we've moved it above -->
              </div>
              <div v-else class="d-flex align-items-center gap-3">
                <div class="skeleton-search"></div>
                <div class="skeleton-filters"></div>
              </div>
            </div>
            
            <div class="table-container">
              <!-- Loading state -->
              <div v-if="isLoadingPayments" class="text-center py-5">
                <div class="spinner-border spinner-border-lg text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3 text-muted">Fetching payment records...</p>
              </div>
              
              <!-- Error state -->
              <div v-else-if="connectionError" class="alert alert-warning mx-4 my-4">
                <h4 class="alert-heading mb-2">
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  Unable to load payments
                </h4>
                <p>{{ connectionError }}</p>
                <button class="btn btn-sm btn-warning mt-2" @click="checkDbConnection">
                  <i class="fas fa-sync-alt me-2"></i> Retry
                </button>
              </div>
              
              <!-- Empty state -->
              <div v-else-if="filteredPayments.length === 0" class="empty-state">
                <img src="@/assets/empty-data.svg" alt="No payments" class="empty-state-img" v-if="false">
                <i class="fas fa-receipt fa-4x text-muted mb-3"></i>
                <h3>{{ isSuperadminWithNoSchool ? 'Select a School' : 'No payments found' }}</h3>
                <p class="text-muted mb-4">
                  <template v-if="isSuperadminWithNoSchool">
                    Please select a school from the dropdown above to view payment records.
                  </template>
                  <template v-else>
                    No payment records match your current search or filter.
                  </template>
                </p>
              </div>
              
              <!-- Data table -->
              <div v-else class="responsive-table">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Purpose</th>
                      <th>Method</th>
                      <th>Paid By</th>
                      <th>Phone</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="payment in paginatedPayments" :key="payment.payment_id">
                      <td>
                        <span class="payment-id">{{ payment.payment_id }}</span>
                      </td>
                      <td>
                        <span class="identification">{{ payment.identification || 'N/A' }}</span>
                      </td>
                      <td>
                        <span class="fw-medium">{{ payment.student_name }}</span>
                      </td>
                      <td>
                        <span class="payment-purpose">
                          {{ payment.payment_for ? payment.payment_for : 'Not specified' }}
                        </span>
                      </td>
                      <td>
                        <span class="payment-method" :class="'method-' + payment.payment_type?.toLowerCase()">
                          {{ payment.payment_type }}
                        </span>
                      </td>
                      <td>{{ payment.payment_by || 'N/A' }}</td>
                      <td>
                        <a :href="'tel:' + payment.phone" class="phone-link">
                          {{ payment.phone || 'N/A' }}
                        </a>
                      </td>
                      <td>
                        <span class="amount-display">
                          {{ formatAmount(payment.amount) }}
                        </span>
                      </td>
                      <td>
                        <div class="actions">
                          <button class="btn btn-icon" title="Print Receipt" @click="showReceiptForPayment(payment)">
                            <i class="fas fa-print"></i>
                          </button>
                          <button class="btn btn-icon text-danger" title="Delete" @click="confirmDeletePayment(payment)" v-if="canDeletePayments">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Pagination controls -->
              <div class="pagination-footer d-flex justify-content-between align-items-center py-3 px-4" v-if="filteredPayments.length > 0">
                <div class="pagination-info">
                  Showing <span class="fw-bold">{{ paginationStart + 1 }}</span> to 
                  <span class="fw-bold">{{ paginationEnd }}</span> of 
                  <span class="fw-bold">{{ filteredPayments.length }}</span> entries
                </div>
                <div class="pagination-controls">
                  <button 
                    class="btn btn-sm btn-outline-primary me-2" 
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                  >
                    <i class="fas fa-chevron-left me-1"></i> Previous
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-primary" 
                    :disabled="currentPage >= totalPages"
                    @click="currentPage++"
                  >
                    Next <i class="fas fa-chevron-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Payment Modal -->
    <div class="modal fade" id="paymentModal" tabindex="-1" aria-labelledby="paymentModalLabel" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true" ref="paymentModalRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title" id="paymentModalLabel">Record New Payment</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="submitPayment">
              <div class="row g-4">
                <!-- Payment Mode Selection -->
                <div class="col-md-12 mb-0">
                  <div class="payment-mode-selector">
                    <div class="modern-radio-container">
                      <div class="modern-radio-option" 
                           :class="{ 'active': paymentMode === 'new' }"
                           @click="() => { paymentMode = 'new'; updatePaymentMode(); }">
                        <div class="radio-icon">
                          <div class="radio-inner"></div>
                        </div>
                        <div class="radio-label">
                          <i class="fas fa-user-graduate me-2"></i>
                          Admission
                        </div>
                      </div>
                      <div class="modern-radio-option"
                           :class="{ 'active': paymentMode === 'followUp' }"
                           @click="() => { paymentMode = 'followUp'; updatePaymentMode(); }">
                        <div class="radio-icon">
                          <div class="radio-inner"></div>
                        </div>
                        <div class="radio-label">
                          <i class="fas fa-user-check me-2"></i>
                          Continue Student
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Follow-up Payment Search (Visible only in follow-up mode) -->
                <div class="col-md-12 mt-n2" v-if="paymentMode === 'followUp'">
                  <div class="form-floating search-with-dropdown">
                    <input 
                      type="text" 
                      class="form-control" 
                      id="searchQuery" 
                      v-model="followUpSearch" 
                      placeholder="Search by student name, payment ID, or phone"
                      autocomplete="off"
                      :class="{'selected-student': selectedFollowUpPayment}"
                    >
                    <label for="searchQuery">Search student with balance</label>
                    <i class="fas fa-search search-icon" v-if="!selectedFollowUpPayment"></i>
                    
                    <!-- Search hint when no search is active -->
                    <div class="search-hint" v-if="!selectedFollowUpPayment && !followUpSearch.trim()">
                      <i class="fas fa-info-circle me-2 text-primary"></i>
                      Type to search for students with outstanding balance
                    </div>
                    
                    <!-- Selected Student Info -->
                    <div class="selected-student-info" v-if="selectedFollowUpPayment">
                      <div class="d-flex justify-content-between align-items-center">
                        <div>
                          <span class="selected-label">Selected:</span>
                          <span class="selected-name">{{ selectedFollowUpPayment.student_name }}</span>
                          <span class="selected-id" v-if="selectedFollowUpPayment.identification">{{ selectedFollowUpPayment.identification }}</span>
                        </div>
                        <button type="button" class="btn-clear" @click="clearSelectedFollowUp">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      <div class="selected-student-balance">
                        <span>{{ selectedFollowUpPayment.payment_for }}</span>
                        <span class="balance-pill">Balance: GHC {{ formatAmount(selectedFollowUpPayment.amount_remaining) }}</span>
                      </div>
                    </div>
                    
                    <!-- Dropdown Results -->
                    <div class="search-results-dropdown" v-if="!selectedFollowUpPayment && followUpSearch.trim()">
                      <div class="dropdown-header d-flex justify-content-between align-items-center">
                        <span>Student Payments with Balance</span>
                        <button type="button" class="btn-close btn-sm" @click="followUpSearch = ''"></button>
                      </div>
                      
                      <div v-if="filteredFollowUpPayments.length === 0" class="no-results">
                        <i class="fas fa-search me-2"></i> No matching payments found
                      </div>
                      
                      <div v-else class="search-results-list">
                        <div 
                          v-for="payment in filteredFollowUpPayments" 
                          :key="payment.payment_id"
                          class="search-result-item"
                          @click="selectFollowUpPayment(payment)"
                        >
                          <div class="result-main">
                            <div class="student-info">
                              <span class="student-name">{{ payment.student_name }}</span>
                              <span class="student-id" v-if="payment.identification">{{ payment.identification }}</span>
                            </div>
                            <div class="payment-info">
                              <span class="payment-id">{{ payment.payment_id }}</span>
                              <span class="payment-for">{{ payment.payment_for }}</span>
                            </div>
                          </div>
                          <div class="result-details">
                            <div class="contact-info">
                              <i class="fas fa-phone-alt me-1"></i> {{ payment.phone || 'No phone' }}
                            </div>
                            <div class="balance">
                              <span class="balance-label">Balance:</span>
                              <span class="balance-amount">GHC {{ formatAmount(payment.amount_remaining) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-12">
                  <div class="form-floating">
                    <input type="text" class="form-control bg-light" id="paymentId" v-model="paymentForm.payment_id" readonly>
                    <label for="paymentId">Payment ID</label>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-floating">
                    <input 
                      type="text" 
                      class="form-control" 
                      :class="{ 'bg-light': paymentMode === 'new' }"
                      id="identification" 
                      v-model="paymentForm.identification" 
                      :readonly="paymentMode === 'new'"
                      @blur="checkStudentId"
                    >
                    <label for="identification">Student ID</label>
                  </div>
                  <small class="form-text text-muted d-block mb-3" v-if="paymentMode === 'new'">
                    <i class="fas fa-info-circle me-1"></i> Auto-generated for new admissions
                  </small>
                  <small class="form-text text-muted d-block mb-3" v-if="paymentMode === 'followUp' && !selectedFollowUpPayment">
                    <i class="fas fa-info-circle me-1"></i> Enter existing student ID to check balances
                  </small>
                  <div v-if="studentFeedback" class="alert alert-info mt-2">
                    <i class="fas fa-info-circle me-2"></i>
                    {{ studentFeedback }}
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-floating">
                    <select class="form-select" id="paymentType" v-model="paymentForm.payment_type" required>
                      <option value="">Select payment method</option>
                      <option 
                        v-for="type in paymentTypes" 
                        :key="type.id" 
                        :value="type.type_name"
                      >
                        {{ type.type_name }}
                      </option>
                    </select>
                    <label for="paymentType">Payment Method</label>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-floating">
                    <input type="text" class="form-control" id="paymentBy" v-model="paymentForm.payment_by" required>
                    <label for="paymentBy">Payment By</label>
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-floating">
                    <input 
                      type="text" 
                      class="form-control" 
                      id="studentName" 
                      v-model="paymentForm.student_name" 
                      required 
                      :readonly="paymentMode === 'followUp' && selectedFollowUpPayment"
                    >
                    <label for="studentName">Student Name</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="tel" class="form-control" id="phone" v-model="paymentForm.phone" required :readonly="paymentMode === 'followUp' && selectedFollowUpPayment">
                    <label for="phone">Phone Number</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <select class="form-select" id="paymentFor" v-model="paymentForm.payment_for" required :disabled="paymentMode === 'followUp' && selectedFollowUpPayment">
                      <option value="">Select payment purpose</option>
                      <option 
                        v-for="option in paymentOptions" 
                        :key="option.id" 
                        :value="option.payment_for"
                      >
                        {{ option.payment_for }}
                      </option>
                    </select>
                    <label for="paymentFor">Payment For</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="number" step="0.01" min="0" class="form-control bg-light" id="expectedAmount" v-model="paymentForm.expected_amount" readonly>
                    <label for="expectedAmount">Expected Amount</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="number" step="0.01" min="0" class="form-control" id="amount" v-model="paymentForm.amount" required>
                    <label for="amount">Amount Paid</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="date" class="form-control bg-light" id="paymentDate" v-model="paymentForm.payment_date" readonly>
                    <label for="paymentDate">Payment Date</label>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-floating">
                    <input type="number" step="0.01" min="0" class="form-control bg-light" id="amountRemaining" v-model="paymentForm.amount_remaining" readonly>
                    <label for="amountRemaining">Amount Remaining</label>
                  </div>
                </div>
                <div class="col-12 mt-4">
                  <div class="d-flex justify-content-end gap-2">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                      <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <i v-else class="fas fa-save me-2"></i>
                      {{ isSubmitting ? 'Saving...' : 'Save Payment' }}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Receipt Modal -->
    <div class="modal fade" id="receiptModal" tabindex="-1" aria-labelledby="receiptModalLabel" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true" ref="receiptModalRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content receipt-modal">
          <div class="modal-header border-0">
            <h5 class="modal-title" id="receiptModalLabel">Payment Receipt</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-0">
            <div v-if="currentReceiptData" class="receipt-container" ref="receiptContainerRef">
              <!-- Security Watermark -->
              <div class="receipt-watermark">
                <div class="watermark-pattern"></div>
                <div class="watermark-logo">
                  <div class="secure-badge">
                    <i class="fas fa-shield-alt"></i>
                  </div>
                  <!-- Removed the serial number -->
                </div>
                <div class="hologram-effect"></div>
              </div>
              
              <!-- School Header -->
              <div class="receipt-header">
                <div class="school-logo">
                  <i class="fas fa-graduation-cap fa-3x"></i>
                </div>
                <div class="school-info">
                  <h2 class="school-name">{{ schoolInfo.name || 'Loading...' }}</h2>
                  <p class="school-address">{{ schoolInfo.address || 'Loading...' }}</p>
                  <p class="school-contact">
                    Email: {{ schoolInfo.email || 'Loading...' }} | Phone: {{ schoolInfo.phone || 'Loading...' }}
                  </p>
                </div>
               
              </div>
              
              <!-- Receipt Title -->
              <div class="receipt-title">
                <h3>Official Payment Receipt</h3>
                <div class="receipt-id">
                  <span>Receipt #: {{ currentReceiptData.receipt_number }}</span>
                </div>
              </div>
              
              <!-- Receipt Details -->
              <div class="receipt-content">
                <div class="receipt-grid">
                  <div class="receipt-row">
                    <div class="receipt-label">Payment Date:</div>
                    <div class="receipt-value">{{ formatReceiptDate(currentReceiptData.payment_date) }}</div>
                  </div>
                  <!-- <div class="receipt-row">
                    <div class="receipt-label">Time:</div>
                    <div class="receipt-value">{{ formatReceiptTime(currentReceiptData.timestamp) }}</div>
                  </div> -->
                  <div class="receipt-row">
                    <div class="receipt-label">Payment For:</div>
                    <div class="receipt-value">{{ currentReceiptData.payment_for }}</div>
                  </div>
                  <div class="receipt-row">
                    <div class="receipt-label">Student Name:</div>
                    <div class="receipt-value">{{ currentReceiptData.student_name }}</div>
                  </div>
                  <div class="receipt-row" v-if="currentReceiptData.identification">
                    <div class="receipt-label">Student ID:</div>
                    <div class="receipt-value">{{ currentReceiptData.identification }}</div>
                  </div>
                  <div class="receipt-row">
                    <div class="receipt-label">Paid By:</div>
                    <div class="receipt-value">{{ currentReceiptData.payment_by }}</div>
                  </div>
                  <div class="receipt-row">
                    <div class="receipt-label">Phone:</div>
                    <div class="receipt-value">{{ currentReceiptData.phone }}</div>
                  </div>
                  <div class="receipt-row">
                    <div class="receipt-label">Payment Method:</div>
                    <div class="receipt-value">
                      <span class="payment-method-badge" :class="'method-' + currentReceiptData.payment_type?.toLowerCase()">
                        {{ currentReceiptData.payment_type }}
                      </span>
                    </div>
                  </div>
                  <div class="receipt-row">
                    <div class="receipt-label">Payment Type:</div>
                    <div class="receipt-value">
                      <span class="payment-type-badge" :class="currentReceiptData.payment_mode?.toLowerCase().replace(' ', '-')">
                        {{ currentReceiptData.payment_mode }}
                      </span>
                    </div>
                  </div>
                  <div class="receipt-row" v-if="currentReceiptData.reference_payment">
                    <div class="receipt-label">Ref. Payment ID:</div>
                    <div class="receipt-value font-monospace">
                      {{ currentReceiptData.reference_payment }}
                    </div>
                  </div>
                </div>
                
                <!-- Payment Amounts -->
                <div class="payment-summary">
                  <div class="summary-row">
                    <div class="summary-label">Expected Amount:</div>
                    <div class="summary-value">GHC {{ formatAmount(currentReceiptData.expected_amount) }}</div>
                  </div>
                  
                  <!-- Payment History -->
                  <div v-if="currentReceiptData.payment_history && currentReceiptData.payment_history.length > 1" class="payment-history mt-3">
                    <h6 class="history-title">Payment History</h6>
                    <div class="history-list">
                      <div v-for="(historyPayment, index) in currentReceiptData.payment_history" 
                           :key="historyPayment.payment_id"
                           class="history-item"
                           :class="{ 'current': historyPayment.payment_id === currentReceiptData.payment_id }">
                        <div class="history-date nowrap">
                          {{ formatReceiptDate(historyPayment.payment_date) }}
                        </div>
                        <div class="history-amount">
                          GHC {{ formatAmount(historyPayment.amount) }}
                        </div>
                        <div class="history-method">
                          <span class="payment-method-badge" :class="'method-' + historyPayment.payment_type?.toLowerCase()">
                            {{ historyPayment.payment_type }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="history-total mt-2">
                      <div class="total-label">Total Amount Paid:</div>
                      <div class="total-value">GHC {{ formatAmount(currentReceiptData.total_amount_paid) }}</div>
                    </div>
                  </div>
                  
                  <div class="summary-row balance" v-if="currentReceiptData.amount_remaining > 0">
                    <div class="summary-label">Remaining Balance:</div>
                    <div class="summary-value">GHC {{ formatAmount(currentReceiptData.amount_remaining) }}</div>
                  </div>
                  <div class="summary-row total">
                    <div class="summary-label">Amount Paid (This Receipt):</div>
                    <div class="summary-value">GHC {{ formatAmount(currentReceiptData.amount) }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="receipt-empty-state">
              <p>No receipt data available.</p>
            </div>
            
            <!-- Receipt Actions -->
            <div class="receipt-actions">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button class="btn btn-primary" @click="generatePdfReceipt" :disabled="isGeneratingPdf">
                <span v-if="isGeneratingPdf" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                <i v-else class="fas fa-file-pdf me-2"></i>
                {{ isGeneratingPdf ? 'Generating...' : 'Download PDF Receipt' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true" ref="deleteModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteModalLabel">Confirm Payment Deletion</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="paymentToDelete" class="delete-confirmation">
              <p class="text-danger"><i class="fas fa-exclamation-triangle me-2"></i> This action cannot be undone!</p>
              <p>Are you sure you want to delete the following payment record?</p>
              
              <div class="payment-details mt-4">
                <div class="detail-row">
                  <span class="detail-label">Payment ID:</span>
                  <span class="detail-value fw-bold">{{ paymentToDelete.payment_id }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Student:</span>
                  <span class="detail-value">{{ paymentToDelete.student_name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount:</span>
                  <span class="detail-value">{{ formatAmount(paymentToDelete.amount) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Payment For:</span>
                  <span class="detail-value">{{ paymentToDelete.payment_for ? paymentToDelete.payment_for : 'Not specified' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="handleDeletePayment"
              :disabled="isDeletingPayment"
            >
              <span v-if="isDeletingPayment" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isDeletingPayment ? 'Deleting...' : 'Delete Payment' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Report Generation Modal -->
    <div class="modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel" data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true" ref="reportModalRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="reportModalLabel">Generate Payment Report</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="generateReport">
              <div class="row">
                <div class="col-12 mb-3">
                  <p class="text-muted">
                    Generate a comprehensive PDF report of payment records based on your selected date range and optional filters. 
                    The report will include payment details, and summary statistics.
                  </p>
                </div>
                
                <!-- Date Range Selector -->
                <div class="col-12 mb-4">
                  <label class="form-label">Date Range</label>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="form-floating">
                        <input type="date" id="startDate" class="form-control" v-model="reportFilters.startDate" required>
                        <label for="startDate">Start Date</label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-floating">
                        <input type="date" id="endDate" class="form-control" v-model="reportFilters.endDate" required>
                        <label for="endDate">End Date</label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Payment Type Filter -->
                <div class="col-md-6 mb-4">
                  <label class="form-label">Payment Method (Optional)</label>
                  <div class="form-floating">
                    <select class="form-select" id="paymentTypeFilter" v-model="reportFilters.paymentType">
                      <option value="">All Payment Methods</option>
                      <option value="Cash">Cash</option>
                      <option value="Momo">Mobile Money (Momo)</option>
                      <option value="Bank">Bank Transfer</option>
                    </select>
                    <label for="paymentTypeFilter">Payment Method</label>
                  </div>
                </div>
                
                <!-- Payment Purpose Filter -->
                <div class="col-md-6 mb-4">
                  <label class="form-label">Payment Purpose (Optional)</label>
                  <div class="form-floating">
                    <select class="form-select" id="paymentPurposeFilter" v-model="reportFilters.paymentPurpose">
                      <option value="">All Payment Purposes</option>
                      <option 
                        v-for="option in paymentOptions" 
                        :key="option.id" 
                        :value="option.payment_for"
                      >
                        {{ option.payment_for }}
                      </option>
                    </select>
                    <label for="paymentPurposeFilter">Payment Purpose</label>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="generateReport"
              :disabled="isGeneratingReport"
            >
              <span v-if="isGeneratingReport" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              <i v-else class="fas fa-file-pdf me-2"></i>
              {{ isGeneratingReport ? 'Generating...' : 'Generate PDF Report' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay for Receipt -->
    <div class="loading-overlay" v-if="isLoadingReceipt">
      <div class="loading-content">
        <div class="spinner">
          <div class="dot1"></div>
          <div class="dot2"></div>
          <div class="dot3"></div>
        </div>
        <p class="loading-text">Preparing your receipt...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch, onUnmounted } from 'vue';
import { Modal } from 'bootstrap';
import { supabase } from '@/lib/supabase';
import { getPayments, getPaymentOptions, addPayment, getPaymentById, deletePayment, getPaymentsByDateRange, updatePaymentRemaining, updatePaymentReference, getRelatedPayments, getPaymentHistoryByReference } from '@/api/payments';
import { useToast } from 'vue-toastification';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuthStore } from '@/store/auth';
import { sendPaymentConfirmationSMS } from '@/services/smsService';
import { getUserInitials, getDisplayName } from '@/utils/userUtils';
// NOTE: If vue-toastification is not installed, run:
// npm install --save vue-toastification@2.0.0-rc.5
// Then in your main.ts file:
// import Toast from "vue-toastification";
// import "vue-toastification/dist/index.css";
// app.use(Toast);

// Initialize toast
const toast = useToast();

// Get user role from auth store
const authStore = useAuthStore();
const userRole = computed(() => authStore.userRole?.role?.toLowerCase() || '');

// Get user display name
const userName = computed(() => getDisplayName(authStore));

// Get user initials for the avatar
const userInitials = computed(() => getUserInitials(userName.value));

// Payment modal reference
const paymentModalRef = ref<HTMLElement | null>(null);
let paymentModal: Modal | null = null;

// Receipt generation
const receiptModalRef = ref<HTMLElement | null>(null);
let receiptModal: Modal | null = null;
const currentReceiptData = ref<any>(null);
const isGeneratingPdf = ref(false);
const isLoadingReceipt = ref(false); // New loading state for receipt loading

// Loading and error states
const isSubmitting = ref(false);
const formError = ref<string | null>(null);
const connectionError = ref<string | null>(null);
const studentFeedback = ref('');

// Recent payments data
const recentPayments = ref<any[]>([]);
const isLoadingPayments = ref(false);

// Table sorting and filtering
const sortColumn = ref('payment_id');
const sortDirection = ref('desc');
const searchQuery = ref('');
const filterType = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Create payment ID with format RC00001
const lastPaymentId = ref(0);

// Add the ref for the receipt container
const receiptContainerRef = ref<HTMLElement | null>(null);

// For delete confirmation
const paymentToDelete = ref<any>(null);
const deleteModalRef = ref<HTMLElement | null>(null);
let deleteModal: Modal | null = null;
const isDeletingPayment = ref(false);

// For report generation
const reportModalRef = ref<HTMLElement | null>(null);
let reportModal: Modal | null = null;
const isGeneratingReport = ref(false);
const reportFilters = ref({
  startDate: new Date().toISOString().slice(0, 10), // Today
  endDate: new Date().toISOString().slice(0, 10),   // Today
  paymentType: '',
  paymentPurpose: ''
});

// Payment mode (new or follow-up) for the payment form
const paymentMode = ref('new');
const followUpSearch = ref('');
const selectedFollowUpPayment = ref<any>(null);

// Computed property for filtering payments with remaining balance
const paymentsWithRemainingBalance = computed(() => {
  return recentPayments.value.filter(payment => 
    payment.amount_remaining && 
    Number(payment.amount_remaining) > 0 && 
    !payment.reference_payment
  );
});

// Filtered follow-up payments based on search
const filteredFollowUpPayments = computed(() => {
  if (!followUpSearch.value.trim()) {
    return paymentsWithRemainingBalance.value;
  }
  
  const query = followUpSearch.value.toLowerCase().trim();
  return paymentsWithRemainingBalance.value.filter(payment => 
    String(payment.payment_id || '').toLowerCase().includes(query) ||
    String(payment.student_name || '').toLowerCase().includes(query) ||
    String(payment.phone || '').toLowerCase().includes(query)
  );
});

// Check if user can delete payments (admin or not accountant)
const canDeletePayments = computed(() => {
  return userRole.value !== 'accountant';
});

// Auto-generate a payment ID with RC format
const generatePaymentId = () => {
  const nextNumber = lastPaymentId.value + 1;
  return `RC${nextNumber.toString().padStart(5, '0')}`;
};

// Auto-generate a student ID with ST format
const lastStudentId = ref(0);
const generateStudentId = () => {
  const nextNumber = lastStudentId.value + 1;
  return `ST${nextNumber.toString().padStart(5, '0')}`;
};

// After authStore declaration
// Add these refs and methods which are used in multiple places
const selectedSchoolId = ref('');
const selectedSchoolName = ref('');
const isSchoolDropdownOpen = ref(false);
const schoolSearchQuery = ref('');
const schoolSearchInput = ref<HTMLInputElement | null>(null);
const schools = ref<{id: string, name: string}[]>([]);

// Load selected school from localStorage
const loadSavedSchoolSelection = () => {
  try {
    const savedId = localStorage.getItem('selectedSchoolId');
    const savedName = localStorage.getItem('selectedSchoolName');
    
    if (savedId && savedName) {
      // Verify that the saved school still exists in the list
      const schoolExists = schools.value.some(school => school.id === savedId);
      
      if (schoolExists) {
        selectedSchoolId.value = savedId;
        selectedSchoolName.value = savedName;
        console.log('Loaded saved school selection:', savedId, savedName);
      } else {
        // Clear invalid school selection
        console.warn('Saved school ID no longer exists in schools list:', savedId);
        localStorage.removeItem('selectedSchoolId');
        localStorage.removeItem('selectedSchoolName');
      }
    }
  } catch (error) {
    console.error('Error loading saved school selection:', error);
  }
};

// Helper function to get the current school_id based on user role
const getCurrentSchoolId = (): string | null => {
  return userRole.value?.toLowerCase() === 'admin' 
    ? authStore.userRole?.school_id || null
    : userRole.value?.toLowerCase() === 'superadmin' && selectedSchoolId.value 
      ? selectedSchoolId.value 
      : null;
};

// Payment form data
const paymentForm = ref({
  payment_id: generatePaymentId(),
  payment_type: '',
  payment_by: '',
  phone: '',
  payment_for: '',
  student_name: '',
  identification: generateStudentId(),
  amount: 0,
  expected_amount: 0,
  payment_date: new Date().toISOString().slice(0, 10),
  amount_remaining: 0,
  reference_payment: null as string | null,
  payment_mode: 'Admission', // Default to 'Admission'
  school_id: getCurrentSchoolId()
});

// Payment options from the database
const paymentOptions = ref<{ id: number; payment_for: string; amount: number; currency: string }[]>([]);

// Payment types from the database
const paymentTypes = ref<{ id: number; type_name: string; school_id?: string }[]>([]);

// Add a computed property to check if user is superadmin with no school selected
// Add a computed property to check if user is superadmin with no school selected
const isSuperadminWithNoSchool = computed(() => {
  return userRole.value === 'superadmin' && !selectedSchoolId.value;
});

// Computed property for filtered and sorted payments
const filteredPayments = computed(() => {
  // If user is superadmin and no school is selected, return empty array
  if (isSuperadminWithNoSchool.value) {
    return [];
  }
  
  let result = [...recentPayments.value];
  
  // Apply text search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(payment => 
      String(payment.payment_id || '').toLowerCase().includes(query) ||
      String(payment.student_name || '').toLowerCase().includes(query) ||
      String(payment.payment_by || '').toLowerCase().includes(query) ||
      String(payment.payment_type || '').toLowerCase().includes(query) ||
      String(payment.phone || '').toLowerCase().includes(query)
    );
  }
  
  // Apply payment type filter
  if (filterType.value !== 'all') {
    result = result.filter(payment => 
      payment.payment_type?.toLowerCase() === filterType.value
    );
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let valueA = a[sortColumn.value];
    let valueB = b[sortColumn.value];
    
    // Handle special cases for sorting
    if (sortColumn.value === 'payment_date') {
      valueA = new Date(valueA || null).getTime() || 0;
      valueB = new Date(valueB || null).getTime() || 0;
    } else if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    } else if (sortColumn.value === 'amount' || sortColumn.value === 'amount_remaining' || sortColumn.value === 'expected_amount') {
      // Handle numeric columns
      valueA = Number(valueA || 0);
      valueB = Number(valueB || 0);
    } else if (sortColumn.value === 'id') {
      // Handle ID columns that might be numeric or string
      valueA = Number(valueA || 0);
      valueB = Number(valueB || 0);
    }
    
    // Apply sort direction
    if (sortDirection.value === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  
  return result;
});

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / itemsPerPage.value);
});

const paginationStart = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value;
});

const paginationEnd = computed(() => {
  const end = paginationStart.value + itemsPerPage.value;
  return end > filteredPayments.value.length ? filteredPayments.value.length : end;
});

const paginatedPayments = computed(() => {
  return filteredPayments.value.slice(paginationStart.value, paginationEnd.value);
});

// Sort function for table headers
const sortBy = (column: string) => {
  if (sortColumn.value === column) {
    // Toggle direction if clicking the same column
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Default to descending for new column
    sortColumn.value = column;
    sortDirection.value = 'desc';
  }
  
  // Reset to first page when sorting changes
  currentPage.value = 1;
};

// Filter by payment type
const filterBy = (type: string) => {
  filterType.value = type;
  // Reset to first page when filter changes
  currentPage.value = 1;
};

// Reset all filters
const resetFilters = () => {
  const hadFilters = filterType.value !== 'all' || searchQuery.value.trim() !== '';
  
  searchQuery.value = '';
  filterType.value = 'all';
  sortColumn.value = 'payment_id';
  sortDirection.value = 'desc';
  currentPage.value = 1;
  
  if (hadFilters) {
    toast.info('Filters have been reset');
  }
};

// Function to get initials from a name
const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Function to determine payment method icon
const getPaymentIcon = (method: string): string => {
  switch (method?.toLowerCase()) {
    case 'cash':
      return 'fa-money-bill-wave';
    case 'momo':
      return 'fa-mobile-alt';
    case 'bank':
      return 'fa-university';
    default:
      return 'fa-credit-card';
  }
};

// Function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Format: Jan 1, 2023
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Function to format amount
const formatAmount = (amount: number): string => {
  return amount.toFixed(2);
};

const formatReceiptDate = (date: string | Date | null): string => {
  if (!date) return 'N/A';
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const showReceiptForPayment = async (payment: any) => {
  try {
    isLoadingReceipt.value = true;
    await fetchSchoolInfo(); // Fetch latest school info before showing receipt
    
    // Get payment history if reference_payment exists
    let paymentHistory = [];
    if (payment.reference_payment) {
      paymentHistory = await getPaymentHistoryByReference(payment.reference_payment);
    }
    
    // Calculate total amount paid from payment history
    const totalAmountPaid = paymentHistory.reduce((total: number, p: any) => total + Number(p.amount), 0);
    
    // Prepare receipt data with payment history
    currentReceiptData.value = {
      ...payment,
      receipt_number: payment.payment_id,
      timestamp: payment.payment_date,
      payment_history: paymentHistory,
      total_amount_paid: totalAmountPaid || Number(payment.amount)
    };
    
    showReceiptModal();
  } catch (error) {
    console.error('Error showing receipt:', error);
    toast.error('Failed to prepare receipt');
  } finally {
    isLoadingReceipt.value = false;
  }
};

// Initialize modal when component is mounted
onMounted(async () => {
  document.title = 'Fees and Admission Payments - School Management System';
  
  if (paymentModalRef.value) {
    paymentModal = new Modal(paymentModalRef.value, {
      backdrop: 'static',
      keyboard: false
    });
  }
  
  // Initialize report modal
  if (reportModalRef.value) {
    reportModal = new Modal(reportModalRef.value, {
      backdrop: 'static',
      keyboard: false
    });
  }
  
  // Make sure user role is loaded
  if (!authStore.userRole) {
    await authStore.fetchUserRole();
  }
  
  console.log('Current user role:', userRole.value);
  console.log('Can delete payments:', canDeletePayments.value);
  
  // Fetch schools list if superadmin
  if (userRole.value?.toLowerCase() === 'superadmin') {
    await fetchSchools();
    
    // Load saved school selection after schools are fetched
    loadSavedSchoolSelection();
    
    // If a school was loaded from localStorage, update the data accordingly
    if (selectedSchoolId.value) {
      await handleSchoolChange(false); // Don't show toast notification on initial load
    }
  }
  
  // Check database connection before loading data
  await checkDbConnection();
  
  // Fetch school info
  await fetchSchoolInfo();
  
  // Fetch payment types
  await fetchPaymentTypes();
});

// Add watch for selectedSchoolId to refresh payment types
watch(
  () => selectedSchoolId.value,
  async () => {
    if (userRole.value === 'superadmin') {
      await fetchPaymentTypes();
    }
  }
);

// Check database connection and table access
const checkDbConnection = async () => {
  try {
    console.log('Checking database connection...');
    connectionError.value = null;
    isLoadingPayments.value = true;
    
    // We'll attempt to fetch the data directly using our API
    // This will verify both connection and permissions
    await fetchRecentPayments();
    await fetchPaymentOptions();
    
    return true;
  } catch (error) {
    console.error('Error checking database connection:', error);
    connectionError.value = 'Could not establish connection to the database. Please check your network connection and try again.';
    isLoadingPayments.value = false;
    return false;
  }
};

// Fetch recent payments from Supabase
const fetchRecentPayments = async () => {
  // Skip if we already know there's a connection error
  if (connectionError.value) {
    isLoadingPayments.value = false;
    return;
  }
  
  try {
    isLoadingPayments.value = true;
    console.log('Fetching payments using API...');
    
    // Get the appropriate school_id based on user role
    const schoolId = userRole.value === 'admin' 
      ? authStore.userRole?.school_id 
      : userRole.value === 'superadmin' 
        ? selectedSchoolId.value 
        : null;
    
    console.log('Fetching payments with school ID:', schoolId);
    
    const data = await getPayments(schoolId);
    
    console.log('Payments data received:', data);
    console.log('Number of records:', data ? data.length : 0);
    
    // Debug payment_for field specifically
    if (data && data.length > 0) {
      console.log('First payment data details:');
      console.log('- payment_id:', data[0].payment_id);
      console.log('- payment_for:', data[0].payment_for);
      console.log('- identification:', data[0].identification);
      console.log('- All first payment fields:', Object.keys(data[0]));
      
      // Check if identification field is coming back
      const paymentsWithId = data.filter(p => p.identification);
      console.log('Number of payments with identification field:', paymentsWithId.length);
      if (paymentsWithId.length > 0) {
        console.log('Sample identification:', paymentsWithId[0].identification);
      }
    }
    
    recentPayments.value = data || [];
    
    // Find the highest payment ID to generate the next ID
    if (data && data.length > 0) {
      // Look for payment IDs with the RC format and extract the highest number
      const rcPayments = data.filter(p => p.payment_id && p.payment_id.startsWith('RC'));
      if (rcPayments.length > 0) {
        // Extract numbers from IDs like 'RC00001' and find the max
        const numbers = rcPayments.map(p => {
          const match = p.payment_id.match(/RC(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });
        lastPaymentId.value = Math.max(...numbers);
      }
      
      // Look for student IDs with the ST format and extract the highest number
      const stIdentifications = data.filter(p => p.identification && p.identification.startsWith('ST'));
      if (stIdentifications.length > 0) {
        // Extract numbers from IDs like 'ST00001' and find the max
        const numbers = stIdentifications.map(p => {
          const match = p.identification.match(/ST(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });
        lastStudentId.value = Math.max(...numbers);
      }
    }
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    toast.error('Failed to load payments. Please try again.');
    connectionError.value = 'Error loading payments. Please try again or contact your administrator.';
  } finally {
    isLoadingPayments.value = false;
  }
};

// Fetch payment options from Supabase
const fetchPaymentOptions = async () => {
  // Skip if we already know there's a connection error
  if (connectionError.value) return;
  
  try {
    console.log('Fetching payment options using API...');
    
    // Get current school ID
    const schoolId = getCurrentSchoolId();
    console.log('Fetching payment options for school ID:', schoolId);
    
    const data = await getPaymentOptions(schoolId);
    
    console.log('Payment options fetched:', data);
    paymentOptions.value = data;
    
    // If no options were returned, use defaults
    if (!data || data.length === 0) {
      console.log('No payment options found, using defaults');
      paymentOptions.value = [
        { id: 1, payment_for: 'School Fees', amount: 1000, currency: 'GHS' },
        { id: 2, payment_for: 'Library Fees', amount: 100, currency: 'GHS' },
        { id: 3, payment_for: 'Examination Fees', amount: 250, currency: 'GHS' }
      ];
    }
  } catch (error) {
    console.error('Error fetching payment options:', error);
    toast.warning('Unable to load payment options. Using default options.');
    
    // Use default options on error
    paymentOptions.value = [
      { id: 1, payment_for: 'School Fees', amount: 1000, currency: 'GHS' },
      { id: 2, payment_for: 'Library Fees', amount: 100, currency: 'GHS' },
      { id: 3, payment_for: 'Examination Fees', amount: 250, currency: 'GHS' }
    ];
  }
};

// Fetch payment types from Supabase
const fetchPaymentTypes = async () => {
  try {
    console.log('Fetching payment types...');
    
    // Get the appropriate school_id based on user role
    const schoolId = getCurrentSchoolId();
    console.log('Fetching payment types for school ID:', schoolId);
    
    // Skip if no school ID is available (for superadmin with no selection)
    if (!schoolId && userRole.value === 'superadmin') {
      console.log('No school selected, using default payment types');
      paymentTypes.value = [
        { id: 1, type_name: 'Cash' },
        { id: 2, type_name: 'Momo' },
        { id: 3, type_name: 'Bank' }
      ];
      return;
    }
    
    // Build query with school_id filter
    let query = supabase.from('payments_type').select('*');
    
    // Add school_id filter if available
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    // Execute the query
    const { data, error } = await query.order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching payment types:', error);
      throw error;
    }
    
    console.log('Payment types data:', data);
    
    // Use the fetched data or fallback to defaults if empty
    if (data && data.length > 0) {
      paymentTypes.value = data;
    } else {
      console.log('No payment types found, using defaults');
      paymentTypes.value = [
        { id: 1, type_name: 'Cash' },
        { id: 2, type_name: 'Momo' },
        { id: 3, type_name: 'Bank' }
      ];
    }
  } catch (error) {
    console.error('Error fetching payment types:', error);
    toast.warning('Unable to load payment types. Using default options.');
    
    // Use default payment types on error
    paymentTypes.value = [
      { id: 1, type_name: 'Cash' },
      { id: 2, type_name: 'Momo' },
      { id: 3, type_name: 'Bank' }
    ];
  }
};

// Open payment modal
const openPaymentModal = async () => {
  // Reset mode and search
  paymentMode.value = 'new';
  followUpSearch.value = '';
  selectedFollowUpPayment.value = null;
  studentFeedback.value = ''; // Reset the feedback message
  
  // Ensure payment types are loaded
  if (paymentTypes.value.length === 0) {
    await fetchPaymentTypes();
  }
  
  // Reset form with a new generated ID
  paymentForm.value = {
    payment_id: generatePaymentId(),
    payment_type: '',
    payment_by: '',
    phone: '',
    payment_for: '',
    student_name: '',
    identification: generateStudentId(),
    amount: 0,
    expected_amount: 0,
    payment_date: new Date().toISOString().slice(0, 10),
    amount_remaining: 0,
    reference_payment: null,
    payment_mode: 'Admission',
    school_id: getCurrentSchoolId()
  };
  formError.value = null;
  paymentModal?.show();
  console.log('Modal opened with payment mode:', paymentForm.value.payment_mode); // Debug log
};

// Open report modal
const openReportModal = () => {
  // Reset report filters with today's date
  reportFilters.value = {
    startDate: new Date().toISOString().slice(0, 10), // Today
    endDate: new Date().toISOString().slice(0, 10),   // Today
    paymentType: '',
    paymentPurpose: ''
  };
  
  // Initialize and show the modal
  if (reportModalRef.value && !reportModal) {
    reportModal = new Modal(reportModalRef.value);
  }
  reportModal?.show();
};

// Add function to check SMS settings
const checkSmsEnabled = async () => {
  try {
    // Get the current school ID
    const schoolId = getCurrentSchoolId();
    
    // Build query with school_id filter
    let query = supabase.from('setup').select('sms');
    
    // Add school_id filter if available
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    // Execute the query and get the first result
    const { data, error } = await query.limit(1).single();

    if (error) throw error;
    return data?.sms === 'true';
  } catch (error) {
    console.error('Error checking SMS settings:', error);
    return false;
  }
};

// Submit payment data
const submitPayment = async () => {
  try {
    isSubmitting.value = true;
    formError.value = null;
    
    // Basic form validation
    if (!paymentForm.value.payment_type) {
      formError.value = 'Payment method is required';
      toast.error(formError.value);
      return;
    }
    if (!paymentForm.value.payment_for) {
      formError.value = 'Payment purpose is required';
      toast.error(formError.value);
      return;
    }
    if (!paymentForm.value.student_name) {
      formError.value = 'Student name is required';
      toast.error(formError.value);
      return;
    }

    // Amount validation
    const payingAmount = Number(paymentForm.value.amount) || 0;
    if (payingAmount <= 0) {
      formError.value = 'Payment amount must be greater than 0';
      toast.error(formError.value);
      return;
    }

    // For new payments, validate against expected amount
    if (paymentMode.value === 'new') {
      const expectedAmount = Number(paymentForm.value.expected_amount) || 0;
      if (payingAmount > expectedAmount) {
        formError.value = `Payment amount (${formatAmount(payingAmount)}) cannot exceed expected amount (${formatAmount(expectedAmount)})`;
        toast.error(formError.value);
        return;
      }
    }
    
    // For follow-up payments, validate against remaining amount
    if (paymentMode.value === 'followUp' && selectedFollowUpPayment.value) {
      const remainingAmount = Number(selectedFollowUpPayment.value.amount_remaining) || 0;
      if (payingAmount > remainingAmount) {
        formError.value = `Payment amount exceeds the remaining balance (${formatAmount(remainingAmount)})`;
        toast.error(formError.value);
        return;
      }
    }

    // Store the relationship info
    const isFollowUpPayment = paymentMode.value === 'followUp' && selectedFollowUpPayment.value;
    const referencePaymentId = isFollowUpPayment ? selectedFollowUpPayment.value.payment_id : null;

    // Ensure payment mode is set correctly before submission
    paymentForm.value.payment_mode = paymentMode.value === 'new' ? 'Admission' : 'Continue Student';
    
    // Format data to match Supabase table types
    const paymentRecord = {
      ...paymentForm.value,
      amount: Number(paymentForm.value.amount),
      amount_remaining: Number(paymentForm.value.amount_remaining),
      expected_amount: Number(paymentForm.value.expected_amount),
      payment_date: new Date(paymentForm.value.payment_date).toISOString(),
      reference_payment: referencePaymentId,
      payment_mode: paymentMode.value === 'new' ? 'Admission' : 'Continue Student',
      school_id: paymentForm.value.school_id || getCurrentSchoolId()
    };
    
    const result = await addPayment(paymentRecord);
    
    if (result) {
      // Show success message
      toast.success('Payment recorded successfully!');
      
      // Check if SMS notifications are enabled before sending
      const isSmsEnabled = await checkSmsEnabled();
      
      if (isSmsEnabled) {
        try {
          const smsResponse = await sendPaymentConfirmationSMS({
            ...result,
            student_name: paymentForm.value.student_name,
            identification: paymentForm.value.identification
          });
          if (smsResponse.status === 0) {
            toast.success('Payment notification SMS sent');
          } else {
            toast.warning('Could not send payment notification SMS');
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to send payment notification');
        }
      }
      
      // Update remaining amount if needed
      if (isFollowUpPayment && selectedFollowUpPayment.value) {
        const newRemainingAmount = Number(selectedFollowUpPayment.value.amount_remaining) - payingAmount;
        await updatePaymentRemaining(selectedFollowUpPayment.value.payment_id, newRemainingAmount, result.payment_id);
      }
      
      // Get payment history if this is a follow-up payment
      let paymentHistory = [];
      let totalAmountPaid = Number(result.amount);
      
      if (isFollowUpPayment && referencePaymentId) {
        paymentHistory = await getPaymentHistoryByReference(referencePaymentId);
        // Add the current payment to history if not already included
        if (!paymentHistory.find(p => p.payment_id === result.payment_id)) {
          paymentHistory.push(result);
        }
        // Calculate total amount paid from all payments
        totalAmountPaid = paymentHistory.reduce((total, p) => total + Number(p.amount), 0);
      }
      
      // Prepare receipt data
      currentReceiptData.value = {
        ...result,
        receipt_number: result.payment_id,
        timestamp: result.payment_date,
        payment_history: paymentHistory,
        total_amount_paid: totalAmountPaid
      };
      
      // Close payment modal and show receipt
      paymentModal?.hide();
      setTimeout(() => {
        showReceiptModal();
      }, 500);
      
      // Refresh payments list
      await fetchRecentPayments();
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to record payment. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

// Update the remaining amount of a payment
const updatePaymentRemainingAmount = async (paymentId: string, newRemainingAmount: number) => {
  try {
    // Use the API function instead of direct Supabase call
    const data = await updatePaymentRemaining(paymentId, newRemainingAmount);
    
    // Also update the local copy of the payment data
    const paymentIndex = recentPayments.value.findIndex(p => p.payment_id === paymentId);
    if (paymentIndex !== -1) {
      recentPayments.value[paymentIndex] = {
        ...recentPayments.value[paymentIndex],
        amount_remaining: newRemainingAmount
      };
      console.log(`Updated payment ${paymentId} remaining amount to ${newRemainingAmount}`);
    } else {
      console.warn(`Could not find payment ${paymentId} in local data to update remaining amount`);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating payment remaining amount:', error);
    throw error;
  }
};

// Watch for payment_for changes to update expected_amount
watch(() => paymentForm.value.payment_for, (newPaymentFor) => {
  // Skip this logic for follow-up payments with a selected payment
  if (paymentMode.value === 'followUp' && selectedFollowUpPayment.value) {
    return;
  }
  
  if (newPaymentFor) {
    // Find the selected payment option
    const selectedOption = paymentOptions.value.find(option => option.payment_for === newPaymentFor);
    if (selectedOption && selectedOption.amount) {
      paymentForm.value.expected_amount = selectedOption.amount;
      // Update amount remaining
      updateAmountRemaining();
    } else {
      paymentForm.value.expected_amount = 0;
      paymentForm.value.amount_remaining = 0;
    }
  } else {
    paymentForm.value.expected_amount = 0;
    paymentForm.value.amount_remaining = 0;
  }
});

// Watch for changes in amount to update amount_remaining
watch(() => paymentForm.value.amount, () => {
  updateAmountRemaining();
});

// Function to calculate amount_remaining
const updateAmountRemaining = () => {
  // For follow-up payments, calculate remaining based on the original payment's remaining amount
  if (paymentMode.value === 'followUp' && selectedFollowUpPayment.value) {
    const originalRemaining = Number(selectedFollowUpPayment.value.amount_remaining) || 0;
    const currentPayment = Number(paymentForm.value.amount) || 0;
    
    // Calculate new remaining (can't be negative)
    const newRemaining = Math.max(0, originalRemaining - currentPayment);
    paymentForm.value.amount_remaining = newRemaining;
    return;
  }
  
  // Regular calculation for new payments
  const expected = parseFloat(paymentForm.value.expected_amount.toString()) || 0;
  const paid = parseFloat(paymentForm.value.amount.toString()) || 0;
  
  if (expected > paid) {
    paymentForm.value.amount_remaining = expected - paid;
  } else {
    paymentForm.value.amount_remaining = 0;
  }
};

// Create the payments table if it doesn't exist
const createPaymentsTable = async () => {
  try {
    toast.info('Attempting to create payments table...');
    
    // Let user know this isn't implemented
    toast.warning('This functionality requires a database administrator to set up the table structure on the Supabase server.');
    toast.info('Please contact your database administrator to create the payments table with proper structure.');
    
    // To demonstrate the proper structure, show what fields are needed
    console.log('Required payment table structure:');
    console.log({
      payment_id: 'text (primary key)',
      payment_type: 'text',
      payment_by: 'text',
      phone: 'text',
      payment_for: 'text',
      student_name: 'text',
      amount: 'numeric',
      expected_amount: 'numeric',
      payment_date: 'date',
      amount_remaining: 'numeric'
    });
    
  } catch (error) {
    console.error('Error creating payments table:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error('Failed to create payments table: ' + errorMessage);
  }
};

// Run diagnostics on the Supabase connection
const runDiagnostics = async () => {
  try {
    console.log('Running Supabase diagnostics...');
    toast.info('Running diagnostics. Check console for details.');
    
    // Check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Authentication status:', session ? `Authenticated as ${session.user.email}` : 'Not authenticated');
    
    // Check Supabase URL (mask parts for security)
    const url = import.meta.env.VITE_SUPABASE_URL || '';
    const maskedUrl = url ? `${url.split('//')[0]}//${url.split('//')[1]?.substring(0, 5)}...` : 'Not configured';
    console.log('Supabase URL:', maskedUrl);
    
    // Test connection to other tables to see if it's specific to payments
    console.log('Testing connection to other tables...');
    
    try {
      const { error: usersError } = await supabase.from('users').select('count', { count: 'exact', head: true });
      console.log('Users table access:', usersError ? `Error: ${usersError.message}` : 'Accessible');
    } catch (e) {
      console.log('Users table access: Error accessing table');
    }
    
    try {
      const { error: classesError } = await supabase.from('classes').select('count', { count: 'exact', head: true });
      console.log('Classes table access:', classesError ? `Error: ${classesError.message}` : 'Accessible');
    } catch (e) {
      console.log('Classes table access: Error accessing table');
    }
    
    // Print suggested solutions
    console.log('\nPossible solutions:');
    console.log('1. Check if the payments table exists in your Supabase project');
    console.log('2. Verify RLS (Row Level Security) policies allow the current user to access the payments table');
    console.log('3. Ensure environment variables for Supabase URL and API keys are correctly set');
    console.log('4. Check network connectivity to the Supabase API endpoint');
    
    toast.success('Diagnostics completed. Check the browser console for results.');
  } catch (error) {
    console.error('Error running diagnostics:', error);
    toast.error('Error running diagnostics. See console for details.');
  }
};

// Function to show receipt modal
const showReceiptModal = () => {
  if (receiptModalRef.value && !receiptModal) {
    receiptModal = new Modal(receiptModalRef.value);
  }
  receiptModal?.show();
};

// Update the generatePdfReceipt function
const generatePdfReceipt = async () => {
  try {
    isGeneratingPdf.value = true;
    const receiptElement = receiptContainerRef.value;
    
    // Temporarily show signature and footer sections for PDF capture
    const signatureSection = document.createElement('div');
    signatureSection.className = 'signature-section mt-4';
    signatureSection.innerHTML = `
      <div class="row">
        <div class="col-6">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p class="signature-label">Accountant Name</p>
          </div>
        </div>
        <div class="col-6">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p class="signature-label">Signature</p>
          </div>
        </div>
      </div>
    `;
    
    const footerSection = document.createElement('div');
    footerSection.className = 'receipt-footer mt-4';
    footerSection.innerHTML = `
      <div class="text-center">
        <p>Thank you for your payment. This receipt serves as proof of payment.</p>
        <p><small>This is an official receipt from the school accounting department.</small></p>
      </div>
    `;
    
    // Add styles for signature lines and footer
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .signature-section {
        margin-top: 2rem;
        padding-top: 1rem;
      }
      .signature-section .row {
        display: flex;
        justify-content: space-between;
        margin: 0 -1rem;
      }
      .signature-section .col-6 {
        flex: 0 0 50%;
        padding: 0 1rem;
      }
      .signature-box {
        text-align: center;
      }
      .signature-line {
        border-bottom: 2px solid #000;
        margin: 2rem 0 0.5rem;
        min-height: 1px;
      }
      .signature-label {
        margin: 0;
        color: #495057;
        font-size: 0.9rem;
        font-weight: 500;
      }
      .receipt-footer {
        margin-top: 3rem;
        text-align: center;
        padding-top: 1.5rem;
        border-top: 1px dashed #dee2e6;
      }
      .receipt-footer p {
        margin: 0 0 0.5rem;
        color: #495057;
        text-align: center;
      }
      .receipt-footer small {
        font-size: 0.85rem;
        color: #6c757d;
      }
      .text-center {
        text-align: center;
      }
    `;
    
    // Check if receipt element exists
    if (!receiptElement) {
      toast.error('Receipt element not found');
      isGeneratingPdf.value = false;
      return;
    }
    
    // Append temporary elements
    receiptElement.appendChild(styleElement);
    receiptElement.appendChild(signatureSection);
    receiptElement.appendChild(footerSection);
    
    // Make sure watermark is visible before capturing
    const watermarkElements = receiptElement.querySelectorAll('.receipt-watermark, .watermark-pattern, .watermark-logo, .hologram-effect');
    watermarkElements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.opacity = '0.15';
        if (el.classList.contains('hologram-effect')) {
          el.style.opacity = '0.5';
        }
      }
    });
    
    // Create canvas from the receipt element
    const canvas = await html2canvas(receiptElement, {
      scale: 4, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true
    });
    
    // Calculate optimal dimensions for A4
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate dimensions to fit A4 with margins
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 10mm margins
    const maxWidth = pageWidth - (margin * 2);
    const aspectRatio = canvas.height / canvas.width;
    const imgWidth = maxWidth;
    const imgHeight = maxWidth * aspectRatio;
    
    // Add the image centered on the page
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin,
      imgWidth,
      imgHeight
    );
    
    // Add new pages if content exceeds first page
    if (imgHeight > pageHeight) {
      let heightLeft = imgHeight - pageHeight;
      let position = -pageHeight;
      
      while (heightLeft >= 0) {
        position = position - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
        heightLeft -= pageHeight;
      }
    }
    
    // Remove temporary elements after capture
    receiptElement.removeChild(styleElement);
    receiptElement.removeChild(signatureSection);
    receiptElement.removeChild(footerSection);
    
    // Generate file name and save
    const fileName = `Receipt_${currentReceiptData.value.receipt_number}.pdf`;
    pdf.save(fileName);
    
    // Close modal and show success message
    receiptModal?.hide();
    toast.success(`Receipt downloaded as ${fileName}`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF. Please try again.');
  } finally {
    isGeneratingPdf.value = false;
  }
};

// Function to confirm payment deletion
const confirmDeletePayment = (payment: any) => {
  paymentToDelete.value = payment;
  
  // Initialize modal if needed
  if (deleteModalRef.value && !deleteModal) {
    deleteModal = new Modal(deleteModalRef.value);
  }
  
  // Show the delete confirmation modal
  deleteModal?.show();
};

// Function to handle actual payment deletion
const handleDeletePayment = async () => {
  if (!paymentToDelete.value) return;
  
  try {
    isDeletingPayment.value = true;
    
    // Call the API to delete the payment
    await deletePayment(paymentToDelete.value.payment_id);
    
    // Success message
    toast.success(`Payment ${paymentToDelete.value.payment_id} deleted successfully`);
    
    // Close the modal
    deleteModal?.hide();
    
    // Refresh the payments list
    await fetchRecentPayments();
    
  } catch (error) {
    console.error('Error deleting payment:', error);
    toast.error('Failed to delete payment. Please try again.');
  } finally {
    isDeletingPayment.value = false;
    paymentToDelete.value = null;
  }
};

// Helper function to truncate text for PDF report
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 2) + '..';
};

// Update the generateReport function with modern styling
const generateReport = async () => {
  try {
    isGeneratingReport.value = true;
    
    // Get the appropriate school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(userRole.value?.toLowerCase() || '') 
      ? authStore.userRole?.school_id 
      : userRole.value?.toLowerCase() === 'superadmin' && selectedSchoolId.value 
        ? selectedSchoolId.value 
        : null;
    
    const payments = await getPaymentsByDateRange(
      reportFilters.value.startDate,
      reportFilters.value.endDate,
      schoolId,
      reportFilters.value.paymentType,
      reportFilters.value.paymentPurpose
    );
    
    if (!payments || payments.length === 0) {
      toast.warning('No payments found for the selected date range');
      return;
    }
    
    // Create PDF document in landscape orientation
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15; // Increased margin for better spacing
    
    // Modern color palette
    const colors = {
      primary: '#42b883',
      secondary: '#2c3e50',
      headerBg: '#f8fafb',
      stripeBg: '#f9fafb',
      text: '#374151',
      subtext: '#6b7280',
      border: '#e5e7eb',
      success: '#059669'
    };
    
    // Add stylish header section
    pdf.setFillColor(colors.primary);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    // Add report title
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.text('Payment Report', margin, 23);
    
    // Add date range in header with better positioning and styling
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    const dateRange = `${new Date(reportFilters.value.startDate).toLocaleDateString()} - ${new Date(reportFilters.value.endDate).toLocaleDateString()}`;
    pdf.text(dateRange, margin, 33);
    
    // Add generation timestamp in header
    pdf.setFontSize(10);
    const generationTime = `Generated: ${new Date().toLocaleString()}`;
    pdf.text(generationTime, pageWidth - margin - pdf.getTextWidth(generationTime), 33);
    
    // Add summary section with modern cards
    const summaryY = 45;
    const cardWidth = 65;
    const cardHeight = 25;
    const cardSpacing = 10;
    
    // Calculate totals
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalPayments = payments.length;
    const avgPayment = totalAmount / totalPayments;
    
    // Function to draw summary card
    const drawSummaryCard = (x: number, title: string, value: string, icon: string) => {
      // Card background
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(colors.border);
      pdf.roundedRect(x, summaryY, cardWidth, cardHeight, 3, 3, 'FD');
      
      // Icon
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(colors.primary);
      pdf.text(icon, x + 5, summaryY + 8);
      
      // Title
      pdf.setTextColor(colors.subtext);
      pdf.setFontSize(8);
      pdf.text(title, x + 5, summaryY + 15);
      
      // Value
      pdf.setTextColor(colors.text);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(value, x + 5, summaryY + 22);
    };
    
    // Draw summary cards
    drawSummaryCard(margin, 'Total Payments', totalPayments.toString(), '');
    drawSummaryCard(margin + cardWidth + cardSpacing, 'Total Amount', `GHC ${totalAmount.toFixed(2)}`, '');
    drawSummaryCard(margin + (cardWidth + cardSpacing) * 2, 'Average Payment', `GHC ${avgPayment.toFixed(2)}`, '');
    
    // Add filters section if any
    let filterText = '';
    if (reportFilters.value.paymentType) filterText += `Payment Method: ${reportFilters.value.paymentType} | `;
    if (reportFilters.value.paymentPurpose) filterText += `Purpose: ${reportFilters.value.paymentPurpose}`;
    if (filterText) {
      pdf.setFontSize(8);
      pdf.setTextColor(colors.subtext);
      pdf.text(`Filters: ${filterText}`, margin, summaryY + cardHeight + 10);
    }
    
    // Table configuration
    const tableTop = summaryY + cardHeight + 20;
    const columns = [
      { header: 'Date', width: 25, align: 'left' },
      { header: 'Receipt ID', width: 30, align: 'left' },
      { header: 'Student Name', width: 40, align: 'left' },
      { header: 'Student ID', width: 25, align: 'left' },
      { header: 'Purpose', width: 35, align: 'left' },
      { header: 'Amount', width: 25, align: 'right' },
      { header: 'Method', width: 20, align: 'left' },
      { header: 'Paid By', width: 35, align: 'left' },
      { header: 'Phone', width: 25, align: 'left' }
    ];
    
    // Draw modern table header
    let xPos = margin;
    let yPos = tableTop;
    
    // Header background
    pdf.setFillColor(colors.headerBg);
    pdf.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
    
    // Header text
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(colors.secondary);
    
    columns.forEach(col => {
      if (col.align === 'right') {
        pdf.text(col.header, xPos + col.width - pdf.getTextWidth(col.header), yPos + 7);
      } else {
        pdf.text(col.header, xPos + 2, yPos + 7);
      }
      xPos += col.width;
    });
    
    // Table rows
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(colors.text);
    
    let rowHeight = 8;
    payments.forEach((payment, index) => {
      yPos += rowHeight;
      
      // Add zebra striping
      if (index % 2 === 0) {
        pdf.setFillColor(colors.stripeBg);
        pdf.rect(margin, yPos, pageWidth - (margin * 2), rowHeight, 'F');
      }
      
      // Check for new page
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = margin + 10;
        
        // Add header to new page
        pdf.setFillColor(colors.primary);
        pdf.rect(0, 0, pageWidth, 20, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Payment Report (Continued)', margin, 15);
        
        // Redraw table header
        yPos += 15;
        xPos = margin;
        pdf.setFillColor(colors.headerBg);
        pdf.rect(margin, yPos, pageWidth - (margin * 2), 10, 'F');
        
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(colors.secondary);
        
        columns.forEach(col => {
          if (col.align === 'right') {
            pdf.text(col.header, xPos + col.width - pdf.getTextWidth(col.header), yPos + 7);
          } else {
            pdf.text(col.header, xPos + 2, yPos + 7);
          }
          xPos += col.width;
        });
        
        yPos += rowHeight;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(colors.text);
      }
      
      // Draw row data
      xPos = margin;
      
      // Date
      pdf.text(new Date(payment.payment_date).toLocaleDateString(), xPos + 2, yPos + 5);
      xPos += columns[0].width;
      
      // Receipt ID
      pdf.text(payment.payment_id || 'N/A', xPos + 2, yPos + 5);
      xPos += columns[1].width;
      
      // Student Name
      pdf.text(truncateText(payment.student_name || 'N/A', 25), xPos + 2, yPos + 5);
      xPos += columns[2].width;
      
      // Student ID
      pdf.text(payment.identification || 'N/A', xPos + 2, yPos + 5);
      xPos += columns[3].width;
      
      // Purpose
      pdf.text(truncateText(payment.payment_for || 'N/A', 20), xPos + 2, yPos + 5);
      xPos += columns[4].width;
      
      // Amount (right-aligned)
      const amountText = `GHC ${Number(payment.amount).toFixed(2)}`;
      pdf.text(amountText, xPos + columns[5].width - pdf.getTextWidth(amountText) - 2, yPos + 5);
      xPos += columns[5].width;
      
      // Method
      pdf.text(payment.payment_type || 'N/A', xPos + 2, yPos + 5);
      xPos += columns[6].width;
      
      // Paid By
      pdf.text(truncateText(payment.payment_by || 'N/A', 20), xPos + 2, yPos + 5);
      xPos += columns[7].width;
      
      // Phone
      pdf.text(payment.phone || 'N/A', xPos + 2, yPos + 5);
    });
    
    // Add modern footer with page numbers
    const pageCount = pdf.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      // Footer line
      pdf.setDrawColor(colors.border);
      pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      // Page numbers
      pdf.setFontSize(8);
      pdf.setTextColor(colors.subtext);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
      
      // Footer text (removed date from here)
      pdf.text('School Management System', margin, pageHeight - 10);
    }
    
    // Generate file name and save
    const fileName = `Payment_Report_${reportFilters.value.startDate}_to_${reportFilters.value.endDate}.pdf`;
    pdf.save(fileName);
    
    // Close modal and show success message
    reportModal?.hide();
    toast.success(`Report downloaded as ${fileName}`);
    
  } catch (error) {
    toast.error('Failed to generate report. Please try again.');
  } finally {
    isGeneratingReport.value = false;
  }
};

// Select a follow-up payment
const selectFollowUpPayment = (payment: any) => {
  selectedFollowUpPayment.value = payment;
  paymentMode.value = 'followUp'; // Ensure mode is set to followUp
  
  // Prefill the form with the existing payment data
  paymentForm.value = {
    // Generate a new ID for this payment
    payment_id: generatePaymentId(),
    // Keep the original payment method
    payment_type: payment.payment_type || '',
    // Keep the same payer
    payment_by: payment.payment_by || '',
    phone: payment.phone || '',
    // Keep the same purpose
    payment_for: payment.payment_for || '',
    student_name: payment.student_name || '',
    // Keep the existing student ID
    identification: payment.identification || '',
    // Default to paying the remaining amount
    amount: Number(payment.amount_remaining) || 0,
    // Keep the original expected amount
    expected_amount: Number(payment.expected_amount) || 0,
    payment_date: new Date().toISOString().slice(0, 10),
    // Initialize with the current remaining amount
    amount_remaining: Number(payment.amount_remaining) || 0,
    // Set reference to the original payment
    reference_payment: payment.payment_id,
    // Set payment mode to Continue Student
    payment_mode: 'Continue Student',
    // Keep the same school_id
    school_id: payment.school_id || getCurrentSchoolId()
  };
  
  console.log('Selected follow-up payment with mode:', paymentForm.value.payment_mode); // Debug log
  
  // Update amount remaining when amount is changed
  updateAmountRemaining();
};

// Clear selected follow-up payment
const clearSelectedFollowUp = () => {
  selectedFollowUpPayment.value = null;
  followUpSearch.value = '';
};

// Add a function to check for existing student ID
const checkStudentId = async () => {
  // Reset feedback
  studentFeedback.value = '';
  
  // Only run in Continue Student mode and when an ID is entered
  if (paymentMode.value !== 'followUp' || !paymentForm.value.identification.trim()) {
    studentFeedback.value = ''; // Ensure feedback is cleared in admission mode
    return;
  }
  
  // Search for payments with this student ID
  const studentId = paymentForm.value.identification.trim();
  console.log('Checking student ID:', studentId);
  
  // Find matching payments in the already loaded data
  const matchingPayments = recentPayments.value.filter(
    payment => payment.identification === studentId
  );
  console.log('Matching payments found:', matchingPayments.length);
  
  if (matchingPayments.length > 0) {
    // Find the student's latest payment to get their info
    const latestPayment = matchingPayments.reduce((latest, current) => {
      return current.payment_id > latest.payment_id ? current : latest;
    }, matchingPayments[0]);
    
    // Always populate student info when found
    paymentForm.value.student_name = latestPayment.student_name;
    paymentForm.value.phone = latestPayment.phone || '';
    
    // Find any payments with remaining balance > 0
    const paymentsWithBalance = matchingPayments.filter(
      payment => Number(payment.amount_remaining) > 0 && !payment.reference_payment
    );
    
    if (paymentsWithBalance.length > 0) {
      // Sort by highest balance
      paymentsWithBalance.sort((a, b) => 
        Number(b.amount_remaining) - Number(a.amount_remaining)
      );
      
      const highestBalance = paymentsWithBalance[0];
      
      // Auto-select this payment for continuation
      setTimeout(() => {
        selectFollowUpPayment(highestBalance);
      }, 100);
    } else {
      // Clear all fields and search results when there are no outstanding balances
      if (paymentMode.value === 'followUp') {
        studentFeedback.value = `Student ${latestPayment.student_name} found with no outstanding balances. You can proceed with a new payment.`;
      } else {
        studentFeedback.value = '';
      }
      followUpSearch.value = '';
      selectedFollowUpPayment.value = null;
      // Reset the form but keep student info and ID
      const currentId = paymentForm.value.identification;
      const studentName = paymentForm.value.student_name;
      const studentPhone = paymentForm.value.phone;
      paymentForm.value = {
        payment_id: generatePaymentId(),
        payment_type: '',
        payment_by: '',
        phone: studentPhone,
        payment_for: '',
        student_name: studentName,
        identification: currentId,
        amount: 0,
        expected_amount: 0,
        payment_date: new Date().toISOString().slice(0, 10),
        amount_remaining: 0,
        reference_payment: null,
        payment_mode: 'Admission',
        school_id: getCurrentSchoolId()
      };
    }
  } else {
    // Try case-insensitive search
    const caseInsensitiveMatches = recentPayments.value.filter(
      payment => payment.identification && payment.identification.toLowerCase() === studentId.toLowerCase()
    );
    
    if (caseInsensitiveMatches.length > 0) {
      // Use the first match
      const matchedPayment = caseInsensitiveMatches[0];
      
      // Always populate student info when found
      paymentForm.value.identification = matchedPayment.identification;
      paymentForm.value.student_name = matchedPayment.student_name;
      paymentForm.value.phone = matchedPayment.phone || '';
      
      // Check for outstanding balances
      const paymentsWithBalance = caseInsensitiveMatches.filter(
        payment => Number(payment.amount_remaining) > 0 && !payment.reference_payment
      );
      
      if (paymentsWithBalance.length > 0) {
        // Sort and use the highest balance
        paymentsWithBalance.sort((a, b) => 
          Number(b.amount_remaining) - Number(a.amount_remaining)
        );
        
        const highestBalance = paymentsWithBalance[0];
        
        setTimeout(() => {
          selectFollowUpPayment(highestBalance);
        }, 100);
      } else {
        // Clear all fields and search results when there are no outstanding balances
        if (paymentMode.value === 'followUp') {
          studentFeedback.value = `Student has no outstanding balances. You can proceed with a new payment.`;
        } else {
          studentFeedback.value = '';
        }
        followUpSearch.value = '';
        selectedFollowUpPayment.value = null;
        // Reset the form but keep student info and ID
        const currentId = paymentForm.value.identification;
        const studentName = paymentForm.value.student_name;
        const studentPhone = paymentForm.value.phone;
        paymentForm.value = {
          payment_id: generatePaymentId(),
          payment_type: '',
          payment_by: '',
          phone: studentPhone,
          payment_for: '',
          student_name: studentName,
          identification: currentId,
          amount: 0,
          expected_amount: 0,
          payment_date: new Date().toISOString().slice(0, 10),
          amount_remaining: 0,
          reference_payment: null,
          payment_mode: 'Admission',
          school_id: getCurrentSchoolId()
        };
      }
    } else {
      // No student found - switch to Admission mode
      toast.info(`No student found with ID: ${studentId}. Switching to Admission mode to register the student.`);
      paymentMode.value = 'new';
      // Keep the entered student ID
      const enteredId = paymentForm.value.identification;
      // Reset form for new admission
      paymentForm.value = {
        payment_id: generatePaymentId(),
        payment_type: '',
        payment_by: '',
        phone: '',
        payment_for: '',
        student_name: '',
        identification: enteredId, // Keep the ID they entered
        amount: 0,
        expected_amount: 0,
        payment_date: new Date().toISOString().slice(0, 10),
        amount_remaining: 0,
        reference_payment: null,
        payment_mode: 'Admission',
        school_id: getCurrentSchoolId()
      };
      studentFeedback.value = '';
      followUpSearch.value = '';
      selectedFollowUpPayment.value = null;
    }
  }
};

// Watch payment mode to reset form appropriately
watch(() => paymentMode.value, (newMode) => {
  console.log('Payment mode changed to:', newMode); // Debug log
  
  // Clear feedback message when switching modes
  studentFeedback.value = '';
  
  // Clear selected payment when changing modes
  selectedFollowUpPayment.value = null;
  followUpSearch.value = '';
  
  if (newMode === 'new') {
    // Reset the form for a new admission
    paymentForm.value = {
      payment_id: generatePaymentId(),
      payment_type: '',
      payment_by: '',
      phone: '',
      payment_for: '',
      student_name: '',
      identification: generateStudentId(),
      amount: 0,
      expected_amount: 0,
      payment_date: new Date().toISOString().slice(0, 10),
      amount_remaining: 0,
      reference_payment: null,
      payment_mode: 'Admission',
      school_id: getCurrentSchoolId()
    };
  } else {
    // Reset for continue student, but leave ID field empty for user input
    paymentForm.value = {
      payment_id: generatePaymentId(),
      payment_type: '',
      payment_by: '',
      phone: '',
      payment_for: '',
      student_name: '',
      identification: '',
      amount: 0,
      expected_amount: 0,
      payment_date: new Date().toISOString().slice(0, 10),
      amount_remaining: 0,
      reference_payment: null,
      payment_mode: 'Continue Student',
      school_id: getCurrentSchoolId()
    };
  }
});

// Add this to debug the current payment mode
const updatePaymentMode = () => {
  console.log('Current payment mode:', paymentMode.value);
  paymentForm.value.payment_mode = paymentMode.value === 'new' ? 'Admission' : 'Continue Student';
  console.log('Updated payment_mode to:', paymentForm.value.payment_mode);
};

// Add schoolInfo ref
const schoolInfo = ref({
  name: '',
  address: '',
  email: '',
  phone: ''
});

// Add fetchSchoolInfo function
const fetchSchoolInfo = async () => {
  try {
    console.log('Fetching school info...');
    
    // Get the appropriate school_id based on user role
    const schoolId = userRole.value?.toLowerCase() === 'admin' 
      ? authStore.userRole?.school_id 
      : userRole.value?.toLowerCase() === 'superadmin' && selectedSchoolId.value 
        ? selectedSchoolId.value 
        : null;
    
    // Start building the query
    let query = supabase.from('setup').select('school_name, school_contact1, school_email, school_address');
    
    // Add school_id filter if available
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    // Execute the query and get the first result
    const { data, error } = await query.limit(1);
    
    if (error) {
      console.error('Error fetching school info:', error.message, error.details, error.hint);
      throw error;
    }
    
    console.log('Fetched school data:', data);
    
    if (data && data.length > 0) {
      schoolInfo.value = {
        name: data[0].school_name || '',
        address: data[0].school_address || '',
        email: data[0].school_email || '',
        phone: data[0].school_contact1 || ''
      };
      console.log('Updated schoolInfo:', schoolInfo.value);
    }
  } catch (error) {
    console.error('Failed to fetch school info:', error instanceof Error ? error.message : error);
    toast.error('Failed to load school information. Please check database configuration.');
  }
};

// Call fetchSchoolInfo in onMounted
onMounted(async () => {
  await fetchSchoolInfo();
  // ... rest of existing onMounted code ...
});

const createSetupTable = async () => {
  try {
    console.log('Creating setup table...');
    
    const { error: createError } = await supabase.rpc('create_setup_table');
    
    if (createError) {
      console.error('Error creating setup table:', createError);
      return false;
    }
    
    // Initialize with default values
    const { error: insertError } = await supabase
      .from('setup')
      .insert([{
        school_name: 'School Management System',
        school_address: '123 Education Street',
        school_email: 'info@school.com',
        school_phone: '(123) 456-7890'
      }])
      .single();
      
    if (insertError) {
      console.error('Error initializing setup data:', insertError);
      return false;
    }
    
    console.log('Setup table created and initialized');
    return true;
  } catch (error) {
    console.error('Failed to create setup table:', error);
    return false;
  }
};

// Filter schools based on search query
const filteredSchools = computed(() => {
  if (!schoolSearchQuery.value.trim()) {
    return schools.value;
  }
  
  const query = schoolSearchQuery.value.toLowerCase().trim();
  return schools.value.filter(school => 
    school.name.toLowerCase().includes(query)
  );
});

// Toggle the school dropdown
const toggleSchoolDropdown = () => {
  isSchoolDropdownOpen.value = !isSchoolDropdownOpen.value;
  
  // Focus the search input when opening
  if (isSchoolDropdownOpen.value) {
    setTimeout(() => {
      if (schoolSearchInput.value) {
        schoolSearchInput.value.focus();
        schoolSearchQuery.value = '';
      }
    }, 100);
  }
};

// Select a school
const selectSchool = (id: string, name: string) => {
  selectedSchoolId.value = id;
  selectedSchoolName.value = name;
  isSchoolDropdownOpen.value = false;
  schoolSearchQuery.value = '';
  
  // Save to localStorage
  try {
    localStorage.setItem('selectedSchoolId', id);
    localStorage.setItem('selectedSchoolName', name);
    console.log('Saved school selection to localStorage:', id, name);
  } catch (error) {
    console.error('Error saving school selection to localStorage:', error);
  }
  
  // Call the existing school change handler
  handleSchoolChange();
};

// Clear school selection
const clearSchoolSelection = (event: Event) => {
  event.stopPropagation();
  selectedSchoolId.value = '';
  selectedSchoolName.value = '';
  
  // Remove from localStorage
  try {
    localStorage.removeItem('selectedSchoolId');
    localStorage.removeItem('selectedSchoolName');
    console.log('Cleared school selection from localStorage');
  } catch (error) {
    console.error('Error clearing school selection from localStorage:', error);
  }
  
  handleSchoolChange();
};

// Close dropdown when clicking outside
const closeSchoolDropdown = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const dropdown = document.querySelector('.search-school-container');
  
  if (dropdown && !dropdown.contains(target)) {
    isSchoolDropdownOpen.value = false;
  }
};

// Add event listener for clicks outside the dropdown
onMounted(() => {
  document.addEventListener('click', closeSchoolDropdown);
  
  // Add event listener for beforeunload to ensure we're saving the most recent selection
  const saveSchoolSelection = () => {
    if (selectedSchoolId.value && selectedSchoolName.value) {
      localStorage.setItem('selectedSchoolId', selectedSchoolId.value);
      localStorage.setItem('selectedSchoolName', selectedSchoolName.value);
    }
  };
  
  window.addEventListener('beforeunload', saveSchoolSelection);
  
  // Save this function for cleanup
  (window as any).saveSchoolSelection = saveSchoolSelection;
  
  // ... rest of existing onMounted code ...
});

// Remove event listener when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', closeSchoolDropdown);
  
  // Remove the beforeunload event listener
  const saveSchoolSelection = (window as any).saveSchoolSelection;
  if (saveSchoolSelection) {
    window.removeEventListener('beforeunload', saveSchoolSelection);
    delete (window as any).saveSchoolSelection;
  }
});

// Fetch schools for superadmin
const fetchSchools = async () => {
  try {
    if (userRole.value?.toLowerCase() !== 'superadmin') return;
    
    const { data, error } = await supabase
      .from('schools')
      .select('id, name')
      .order('name');
      
    if (error) throw error;
    
    schools.value = data || [];
    console.log('Schools loaded:', schools.value);
  } catch (error) {
    console.error('Error fetching schools:', error);
    toast.error('Failed to load schools list');
  }
};

// Handle school change
const handleSchoolChange = async (showNotification = true) => {
  console.log('School filter changed to:', selectedSchoolId.value, selectedSchoolName.value);
  await fetchRecentPayments();
  
  // Show toast notification for selected school if showNotification is true
  if (selectedSchoolId.value && showNotification) {
    toast.info(`Showing payments for: ${selectedSchoolName.value}`);
  }
};
</script>

<style lang="scss" scoped>
/* Add styles for the root element */
.accountants-view {
  min-height: 100vh;
  width: 100%;
  position: relative;
  background-color: var(--bs-body-bg, #fff);
  
  /* Add max-width to match dashboard if needed */
  .container {
    max-width: 1320px; /* Bootstrap's default container max-width */
    margin: 0 auto;
  }
}

.header-card {
  background: linear-gradient(135deg, #42b883 0%, #3aa876 100%);
  border-radius: 1rem;
  padding: 2rem;
  color: white;
  margin-bottom: 1rem;
  box-shadow: 0 4px 15px rgba(66, 184, 131, 0.2);
  
  .welcome-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;

    .user-info {
      flex: 1;
    }

    .avatar {
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4.2rem;
      font-weight: 500;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .role-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.4rem 0.8rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2rem;
    font-size: 0.9rem;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    .welcome-header {
      flex-direction: column-reverse;
      align-items: center;
      text-align: center;
      gap: 1.5rem;

      .avatar {
        width: 120px;
        height: 120px;
        font-size: 3.6rem;
      }

      .user-info {
        text-align: center;
        
        .role-badge {
          margin-top: 0.5rem;
        }
      }
    }
  }
  
  .header-actions {
    .btn {
      font-weight: 500;
      border: none;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      transition: background-color 0.3s ease;
      
      &:hover {
        background-color: #ffffff !important;
      }
    }
    
    .header-btn {
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      background-color: rgba(255, 255, 255, 0.9);
      color: #2c845e;
      
      i {
        opacity: 0.8;
      }
    }
  }
}

/* Advanced Table Styles */
.payments-card {
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  border: none;
  overflow: hidden;
  margin-bottom: 2rem;
  transition: none !important;
  transform: none !important;
  
  &:hover {
    transform: none !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
  }
  
  .card-header {
    padding: 1.5rem 1.5rem;
    background: white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    
    h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      
      i {
        color: #42b883;
      }
    }
    
    .d-flex {
      @media (max-width: 992px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  }
}

.search-container {
  position: relative;
  width: 500px;
  
  @media (max-width: 1200px) {
    width: 300px;
  }
  
  @media (max-width: 992px) {
    width: 100%;
    max-width: 400px;
  }
  
  .search-input {
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    border-radius: 50px;
    border: 1px solid #e0e0e0;
    height: 38px;
    font-size: 0.9rem;
    background-color: #f8f9fa;
    transition: none;
    
    &:focus {
      box-shadow: none;
      border-color: #e0e0e0;
      background-color: #f8f9fa;
    }
    
    &::placeholder {
      color: #adb5bd;
      font-size: 0.85rem;
    }
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #adb5bd;
    transition: none;
  }
  
  .search-clear-btn {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: none;
    color: #dc3545;
    font-size: 0.75rem;
    padding: 0.25rem;
    opacity: 0.7;
    border-radius: 50%;
    height: 1.5rem;
    width: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: none;
    
    &:hover {
      opacity: 0.7;
      background-color: transparent;
    }
  }
  
  &:focus-within .search-icon {
    color: #adb5bd;
  }
}

.table-container {
  position: relative;
  
  .empty-state {
    padding: 4rem 2rem;
    text-align: center;
    
    .empty-state-img {
      max-width: 180px;
      margin-bottom: 1.5rem;
    }
    
    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }
  }
}

.advanced-table {
  margin-bottom: 0;
  
  thead {
    background-color: #f8f9fa;
    
    th {
      font-weight: 600;
      color: #495057;
      padding: 1rem;
      border-bottom: 1px solid #e9ecef;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      
      &.sortable-header {
        cursor: pointer;
        
        &:hover {
          background-color: transparent;
        }
        
        i {
          font-size: 0.75rem;
          opacity: 0.7;
        }
      }
    }
  }
  
  tbody {
    tr {
      &:hover {
        background-color: transparent !important;
      }
      
      td {
        padding: 1rem;
        vertical-align: middle;
        border-bottom: 1px solid #f2f2f2;
      }
    }
  }
}

.id-badge {
  display: inline-block;
  background-color: #f5f5f5;
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.payment-id {
  font-family: inherit; // Use the same font as the rest of the table
  font-weight: 500;
  color: #2c3e50;
}

.payment-method {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.7rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 500;
  
  &.method-cash {
    background-color: #e3f8ef;
    color: #2c845e;
  }
  
  &.method-momo {
    background-color: #fff5e6;
    color: #ff9500;
  }
  
  &.method-bank {
    background-color: #e6f4ff;
    color: #0085ff;
  }
}

.phone-link {
  color: #495057;
  text-decoration: none;
  
  &:hover {
    color: #495057;
    text-decoration: none;
  }
}

.amount-display {
  font-weight: 600;
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 0.4rem;
  
  .btn-icon {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: #f8f9fa;
    color: #6c757d;
    border: none;
    transition: none;
    
    &:hover {
      background-color: #f8f9fa;
      color: #6c757d;
      transform: none;
      box-shadow: none;
      
      &.text-danger {
        background-color: #f8f9fa;
        color: #dc3545;
      }
    }
  }
}

.pagination-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  
  .pagination-info {
    color: #6c757d;
    font-size: 0.875rem;
  }
}

/* Bootstrap Modal Overrides */
.modal-content {
  border: none;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.modal-header {
  background-color: #f8f9fa;
  padding: 1.5rem 2rem;
  
  .modal-title {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1.5rem;
  }
}

.modal-body {
  padding: 2rem;
}

.form-floating {
  > label {
    color: #6c757d;
  }
  
  > .form-control,
  > .form-select {
    height: 58px;
    border-color: #e9ecef;
    
    &:focus {
      border-color: #42b883;
      box-shadow: 0 0 0 0.25rem rgba(66, 184, 131, 0.25);
    }
  }
}

.btn-primary {
  background-color: #42b883;
  border-color: #42b883;
  transition: none;
  
  &:hover, &:active, &:focus {
    background-color: #42b883;
    border-color: #42b883;
    box-shadow: none;
  }
}

.btn-outline-secondary {
  transition: none;
  
  &:hover, &:active, &:focus {
    background-color: transparent;
    color: #6c757d;
    box-shadow: none;
  }
}

.filter-container {
  display: flex;
  flex-direction: column;
  min-width: 320px;
  
  .filter-label {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .filter-options {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    
    .filter-pill {
      border: none;
      background-color: #f1f3f5;
      color: #495057;
      padding: 0.4rem 0.8rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 500;
      transition: none;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      
      &:hover {
        background-color: #f1f3f5;
      }
      
      &.active {
        background-color: #42b883;
        color: white;
      }
      
      &.clear-pill {
        background-color: #f8d7da;
        color: #dc3545;
        margin-left: 0.5rem;
        
        &:hover {
          background-color: #f8d7da;
        }
      }
    }
  }
}

.pagination-controls {
  .btn {
    transition: none;
    
    &:hover, &:active, &:focus {
      background-color: transparent;
      color: #0d6efd;
      box-shadow: none;
    }
    
    &:disabled {
      opacity: 0.5;
    }
  }
}

/* Receipt Modal Styles */
.receipt-modal {
  border: none;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.receipt-container {
  padding: 2rem;
  background-color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  min-height: 100%;
  z-index: 1;
}

.receipt-watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  overflow: hidden;
  /* Make sure these can be captured by html2canvas */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: opacity;
}

.watermark-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.04;
  background-image: repeating-linear-gradient(
    45deg,
    #42b883,
    #42b883 10px,
    transparent 10px,
    transparent 20px
  );
  /* Make sure these can be captured by html2canvas */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.watermark-pattern::before {
  content: "VALID RECEIPT VALID RECEIPT ";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  font-size: 8px;
  color: rgba(0, 0, 0, 0.15);
  text-align: center;
  line-height: 10px;
  white-space: break-spaces;
  word-break: break-all;
  transform: rotate(45deg);
  /* Make sure these can be captured by html2canvas */
  -webkit-transform: rotate(45deg) translateZ(0);
}

.watermark-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-30deg);
  width: 300px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  opacity: 0.08;
}

.secure-badge {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(66, 184, 131, 0.6), rgba(0, 150, 136, 0.6));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(66, 184, 131, 0.4);
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.secure-badge i {
  font-size: 3rem;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.secure-badge::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to bottom right,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 0) 60%,
    rgba(255, 255, 255, 0.3) 100%
  );
  transform: rotate(45deg);
  animation: shimmer 3s infinite linear;
}

.serial-number {
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
  text-transform: uppercase;
  background: linear-gradient(to right, #42b883, #009688);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hologram-effect {
  position: absolute;
  bottom: 5%;
  right: 5%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.3)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  z-index: 1002;
  opacity: 0.8;
  /* Make sure these can be captured by html2canvas */
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
  will-change: transform;
}

.hologram-effect::before {
  content: "";
  position: absolute;
  width: 150%;
  height: 150%;
  /* Use a static gradient that will look good in print */
  background-image: repeating-conic-gradient(
    from 0deg,
    rgba(66, 184, 131, 0.2) 0deg 10deg,
    rgba(0, 150, 136, 0.2) 10deg 20deg
  );
  /* Freeze animation at a good-looking point for print */
  transform: rotate(45deg);
  /* Make sure these can be captured by html2canvas */
  -webkit-transform: rotate(45deg) translateZ(0);
}

.hologram-effect::after {
  content: "";
  position: absolute;
  width: 60px;
  height: 60px;
  background: 
    linear-gradient(to right, #000 25%, transparent 25%) 0 0,
    linear-gradient(to right, #000 25%, transparent 25%) 0 50%,
    linear-gradient(to right, #000 25%, transparent 25%) 0 100%,
    linear-gradient(to left, #000 25%, transparent 25%) 100% 0,
    linear-gradient(to left, #000 25%, transparent 25%) 100% 50%,
    linear-gradient(to left, #000 25%, transparent 25%) 100% 100%,
    linear-gradient(to bottom, #000 25%, transparent 25%) 0 0,
    linear-gradient(to bottom, #000 25%, transparent 25%) 50% 0,
    linear-gradient(to bottom, #000 25%, transparent 25%) 100% 0,
    linear-gradient(to top, #000 25%, transparent 25%) 0 100%,
    linear-gradient(to top, #000 25%, transparent 25%) 50% 100%,
    linear-gradient(to top, #000 25%, transparent 25%) 100% 100%;
  background-repeat: no-repeat;
  background-size: 15px 15px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  opacity: 0.2;
  border-radius: 5px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes shimmer {
  0% {
    transform: rotate(45deg) translateX(-80%);
  }
  100% {
    transform: rotate(45deg) translateX(80%);
  }
}

.receipt-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed #e9ecef;
  
  .school-logo {
    flex-shrink: 0;
    margin-right: 1.5rem;
    color: #42b883;
  }
  
  .school-info {
    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      color: #2c3e50;
    }
    
    p {
      margin-bottom: 0.25rem;
      color: #6c757d;
      font-size: 0.9rem;
    }
  }
}

.receipt-title {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .receipt-id {
    font-size: 1rem;
    color: #6c757d;
    font-weight: 500;
    background-color: #f8f9fa;
    display: inline-block;
    padding: 0.3rem 1rem;
    border-radius: 2rem;
    
    span {
      font-family: 'Courier New', monospace;
      font-weight: 600;
    }
  }
}

.receipt-content {
  margin-bottom: 2rem;
}

.receipt-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 2rem;
  
  @media (min-width: 576px) {
    grid-template-columns: 1fr 1fr;
  }
  
  .receipt-row {
    display: flex;
    flex-direction: column;
    
    @media (min-width: 768px) {
      flex-direction: row;
    }
    
    .receipt-label {
      font-weight: 600;
      color: #6c757d;
      margin-right: 1rem;
      flex-basis: 40%;
      flex-shrink: 0;
    }
    
    .receipt-value {
      color: #2c3e50;
    }
  }
}

.payment-method-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  
  &.method-cash {
    background-color: #e3f8ef;
    color: #2c845e;
  }
  
  &.method-momo {
    background-color: #fff5e6;
    color: #ff9500;
  }
  
  &.method-bank {
    background-color: #e6f4ff;
    color: #0085ff;
  }
}

.payment-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  
  &.admission {
    background-color: #e3f8ef;
    color: #2c845e;
  }
  
  &.continue-student {
    background-color: #e6f4ff;
    color: #0085ff;
  }
}

.payment-summary {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .summary-label {
      font-weight: 500;
      color: #6c757d;
    }
    
    .summary-value {
      font-weight: 600;
      color: #2c3e50;
    }
    
    &.balance {
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #dee2e6;
    }
    
    &.total {
      margin-top: 0.75rem;
      font-size: 1.1rem;
      
      .summary-label {
        font-weight: 600;
        color: #2c3e50;
      }
      
      .summary-value {
        font-weight: 700;
        color: #42b883;
      }
    }
  }
}

.receipt-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #e9ecef;
  
  p {
    margin-bottom: 0.5rem;
    color: #6c757d;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  small {
    font-size: 0.85rem;
    color: #adb5bd;
  }
}

.receipt-empty-state {
  padding: 3rem;
  text-align: center;
  color: #6c757d;
}

.receipt-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  border-bottom-left-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

.payment-purpose {
  color: #5c6bc0;
  font-size: 0.9rem;
  font-weight: 500;
}

.delete-confirmation {
  .payment-details {
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-top: 1rem;
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eaeaea;
      
      &:last-child {
        border-bottom: none;
      }
      
      .detail-label {
        color: #6c757d;
        font-weight: 500;
      }
      
      .detail-value {
        color: #212529;
        text-align: right;
      }
    }
  }
}

/* Loading Overlay Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
  
  .loading-content {
    text-align: center;
    
    .spinner {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
      position: relative;
      width: 80px;
      height: 80px;
      margin-left: auto;
      margin-right: auto;
      
      .dot1, .dot2, .dot3 {
        position: absolute;
        top: 30px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #42b883;
        animation: loading-animation 1.4s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      }
      
      .dot1 {
        animation-delay: -0.32s;
        left: 8px;
      }
      
      .dot2 {
        animation-delay: -0.16s;
        left: 30px;
      }
      
      .dot3 {
        left: 52px;
      }
    }
    
    .loading-text {
      font-size: 1.1rem;
      font-weight: 600;
      color: #42b883;
      margin-top: 1rem;
      letter-spacing: 0.5px;
      animation: fadeInOut 1.5s ease-in-out infinite;
    }
  }
}

@keyframes loading-animation {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.signature-section {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding-top: 1.5rem;
  
  .row {
    display: flex;
    justify-content: space-between;
    margin: 0 -1rem;
  }
  
  .col-6 {
    width: 50%;
    padding: 0 1rem;
  }
  
  .signature-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    
    .signature-line {
      width: 100%;
      height: 1px;
      background-color: #adb5bd;
      margin-bottom: 0.5rem;
      position: relative;
      
      &::before {
        content: "";
        position: absolute;
        left: 0;
        top: -5px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #42b883;
        opacity: 0.5;
      }
    }
    
    .signature-label {
      font-size: 0.85rem;
      color: #495057;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
  }
}

/* Skeleton Loading Styles */
.skeleton-text {
  height: 1.2rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading-wave 1.5s ease-in-out infinite;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  
  &.skeleton-lg {
    height: 1.5rem;
    width: 200px;
  }

  &.skeleton-title {
    height: 2.5rem;
    width: 60%;
    margin-bottom: 1rem;
  }

  &.skeleton-subtitle {
    height: 1.2rem;
    width: 80%;
  }
}

.skeleton-button {
  width: 150px;
  height: 38px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.3) 25%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.3) 75%);
  background-size: 200% 100%;
  animation: loading-wave 1.5s ease-in-out infinite;
  border-radius: 2rem;
}

.skeleton-search {
  width: 300px;
  height: 38px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading-wave 1.5s ease-in-out infinite;
  border-radius: 50px;
}

.skeleton-filters {
  width: 320px;
  height: 38px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading-wave 1.5s ease-in-out infinite;
  border-radius: 50px;
}

.skeleton-header {
  width: 100%;
}

.skeleton-loading {
  .skeleton-header {
    .skeleton-text, .skeleton-button {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 25%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.2) 75%);
      background-size: 200% 100%;
      animation: loading-wave 1.5s ease-in-out infinite;
    }
  }
}

@keyframes loading-wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.form-check-input:checked {
  background-color: #42b883;
  border-color: #42b883;
}

.payment-mode-selector {
  margin-bottom: 0;
}

.modern-radio-container {
  display: flex;
  gap: 1.5rem;
  padding: 0.5rem 0;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.modern-radio-option {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  border-radius: 0.75rem;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: #f0f2f5;
  }
  
  &.active {
    background-color: #e3f8ef;
    border-color: #42b883;
    
    .radio-icon {
      border-color: #42b883;
      
      .radio-inner {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .radio-label {
      color: #2c845e;
      font-weight: 600;
    }
  }
  
  .radio-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #adb5bd;
    margin-right: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color 0.25s ease;
    
    .radio-inner {
      width: 10px;
      height: 10px;
      background-color: #42b883;
      border-radius: 50%;
      transform: scale(0);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.17, 0.67, 0.83, 0.67);
    }
  }
  
  .radio-label {
    font-size: 1rem;
    font-weight: 500;
    color: #495057;
    display: flex;
    align-items: center;
    
    i {
      opacity: 0.8;
      font-size: 1.1rem;
    }
  }
}

.follow-up-payments-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  
  .payment-item {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
    cursor: pointer;
    transition: background-color 0.2s ease;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    &.selected {
      background-color: #e3f8ef;
      border-left: 4px solid #42b883;
    }
    
    .payment-item-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      
      .payment-id {
        font-family: 'Courier New', monospace;
        font-weight: 600;
      }
      
      .badge {
        font-weight: 500;
      }
    }
    
    .payment-item-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      .payment-purpose {
        color: #5c6bc0;
        font-weight: 500;
      }
    }
  }
}

.search-with-dropdown {
  position: relative;
  margin-bottom: 1.5rem;
  
  .search-icon {
    position: absolute;
    right: 15px;
    top: 20px;
    color: #adb5bd;
    font-size: 0.9rem;
    pointer-events: none;
  }
  
  .search-hint {
    font-size: 0.9rem;
    color: #6c757d;
    padding: 0.75rem 0;
    display: flex;
    align-items: center;
    
    i {
      color: #007bff;
      opacity: 0.8;
    }
  }
  
  input.form-control {
    padding-right: 2.5rem;
    background-position: calc(100% - 12px) center;
    
    &.selected-student {
      border-color: #42b883;
      background-color: #f9fcfb;
      
      &:focus {
        box-shadow: 0 0 0 0.25rem rgba(66, 184, 131, 0.25);
      }
      
      & + label {
        color: #42b883;
      }
    }
    
    &:focus {
      border-color: #80bdff;
      box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
    }
  }
  
  .search-results-dropdown {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 0.75rem;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    z-index: 1050;
    overflow: hidden;
    
    .dropdown-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid #f0f0f0;
      background-color: #f8f9fa;
      
      span {
        font-weight: 600;
        color: #495057;
        font-size: 0.9rem;
      }
      
      .btn-close {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        border: none;
        font-size: 0.8rem;
        color: #6c757d;
        cursor: pointer;
        padding: 0;
        transition: background-color 0.2s;
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
    }
    
    .no-results {
      padding: 1.25rem;
      color: #6c757d;
      text-align: center;
      font-size: 0.9rem;
      
      i {
        opacity: 0.7;
      }
    }
    
    .search-results-list {
      max-height: 260px;
      overflow-y: auto;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 3px;
      }
      
      .search-result-item {
        padding: 0.75rem 1.25rem;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 1px solid #f8f8f8;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:hover {
          background-color: #f5f9f7;
        }
        
        .result-main {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          
          .student-info {
            flex: 1;
            
            .student-name {
              font-weight: 600;
              color: #2c3e50;
              display: block;
              font-size: 0.95rem;
            }
            
            .student-id {
              font-size: 0.8rem;
              color: #6c757d;
              margin-left: 0.5rem;
              background-color: #f0f0f0;
              padding: 0.15rem 0.4rem;
              border-radius: 3px;
              display: inline-block;
              font-family: 'Courier New', monospace;
            }
          }
          
          .payment-info {
            text-align: right;
            
            .payment-id {
              font-size: 0.8rem;
              color: #6c757d;
              display: block;
              margin-bottom: 0.25rem;
              font-family: 'Courier New', monospace;
            }
            
            .payment-for {
              font-size: 0.85rem;
              color: #5c6bc0;
              font-weight: 500;
              display: block;
            }
          }
        }
        
        .result-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .contact-info {
            font-size: 0.85rem;
            color: #6c757d;
            
            i {
              color: #8e8e8e;
              font-size: 0.8rem;
            }
          }
          
          .balance {
            background-color: #fff5e6;
            color: #ff9500;
            padding: 0.2rem 0.5rem;
            border-radius: 50px;
            font-size: 0.8rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            
            .balance-label {
              margin-right: 0.25rem;
              font-weight: normal;
              color: #8a6d3b;
            }
            
            .balance-amount {
              font-weight: 600;
              color: #ff9500;
            }
          }
        }
      }
    }
  }
}

.selected-student-info {
  padding: 0.75rem 1rem;
  background-color: #e3f8ef;
  border-radius: 0.5rem;
  margin-top: 0.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(66, 184, 131, 0.3);
  
  .selected-label {
    font-weight: 600;
    color: #42b883;
    margin-right: 0.5rem;
    font-size: 0.85rem;
  }
  
  .selected-name {
    font-weight: 600;
    color: #2c3e50;
    margin-right: 0.5rem;
  }
  
  .selected-id {
    font-size: 0.85rem;
    color: #6c757d;
    background-color: rgba(255, 255, 255, 0.7);
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
  
  .btn-clear {
    background: none;
    border: none;
    color: #dc3545;
    font-size: 0.9rem;
    cursor: pointer;
    transition: color 0.2s;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: #bb2d3b;
      background-color: rgba(220, 53, 69, 0.1);
    }
  }
  
  .selected-student-balance {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px dashed rgba(66, 184, 131, 0.2);
    font-size: 0.9rem;
    
    span:first-child {
      font-weight: 500;
      color: #5c6bc0;
    }
    
    .balance-pill {
      background-color: #fff5e6;
      color: #ff9500;
      padding: 0.2rem 0.6rem;
      border-radius: 50px;
      font-size: 0.8rem;
      font-weight: 600;
    }
  }
}

.payment-history {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;

  .history-title {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 0.75rem;
  }

  .history-list {
    .history-item {
      display: grid;
      grid-template-columns: 150px auto 100px;
      gap: 1rem;
      align-items: center;
      padding: 0.5rem;
      border-radius: 0.25rem;
      margin-bottom: 0.5rem;
      background-color: #f8f9fa;
      
      &.current {
        background-color: #e3f8ef;
        border-left: 3px solid #42b883;
      }

      .history-date {
        font-size: 0.85rem;
        color: #495057;
        white-space: nowrap;
      }

      .history-amount {
        font-weight: 600;
        color: #2c3e50;
        text-align: right;
        padding-right: 1rem;
      }

      .history-method {
        text-align: right;
        .payment-method-badge {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }
      }
    }
  }

  .history-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    margin-top: 0.5rem;
    border-top: 1px dashed #dee2e6;
    
    .total-label {
      font-weight: 600;
      color: #495057;
    }
    
    .total-value {
      font-weight: 700;
      color: #2c3e50;
      font-size: 1.1rem;
    }
  }
}

// Hide signature and footer in modal
.receipt-modal {
  .signature-section,
  .receipt-footer {
    display: none;
  }
}

.identification {
  color: #2c3e50;
  font-weight: 500;
}

.alert {
  padding: 0.5rem 1rem;  // Reduce padding to decrease height
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  
  &.alert-info {
    font-size: 0.875rem;  // Reduce font size
    line-height: 1.4;     // Adjust line height for better readability
    
    i {
      font-size: 0.875rem;  // Match icon size with text
    }
  }
}

/* Add styles for the table */
.table {
  font-size: 0.875rem; /* Reduced from default 1rem to 0.875rem (14px) */
  
  th {
    font-size: 0.875rem;
    font-weight: 600;
    color: #495057;
  }
  
  td {
    font-size: 0.875rem;
    vertical-align: middle;
    padding: 0.5rem 0.75rem; /* Reduced padding */
  }

  .amount-display {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .payment-purpose {
    font-size: 0.8125rem; /* Slightly smaller for secondary info */
  }

  .btn-icon {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
}

/* Adjust pagination text size */
.pagination-controls {
  font-size: 0.875rem;
  
  .btn {
    font-size: 0.875rem;
    padding: 0.25rem 0.75rem;
  }
}

.receipt-header {
  text-align: left;
  padding: 1rem;
}

.school-info {
  text-align: left;
}

.school-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.school-address, .school-contact {
  margin-bottom: 0.25rem;
}

/* School Selector Card Styles */
.school-selector-card {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  
  .school-icon {
    font-size: 2rem;
    color: #42b883;
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
  }
  
  .text-muted {
    font-size: 0.9rem;
  }
  
  .school-select {
    border-color: #e0e0e0;
    border-radius: 0.75rem;
    height: 50px;
    
    &:focus {
      border-color: #42b883;
      box-shadow: 0 0 0 0.25rem rgba(66, 184, 131, 0.25);
    }
  }
  
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    
    @media (max-width: 768px) {
      margin-top: 1rem;
      width: 100%;
      justify-content: flex-start;
    }
  }
  
  .action-btn {
    padding: 0.5rem 1.2rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    }
    
    &.btn-success {
      background-color: #42b883;
      border-color: #42b883;
      
      &:hover, &:focus {
        background-color: #3aa876;
        border-color: #3aa876;
      }
    }
  }
  
  @media (max-width: 992px) {
    .d-flex.justify-content-between {
      flex-direction: column;
      align-items: flex-start;
      
      .action-buttons {
        margin-top: 1rem;
        width: 100%;
      }
    }
  }
}

/* School Search Dropdown Styles */
.search-school-container {
  position: relative;
  width: 100%;
  z-index: 100;
  
  &.active {
    .selected-display {
      border-color: #42b883;
      box-shadow: 0 0 0 0.25rem rgba(66, 184, 131, 0.25);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      background-color: #fff;
    }
  }
  
  .selected-display {
    display: flex;
    align-items: center;
    min-height: 50px;
    padding: 0.5rem 1rem;
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    
    &:hover {
      border-color: #ced4da;
      background-color: #f8f9fa;
    }
    
    /* Prevent browser highlighting/selection */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    
    .placeholder {
      color: #adb5bd;
      display: flex;
      align-items: center;
      width: 100%;
      
      i {
        color: #6c757d;
        margin-right: 0.5rem;
      }
    }
    
    .btn-clear {
      background: none;
      border: none;
      color: #dc3545;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: rgba(220, 53, 69, 0.1);
      }
    }
  }
  
  .dropdown-panel {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    border: 1px solid #e0e0e0;
    border-top: none;
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    z-index: 100;
    overflow: hidden;
    
    .search-input-container {
      padding: 0.75rem;
      border-bottom: 1px solid #f0f0f0;
      position: relative;
      background-color: #fff;
      
      .search-input {
        padding-left: 2.5rem;
        height: 40px;
        border-radius: 0.5rem;
        font-size: 0.9rem;
        background-color: #fff;
        
        &:focus {
          border-color: #42b883;
          box-shadow: 0 0 0 0.2rem rgba(66, 184, 131, 0.25);
          background-color: #fff;
        }
      }
      
      .search-icon {
        position: absolute;
        left: 1.5rem;
        top: 50%;
        transform: translateY(-50%);
        color: #adb5bd;
        pointer-events: none;
      }
    }
    
    .dropdown-options {
      max-height: 280px;
      overflow-y: auto;
      background-color: #fff;
      
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
        
        &:hover {
          background: #aaa;
        }
      }
      
      .dropdown-option {
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
        display: flex;
        align-items: center;
        color: #495057;
        background-color: #fff;
        
        i {
          color: #42b883;
          margin-right: 0.5rem;
        }
        
        &:hover {
          background-color: #f5f9f7;
        }
        
        &.active {
          background-color: #e3f8ef;
          font-weight: 600;
          color: #2c845e;
        }
        
        &.all-option {
          border-bottom: 1px solid #f0f0f0;
          
          i {
            color: #5c6bc0;
          }
        }
      }
      
      .no-results {
        padding: 1rem;
        text-align: center;
        color: #6c757d;
        font-style: italic;
        background-color: #fff;
        
        i {
          color: #dc3545;
        }
      }
    }
  }
}

/* School Selector Styles - Matching SchoolSelector.vue */
.school-selector {
  .form-label {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .custom-select-container {
    position: relative;

    .form-control {
      height: 3.5rem;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 0.5rem;
      background-color: #fff;
      transition: all 0.2s ease;
      font-size: 0.95rem;
      width: 100%;

      &:disabled {
        background-color: #f8fafc;
        cursor: not-allowed;
        opacity: 0.8;
      }

      &::placeholder {
        color: #94a3b8;
      }

      &:focus {
        border-color: #42b883;
        box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
      }
    }
  }

  .custom-select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    margin-top: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 50;
    max-height: 250px;
    overflow-y: auto;
  }

  .custom-select-options {
    padding: 0.5rem 0;
  }

  .custom-select-option {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #f8f9fa;
      color: #42b883;
    }
    
    &.selected {
      background: #42b883;
      color: white;
      
      &:hover {
        background: #3aa876;
      }
    }
  }

  .no-results {
    padding: 0.75rem 1rem;
    color: #64748b;
    text-align: center;
    font-style: italic;
  }

  /* Custom scrollbar for the dropdown */
  .custom-select-dropdown {
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
      
      &:hover {
        background: #a8a8a8;
      }
    }
  }
}
</style> 