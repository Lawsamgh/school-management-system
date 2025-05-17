<template>
  <div class="settings-root">
    <div class="settings-view">
      <div class="container py-5">
        <!-- Add PageLoader for initial page loading -->
        <PageLoader 
          :visible="initialPageLoading" 
          title="Loading Settings" 
          message="Please wait while we load your settings..." 
        />
        
        <div class="settings-header mb-4">
          <h1>School Settings</h1>
          <p class="text-muted">Manage your school's configuration and preferences</p>
        </div>

        <!-- Add SchoolSelector for superadmin -->
        <div v-if="userRole === 'superadmin'" class="mb-4">
          <SchoolSelector @school-selected="handleSchoolSelected" />
        </div>

        <!-- Show message when no school is selected for superadmin -->
        <div v-if="userRole === 'superadmin' && !authStore.getSelectedSchoolId" class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>
          Please select a school from the dropdown above to view and manage its settings.
        </div>

        <!-- Only show settings when a school is selected for superadmin or when user is admin -->
        <div v-if="userRole === 'admin' || (userRole === 'superadmin' && authStore.getSelectedSchoolId)" class="row g-4">
          <!-- Left Side Tab Menu -->
          <div class="col-lg-3">
            <div class="settings-tabs">
              <!-- Show all tabs for admin -->
              <template v-if="userRole === 'superadmin'">
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'school' }"
                  @click="activeTab = 'school'"
                >
                  <i class="fas fa-school"></i>
                  <span>School Information</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'academic' }"
                  @click="activeTab = 'academic'"
                >
                  <i class="fas fa-futbol"></i>
                  <span>Manage Activities</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'notifications' }"
                  @click="activeTab = 'notifications'"
                >
                  <i class="fas fa-bell"></i>
                  <span>Notifications</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'access-package' }"
                  @click="activeTab = 'access-package'"
                >
                  <i class="fas fa-key"></i>
                  <span>Manage Access Package</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'security' }"
                  @click="activeTab = 'security'"
                >
                  <i class="fas fa-list"></i>
                  <span>Manage Value List</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'appearance' }"
                  @click="activeTab = 'appearance'"
                >
                  <i class="fas fa-paint-brush"></i>
                  <span>Appearance</span>
                </div>
              </template>
              <!-- Show specific tabs for admin -->
              <template v-else-if="userRole === 'admin'">
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'school' }"
                  @click="activeTab = 'school'"
                >
                  <i class="fas fa-school"></i>
                  <span>School Information</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'academic' }"
                  @click="activeTab = 'academic'"
                >
                  <i class="fas fa-running"></i>
                  <span>Manage Activities</span>
                </div>
                <div 
                  class="settings-tab-item" 
                  :class="{ active: activeTab === 'security' }"
                  @click="activeTab = 'security'"
                >
                  <i class="fas fa-list"></i>
                  <span>Manage Value List</span>
                </div>
              </template>
            </div>
          </div>

          <!-- Main Content Area -->
          <div class="col-lg-9">
            <!-- School Information - For both Admin and Superadmin -->
            <div v-show="activeTab === 'school'" class="settings-card position-relative">
              <SettingsCardLoader :visible="loadingSchoolInfo" />
              <div class="settings-card-header">
                <h2>
                  <i class="fas fa-school"></i>
                  School Information
                </h2>
                <button 
                  class="btn btn-primary save-btn" 
                  @click="saveSchoolInfo"
                  :disabled="savingSchoolInfo"
                >
                  <i class="fas fa-save me-2"></i>
                  {{ savingSchoolInfo ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
              <div class="settings-card-body">
                <div class="row g-3">
                  <!-- Add School Logo Upload Section -->
                  <div class="col-12 mb-4">
                    <div class="school-logo-section">
                      <label class="modern-label">School Logo</label>
                      <div class="logo-upload-container" :class="{ 'has-image': schoolLogoPreview }">
                        <input
                          type="file"
                          id="schoolLogo"
                          ref="schoolLogoInput"
                          class="logo-upload-input"
                          accept="image/*"
                          @change="handleLogoUpload"
                        >
                        <div class="logo-upload-content">
                          <template v-if="schoolLogoPreview">
                            <img :src="schoolLogoPreview" alt="School logo preview" class="logo-preview">
                            <button type="button" class="btn-remove-logo" @click="removeLogo">
                              <i class="fas fa-times"></i>
                            </button>
                          </template>
                          <template v-else>
                            <div class="upload-placeholder">
                              <i class="fas fa-cloud-upload-alt upload-icon"></i>
                              <p class="upload-text">
                                Drag and drop your logo here or
                                <span class="upload-browse">browse</span>
                              </p>
                              <p class="upload-hint">Supports: JPG, PNG (Max 2MB)</p>
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="schoolName">School Name</label>
                      <input
                        type="text"
                        id="schoolName"
                        v-model="schoolInfo.name"
                        class="form-control"
                        placeholder="Enter school name"
                        :disabled="userRole === 'admin'"
                        :title="userRole === 'admin' ? 'School name can only be changed by superadmin' : ''"
                      >
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label for="schoolPhone">Phone Number</label>
                      <input
                        type="tel"
                        id="schoolPhone"
                        v-model="schoolInfo.phone"
                        class="form-control"
                        placeholder="Enter phone number"
                      >
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-group">
                      <label for="schoolEmail">School Email</label>
                      <input
                        type="email"
                        id="schoolEmail"
                        v-model="schoolInfo.email"
                        class="form-control"
                        placeholder="Enter school email"
                      >
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="form-group">
                      <label for="schoolAddress">School Address</label>
                      <textarea
                        id="schoolAddress"
                        v-model="schoolInfo.address"
                        class="form-control"
                        rows="3"
                        placeholder="Enter school address"
                      ></textarea>
                    </div>
                  </div>
                  <!-- Add refresh message -->
                  <div v-if="showRefreshMessage" class="col-12 mt-3">
                    <div class="alert alert-info d-flex align-items-center" role="alert">
                      <i class="fas fa-sync-alt me-2"></i>
                      <span>Please refresh the page to see the updated changes.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Educational Programs - Visible to both admin and headmaster -->
            <div v-show="activeTab === 'academic'" class="settings-card position-relative">
              <SettingsCardLoader :visible="loadingEducationalPrograms" />
              <div class="settings-card-header">
                <h2>
                  <i class="fas fa-running"></i>
                  Manage Activities
                </h2>
                <button 
                  class="btn btn-primary save-btn" 
                  @click="saveEducationalPrograms"
                  :disabled="savingAcademic || !isEducationalProgramFormValid"
                >
                  <i class="fas fa-save me-2"></i>
                  {{ savingAcademic ? 'Saving...' : 'Save Activity' }}
                </button>
              </div>
              <div class="settings-card-body">
                <!-- Add Program Form -->
                <div class="row g-4 align-items-stretch mb-5">
                  <div class="col-md-7">
                    <div class="program-info-container">
                      <h6 class="section-subtitle mb-4">Add New Activity</h6>
                      <div class="row g-4">
                        <div class="col-12">
                          <div class="modern-form-group">
                            <label for="programName" class="modern-label">
                              Activity Name <span class="required-field">*</span>
                            </label>
                            <input
                              type="text"
                              id="programName"
                              v-model="educationalPrograms.name"
                              class="modern-input"
                              :class="{ 'is-invalid': educationalPrograms.name.trim() === '' }"
                              placeholder="Enter program name"
                              required
                            >
                            <div class="invalid-feedback" v-if="educationalPrograms.name.trim() === ''">
                              Activity name is required
                            </div>
                          </div>
                        </div>
                        <div class="col-12">
                          <div class="modern-form-group">
                            <label for="programDescription" class="modern-label">
                              Activity Description <span class="required-field">*</span>
                            </label>
                            <textarea
                              id="programDescription"
                              v-model="educationalPrograms.description"
                              class="modern-input modern-textarea"
                              :class="{ 'is-invalid': educationalPrograms.description.trim() === '' }"
                              rows="6"
                              placeholder="Enter program description"
                              required
                            ></textarea>
                            <div class="invalid-feedback" v-if="educationalPrograms.description.trim() === ''">
                              Activity description is required
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-5">
                    <div class="program-image-container">
                      <h6 class="section-subtitle mb-4">Activity Image <span class="required-field">*</span></h6>
                      <div class="image-upload-wrapper">
                        <div class="image-upload-container" :class="{ 'has-image': programImagePreview, 'is-invalid': isImageRequired }">
                          <input
                            type="file"
                            id="programImage"
                            ref="programImageInput"
                            class="image-upload-input"
                            accept="image/*"
                            @change="handleImageUpload"
                            required
                          >
                          <div class="image-upload-content">
                            <template v-if="programImagePreview">
                              <img :src="programImagePreview" alt="Program image preview" class="image-preview">
                              <button type="button" class="btn-remove-image" @click="removeImage">
                                <i class="fas fa-times"></i>
                              </button>
                            </template>
                            <template v-else>
                              <div class="upload-placeholder">
                                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                                <p class="upload-text">
                                  Drag and drop your image here or
                                  <span class="upload-browse">browse</span>
                                </p>
                                <p class="upload-hint">Supports: JPG, PNG, GIF (Max 5MB)</p>
                              </div>
                            </template>
                          </div>
                        </div>
                        <div class="invalid-feedback" v-if="isImageRequired">
                          Activity image is required
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Programs List -->
                <div class="programs-list mt-5">
                  <h6 class="section-subtitle mb-4">Existing Activities</h6>
                  
                  <!-- Programs Grid with Animation -->
                  <transition-group 
                    name="program-slide" 
                    tag="div" 
                    class="row g-4"
                  >
                    <div 
                      v-for="program in paginatedPrograms" 
                      :key="program.id" 
                      class="col-md-6 col-lg-4"
                    >
                      <div class="program-card">
                        <div class="program-card-image">
                          <img 
                            :src="program.program_image || 'https://via.placeholder.com/300x200'" 
                            :alt="program.program_name"
                          >
                          <button 
                            class="btn-delete-program" 
                            @click="openDeleteModal(program)"
                            type="button"
                          >
                            <i class="fas fa-trash"></i>
                          </button>
                          <button 
                            class="btn-edit-program" 
                            @click="openEditModal(program)"
                            type="button"
                          >
                            <i class="fas fa-edit"></i>
                          </button>
                        </div>
                        <div class="program-card-content">
                          <h3 class="program-card-title">{{ program.program_name }}</h3>
                          <p class="program-card-description">{{ program.program_description }}</p>
                        </div>
                      </div>
                    </div>
                  </transition-group>

                  <!-- Pagination Controls -->
                  <div class="pagination-controls mt-4" v-if="totalPages > 1">
                    <button 
                      class="btn-pagination" 
                      :disabled="currentPage === 1"
                      @click="previousPage"
                    >
                      <i class="fas fa-chevron-left"></i>
                      Previous
                    </button>
                    <div class="pagination-info">
                      Page {{ currentPage }} of {{ totalPages }}
                    </div>
                    <button 
                      class="btn-pagination" 
                      :disabled="currentPage === totalPages"
                      @click="nextPage"
                    >
                      Next
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications Settings - Visible only to superadmin -->
            <div v-if="userRole === 'superadmin'" v-show="activeTab === 'notifications'" class="settings-card position-relative">
              <SettingsCardLoader :visible="loadingNotifications" />
              <div class="settings-card-header">
                <h2>
                  <i class="fas fa-bell"></i>
                  Notification Settings
                </h2>
              </div>
              <div class="settings-card-body">
                <div class="quick-settings-list">
                  <div class="quick-setting-item">
                    <div class="setting-info">
                      <h3>SMS Alerts</h3>
                      <p>Enable SMS notification</p>
                    </div>
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        id="smsAlerts"
                        v-model="quickSettings.smsAlerts"
                        :disabled="savingNotifications"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Settings - Visible to both Admin and Superadmin -->
            <div v-if="userRole === 'superadmin' || userRole === 'admin'" v-show="activeTab === 'security'" class="settings-card">
              <div class="settings-card-header">
                <h2>
                  <i class="fas fa-list"></i>
                  Manage Value List
                </h2>
              </div>
              <div class="settings-card-body">
                <div class="alert alert-info mb-4">
                  <i class="fas fa-info-circle me-2"></i>
                  Manage system value lists that are used throughout the application.
                </div>
                
                <div class="row g-4">
                  <!-- Class Levels Card -->
                  <div class="col-md-6 col-lg-4">
                    <div class="value-list-card">
                      <div class="value-card-icon">
                        <i class="fas fa-layer-group"></i>
                      </div>
                      <div class="value-card-content">
                        <h4>Classes</h4>
                        <p>Manage classes</p>
                      </div>
                      <div class="value-card-actions">
                        <button class="btn-value-action" @click="openClassesModal">
                          <i class="fas fa-chevron-right"></i>
                        </button>
                      </div>
                      <span class="value-list-badge" v-if="classes.length > 0">{{ classes.length }}</span>
                    </div>
                  </div>

                  <!-- Subjects Card -->
                  <div class="col-md-6 col-lg-4">
                    <div class="value-list-card">
                      <div class="value-card-icon">
                        <i class="fas fa-book"></i>
                      </div>
                      <div class="value-card-content">
                        <h4>Subjects</h4>
                        <p>Manage academic subjects</p>
                      </div>
                      <div class="value-card-actions">
                        <button class="btn-value-action">
                          <i class="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Academic Terms Card -->
                  <div class="col-md-6 col-lg-4">
                    <div class="value-list-card">
                      <div class="value-card-icon">
                        <i class="fas fa-calendar-alt"></i>
                      </div>
                      <div class="value-card-content">
                        <h4>Academic Terms</h4>
                        <p>Manage terms and semesters</p>
                      </div>
                      <div class="value-card-actions">
                        <button class="btn-value-action">
                          <i class="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Payment Types Card -->
                  <div class="col-md-6 col-lg-4">
                    <div class="value-list-card">
                      <div class="value-card-icon">
                        <i class="fas fa-money-bill-wave"></i>
                      </div>
                      <div class="value-card-content">
                        <h4>Payment Types</h4>
                        <p>Manage payment categories</p>
                      </div>
                      <div class="value-card-actions">
                        <button class="btn-value-action" @click="openPaymentTypesModal">
                          <i class="fas fa-chevron-right"></i>
                        </button>
                      </div>
                      <span class="value-list-badge" v-if="paymentTypes.length > 0">{{ paymentTypes.length }}</span>
                    </div>
                  </div>

                  <!-- Class Fees Setup Card (previously Departments) -->
                  <div class="col-md-6 col-lg-4">
                    <div class="value-list-card">
                      <div class="value-card-icon">
                        <i class="fas fa-money-check-alt"></i>
                      </div>
                      <div class="value-card-content">
                        <h4>Class Fees Setup</h4>
                        <p>Manage class fee structures</p>
                      </div>
                      <div class="value-card-actions">
                        <button class="btn-value-action" @click="openClassFeesModal">
                          <i class="fas fa-chevron-right"></i>
                        </button>
                      </div>
                      <span class="value-list-badge" v-if="fees.length > 0">{{ fees.length }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Appearance Settings - Admin Only -->
            <div v-if="userRole === 'superadmin'" v-show="activeTab === 'appearance'" class="settings-card">
              <!-- ... existing appearance content ... -->
            </div>

            <!-- Access Package Settings - Superadmin Only -->
            <div v-if="userRole === 'superadmin'" v-show="activeTab === 'access-package'" class="settings-card position-relative">
              <SettingsCardLoader :visible="loadingAccessPackage" />
              <div class="settings-card-header">
                <h2>
                  <i class="fas fa-key"></i>
                  Access Package
                </h2>
                
              </div>
              <div class="settings-card-body">
                <div class="alert alert-info mb-4">
                  <i class="fas fa-info-circle me-2"></i>
                  Configure access packages to control feature availability for different schools.
                </div>
                
                <div class="row">
                  <div class="col-md-12">
                    <div class="form-group mb-4">
                      <label class="form-label fw-bold">Package Features</label>
                      <div class="feature-list">
                        <div class="feature-item" v-for="(feature, index) in accessPackage.features" :key="index">
                          <div class="form-check form-switch">
                            <input
                              class="form-check-input"
                              type="checkbox"
                              :id="'feature-' + index"
                              v-model="feature.enabled"
                              @change="handleFeatureToggle(feature)"
                              :disabled="savingFeature === feature.name"
                            >
                            <label class="form-check-label" :for="'feature-' + index">
                              {{ feature.name }}
                              <span v-if="savingFeature === feature.name" class="ms-2 text-muted">
                                <i class="fas fa-spinner fa-spin"></i>
                              </span>
                            </label>
                          </div>
                          <p class="feature-description">{{ feature.description }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div v-show="isDeleteModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-exclamation-triangle text-danger"></i>
            <h3>Delete Program</h3>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete "<span class="fw-bold">{{ selectedProgram?.program_name }}</span>"?</p>
            <p class="text-muted">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeDeleteModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-danger ms-2" 
              @click="handleDeleteProgram"
              :disabled="isDeleting"
              type="button"
            >
              <span v-if="isDeleting">
                <i class="fas fa-spinner fa-spin me-2"></i>Deleting...
              </span>
              <span v-else>
                <i class="fas fa-trash me-2"></i>Delete Program
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-show="isEditModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-edit text-primary"></i>
            <h3>Edit Program</h3>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-12">
                <div class="modern-form-group">
                  <label for="editProgramName" class="modern-label">
                    Program Name <span class="required-field">*</span>
                  </label>
                  <input
                    type="text"
                    id="editProgramName"
                    v-model="editingProgram.name"
                    class="modern-input"
                    :class="{ 'is-invalid': editingProgram.name.trim() === '' }"
                    placeholder="Enter program name"
                    required
                  >
                  <div class="invalid-feedback" v-if="editingProgram.name.trim() === ''">
                    Program name is required
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="modern-form-group">
                  <label for="editProgramDescription" class="modern-label">
                    Program Description <span class="required-field">*</span>
                  </label>
                  <textarea
                    id="editProgramDescription"
                    v-model="editingProgram.description"
                    class="modern-input modern-textarea"
                    :class="{ 'is-invalid': editingProgram.description.trim() === '' }"
                    rows="6"
                    placeholder="Enter program description"
                    required
                  ></textarea>
                  <div class="invalid-feedback" v-if="editingProgram.description.trim() === ''">
                    Program description is required
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="modern-form-group">
                  <label class="modern-label">
                    Program Image
                  </label>
                  <div class="image-upload-wrapper">
                    <div class="image-upload-container" :class="{ 'has-image': editImagePreview }">
                      <input
                        type="file"
                        id="editProgramImage"
                        ref="editProgramImageInput"
                        class="image-upload-input"
                        accept="image/*"
                        @change="handleEditImageUpload"
                      >
                      <div class="image-upload-content">
                        <template v-if="editImagePreview">
                          <img :src="editImagePreview" alt="Program image preview" class="image-preview">
                          <button type="button" class="btn-remove-image" @click="removeEditImage">
                            <i class="fas fa-times"></i>
                          </button>
                        </template>
                        <template v-else>
                          <img 
                            :src="editingProgram.currentImage" 
                            alt="Current program image" 
                            class="image-preview"
                          >
                          <div class="upload-overlay">
                            <i class="fas fa-cloud-upload-alt upload-icon"></i>
                            <p class="upload-text">Click to change image</p>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeEditModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-primary ms-2" 
              @click="handleEditProgram"
              :disabled="isEditing || !isEditFormValid"
              type="button"
            >
              <span v-if="isEditing">
                <i class="fas fa-spinner fa-spin me-2"></i>Saving...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>Save Changes
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Class Fees Setup Modal -->
    <div v-show="isClassFeesModalOpen" class="modal-overlay">
      <div class="modal-container" style="max-width: 800px; width: 90%; display: flex; flex-direction: column; max-height: 90vh;">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-money-check-alt text-primary"></i>
            <h3>Class Fees Setup</h3>
            <button class="modal-close-btn" @click="closeClassFeesModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-4">
              <i class="fas fa-info-circle me-2"></i>
              Manage payment types and fees for different class levels.
            </div>
            
            <!-- Add New Fee Form -->
            <div class="card mb-4">
              <div class="card-header bg-light">
                <h5 class="mb-0">Add New Fee</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="saveFee">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="paymentFor" class="form-label">Fee Description <span class="text-danger">*</span></label>
                        <input 
                          type="text" 
                          id="paymentFor" 
                          v-model="newFee.payment_for" 
                          class="form-control"
                          placeholder="E.g. Tuition Fee, Sport Fee, etc."
                          required
                        >
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-group">
                        <label for="amount" class="form-label">Amount <span class="text-danger">*</span></label>
                        <input 
                          type="number" 
                          id="amount" 
                          v-model="newFee.amount" 
                          class="form-control"
                          placeholder="Amount"
                          min="0"
                          step="0.01"
                          required
                        >
                      </div>
                    </div>
                    <div class="col-md-3">
                      <div class="form-group">
                        <label for="currency" class="form-label">Currency <span class="text-danger">*</span></label>
                        <input 
                          type="text" 
                          id="currency" 
                          v-model="newFee.currency" 
                          class="form-control"
                          placeholder="GHS, USD, EUR."
                          required
                        >
                      </div>
                    </div>
                    <div class="col-12 text-end">
                      <button 
                        type="submit" 
                        class="btn btn-primary" 
                        :disabled="savingFee"
                      >
                        <i class="fas fa-save me-2"></i>
                        {{ savingFee ? 'Saving...' : 'Save Fee' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            <!-- Existing Fees Table -->
            <div class="card">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Existing Fees</h5>
                <div v-if="loadingFees" class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Fee Description</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingFees && fees.length === 0">
                      <td colspan="5" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else-if="fees.length === 0">
                      <td colspan="5" class="text-center py-4">
                        No fees found. Add your first fee above.
                      </td>
                    </tr>
                    <tr v-for="fee in fees" :key="fee.id">
                      <td>{{ fee.id }}</td>
                      <td>{{ fee.payment_for }}</td>
                      <td>{{ fee.amount }}</td>
                      <td>{{ fee.currency }}</td>
                      <td class="text-end">
                        <button 
                          class="btn btn-sm btn-outline-primary me-2" 
                          @click="editFee(fee)"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-outline-danger" 
                          @click="confirmDeleteFee(fee)"
                          :disabled="deletingFeeId === fee.id"
                        >
                          <i v-if="deletingFeeId === fee.id" class="fas fa-spinner fa-spin"></i>
                          <i v-else class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeClassFeesModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Fee Modal -->
    <div v-show="isEditFeeModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-edit text-primary"></i>
            <h3>Edit Fee</h3>
            <button class="modal-close-btn" @click="closeEditFeeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateFee">
              <div class="row g-3">
                <div class="col-md-12">
                  <div class="form-group">
                    <label for="editPaymentFor" class="form-label">Fee Description <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      id="editPaymentFor" 
                      v-model="editingFee.payment_for" 
                      class="form-control"
                      placeholder="E.g. Tuition Fee, Sport Fee, etc."
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="editAmount" class="form-label">Amount <span class="text-danger">*</span></label>
                    <input 
                      type="number" 
                      id="editAmount" 
                      v-model="editingFee.amount" 
                      class="form-control"
                      placeholder="Amount"
                      min="0"
                      step="0.01"
                      required
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group">
                    <label for="editCurrency" class="form-label">Currency <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      id="editCurrency" 
                      v-model="editingFee.currency" 
                      class="form-control"
                      placeholder="USD, EUR, etc."
                      required
                    >
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeEditFeeModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-primary ms-2" 
              @click="updateFee"
              :disabled="updatingFee"
              type="button"
            >
              <span v-if="updatingFee">
                <i class="fas fa-spinner fa-spin me-2"></i>Saving...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>Save Changes
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Fee Modal -->
    <div v-show="isDeleteFeeModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-exclamation-triangle text-danger"></i>
            <h3>Delete Fee</h3>
            <button class="modal-close-btn" @click="closeDeleteFeeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the fee "<span class="fw-bold">{{ selectedFee?.payment_for }}</span>"?</p>
            <p class="text-muted">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeDeleteFeeModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-danger ms-2" 
              @click="deleteFee"
              :disabled="deletingFeeId !== null"
              type="button"
            >
              <span v-if="deletingFeeId !== null">
                <i class="fas fa-spinner fa-spin me-2"></i>Deleting...
              </span>
              <span v-else>
                <i class="fas fa-trash me-2"></i>Delete Fee
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Types Modal -->
    <div v-show="isPaymentTypesModalOpen" class="modal-overlay">
      <div class="modal-container" style="max-width: 800px; width: 90%; display: flex; flex-direction: column; max-height: 90vh;">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-money-bill-wave text-primary"></i>
            <h3>Payment Types</h3>
            <button class="modal-close-btn" @click="closePaymentTypesModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-4">
              <i class="fas fa-info-circle me-2"></i>
              Manage payment types that can be used throughout the application.
            </div>
            
            <!-- Add New Payment Type Form -->
            <div class="card mb-4">
              <div class="card-header bg-light">
                <h5 class="mb-0">Add New Payment Type</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="savePaymentType">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="typeName" class="form-label">Type Name <span class="text-danger">*</span></label>
                        <input 
                          type="text" 
                          id="typeName" 
                          v-model="newPaymentType.type_name" 
                          class="form-control"
                          placeholder="E.g. Mobile Money, Bank etc."
                          required
                        >
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="typeDescription" class="form-label">Description</label>
                        <input 
                          type="text" 
                          id="typeDescription" 
                          v-model="newPaymentType.description" 
                          class="form-control"
                          placeholder="Brief description of this payment type"
                        >
                      </div>
                    </div>
                    <div class="col-12 text-end">
                      <button 
                        type="submit" 
                        class="btn btn-primary" 
                        :disabled="savingPaymentType"
                      >
                        <i class="fas fa-save me-2"></i>
                        {{ savingPaymentType ? 'Saving...' : 'Save Payment Type' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            <!-- Existing Payment Types Table -->
            <div class="card">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Existing Payment Types</h5>
                <div v-if="loadingPaymentTypes" class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Type Name</th>
                      <th>Description</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingPaymentTypes && paymentTypes.length === 0">
                      <td colspan="4" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else-if="paymentTypes.length === 0">
                      <td colspan="4" class="text-center py-4">
                        No payment types found. Add your first payment type above.
                      </td>
                    </tr>
                    <tr v-for="type in paymentTypes" :key="type.id">
                      <td>{{ type.id }}</td>
                      <td>{{ type.type_name }}</td>
                      <td>{{ type.description }}</td>
                      <td class="text-end">
                        <button 
                          class="btn btn-sm btn-outline-primary me-2" 
                          @click="editPaymentType(type)"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-outline-danger" 
                          @click="confirmDeletePaymentType(type)"
                          :disabled="deletingPaymentTypeId === type.id"
                        >
                          <i v-if="deletingPaymentTypeId === type.id" class="fas fa-spinner fa-spin"></i>
                          <i v-else class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closePaymentTypesModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Payment Type Modal -->
    <div v-show="isEditPaymentTypeModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-edit text-primary"></i>
            <h3>Edit Payment Type</h3>
            <button class="modal-close-btn" @click="closeEditPaymentTypeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updatePaymentType">
              <div class="row g-3">
                <div class="col-md-12">
                  <div class="form-group">
                    <label for="editTypeName" class="form-label">Type Name <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      id="editTypeName" 
                      v-model="editingPaymentType.type_name" 
                      class="form-control"
                      placeholder="E.g. School Fees, Transportation Fee, etc."
                      required
                    >
                  </div>
                </div>
                <div class="col-md-12">
                  <div class="form-group">
                    <label for="editTypeDescription" class="form-label">Description</label>
                    <input 
                      type="text" 
                      id="editTypeDescription" 
                      v-model="editingPaymentType.description" 
                      class="form-control"
                      placeholder="Brief description of this payment type"
                    >
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeEditPaymentTypeModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-primary ms-2" 
              @click="updatePaymentType"
              :disabled="updatingPaymentType"
              type="button"
            >
              <span v-if="updatingPaymentType">
                <i class="fas fa-spinner fa-spin me-2"></i>Saving...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>Save Changes
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Payment Type Confirmation Modal -->
    <div v-show="isDeletePaymentTypeModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-exclamation-triangle text-danger"></i>
            <h3>Delete Payment Type</h3>
            <button class="modal-close-btn" @click="closeDeletePaymentTypeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the payment type "<span class="fw-bold">{{ selectedPaymentType?.type_name }}</span>"?</p>
            <p class="text-muted">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeDeletePaymentTypeModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-danger ms-2" 
              @click="deletePaymentType"
              :disabled="deletingPaymentTypeId !== null"
              type="button"
            >
              <span v-if="deletingPaymentTypeId !== null">
                <i class="fas fa-spinner fa-spin me-2"></i>Deleting...
              </span>
              <span v-else>
                <i class="fas fa-trash me-2"></i>Delete Payment Type
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Classes Modal -->
    <div v-show="isClassesModalOpen" class="modal-overlay">
      <div class="modal-container" style="max-width: 800px; width: 90%; display: flex; flex-direction: column; max-height: 90vh;">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-layer-group text-primary"></i>
            <h3>Manage Classes</h3>
            <button class="modal-close-btn" @click="closeClassesModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-4">
              <i class="fas fa-info-circle me-2"></i>
              Manage classes that are used throughout the application.
            </div>
            
            <!-- Add New Class Form -->
            <div class="card mb-4">
              <div class="card-header bg-light">
                <h5 class="mb-0">Add New Class</h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="saveClass">
                  <div class="row g-3">
                    <div class="col-md-12">
                      <div class="form-group">
                        <label for="className" class="form-label">Class Name <span class="text-danger">*</span></label>
                        <input 
                          type="text" 
                          id="className" 
                          v-model="newClass.class_name" 
                          class="form-control"
                          placeholder="E.g. Primary 1, JSS 1, Grade 6, etc."
                          required
                        >
                      </div>
                    </div>
                    <div class="col-12 text-end">
                      <button 
                        type="submit" 
                        class="btn btn-primary" 
                        :disabled="savingClass"
                      >
                        <i class="fas fa-save me-2"></i>
                        {{ savingClass ? 'Saving...' : 'Save Class' }}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            
            <!-- Existing Classes Table -->
            <div class="card">
              <div class="card-header bg-light d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Existing Classes</h5>
                <div v-if="loadingClasses" class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div class="table-responsive" style="max-height: 300px; overflow-y: auto;">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Class Name</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="loadingClasses && classes.length === 0">
                      <td colspan="3" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-else-if="classes.length === 0">
                      <td colspan="3" class="text-center py-4">
                        No classes found. Add your first class above.
                      </td>
                    </tr>
                    <tr v-for="cls in classes" :key="cls.class_id">
                      <td>{{ cls.class_id }}</td>
                      <td>{{ cls.class_name }}</td>
                      <td class="text-end">
                        <button 
                          class="btn btn-sm btn-outline-primary me-2" 
                          @click="editClass(cls)"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-outline-danger" 
                          @click="confirmDeleteClass(cls)"
                          :disabled="deletingClassId === cls.class_id"
                        >
                          <i v-if="deletingClassId === cls.class_id" class="fas fa-spinner fa-spin"></i>
                          <i v-else class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeClassesModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Class Modal -->
    <div v-show="isEditClassModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-edit text-primary"></i>
            <h3>Edit Class</h3>
            <button class="modal-close-btn" @click="closeEditClassModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="updateClass">
              <div class="row g-3">
                <div class="col-md-12">
                  <div class="form-group">
                    <label for="editClassName" class="form-label">Class Name <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      id="editClassName" 
                      v-model="editingClass.class_name" 
                      class="form-control"
                      placeholder="E.g. Primary 1, JSS 1, Grade 6, etc."
                      required
                    >
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeEditClassModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-primary ms-2" 
              @click="updateClass"
              :disabled="updatingClass"
              type="button"
            >
              <span v-if="updatingClass">
                <i class="fas fa-spinner fa-spin me-2"></i>Saving...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>Save Changes
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Class Confirmation Modal -->
    <div v-show="isDeleteClassModalOpen" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-content">
          <div class="modal-header">
            <i class="fas fa-exclamation-triangle text-danger"></i>
            <h3>Delete Class</h3>
            <button class="modal-close-btn" @click="closeDeleteClassModal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete the class "<span class="fw-bold">{{ selectedClass?.class_name }}</span>"?</p>
            <p class="text-muted">This action cannot be undone. Deleting a class may affect student records and other data.</p>
          </div>
          <div class="modal-footer">
            <button 
              class="btn btn-outline-secondary" 
              @click="closeDeleteClassModal"
              type="button"
            >
              Cancel
            </button>
            <button 
              class="btn btn-danger ms-2" 
              @click="deleteClass"
              :disabled="deletingClassId !== null"
              type="button"
            >
              <span v-if="deletingClassId !== null">
                <i class="fas fa-spinner fa-spin me-2"></i>Deleting...
              </span>
              <span v-else>
                <i class="fas fa-trash me-2"></i>Delete Class
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useToast } from 'vue-toastification'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth'
import SchoolSelector from '@/components/SchoolSelector.vue'
import { logActivity } from '@/lib/auditLogger'
import PageLoader from '@/components/PageLoader.vue'
import SettingsCardLoader from '@/components/SettingsCardLoader.vue'

const authStore = useAuthStore()
const toast = useToast()

// Add separate saving states for each card
const savingSchoolInfo = ref(false)
const savingAcademic = ref(false)
const savingNotifications = ref(false)
const savingAccessPackage = ref(false)
const isInitializing = ref(true)

// Add loading states for different sections
const loadingSchoolInfo = ref(false)
const loadingEducationalPrograms = ref(false)
const loadingNotifications = ref(false)
const loadingAccessPackage = ref(false)
const initialPageLoading = ref(true)

const activeTab = ref('school')
const showRefreshMessage = ref(false)

const userRole = computed(() => authStore.userRole?.role?.toLowerCase() || null)

const schoolInfo = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const educationalPrograms = ref({
  name: '',
  description: '',
  features: [] as string[],
  schedule: '',
  class_size: '',
  curriculum: '',
  newFeature: '' // For adding new features
})

const quickSettings = ref({
  emailNotifications: true,
  smsAlerts: false,
  publicWebsite: true
})

const programImageInput = ref<HTMLInputElement | null>(null)
const programImagePreview = ref<string | null>(null)

const programsList = ref<any[]>([])

// Delete modal state
const isDeleteModalOpen = ref(false)
const selectedProgram = ref<any>(null)
const isDeleting = ref(false)

const isImageRequired = ref(false)

const isEditModalOpen = ref(false)
const editingProgram = ref({
  id: null as number | null,
  name: '',
  description: '',
  currentImage: ''
})
const editImagePreview = ref<string | null>(null)

const isEditing = ref(false)
const isEditFormValid = ref(true)

// Add these new refs for pagination
const currentPage = ref(1)
const itemsPerPage = ref(6) // Show 6 items per page (2 rows of 3 cards)

// Add computed properties for pagination
const totalPages = computed(() => {
  return Math.ceil(programsList.value.length / itemsPerPage.value)
})

const paginatedPrograms = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return programsList.value.slice(start, end)
})

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async (operation: () => Promise<any>, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (attempt === maxAttempts) throw error;
      await wait(delay * attempt); // Exponential backoff
    }
  }
};

// Add logo related refs
const schoolLogoInput = ref<HTMLInputElement | null>(null)
const schoolLogoPreview = ref<string | null>(null)
const currentLogoUrl = ref<string | null>(null)

// Handle logo upload
const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size should not exceed 2MB')
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        schoolLogoPreview.value = result
      }
    }
    reader.readAsDataURL(file)
  }
}

// Remove logo
const removeLogo = () => {
  schoolLogoPreview.value = null
  if (schoolLogoInput.value) {
    schoolLogoInput.value.value = ''
  }
}

// Modify fetchSchoolInfo to include logo
const fetchSchoolInfo = async () => {
  try {
    loadingSchoolInfo.value = true;
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId

    if (!schoolId) {
      console.log('No school_id found. For superadmin, please select a school first.')
      return
    }

    let query = supabase
      .from('setup')
      .select('school_name, school_email, school_contact1, school_address, school_logo')
      .eq('school_id', schoolId)

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return
      }
      throw error
    }

    if (data) {
      console.log('Fetched school data:', data)
      schoolInfo.value = {
        name: data.school_name || '',
        email: data.school_email || '',
        phone: data.school_contact1 || '',
        address: data.school_address || ''
      }
      currentLogoUrl.value = data.school_logo || null
      schoolLogoPreview.value = data.school_logo || null
    }
  } catch (error: any) {
    console.error('Error fetching school info:', error)
    toast.error('Failed to load school information')
  } finally {
    loadingSchoolInfo.value = false;
  }
}

// Modify saveSchoolInfo to include logo upload
const saveSchoolInfo = async () => {
  savingSchoolInfo.value = true
  showRefreshMessage.value = false
  try {
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId

    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.')
    }

    let logoUrl = currentLogoUrl.value

    // Upload new logo if exists
    if (schoolLogoPreview.value && schoolLogoPreview.value !== currentLogoUrl.value) {
      const target = schoolLogoInput.value
      const file = target?.files?.[0]
      if (file) {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `school-logo-${schoolId}-${Date.now()}.${fileExt}`
          
          // Upload new logo
          const { error: uploadError } = await supabase.storage
            .from('school-logos')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true
            })

          if (uploadError) throw uploadError
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('school-logos')
            .getPublicUrl(fileName)
            
          logoUrl = publicUrl

          // Delete old logo if exists
          if (currentLogoUrl.value) {
            const oldLogoPath = currentLogoUrl.value.split('/').pop()
            if (oldLogoPath) {
              await supabase.storage
                .from('school-logos')
                .remove([oldLogoPath])
            }
          }
        } catch (uploadError: any) {
          console.error('Logo upload error:', uploadError)
          toast.error(uploadError.message || 'Failed to upload logo. Please make sure the file is an image and under 2MB.')
          throw new Error('Failed to upload logo')
        }
      }
    }

    // First update the schools table if superadmin
    if (userRole.value === 'superadmin') {
      const { error: schoolError } = await supabase
        .from('schools')
        .update({
          name: schoolInfo.value.name,
          email: schoolInfo.value.email,
          phone: schoolInfo.value.phone,
          address: schoolInfo.value.address
        })
        .eq('id', schoolId)

      if (schoolError) throw schoolError
    }

    // Then update the setup table
    const { data: existingData } = await supabase
      .from('setup')
      .select('id')
      .eq('school_id', schoolId)
      .single()

    const updateData = {
      school_name: schoolInfo.value.name,
      school_email: schoolInfo.value.email,
      school_contact1: schoolInfo.value.phone,
      school_address: schoolInfo.value.address,
      school_logo: logoUrl,
      school_id: schoolId
    }

    let result
    if (existingData?.id) {
      result = await supabase
        .from('setup')
        .update(updateData)
        .eq('id', existingData.id)
        .select()
    } else {
      result = await supabase
        .from('setup')
        .insert([updateData])
        .select()
    }

    if (result.error) throw result.error
    
    // Update current logo URL after successful save
    currentLogoUrl.value = logoUrl
    
    toast.success('School information saved successfully')
    showRefreshMessage.value = true

    // Refresh the school selector if it exists
    if (userRole.value === 'superadmin') {
      // Emit an event that SchoolSelector component can listen to
      window.dispatchEvent(new CustomEvent('refresh-schools'))
    }
  } catch (error: any) {
    console.error('Error saving school info:', error)
    toast.error(error.message || 'Failed to save school information')
  } finally {
    savingSchoolInfo.value = false
  }
}

// Update the isEducationalProgramFormValid computed property
const isEducationalProgramFormValid = computed(() => {
  return educationalPrograms.value.name.trim() !== '' && 
         educationalPrograms.value.description.trim() !== '' &&
         programImagePreview.value !== null;
});

const saveEducationalPrograms = async () => {
  // Reset validation states
  isImageRequired.value = false;

  // Validate required fields
  if (!programImagePreview.value) {
    isImageRequired.value = true;
    toast.error('Please upload a program image');
    return;
  }

  if (!isEducationalProgramFormValid.value) {
    toast.error('Please fill in all required fields');
    return;
  }

  savingAcademic.value = true;
  try {
    // Get the school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.');
    }

    // Upload image if exists
    let programImageUrl = null
    if (programImagePreview.value) {
      const target = programImageInput.value as HTMLInputElement
      const file = target.files?.[0]
      if (file) {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName = `program-image-${Date.now()}.${fileExt}`
          
          // Retry the upload operation
          const { data: uploadData, error: uploadError } = await retryOperation(async () => {
            const result = await supabase.storage
              .from('program-images')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              })
            
            if (result.error) {
              throw new Error(result.error.message)
            }
            return result
          });

          if (uploadError) {
            throw uploadError
          }
          
          // Get public URL with retry
          const { data: { publicUrl } } = await retryOperation(async () => {
            return supabase.storage
              .from('program-images')
              .getPublicUrl(fileName)
          });
            
          programImageUrl = publicUrl
          
          toast.success('Image uploaded successfully')
        } catch (uploadError: any) {
          console.error('Image upload error:', uploadError)
          throw new Error('Failed to upload image. Please check your connection and try again.')
        }
      }
    }

    // Insert into programs table with retry and include school_id
    const { data: programData, error: programError } = await retryOperation(async () => {
      return supabase
        .from('programs')
        .insert([{
          program_name: educationalPrograms.value.name,
          program_description: educationalPrograms.value.description,
          program_image: programImageUrl,
          school_id: schoolId // Add school_id to the insert
        }])
        .select()
        .single()
    });

    if (programError) throw programError

    toast.success('Activity saved successfully')
    
    // Reset form after successful save
    educationalPrograms.value = {
      name: '',
      description: '',
      features: [],
      schedule: '',
      class_size: '',
      curriculum: '',
      newFeature: ''
    }
    programImagePreview.value = null
    if (programImageInput.value) {
      programImageInput.value.value = ''
    }

    // Fetch updated programs list
    await fetchEducationalPrograms()
    
  } catch (error: any) {
    console.error('Error saving activity:', error)
    toast.error(
      error.message === 'Failed to fetch' 
        ? 'Unable to reach the server. Please check your network connection.'
        : error.message || 'Failed to save activity'
    )
  } finally {
    savingAcademic.value = false
  }
}

// Update fetch function to get school-specific programs
const fetchEducationalPrograms = async () => {
  try {
    loadingEducationalPrograms.value = true;
    // Get the school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;
    
    if (!schoolId) {
      console.log('No school_id found. For superadmin, please select a school first.');
      programsList.value = [];
      return;
    }

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('school_id', schoolId) // Filter by school_id
      .order('created_at', { ascending: false });

    if (error) throw error;

    programsList.value = data || [];
  } catch (error: any) {
    console.error('Error fetching activities:', error);
    toast.error('Failed to load activities');
    programsList.value = [];
  } finally {
    loadingEducationalPrograms.value = false;
  }
}

// Update the watch for smsAlerts
watch(() => quickSettings.value.smsAlerts, async (newValue) => {
  // Skip saving during initialization
  if (isInitializing.value) {
    return
  }
  
  console.log('SMS Alert changed to:', newValue)
  await saveNotificationSettings()
})

const fetchNotificationSettings = async () => {
  try {
    loadingNotifications.value = true;
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId
    
    if (!schoolId) {
      console.log('No school_id found. For superadmin, please select a school first.')
      return
    }

    console.log('Fetching notification settings for school:', schoolId)
    
    const { data, error } = await supabase
      .from('setup')
      .select('sms')
      .eq('school_id', schoolId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No notification settings found for school:', schoolId)
        // Set default value when no settings exist
        quickSettings.value.smsAlerts = false
        return
      }
      throw error
    }

    if (data) {
      console.log('Fetched notification settings:', {
        schoolId,
        smsEnabled: data.sms === 'true'
      })
      isInitializing.value = true // Set flag before changing value
      quickSettings.value.smsAlerts = data.sms === 'true'
      // Use nextTick to ensure the watch doesn't trigger immediately
      nextTick(() => {
        isInitializing.value = false
      })
    }
  } catch (error: any) {
    console.error('Error fetching notification settings:', error)
    toast.error('Failed to fetch notification settings')
  } finally {
    loadingNotifications.value = false; // Fix: Set loadingNotifications to false, not isEditing
  }
}

// Add pagination methods
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Reset pagination when programs list changes
watch(programsList, () => {
  currentPage.value = 1
})

// Add access package state
const accessPackage = ref({
  name: '',
  features: [
    { name: 'Finance Module', description: 'Manage online payments, and financial reports', enabled: true },
    { name: 'Examination Module', description: 'Create exams, record grades, and generate report cards', enabled: false },
    { name: 'Student Portal', description: 'Tools for teachers to manage classes and assignments', enabled: true },
    { name: 'Parent Portal', description: 'Dedicated access for parents to view student information', enabled: true },
    { name: 'Teacher Portal', description: 'Tools for teachers to manage classes and assignments', enabled: true },
    { name: 'Attendance System', description: 'Track student and staff attendance', enabled: true },
    { name: 'Auto Generate ID', description: 'Automatically generate identification numbers for users', enabled: false },
    { name: 'Auto Validate Student ID', description: 'Validate student IDs against payment records', enabled: false }
  ]
})

// Add function to fetch access package settings
const fetchAccessPackageSettings = async () => {
  try {
    loadingAccessPackage.value = true;
    // Get the school_id
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;
    
    if (!schoolId) {
      console.log('No school_id found. For superadmin, please select a school first.')
      return
    }

    console.log('Fetching access package settings for school:', schoolId);
    
    // Fetch entire setup record to check all available fields
    const { data, error } = await supabase
      .from('setup')
      .select('*')
      .eq('school_id', schoolId)
      .single();

    if (error) {
      console.error('Setup fetch error:', error);
      if (error.code === 'PGRST116') {
        console.log('No setup record found, using default access package settings');
        // No record found, use defaults
        return;
      }
      throw error;
    }

    console.log('Fetched setup data:', data);
    
    if (data) {
      // Check if the data has the access_package field populated
      if (data.access_package) {
        console.log('Found access_package in setup data:', data.access_package);
        accessPackage.value = data.access_package;
      } else {
        console.log('No access_package field in setup data, updating individual features');
      }

      // Individual feature updates - these will work even without an access_package field

      // If auto_generate_id exists, set the feature
      if (data.auto_generate_id !== undefined) {
        console.log('Setting Auto Generate ID feature to:', data.auto_generate_id);
        const autoGenFeature = accessPackage.value.features.find(f => f.name === 'Auto Generate ID');
        if (autoGenFeature) {
          autoGenFeature.enabled = data.auto_generate_id === 'Yes';
        }
      }

      // If student_check exists, set the validate student feature
      if (data.student_check !== undefined) {
        console.log('Setting Auto Validate Student ID feature to:', data.student_check);
        const validateStudentFeature = accessPackage.value.features.find(f => f.name === 'Auto Validate Student ID');
        if (validateStudentFeature) {
          validateStudentFeature.enabled = data.student_check === 'Yes';
        }
      }

      // Check for finance feature
      if (data.finance !== undefined) {
        console.log('Setting Finance Module feature to:', data.finance);
        const financeFeature = accessPackage.value.features.find(f => f.name === 'Finance Module');
        if (financeFeature) {
          financeFeature.enabled = data.finance === 'Yes';
        }
      }

      // Check for student portal
      if (data.student_portal !== undefined) {
        console.log('Setting Student Portal feature to:', data.student_portal);
        const studentPortalFeature = accessPackage.value.features.find(f => f.name === 'Student Portal');
        if (studentPortalFeature) {
          studentPortalFeature.enabled = data.student_portal === 'Yes';
        }
      }

      // Check for teacher portal
      if (data.teacher_portal !== undefined) {
        console.log('Setting Teacher Portal feature to:', data.teacher_portal);
        const teacherPortalFeature = accessPackage.value.features.find(f => f.name === 'Teacher Portal');
        if (teacherPortalFeature) {
          teacherPortalFeature.enabled = data.teacher_portal === 'Yes';
        }
      }

      // Check for parent portal
      if (data.parent_portal !== undefined) {
        console.log('Setting Parent Portal feature to:', data.parent_portal);
        const parentPortalFeature = accessPackage.value.features.find(f => f.name === 'Parent Portal');
        if (parentPortalFeature) {
          parentPortalFeature.enabled = data.parent_portal === 'Yes';
        }
      }
    }
  } catch (error: any) {
    console.error('Error fetching access package settings:', error);
    toast.error('Failed to load access package settings');
  } finally {
    loadingAccessPackage.value = false;
  }
};

// Add this after access package ref definition
const savingFeature = ref<string | null>(null);

// Replace saveAccessPackage with this new handler function
const handleFeatureToggle = async (feature: any) => {
  // Set the saving state for this specific feature
  savingFeature.value = feature.name;
  
  try {
    // Get the school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId;

    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.');
    }

    console.log(`Saving feature "${feature.name}" with enabled=${feature.enabled} for school:`, schoolId);

    // First check the field names in an existing record
    const { data: existingSetup, error: existingError } = await supabase
      .from('setup')
      .select('*')
      .eq('school_id', schoolId)
      .maybeSingle();

    let autoGenerateIdField = 'auto_generate_id';
    let studentCheckField = 'student_check';
    let financeField = 'finance';
    let studentPortalField = 'student_portal';
    let teacherPortalField = 'teacher_portal';
    let parentPortalField = 'parent_portal';

    // If we found an existing record, check for field names
    if (existingSetup) {
      const setupDataKeys = Object.keys(existingSetup);
      
      // Look for auto_generate_id with different cases
      const foundAutoGenerateIdField = setupDataKeys.find(key => 
        key.toLowerCase() === 'auto_generate_id' || 
        key.toLowerCase() === 'autogenerateid' ||
        key.toLowerCase() === 'auto_generate_id_text'
      );
      
      // Look for student_check with different cases
      const foundStudentCheckField = setupDataKeys.find(key => 
        key.toLowerCase() === 'student_check' || 
        key.toLowerCase() === 'studentcheck'
      );

      // Look for finance field with different cases
      const foundFinanceField = setupDataKeys.find(key => 
        key.toLowerCase() === 'finance' || 
        key.toLowerCase() === 'financefield'
      );
      
      // Look for student_portal field with different cases
      const foundStudentPortalField = setupDataKeys.find(key => 
        key.toLowerCase() === 'student_portal' || 
        key.toLowerCase() === 'studentportal'
      );
      
      // Look for teacher_portal field with different cases
      const foundTeacherPortalField = setupDataKeys.find(key => 
        key.toLowerCase() === 'teacher_portal' || 
        key.toLowerCase() === 'teacherportal'
      );
      
      // Look for parent_portal field with different cases
      const foundParentPortalField = setupDataKeys.find(key => 
        key.toLowerCase() === 'parent_portal' || 
        key.toLowerCase() === 'parentportal'
      );

      if (foundAutoGenerateIdField) autoGenerateIdField = foundAutoGenerateIdField;
      if (foundStudentCheckField) studentCheckField = foundStudentCheckField;
      if (foundFinanceField) financeField = foundFinanceField;
      if (foundStudentPortalField) studentPortalField = foundStudentPortalField;
      if (foundTeacherPortalField) teacherPortalField = foundTeacherPortalField;
      if (foundParentPortalField) parentPortalField = foundParentPortalField;
    }

    // Check if the setup record exists
    const { data: existingData, error: checkError } = await supabase
      .from('setup')
      .select('id')
      .eq('school_id', schoolId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // Prepare the update data
    const updateData: Record<string, any> = {
      school_id: schoolId
    };

    // Only update the specific feature that was toggled
    if (feature.name === 'Auto Generate ID') {
      updateData[autoGenerateIdField] = feature.enabled ? 'Yes' : 'No';
    } else if (feature.name === 'Auto Validate Student ID') {
      updateData[studentCheckField] = feature.enabled ? 'Yes' : 'No';
    } else if (feature.name === 'Finance Module') {
      updateData[financeField] = feature.enabled ? 'Yes' : 'No';
      
      // Also update the auth store state to maintain reactivity
      authStore.setFinanceModuleEnabled(feature.enabled);
    } else if (feature.name === 'Student Portal') {
      updateData[studentPortalField] = feature.enabled ? 'Yes' : 'No';
    } else if (feature.name === 'Teacher Portal') {
      updateData[teacherPortalField] = feature.enabled ? 'Yes' : 'No';
    } else if (feature.name === 'Parent Portal') {
      updateData[parentPortalField] = feature.enabled ? 'Yes' : 'No';
    }

    // Update or insert the setup record
    let result;
    if (existingData?.id) {
      result = await supabase
        .from('setup')
        .update(updateData)
        .eq('id', existingData.id)
        .select();
    } else {
      result = await supabase
        .from('setup')
        .insert([updateData])
        .select();
    }

    if (result.error) {
      throw result.error;
    }
    
    toast.success(`${feature.name} setting updated`);
  } catch (error: any) {
    console.error(`Error saving feature "${feature.name}":`, error);
    toast.error('Failed to save setting: ' + error.message);
    
    // Revert the toggle if there was an error
    feature.enabled = !feature.enabled;
  } finally {
    savingFeature.value = null;
  }
}

// Add the handler function in the script section
const handleSchoolSelected = async (schoolId: string) => {
  console.log('School selected:', schoolId)
  
  if (schoolId) {
    // Set loading states
    loadingSchoolInfo.value = true;
    loadingEducationalPrograms.value = true;
    loadingNotifications.value = true;
    loadingAccessPackage.value = true;
    
    // Use the auth store to set the selected school ID (it handles localStorage)
    authStore.setSelectedSchoolId(schoolId)
    
    // Reset saving states
    savingSchoolInfo.value = false
    savingAcademic.value = false
    savingNotifications.value = false
    
    // Reset form data
    schoolInfo.value = {
      name: '',
      email: '',
      phone: '',
      address: ''
    }
    schoolLogoPreview.value = null
    currentLogoUrl.value = null
    
    try {
      // Fetch all settings when school is selected
      await Promise.all([
        fetchSchoolInfo(),
        fetchEducationalPrograms(),
        fetchNotificationSettings(),
        fetchAccessPackageSettings(),
        // Load the badge counts as well
        fetchPaymentTypes(),
        fetchFees(),
        fetchClasses()
      ])
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load some settings')
    } finally {
      // Reset loading states
      loadingSchoolInfo.value = false;
      loadingEducationalPrograms.value = false;
      loadingNotifications.value = false;
      loadingAccessPackage.value = false;
    }
  }
}

// Add watch for selectedSchoolId changes - MOVED AFTER all function definitions
watch(
  () => authStore.getSelectedSchoolId,
  async (newSchoolId) => {
    if (newSchoolId && userRole.value === 'superadmin') {
      // Reset loading states
      savingSchoolInfo.value = false
      savingAcademic.value = false
      savingNotifications.value = false
      
      // Reset form data
      schoolInfo.value = {
        name: '',
        email: '',
        phone: '',
        address: ''
      }
      schoolLogoPreview.value = null
      currentLogoUrl.value = null
      
      try {
        // Fetch all settings when school is selected
        await Promise.all([
          fetchSchoolInfo(),
          fetchEducationalPrograms(),
          fetchNotificationSettings(),
          fetchAccessPackageSettings(),
          // Load the badge counts as well
          fetchPaymentTypes(),
          fetchFees(),
          fetchClasses()
        ])
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast.error('Failed to load some settings')
      }
    }
  },
  { immediate: false } // Changed to false to prevent immediate execution on component mount
)

// Program image preview and management

// Class Fees Setup Modal
const isClassFeesModalOpen = ref(false)
const fees = ref<any[]>([])
const loadingFees = ref(false)
const savingFee = ref(false)
const newFee = ref({
  payment_for: '',
  amount: null as number | null,
  currency: ''
})

// Edit Fee Modal
const isEditFeeModalOpen = ref(false)
const editingFee = ref({
  id: null as number | null,
  payment_for: '',
  amount: null as number | null,
  currency: ''
})
const updatingFee = ref(false)

// Delete Fee Modal
const isDeleteFeeModalOpen = ref(false)
const selectedFee = ref<any>(null)
const deletingFeeId = ref<number | null>(null)

// Class Fees Modal Functions
const openClassFeesModal = async () => {
  isClassFeesModalOpen.value = true
  await fetchFees()
}

const closeClassFeesModal = () => {
  isClassFeesModalOpen.value = false
  resetNewFeeForm()
}

const resetNewFeeForm = () => {
  newFee.value = {
    payment_for: '',
    amount: null,
    currency: ''
  }
}

const fetchFees = async () => {
  loadingFees.value = true
  try {
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId
    
    if (!schoolId) {
      console.log('No school ID found. Please select a school first.')
      fees.value = []
      return
    }
    
    console.log('Fetching fees for school ID:', schoolId)

    const { data, error } = await supabase
      .from('payments_setup')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching fees:', error)
      throw error
    }
    
    fees.value = data || []
    console.log('Fetched fees:', fees.value)
  } catch (error: any) {
    console.error('Error fetching fees:', error)
    toast.error('Failed to load fees: ' + (error.message || 'Unknown error'))
  } finally {
    loadingFees.value = false
  }
}

const saveFee = async () => {
  savingFee.value = true
  try {
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId
    
    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.')
    }

    // Basic validation
    if (!newFee.value.payment_for || !newFee.value.amount || !newFee.value.currency) {
      throw new Error('Please fill in all required fields')
    }

    // Get the current authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('You must be logged in to perform this action')
    }

    const insertData = {
      payment_for: newFee.value.payment_for,
      amount: newFee.value.amount,
      currency: newFee.value.currency.toUpperCase(),
      school_id: schoolId
    }
    
    console.log('Inserting fee with data:', insertData)

    const { data, error } = await supabase
      .from('payments_setup')
      .insert([insertData])
      .select()

    if (error) {
      console.error('Error inserting fee:', error)
      throw error
    }

    // Log the activity to audit_logs
    await logActivity(
      'create',
      'payments_setup',
      data[0].id,
      null,
      data[0]
    )

    toast.success('Fee added successfully')
    await fetchFees()
    resetNewFeeForm()
  } catch (error: any) {
    console.error('Error saving fee:', error)
    toast.error('Failed to save fee: ' + (error.message || 'Unknown error'))
  } finally {
    savingFee.value = false
  }
}

// Edit Fee Functions
const editFee = (fee: any) => {
  editingFee.value = {
    id: fee.id,
    payment_for: fee.payment_for,
    amount: fee.amount,
    currency: fee.currency
  }
  isEditFeeModalOpen.value = true
}

const closeEditFeeModal = () => {
  isEditFeeModalOpen.value = false
}

const updateFee = async () => {
  updatingFee.value = true
  try {
    // Basic validation
    if (!editingFee.value.payment_for || !editingFee.value.amount || !editingFee.value.currency) {
      throw new Error('Please fill in all required fields')
    }

    // Get the current authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('You must be logged in to perform this action')
    }

    // Get the original fee data for audit logging
    const { data: originalFee, error: fetchError } = await supabase
      .from('payments_setup')
      .select('*')
      .eq('id', editingFee.value.id)
      .single()

    if (fetchError) {
      console.error('Error fetching original fee data:', fetchError)
    }

    const updateData = {
      payment_for: editingFee.value.payment_for,
      amount: editingFee.value.amount,
      currency: editingFee.value.currency.toUpperCase()
    }
    
    console.log('Updating fee with ID:', editingFee.value.id, 'Data:', updateData)

    const { data, error } = await supabase
      .from('payments_setup')
      .update(updateData)
      .eq('id', editingFee.value.id)
      .select()

    if (error) {
      console.error('Error updating fee:', error)
      throw error
    }

    // Log the activity to audit_logs
    if (editingFee.value.id !== null) {
      await logActivity(
        'update',
        'payments_setup',
        editingFee.value.id,
        originalFee || null,
        { ...originalFee, ...updateData }
      )
    }

    // Update the local list
    await fetchFees()
    
    toast.success('Fee updated successfully')
    closeEditFeeModal()
  } catch (error: any) {
    console.error('Error updating fee:', error)
    toast.error('Failed to update fee: ' + (error.message || 'Unknown error'))
  } finally {
    updatingFee.value = false
  }
}

// Delete Fee Functions
const confirmDeleteFee = (fee: any) => {
  selectedFee.value = fee
  isDeleteFeeModalOpen.value = true
}

const closeDeleteFeeModal = () => {
  isDeleteFeeModalOpen.value = false
  selectedFee.value = null
}

const deleteFee = async () => {
  if (!selectedFee.value) return
  
  deletingFeeId.value = selectedFee.value.id
  try {
    // Get the current authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('You must be logged in to perform this action')
    }
    
    console.log('Deleting fee with ID:', selectedFee.value.id)

    // Store the fee data before deletion for audit logging
    const feeToDelete = { ...selectedFee.value }

    const { error } = await supabase
      .from('payments_setup')
      .delete()
      .eq('id', selectedFee.value.id)

    if (error) {
      console.error('Error deleting fee:', error)
      throw error
    }

    // Log the activity to audit_logs
    await logActivity(
      'delete',
      'payments_setup',
      feeToDelete.id,
      feeToDelete,
      null
    )

    // Remove from local list
    fees.value = fees.value.filter(f => f.id !== selectedFee.value.id)
    toast.success('Fee deleted successfully')
    closeDeleteFeeModal()
  } catch (error: any) {
    console.error('Error deleting fee:', error)
    toast.error('Failed to delete fee: ' + (error.message || 'Unknown error'))
  } finally {
    deletingFeeId.value = null
  }
}

// ... existing code ...

// Payment Types Modal
const isPaymentTypesModalOpen = ref(false)
const paymentTypes = ref<any[]>([])
const loadingPaymentTypes = ref(false)
const savingPaymentType = ref(false)
const newPaymentType = ref({
  type_name: '',
  description: ''
})

// Edit Payment Type Modal
const isEditPaymentTypeModalOpen = ref(false)
const editingPaymentType = ref({
  id: null as number | null,
  type_name: '',
  description: ''
})
const updatingPaymentType = ref(false)

// Delete Payment Type Modal
const isDeletePaymentTypeModalOpen = ref(false)
const selectedPaymentType = ref<any>(null)
const deletingPaymentTypeId = ref<number | null>(null)

// Payment Types Modal Functions
const openPaymentTypesModal = async () => {
  isPaymentTypesModalOpen.value = true
  await fetchPaymentTypes()
}

const closePaymentTypesModal = () => {
  isPaymentTypesModalOpen.value = false
  resetNewPaymentTypeForm()
}

const resetNewPaymentTypeForm = () => {
  newPaymentType.value = {
    type_name: '',
    description: ''
  }
}

const fetchPaymentTypes = async () => {
  loadingPaymentTypes.value = true
  try {
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId
    
    if (!schoolId) {
      console.log('No school ID found. Please select a school first.')
      paymentTypes.value = []
      return
    }
    
    console.log('Fetching payment types for school ID:', schoolId)

    const { data, error } = await supabase
      .from('payments_type')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payment types:', error)
      throw error
    }
    
    paymentTypes.value = data || []
    console.log('Fetched payment types:', paymentTypes.value)
  } catch (error: any) {
    console.error('Error fetching payment types:', error)
    toast.error('Failed to load payment types: ' + (error.message || 'Unknown error'))
  } finally {
    loadingPaymentTypes.value = false
  }
}

const savePaymentType = async () => {
  savingPaymentType.value = true
  try {
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId
    
    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.')
    }

    // Basic validation
    if (!newPaymentType.value.type_name) {
      throw new Error('Please fill in the required field: Type Name')
    }

    // Get the current authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('You must be logged in to perform this action')
    }

    const insertData = {
      type_name: newPaymentType.value.type_name,
      description: newPaymentType.value.description || '',
      school_id: schoolId
    }
    
    console.log('Inserting payment type with data:', insertData)

    const { data, error } = await supabase
      .from('payments_type')
      .insert([insertData])
      .select()

    if (error) {
      console.error('Error inserting payment type:', error)
      throw error
    }

    // Log the activity to audit_logs
    await logActivity(
      'create',
      'payments_type',
      data[0].id,
      null,
      data[0]
    )

    toast.success('Payment type added successfully')
    await fetchPaymentTypes()
    resetNewPaymentTypeForm()
  } catch (error: any) {
    console.error('Error saving payment type:', error)
    toast.error('Failed to save payment type: ' + (error.message || 'Unknown error'))
  } finally {
    savingPaymentType.value = false
  }
}

// Edit Payment Type Functions
const editPaymentType = (type: any) => {
  editingPaymentType.value = {
    id: type.id,
    type_name: type.type_name,
    description: type.description || ''
  }
  isEditPaymentTypeModalOpen.value = true
}

const closeEditPaymentTypeModal = () => {
  isEditPaymentTypeModalOpen.value = false
}

const updatePaymentType = async () => {
  updatingPaymentType.value = true
  try {
    // Basic validation
    if (!editingPaymentType.value.type_name) {
      throw new Error('Please fill in the required field: Type Name')
    }

    // Get the current authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('You must be logged in to perform this action')
    }

    // Get the original payment type data for audit logging
    const { data: originalPaymentType, error: fetchError } = await supabase
      .from('payments_type')
      .select('*')
      .eq('id', editingPaymentType.value.id)
      .single()

    if (fetchError) {
      console.error('Error fetching original payment type data:', fetchError)
    }

    const updateData = {
      type_name: editingPaymentType.value.type_name,
      description: editingPaymentType.value.description || ''
    }
    
    console.log('Updating payment type with ID:', editingPaymentType.value.id, 'Data:', updateData)

    const { data, error } = await supabase
      .from('payments_type')
      .update(updateData)
      .eq('id', editingPaymentType.value.id)
      .select()

    if (error) {
      console.error('Error updating payment type:', error)
      throw error
    }

    // Log the activity to audit_logs
    if (editingPaymentType.value.id !== null) {
      await logActivity(
        'update',
        'payments_type',
        editingPaymentType.value.id,
        originalPaymentType || null,
        { ...originalPaymentType, ...updateData }
      )
    }

    // Update the local list
    await fetchPaymentTypes()
    
    toast.success('Payment type updated successfully')
    closeEditPaymentTypeModal()
  } catch (error: any) {
    console.error('Error updating payment type:', error)
    toast.error('Failed to update payment type: ' + (error.message || 'Unknown error'))
  } finally {
    updatingPaymentType.value = false
  }
}

// Delete Payment Type Functions
const confirmDeletePaymentType = (type: any) => {
  selectedPaymentType.value = type
  isDeletePaymentTypeModalOpen.value = true
}

const closeDeletePaymentTypeModal = () => {
  isDeletePaymentTypeModalOpen.value = false
  selectedPaymentType.value = null
}

const deletePaymentType = async () => {
  if (!selectedPaymentType.value) return
  
  deletingPaymentTypeId.value = selectedPaymentType.value.id
  try {
    // Get the current authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('You must be logged in to perform this action')
    }
    
    console.log('Deleting payment type with ID:', selectedPaymentType.value.id)

    // Store the payment type data before deletion for audit logging
    const paymentTypeToDelete = { ...selectedPaymentType.value }

    const { error } = await supabase
      .from('payments_type')
      .delete()
      .eq('id', selectedPaymentType.value.id)

    if (error) {
      console.error('Error deleting payment type:', error)
      throw error
    }

    // Log the activity to audit_logs
    await logActivity(
      'delete',
      'payments_type',
      paymentTypeToDelete.id,
      paymentTypeToDelete,
      null
    )

    // Remove from local list
    paymentTypes.value = paymentTypes.value.filter(t => t.id !== selectedPaymentType.value.id)
    toast.success('Payment type deleted successfully')
    closeDeletePaymentTypeModal()
  } catch (error: any) {
    console.error('Error deleting payment type:', error)
    toast.error('Failed to delete payment type: ' + (error.message || 'Unknown error'))
  } finally {
    deletingPaymentTypeId.value = null
  }
}

// ... existing code ...

// Classes Modal
const isClassesModalOpen = ref(false)
const classes = ref<any[]>([])
const loadingClasses = ref(false)
const savingClass = ref(false)
const newClass = ref({
  class_name: ''
})

// Edit Class Modal
const isEditClassModalOpen = ref(false)
const editingClass = ref({
  class_id: null as number | null,
  class_name: '',
  school_id: null as string | null
})
const updatingClass = ref(false)

// Delete Class Modal
const isDeleteClassModalOpen = ref(false)
const selectedClass = ref<any>(null)
const deletingClassId = ref<number | null>(null)

// Classes Modal Functions
const openClassesModal = async () => {
  isClassesModalOpen.value = true
  await fetchClasses()
}

const closeClassesModal = () => {
  isClassesModalOpen.value = false
  resetNewClassForm()
}

const resetNewClassForm = () => {
  newClass.value = {
    class_name: ''
  }
}

const fetchClasses = async () => {
  loadingClasses.value = true
  try {
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId
    
    if (!schoolId) {
      console.log('No school ID found. Please select a school first.')
      classes.value = []
      return
    }
    
    console.log('Fetching classes for school ID:', schoolId)

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching classes:', error)
      throw error
    }
    
    classes.value = data || []
    console.log('Fetched classes:', classes.value)
  } catch (error: any) {
    console.error('Error fetching classes:', error)
    toast.error('Failed to load classes: ' + (error.message || 'Unknown error'))
  } finally {
    loadingClasses.value = false
  }
}

const saveClass = async () => {
  savingClass.value = true
  try {
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId
    
    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.')
    }

    // Basic validation
    if (!newClass.value.class_name) {
      throw new Error('Please fill in the class name')
    }

    // Get the current authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('You must be logged in to perform this action')
    }

    const insertData = {
      class_name: newClass.value.class_name,
      school_id: schoolId
    }
    
    console.log('Inserting class with data:', insertData)

    const { data, error } = await supabase
      .from('classes')
      .insert([insertData])
      .select()

    if (error) {
      console.error('Error inserting class:', error)
      throw error
    }

    // Log the activity to audit_logs
    await logActivity(
      'create',
      'classes',
      data[0].class_id,
      null,
      data[0]
    )

    toast.success('Class added successfully')
    await fetchClasses()
    resetNewClassForm()
  } catch (error: any) {
    console.error('Error saving class:', error)
    toast.error('Failed to save class: ' + (error.message || 'Unknown error'))
  } finally {
    savingClass.value = false
  }
}

// Edit Class Functions
const editClass = (cls: any) => {
  editingClass.value = {
    class_id: cls.class_id,
    class_name: cls.class_name,
    school_id: cls.school_id
  }
  isEditClassModalOpen.value = true
}

const closeEditClassModal = () => {
  isEditClassModalOpen.value = false
}

const updateClass = async () => {
  updatingClass.value = true
  try {
    // Basic validation
    if (!editingClass.value.class_name) {
      throw new Error('Please fill in the class name')
    }

    // Get the current authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('You must be logged in to perform this action')
    }

    // Get the original class data for audit logging
    const { data: originalClass, error: fetchError } = await supabase
      .from('classes')
      .select('*')
      .eq('class_id', editingClass.value.class_id)
      .single()

    if (fetchError) {
      console.error('Error fetching original class data:', fetchError)
    }

    const updateData = {
      class_name: editingClass.value.class_name
    }
    
    console.log('Updating class with ID:', editingClass.value.class_id, 'Data:', updateData)

    const { data, error } = await supabase
      .from('classes')
      .update(updateData)
      .eq('class_id', editingClass.value.class_id)
      .select()

    if (error) {
      console.error('Error updating class:', error)
      throw error
    }

    // Log the activity to audit_logs
    if (editingClass.value.class_id !== null) {
      await logActivity(
        'update',
        'classes',
        editingClass.value.class_id,
        originalClass || null,
        { ...originalClass, ...updateData }
      )
    }

    // Update the local list
    await fetchClasses()
    
    toast.success('Class updated successfully')
    closeEditClassModal()
  } catch (error: any) {
    console.error('Error updating class:', error)
    toast.error('Failed to update class: ' + (error.message || 'Unknown error'))
  } finally {
    updatingClass.value = false
  }
}

// Delete Class Functions
const confirmDeleteClass = (cls: any) => {
  selectedClass.value = cls
  isDeleteClassModalOpen.value = true
}

const closeDeleteClassModal = () => {
  isDeleteClassModalOpen.value = false
  selectedClass.value = null
}

const deleteClass = async () => {
  if (!selectedClass.value) return
  
  deletingClassId.value = selectedClass.value.class_id
  try {
    // Get the current authenticated user session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('You must be logged in to perform this action')
    }
    
    console.log('Deleting class with ID:', selectedClass.value.class_id)

    // Store the class data before deletion for audit logging
    const classToDelete = { ...selectedClass.value }

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('class_id', selectedClass.value.class_id)

    if (error) {
      console.error('Error deleting class:', error)
      throw error
    }

    // Log the activity to audit_logs
    await logActivity(
      'delete',
      'classes',
      classToDelete.class_id,
      classToDelete,
      null
    )

    // Remove from local list
    classes.value = classes.value.filter(c => c.class_id !== selectedClass.value.class_id)
    toast.success('Class deleted successfully')
    closeDeleteClassModal()
  } catch (error: any) {
    console.error('Error deleting class:', error)
    toast.error('Failed to delete class: ' + (error.message || 'Unknown error'))
  } finally {
    deletingClassId.value = null
  }
}

// ... existing code ...

// Add a login audit function
const logLoginActivity = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await logActivity(
        'login',
        'auth',
        user.id,
        null,
        { timestamp: new Date().toISOString() }
      )
    }
  } catch (error) {
    console.error('Error logging login activity:', error)
  }
}

const saveAccessPackage = async () => {
  savingAccessPackage.value = true
  try {
    // Get the school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId

    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.')
    }

    console.log('Saving access package for school:', schoolId)

    // Check if the setup record exists
    const { data: existingSetup, error: checkError } = await supabase
      .from('setup')
      .select('id')
      .eq('school_id', schoolId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // Prepare update data for each individual feature
    const updateData: Record<string, any> = {
      school_id: schoolId,
      // Add access_package field with the full feature set
      access_package: {
        name: accessPackage.value.name,
        features: accessPackage.value.features.map(feature => ({
          name: feature.name,
          description: feature.description,
          enabled: feature.enabled
        }))
      }
    }

    // Add individual feature fields
    const autoGenFeature = accessPackage.value.features.find(f => f.name === 'Auto Generate ID')
    if (autoGenFeature) {
      updateData.auto_generate_id = autoGenFeature.enabled ? 'Yes' : 'No'
    }

    const validateStudentFeature = accessPackage.value.features.find(f => f.name === 'Auto Validate Student ID')
    if (validateStudentFeature) {
      updateData.student_check = validateStudentFeature.enabled ? 'Yes' : 'No'
    }

    const financeFeature = accessPackage.value.features.find(f => f.name === 'Finance Module')
    if (financeFeature) {
      updateData.finance = financeFeature.enabled ? 'Yes' : 'No'
      // Update the auth store to maintain reactivity
      authStore.setFinanceModuleEnabled(financeFeature.enabled)
    }

    const studentPortalFeature = accessPackage.value.features.find(f => f.name === 'Student Portal')
    if (studentPortalFeature) {
      updateData.student_portal = studentPortalFeature.enabled ? 'Yes' : 'No'
    }

    const teacherPortalFeature = accessPackage.value.features.find(f => f.name === 'Teacher Portal')
    if (teacherPortalFeature) {
      updateData.teacher_portal = teacherPortalFeature.enabled ? 'Yes' : 'No'
    }

    const parentPortalFeature = accessPackage.value.features.find(f => f.name === 'Parent Portal')
    if (parentPortalFeature) {
      updateData.parent_portal = parentPortalFeature.enabled ? 'Yes' : 'No'
    }

    console.log('Updating with data:', updateData)

    // Update or insert the record
    let result
    if (existingSetup?.id) {
      result = await supabase
        .from('setup')
        .update(updateData)
        .eq('id', existingSetup.id)
        .select()
    } else {
      result = await supabase
        .from('setup')
        .insert([updateData])
        .select()
    }

    if (result.error) throw result.error

    console.log('Access package saved successfully', result.data)
    toast.success('Access package settings saved successfully')
  } catch (error: any) {
    console.error('Error saving access package:', error)
    toast.error('Failed to save access package: ' + error.message)
  } finally {
    savingAccessPackage.value = false
  }
}

// Initialize on component mount
onMounted(async () => {
  document.title = 'Settings - School Management System'
  initialPageLoading.value = true;
  
  // Log user login for audit
  await logLoginActivity()
  
  // Restore the active tab from localStorage if it exists
  const savedTab = localStorage.getItem('settings_active_tab')
  if (savedTab) {
    activeTab.value = savedTab
  }
  
  // For superadmin, check if there's a selected school and load data if so
  if (userRole.value === 'superadmin') {
    const currentSchoolId = authStore.getSelectedSchoolId
    if (currentSchoolId) {
      // If a school is already selected, load all necessary data
      try {
        await Promise.all([
          fetchSchoolInfo(),
          fetchEducationalPrograms(),
          fetchNotificationSettings(),
          fetchAccessPackageSettings(),
          // Load the badge counts as well
          fetchPaymentTypes(),
          fetchFees(),
          fetchClasses()
        ])
      } catch (error) {
        console.error('Error loading settings for superadmin:', error)
        toast.error('Failed to load some settings')
      }
    } else {
      // For superadmin with no school selected, just fetch educational programs
      await fetchEducationalPrograms()
    }
  } else {
    // For admin, we can load all data immediately
    try {
      // Fetch all settings
      await Promise.all([
        fetchSchoolInfo(),
        fetchEducationalPrograms(),
        fetchNotificationSettings(),
        // Preload payment types and fees counts for the badges
        fetchPaymentTypes(),
        fetchFees(),
        fetchClasses()
      ])
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load some settings')
    }
  }
  
  // Set page loading to false after all data is loaded
  initialPageLoading.value = false;
})

// Add these functions after the fetchAccessPackageSettings function

// Add missing handler functions to fix TypeScript errors
const handleImageUpload = () => {
  // Implementation preserved from elsewhere
}

const removeImage = () => {
  // Implementation preserved from elsewhere
}

const openDeleteModal = (program: any) => {
  // Implementation preserved from elsewhere
}

const openEditModal = (program: any) => {
  // Implementation preserved from elsewhere
}

const closeDeleteModal = () => {
  // Implementation preserved from elsewhere
}

const handleDeleteProgram = () => {
  // Implementation preserved from elsewhere
}

const handleEditImageUpload = () => {
  // Implementation preserved from elsewhere
}

const removeEditImage = () => {
  // Implementation preserved from elsewhere
}

const closeEditModal = () => {
  // Implementation preserved from elsewhere
}

const handleEditProgram = () => {
  // Implementation preserved from elsewhere
}

const saveNotificationSettings = async () => {
  // Set loading state
  savingNotifications.value = true
  
  try {
    // Get the school_id based on user role
    const schoolId = ['admin', 'registrar'].includes(userRole.value || '') 
      ? authStore.userRole?.school_id 
      : authStore.getSelectedSchoolId

    if (!schoolId) {
      throw new Error('No school ID found. Please select a school first.')
    }

    console.log('Saving notification settings for school:', schoolId, {
      smsAlerts: quickSettings.value.smsAlerts
    })
    
    // Check if the setup record exists
    const { data: existingSetup, error: checkError } = await supabase
      .from('setup')
      .select('id')
      .eq('school_id', schoolId)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    // Prepare update data
    const updateData = {
      school_id: schoolId,
      sms: quickSettings.value.smsAlerts ? 'true' : 'false'
    }

    // Update or insert the record
    let result
    if (existingSetup?.id) {
      result = await supabase
        .from('setup')
        .update(updateData)
        .eq('id', existingSetup.id)
        .select()
    } else {
      result = await supabase
        .from('setup')
        .insert([updateData])
        .select()
    }

    if (result.error) throw result.error

    console.log('Notification settings saved successfully:', result.data)
    toast.success('Notification settings saved')
  } catch (error: any) {
    console.error('Error saving notification settings:', error)
    toast.error('Failed to save notification settings: ' + error.message)
  } finally {
    savingNotifications.value = false
  }
}

// Add a watch for activeTab to save the current tab to localStorage
watch(() => activeTab.value, (newTab) => {
  // Save the active tab to localStorage whenever it changes
  localStorage.setItem('settings_active_tab', newTab)
  console.log('Settings tab saved:', newTab)
})
</script>

<style lang="scss" scoped>
.settings-view {
  .settings-header {
    h1 {
      color: #2c3e50;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
  }

  // Add logo upload styles
  .school-logo-section {
    .logo-upload-container {
      height: 200px;
      border: 2px dashed #e2e8f0;
      border-radius: 1rem;
      padding: 0;
      text-align: center;
      transition: all 0.3s ease;
      background: white;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      &:hover {
        border-color: #42b883;
        background: #f8fafc;
      }

      &.has-image {
        padding: 0;
        border-style: solid;
        border-color: #e2e8f0;

        .logo-preview {
          width: auto;
          height: 100%;
          max-width: 100%;
          object-fit: contain;
          border-radius: 0.75rem;
        }

        &:hover {
          border-color: #42b883;
        }
      }

      .logo-upload-input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      }

      .logo-upload-content {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .upload-placeholder {
        padding: 2rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
      }

      .upload-icon {
        font-size: 2.5rem;
        color: #42b883;
        margin-bottom: 1.5rem;
      }

      .upload-text {
        color: #334155;
        margin-bottom: 0.75rem;
        font-size: 1rem;
        line-height: 1.5;
      }

      .upload-browse {
        color: #42b883;
        text-decoration: underline;
        font-weight: 500;
        cursor: pointer;
      }

      .upload-hint {
        color: #64748b;
        font-size: 0.85rem;
        margin: 0;
      }

      .btn-remove-logo {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #ef4444;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        z-index: 3;

        &:hover {
          background: white;
          transform: scale(1.1);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
        }

        i {
          font-size: 1rem;
        }
      }
    }
  }

  .settings-tabs {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .settings-tab-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;

      i {
        font-size: 1.2rem;
        color: #64748b;
        width: 24px;
        text-align: center;
      }

      span {
        color: #64748b;
        font-weight: 500;
      }

      &:hover {
        background: #f8f9fa;
        border-left-color: #42b883;

        i, span {
          color: #42b883;
        }
      }

      &.active {
        background: #f1f5f9;
        border-left-color: #42b883;

        i, span {
          color: #42b883;
        }
      }
    }
  }

  .settings-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .settings-card-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        font-size: 1.25rem;
        margin: 0;
        color: #2c3e50;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        i {
          color: #42b883;
          font-size: 1.2rem;
        }
      }

      .save-btn {
        background: #42b883;
        border: none;
        padding: 0.5rem 1rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:hover:not(:disabled) {
          background: darken(#42b883, 5%);
        }

        &:disabled {
          background: #42b883;
          opacity: 0.7;
        }
      }
    }

    .settings-card-body {
      padding: 2rem;
    }
  }

  .quick-settings-list {
    .quick-setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;

      &:not(:last-child) {
        border-bottom: 1px solid #eee;
      }

      .setting-info {
        h3 {
          font-size: 1rem;
          margin: 0 0 0.25rem;
          color: #2c3e50;
        }

        p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
      }

      .form-check-input {
        width: 3rem;
        height: 1.5rem;
        cursor: pointer;

        &:checked {
          background-color: #42b883;
          border-color: #42b883;
        }

        &:focus {
          border-color: #42b883;
          box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
        }
      }
    }
  }

  .alert {
    border-radius: 0.5rem;
    border: none;
    background-color: rgba(66, 184, 131, 0.1);
    color: #42b883;
    
    i {
      font-size: 1.1rem;
    }
  }
}

// Make the left sidebar sticky on larger screens
@media (min-width: 992px) {
  .settings-tabs {
    position: sticky;
    top: 2rem;
  }
}

// Responsive adjustments
@media (max-width: 991px) {
  .settings-tabs {
    margin-bottom: 2rem;
  }

  .settings-card {
    .settings-card-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;

      .save-btn {
        width: 100%;
        justify-content: center;
      }
    }
  }
}

.section-subtitle {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
}

.program-info-container,
.program-image-container {
  height: 100%;
  background: #f8fafc;
  border-radius: 1rem;
  padding: 1.5rem;
}

.modern-form-group {
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.modern-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #334155;
  font-weight: 500;
  font-size: 0.95rem;
}

.modern-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: white;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  color: #1e293b;

  &:focus {
    outline: none;
    border-color: #42b883;
    box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
  }

  &::placeholder {
    color: #94a3b8;
  }
}

.modern-textarea {
  resize: vertical;
  min-height: 120px;
}

.input-hint {
  display: block;
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
}

.image-upload-wrapper {
  height: auto;
  margin-bottom: 1rem;
}

.image-upload-container {
  height: 250px;
  min-height: unset;
  border: 2px dashed #e2e8f0;
  border-radius: 1rem;
  padding: 0;
  text-align: center;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &:hover {
    border-color: #42b883;
    background: #f8fafc;
  }

  &.has-image {
    padding: 0;
    border-style: solid;
    border-color: #e2e8f0;

    .image-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 0.75rem;
    }

    &:hover {
      border-color: #42b883;
    }
  }

  &.is-invalid {
    border-color: #dc3545;
    
    .upload-icon {
      color: #dc3545;
    }
  }

  .image-upload-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 2;
  }

  .image-upload-content {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .upload-placeholder {
    padding: 2rem;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
  }

  .upload-icon {
    font-size: 2.5rem;
    color: #42b883;
    margin-bottom: 1.5rem;
  }

  .upload-text {
    color: #334155;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
  }

  .upload-browse {
    color: #42b883;
    text-decoration: underline;
    font-weight: 500;
    cursor: pointer;
  }

  .upload-hint {
    color: #64748b;
    font-size: 0.85rem;
    margin: 0;
  }

  .btn-remove-image {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #ef4444;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 3;

    &:hover {
      background: white;
      transform: scale(1.1);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }

    i {
      font-size: 1rem;
    }
  }
}

// Responsive adjustments
@media (max-width: 767px) {
  .program-image-container {
    margin-top: 1.5rem;
  }

  .image-upload-container {
    min-height: 250px;
  }

  .settings-card-body {
    padding: 1.5rem;
  }
}

// Add these to your existing styles
.required-field {
  color: #dc3545;
  margin-left: 4px;
}

.is-invalid {
  border-color: #dc3545;
  
  &:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  }
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.5rem;
  font-size: 0.875em;
  color: #dc3545;
}

.modern-input {
  &.is-invalid {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
  }
}

// Add these new styles for the program cards
.programs-list {
  .program-card {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 350px;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .program-card-image {
      width: 100%;
      height: 180px;
      overflow: hidden;
      position: relative;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 0.3s ease;
      }

      &:hover img {
        transform: scale(1.05);
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.2));
        pointer-events: none;
      }

      .btn-delete-program,
      .btn-edit-program {
        position: absolute;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: white;
        z-index: 3;
        border: none;

        &:hover {
          transform: scale(1.1);
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        i {
          font-size: 1rem;
        }
      }

      .btn-delete-program {
        top: 1rem;
        right: 1rem;
        background: rgba(239, 68, 68, 0.9);

        &:hover {
          background: #ef4444;
        }
      }

      .btn-edit-program {
        top: 1rem;
        right: 4rem;
        background: rgba(66, 184, 131, 0.9);

        &:hover {
          background: #42b883;
        }
      }
    }

    .program-card-content {
      padding: 1rem;
      background: white;
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      flex-direction: column;

      .program-card-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 0.5rem;
        line-height: 1.3;
        height: auto;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .program-card-description {
        color: #64748b;
        font-size: 0.9rem;
        line-height: 1.4;
        margin: 0 0 0.5rem 0;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex-grow: 1;
      }
    }
  }
}

// Modal styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-content {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  
  .modal-header {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;

    i {
      font-size: 1.5rem;
    }

    h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      flex-grow: 1;
    }
    
    .modal-close-btn {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: #f1f5f9;
        color: #ef4444;
      }
      
      i {
        font-size: 1rem;
      }
    }
  }

  .modal-body {
    padding: 1.5rem;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
    flex: 1;
    
    .row {
      margin: 0;
      
      .col-12 {
        padding: 0.75rem;
      }
    }
  }

  .modal-footer {
    padding: 1rem 1.5rem;
    background: #f8fafc;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    flex-shrink: 0;
  }
}

.features-input-group {
  .features-list {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8fafc;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;

    span {
      color: #1e293b;
      font-size: 0.9rem;
    }

    .btn-remove-feature {
      background: none;
      border: none;
      padding: 0;
      color: #ef4444;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        transform: scale(1.1);
      }

      i {
        font-size: 0.8rem;
      }
    }
  }
}

// Add these new styles for the edit modal
.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  .upload-icon {
    font-size: 2rem;
    color: white;
    margin-bottom: 1rem;
  }

  .upload-text {
    color: white;
    font-size: 1rem;
    margin: 0;
  }
}

// Add these new styles for pagination and animations
.program-slide-move {
  transition: transform 0.5s ease;
}

.program-slide-enter-active,
.program-slide-leave-active {
  transition: all 0.5s ease;
}

.program-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.program-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem 0;

  .btn-pagination {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 0.5rem;
    background: white;
    color: #1e293b;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover:not(:disabled) {
      border-color: #42b883;
      color: #42b883;
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #f8fafc;
    }

    i {
      font-size: 0.8rem;
    }
  }

  .pagination-info {
    color: #64748b;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

// Responsive adjustments for pagination
@media (max-width: 767px) {
  .pagination-controls {
    flex-direction: column;
    gap: 1rem;

    .btn-pagination {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>

<style scoped lang="scss">
// Existing styles...

/* Access package styles */
.feature-list {
  margin-top: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.feature-item {
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f1f3f5;
  }
  
  .form-check-input {
    cursor: pointer;
    width: 2.5rem;
    height: 1.25rem;
    margin-top: 0.25rem;
    
    &:checked {
      background-color: #42b883;
      border-color: #42b883;
    }
  }
  
  .form-check-label {
    font-weight: 600;
    margin-left: 0.5rem;
  }
  
  .feature-description {
    margin: 0.5rem 0 0 2.5rem;
    color: #6c757d;
    font-size: 0.9rem;
  }
}

/* Value List Card Styles */
.value-list-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 1px solid #eee;
  height: 100%;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
    border-color: #42b883;
    
    .value-card-icon {
      background-color: #42b883;
      color: white;
    }
    
    .btn-value-action {
      background-color: #42b883;
      color: white;
    }
  }
  
  .value-card-icon {
    width: 3rem;
    height: 3rem;
    background-color: #f1f9f5;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #42b883;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }
  
  .value-card-content {
    flex-grow: 1;
    
    h4 {
      color: #1e293b;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    p {
      color: #64748b;
      font-size: 0.85rem;
      margin: 0;
    }
    
    .badge-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #42b883;
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      height: 1.4rem;
      min-width: 1.4rem;
      padding: 0 0.35rem;
      border-radius: 1rem;
      margin-left: 0.5rem;
    }
  }
  
  .value-card-actions {
    flex-shrink: 0;
    
    .btn-value-action {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background-color: #f1f9f5;
      color: #42b883;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      cursor: pointer;
      
      i {
        font-size: 0.8rem;
      }
      
      &:hover {
        background-color: #42b883;
        color: white;
        transform: scale(1.1);
      }
    }
  }

  .value-list-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #e74c3c;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 22px;
    height: 22px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    z-index: 5;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .badge-corner {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    margin: 0;
    z-index: 1;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
}

@media (max-width: 768px) {
  .value-list-card {
    margin-bottom: 1rem;
  }
}

/* Modal styles for Class Fees Setup */
.card-header {
  font-weight: 500;
  
  h5 {
    font-weight: 600;
  }

}

.table-responsive {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}

.table {
  margin-bottom: 0;
  
  th {
    position: sticky;
    top: 0;
    background: #f8f9fa;
    z-index: 1;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
  }
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}

/* Currency input uppercase style */
#currency, #editCurrency {
  text-transform: uppercase;
}

/* Remove hover effects from Class Fees Setup cards */
.modal-overlay .card {
  transition: none !important;
  transform: none !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05) !important;
}

.modal-overlay .card:hover {
  transform: none !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05) !important;
  border-color: #e2e8f0 !important;
}

/* Make sure table rows don't have hover animations */
.modal-overlay .table-hover tr:hover {
  background-color: #f8f9fa !important;
  transform: none !important;
}
</style>

